import httpx

from app.core.config import settings


async def generate_with_groq(
    prompt: str, model: str = "llama3-70b-8192"
) -> str:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not configured")
    url = "https://api.groq.com/openai/v1/chat/completions"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            url,
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

