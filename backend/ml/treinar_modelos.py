# Função no sistema: Treinar o vetorizador TF-IDF sobre os textos padronizados de filmes
# e jogos e gerar o artefato vetorizado da recomendação por contexto em artefatos/contexto/,
# separado dos datasets originais (data/raw/) e dos intermediários (data/processed/).
#
# Conteúdo do artefato:
#   vetorizador_tfidf.joblib  vocabulário e pesos IDF compartilhados entre filmes e jogos
#   matriz_filmes.npz         matriz esparsa (n_filmes x n_termos), linha i = filmes_metadata[i]
#   matriz_jogos.npz          matriz esparsa (n_jogos x n_termos),  linha i = jogos_metadata[i]
#   filmes_metadata.joblib    colunas exibidas pela API, na mesma ordem das linhas da matriz
#   jogos_metadata.joblib     idem para jogos
#   manifesto.json            procedência (revisão e SHA-256 dos originais), parâmetros e formas

import ast
import json
import shutil
from datetime import datetime, timezone

import joblib
import pandas as pd
import sklearn
from scipy.sparse import save_npz
from sklearn.feature_extraction.text import TfidfVectorizer

from backend.config import ARTEFATO_CONTEXTO_DIR, caminho_processado
from backend.ml.datasets import ler_manifesto_datasets

VERSAO_FORMATO = 1

PARAMETROS_TFIDF = {
    "max_features": 20000,
    "min_df": 2,
    "ngram_range": (1, 2),
    "sublinear_tf": True,
}


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
    filmes = pd.read_csv(caminho_processado("filmes_padronizados.csv"), low_memory=False)
    jogos = pd.read_csv(caminho_processado("jogos_padronizados.csv"), low_memory=False)

    filmes["texto_final"] = filmes["texto_final"].fillna("")
    jogos["texto_final"] = jogos["texto_final"].fillna("")
    filmes["overview"] = filmes["overview"].fillna("")
    jogos["header_image"] = jogos["header_image"].fillna("")
    filmes["genres"] = filmes["genres"].apply(_garantir_lista)
    jogos["genres"] = jogos["genres"].apply(_garantir_lista)
    jogos["tags"] = jogos["tags"].apply(_garantir_lista)

    todos_textos = pd.concat([filmes["texto_final"], jogos["texto_final"]], ignore_index=True)

    vetorizador = TfidfVectorizer(**PARAMETROS_TFIDF)
    matriz_tfidf = vetorizador.fit_transform(todos_textos).tocsr()

    qtd_filmes = len(filmes)
    matriz_filmes = matriz_tfidf[:qtd_filmes]
    matriz_jogos = matriz_tfidf[qtd_filmes:]

    # Salva apenas as colunas necessárias para respostas rápidas na API
    filmes_meta = filmes[["movie_id", "title", "genres", "overview"]].reset_index(drop=True)
    jogos_meta = jogos[
        ["game_id", "name", "genres", "tags", "header_image", "recommendations", "positive"]
    ].reset_index(drop=True)

    manifesto = {
        "artefato": "contexto",
        "descricao": (
            "Vetores TF-IDF de filmes e jogos em vocabulário compartilhado, "
            "usados na recomendação baseada em conteúdo (similaridade do cosseno)."
        ),
        "versao_formato": VERSAO_FORMATO,
        "gerado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "datasets_origem": ler_manifesto_datasets(),
        "vetorizador": {
            "tipo": "TfidfVectorizer",
            "scikit_learn": sklearn.__version__,
            "parametros": {**PARAMETROS_TFIDF, "ngram_range": list(PARAMETROS_TFIDF["ngram_range"])},
            "tamanho_vocabulario": len(vetorizador.vocabulary_),
        },
        "matrizes": {
            "filmes": {"linhas": matriz_filmes.shape[0], "colunas": matriz_filmes.shape[1]},
            "jogos": {"linhas": matriz_jogos.shape[0], "colunas": matriz_jogos.shape[1]},
        },
    }

    # Grava numa pasta temporária e só então substitui o artefato anterior,
    # para que uma falha no meio do processo não deixe arquivos de versões misturadas.
    temporario = ARTEFATO_CONTEXTO_DIR.with_name(ARTEFATO_CONTEXTO_DIR.name + ".tmp")
    shutil.rmtree(temporario, ignore_errors=True)
    temporario.mkdir(parents=True)

    joblib.dump(vetorizador, temporario / "vetorizador_tfidf.joblib")
    save_npz(temporario / "matriz_filmes.npz", matriz_filmes)
    save_npz(temporario / "matriz_jogos.npz", matriz_jogos)
    joblib.dump(filmes_meta, temporario / "filmes_metadata.joblib")
    joblib.dump(jogos_meta, temporario / "jogos_metadata.joblib")
    (temporario / "manifesto.json").write_text(
        json.dumps(manifesto, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    shutil.rmtree(ARTEFATO_CONTEXTO_DIR, ignore_errors=True)
    temporario.rename(ARTEFATO_CONTEXTO_DIR)

    print(
        f"Artefato de contexto salvo em {ARTEFATO_CONTEXTO_DIR} | "
        f"Vocabulário: {len(vetorizador.vocabulary_)} termos | "
        f"Filmes: {matriz_filmes.shape[0]} | Jogos: {matriz_jogos.shape[0]}"
    )


if __name__ == "__main__":
    treinar_e_salvar_modelo()
