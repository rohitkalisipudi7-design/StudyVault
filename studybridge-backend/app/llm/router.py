from app.core.config import settings
from app.llm.gemini import generate_with_gemini
from app.llm.groq import generate_with_groq
from app.llm.ollama import generate_with_ollama


async def generate(prompt: str, provider: str | None = None) -> tuple[str, str]:
    """
    Simple provider router:
    1. Use override if provided.
    2. Else use DEFAULT_LLM_PROVIDER.
    3. Fallback chain: gemini -> groq -> ollama.
    Returns (text, provider_used).
    """
    chain = ["gemini", "groq", "ollama"]
    if provider:
        chain = [provider] + [p for p in chain if p != provider]
    else:
        default = settings.default_llm_provider
        chain = [default] + [p for p in chain if p != default]

    last_error: Exception | None = None
    for prov in chain:
        try:
            if prov == "gemini":
                text = await generate_with_gemini(prompt)
            elif prov == "groq":
                text = await generate_with_groq(prompt)
            else:
                text = await generate_with_ollama(prompt)
            return text, prov
        except Exception as e:  # noqa: BLE001
            last_error = e
            continue
    raise RuntimeError(f"All LLM providers failed: {last_error}")

