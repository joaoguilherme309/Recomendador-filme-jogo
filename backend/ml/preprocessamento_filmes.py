# Função no sistema: Carregar o dataset bruto de filmes (TMDB), converter IDs de gêneros
# em nomes legíveis, tratar valores ausentes e salvar os dados limpos.
#
# Regras de limpeza (efeito registrado em docs/dados/limpeza_filmes.json):
#   1. Remove filmes sem título.
#   2. `id` duplicado: o mesmo filme aparece mais de uma vez com contagens de votos
#      diferentes (capturas em momentos distintos). Mantém o registro com mais votos.
#   3. Remove filmes sem nenhum texto (sem sinopse e sem gêneros), que não podem ser descritos.
# Tratamentos sem remoção:
#   - `Unnamed: 0` (índice exportado junto com o CSV) é descartada.
#   - `release_date` vira data ISO e `ano`; `titulo_exibicao` = "Título (ano)" desambigua
#     títulos repetidos (remakes e homônimos), sinalizados em `titulo_repetido`.
#   - `sem_sinopse` sinaliza filmes que só têm gêneros como texto.

import ast
import pandas as pd

from backend.config import caminho_bruto, caminho_processado
from backend.ml.qualidade_dados import FunilLimpeza, texto_preenchido

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
    # Lê o original em data/raw/ sem alterá-lo; tudo daqui em diante é uma cópia em memória
    filmes = pd.read_csv(caminho_bruto("filmes"))
    filmes = filmes.drop(columns=["Unnamed: 0"], errors="ignore")
    filmes = filmes.rename(columns={"id": "movie_id"})

    filmes["movie_id"] = filmes["movie_id"].astype(int)
    filmes["title"] = filmes["title"].fillna("").str.strip()
    filmes["overview"] = filmes["overview"].fillna("").str.strip()
    filmes["genres"] = filmes["genre_ids"].apply(converter_generos_filmes)

    funil = FunilLimpeza("filmes", filmes)
    filmes = funil.remover("sem título", filmes["title"] == "", "título vazio")

    # Ordena por votos só para decidir qual duplicata fica; a máscara é alinhada pelo índice
    por_votos = filmes.sort_values("vote_count", ascending=False, kind="stable")
    filmes = funil.remover(
        "id duplicado",
        por_votos.duplicated(subset=["movie_id"], keep="first").reindex(filmes.index),
        "mesmo filme capturado mais de uma vez; mantido o registro com mais votos",
    )

    filmes = funil.remover(
        "sem texto (sem sinopse e sem gêneros)",
        ~texto_preenchido(filmes["overview"]) & (filmes["genres"].str.len() == 0),
        "nada para vetorizar",
    )

    filmes = filmes.reset_index(drop=True)

    datas = pd.to_datetime(filmes["release_date"], format="%Y-%m-%d", errors="coerce")
    filmes["release_date"] = datas.dt.strftime("%Y-%m-%d")
    filmes["ano"] = datas.dt.year.astype("Int64")
    filmes["titulo_repetido"] = filmes["title"].duplicated(keep=False)
    filmes["titulo_exibicao"] = [
        f"{titulo} ({ano})" if pd.notna(ano) else titulo
        for titulo, ano in zip(filmes["title"], filmes["ano"])
    ]
    filmes["sem_sinopse"] = ~texto_preenchido(filmes["overview"])

    filmes["texto_combinado"] = (
        filmes["genres"].apply(lambda g: " ".join(g)) + " " + filmes["overview"]
    ).str.strip()

    caminho_saida = caminho_processado("filmes_processados.csv")
    filmes.to_csv(caminho_saida, index=False, encoding="utf-8")

    funil.imprimir()
    funil.salvar(
        {
            "sinalizacoes": {
                "titulo_repetido": int(filmes["titulo_repetido"].sum()),
                "sem_sinopse": int(filmes["sem_sinopse"].sum()),
                "sem_data": int(filmes["ano"].isna().sum()),
            }
        }
    )
    print(f"Filmes processados: {len(filmes)} -> {caminho_saida}")


if __name__ == "__main__":
    executar_preprocessamento_filmes()
