# Função no sistema: Treinar o vetorizador TF-IDF sobre os textos padronizados de
# filmes e jogos e persistir matrizes e metadados em disco via Joblib.

import ast
from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def _garantir_lista(valor):
    if isinstance(valor, list):
        return valor
    if not isinstance(valor, str) or not valor.strip():
        return []
    try:
        res = ast.literal_eval(valor)
        return res if isinstance(res, list) else []
    except (ValueError, SyntaxError):
        return []


def treinar_e_salvar_modelo():
    filmes = pd.read_csv(BASE_DIR / "data" / "filmes_padronizados.csv", low_memory=False)
    jogos = pd.read_csv(BASE_DIR / "data" / "jogos_padronizados.csv", low_memory=False)

    filmes["texto_final"] = filmes["texto_final"].fillna("")
    jogos["texto_final"] = jogos["texto_final"].fillna("")
    filmes["genres"] = filmes["genres"].apply(_garantir_lista)
    jogos["genres"] = jogos["genres"].apply(_garantir_lista)
    jogos["tags"] = jogos["tags"].apply(_garantir_lista)

    todos_textos = pd.concat([filmes["texto_final"], jogos["texto_final"]], ignore_index=True)

    vetorizador = TfidfVectorizer(
        max_features=20000,
        min_df=2,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    matriz_tfidf = vetorizador.fit_transform(todos_textos)

    qtd_filmes = len(filmes)
    matriz_filmes = matriz_tfidf[:qtd_filmes]
    matriz_jogos = matriz_tfidf[qtd_filmes:]

    # Salva apenas as colunas necessárias para respostas rápidas na API
    filmes_meta = filmes[["movie_id", "title", "genres", "overview"]].copy()
    jogos_meta = jogos[
        ["game_id", "name", "genres", "tags", "header_image", "recommendations", "positive"]
    ].copy()

    joblib.dump(vetorizador, ARTIFACTS_DIR / "vetorizador_tfidf.joblib")
    joblib.dump(matriz_filmes, ARTIFACTS_DIR / "matriz_filmes.joblib")
    joblib.dump(matriz_jogos, ARTIFACTS_DIR / "matriz_jogos.joblib")
    joblib.dump(filmes_meta, ARTIFACTS_DIR / "filmes_metadata.joblib")
    joblib.dump(jogos_meta, ARTIFACTS_DIR / "jogos_metadata.joblib")

    print(f"Modelo salvo em {ARTIFACTS_DIR} | Vocabulário: {len(vetorizador.vocabulary_)} termos")


if __name__ == "__main__":
    treinar_e_salvar_modelo()