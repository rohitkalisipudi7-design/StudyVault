from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.llm.router import generate as llm_generate
from app.models.resource import ChatSession
from app.models.user import User
from app.schemas.chat import ChatHistory, ChatMessage, ChatRequest


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Load or create chat session
    session_id: UUID
    messages: list[ChatMessage]
    if body.session_id:
        stmt = select(ChatSession).where(
            ChatSession.id == body.session_id, ChatSession.user_id == current_user.id
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
        session_id = session.id
        messages = [
            ChatMessage(**m) for m in session.messages.get("messages", [])
        ]  # type: ignore[arg-type]
    else:
        session_id = uuid4()
        messages = []

    # Append new user message
    messages.append(ChatMessage(role="user", content=body.message))

    async def event_generator():
        history_text = "\n".join(
            f"{m.role}: {m.content}" for m in messages
        )
        prompt = f"You are StudyBridge AI Study Buddy.\n\nConversation so far:\n{history_text}\n\nRespond to the last user message with a clear, concise academic explanation."
        full_text, provider_used = await llm_generate(prompt, body.provider)
        chunk_size = max(64, len(full_text) // 4)
        acc = ""
        for i in range(0, len(full_text), chunk_size):
            delta = full_text[i : i + chunk_size]
            acc += delta
            yield f'data: {{"delta": {delta!r}, "done": false, "citations": []}}\n\n'
        # Save history with assistant reply
        messages.append(ChatMessage(role="assistant", content=acc))
        session_dict = {"messages": [m.dict() for m in messages], "provider_used": provider_used}
        # upsert session
        stmt = select(ChatSession).where(
            ChatSession.id == session_id, ChatSession.user_id == current_user.id
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            existing.messages = session_dict
        else:
            db.add(
                ChatSession(
                    id=session_id,
                    user_id=current_user.id,
                    messages=session_dict,
                    provider_used=provider_used,
                )
            )
        await db.commit()
        yield f'data: {{"done": true, "full_text": {acc!r}, "citations": [], "session_id": "{session_id}", "provider_used": {provider_used!r}}}\n\n'

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history/{session_id}", response_model=ChatHistory)
async def get_history(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(ChatSession).where(
        ChatSession.id == session_id, ChatSession.user_id == current_user.id
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    messages = [
        ChatMessage(**m) for m in session.messages.get("messages", [])
    ]  # type: ignore[arg-type]
    return ChatHistory(session_id=session.id, messages=messages)


@router.delete("/history/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(ChatSession).where(
        ChatSession.id == session_id, ChatSession.user_id == current_user.id
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    await db.delete(session)
    await db.commit()


