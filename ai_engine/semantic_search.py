import math
from dotenv import load_dotenv
from google import genai

load_dotenv()  # reads GEMINI_API_KEY from .env

EMBED_MODEL = "gemini-embedding-001"  # change here if the team uses another


def tutor_to_text(tutor):
    """Turn any tutor dict into one string, whatever its field names are."""
    parts = []
    for key, value in tutor.items():
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        parts.append(f"{key}: {value}")
    return ". ".join(parts)


def cosine_similarity(a, b):
    """1.0 = same meaning, 0 = unrelated."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def embed_texts(client, texts):
    result = client.models.embed_content(model=EMBED_MODEL, contents=texts)
    return [e.values for e in result.embeddings]


def search_tutors(query, tutors, top_k=3):
    """Return the top_k (score, tutor) pairs closest in meaning to the query."""
    client = genai.Client()
    vectors = embed_texts(client, [tutor_to_text(t) for t in tutors] + [query])
    query_vec = vectors[-1]
    scored = [
        (cosine_similarity(query_vec, v), t)
        for v, t in zip(vectors[:-1], tutors)
    ]
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return scored[:top_k]