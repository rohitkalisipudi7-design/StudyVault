import httpx

from app.core.config import settings


async def generate_with_ollama(prompt: str, model: str = "llama3.1:8b") -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.ollama_base_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "")

