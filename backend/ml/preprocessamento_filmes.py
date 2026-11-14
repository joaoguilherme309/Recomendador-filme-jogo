# Função no sistema: Carregar o dataset bruto de filmes (TMDB), converter IDs de gêneros
# em nomes legíveis, tratar valores ausentes e salvar os dados limpos.

import ast
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent

GENEROS_TMDB = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
}


def converter_generos_filmes(generos):
    if isinstance(generos, str):
        try:
            generos = ast.literal_eval(generos)
        except (ValueError, SyntaxError):
            return []
    if not isinstance(generos, list):
        return []
    return [GENEROS_TMDB.get(g, "Unknown") for g in generos if g in GENEROS_TMDB]


def executar_preprocessamento_filmes():
    caminho_padrao = BASE_DIR / "data" / "tmdb_top_10k_movies_2026.csv"
    caminho_legado = BASE_DIR / "data" / "tmdb_top_10k_movies_2026.csv.csv"
    caminho_filmes = caminho_padrao if caminho_padrao.exists() else caminho_legado

    filmes = pd.read_csv(caminho_filmes)

    # Garante identificador inteiro único para cada filme na API
    if "id" in filmes.columns:
        filmes = filmes.rename(columns={"id": "movie_id"})
    elif "movie_id" not in filmes.columns:
        filmes["movie_id"] = filmes.index + 1

    filmes["movie_id"] = filmes["movie_id"].astype(int)
    filmes["title"] = filmes["title"].fillna("").str.strip()
    filmes["overview"] = filmes["overview"].fillna("").str.strip()
    filmes["genres"] = filmes["genre_ids"].apply(converter_generos_filmes)

    # Remove filmes sem título ou duplicados
    filmes = filmes[filmes["title"] != ""].drop_duplicates(subset=["movie_id"])
    filmes = filmes.reset_index(drop=True)

    filmes["texto_combinado"] = (
        filmes["genres"].apply(lambda g: " ".join(g)) + " " + filmes["overview"]
    ).str.strip()

    caminho_saida = BASE_DIR / "data" / "filmes_processados.csv"
    filmes.to_csv(caminho_saida, index=False, encoding="utf-8")
    print(f"Filmes processados: {len(filmes)} -> {caminho_saida}")


if __name__ == "__main__":
    executar_preprocessamento_filmes()