# Função no sistema: Centralizar caminhos do projeto e a definição das fontes de dados
# (Hugging Face), separando dados originais, dados processados e o artefato vetorizado.

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
# Cópias fiéis dos datasets baixados do Hugging Face. Nunca são alteradas pelo pipeline.
RAW_DIR = DATA_DIR / "raw"
# Saídas intermediárias do pré-processamento e da padronização.
PROCESSED_DIR = DATA_DIR / "processed"

# Artefato vetorizado da recomendação por contexto (TF-IDF), separado dos datasets.
ARTEFATOS_DIR = BASE_DIR / "artefatos"
ARTEFATO_CONTEXTO_DIR = ARTEFATOS_DIR / "contexto"

MANIFESTO_RAW = RAW_DIR / "manifesto.json"
MANIFESTO_ARTEFATO = ARTEFATO_CONTEXTO_DIR / "manifesto.json"

# Revisões fixadas (commit do repositório no Hugging Face) para tornar o pipeline
# reprodutível. Para atualizar, troque o hash e rode `baixar_datasets.py --forcar`.
DATASETS = {
    "filmes": {
        "repo_id": "jason1966/algozee_global-movie-trends-2026",
        "arquivo": "tmdb_top_10k_movies_2026.csv.csv",
        "revisao": "1d112c7485f59eaa57fc78aa1ce16d5481964c74",
        "descricao": "Global Movie Trends (2026) — TMDB Top 10K Movies",
    },
    "jogos": {
        "repo_id": "FronkonGames/steam-games-dataset",
        "arquivo": "games.csv",
        "revisao": "6c21457b9ebf0a6a7f5b91e11281d65d456ea30e",
        "descricao": "Steam Games Dataset (FronkonGames)",
    },
}


def caminho_bruto(nome: str) -> Path:
    """Caminho local do arquivo original de um dataset (`filmes` ou `jogos`)."""
    return RAW_DIR / nome / DATASETS[nome]["arquivo"]


def caminho_processado(nome_arquivo: str) -> Path:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    return PROCESSED_DIR / nome_arquivo
