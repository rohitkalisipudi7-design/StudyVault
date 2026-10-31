from sentence_transformers import SentenceTransformer


_model: SentenceTransformer | None = None


def get_embedder() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_query(text: str) -> list[float]:
    model = get_embedder()
    return model.encode([text])[0].tolist()

