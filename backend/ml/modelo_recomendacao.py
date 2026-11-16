
# Função no sistema: Carregar os artefatos TF-IDF, construir o vetor de perfil a partir
# de 2 a 3 filmes, calcular similaridade do cosseno, gerar explicações e separar franquias.

from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

from scipy.sparse import csr_matrix, load_npz
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

from backend.ml.franquias import (
    identificar_franquia,
    jogo_pertence_franquia,
    obter_nome_franquia,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Caminho corrigido para os artefatos gerados pelo pipeline
ARTIFACTS_DIR = BASE_DIR / "artefatos" / "contexto"


@lru_cache(maxsize=1)
def carregar_artefatos():

    # Carrega o vetorizador TF-IDF treinado
    vetorizador = joblib.load(
        ARTIFACTS_DIR / "vetorizador_tfidf.joblib"
    )

    # Matrizes esparsas salvas no formato NPZ
    matriz_filmes = load_npz(
        ARTIFACTS_DIR / "matriz_filmes.npz"
    )

    matriz_jogos = load_npz(
        ARTIFACTS_DIR / "matriz_jogos.npz"
    )

    # Metadados dos filmes e jogos
    filmes_df = joblib.load(
        ARTIFACTS_DIR / "filmes_metadata.joblib"
    )

    jogos_df = joblib.load(
        ARTIFACTS_DIR / "jogos_metadata.joblib"
    )

    nomes_features = vetorizador.get_feature_names_out()

    return (
        nomes_features,
        matriz_filmes,
        matriz_jogos,
        filmes_df,
        jogos_df,
    )


def buscar_filmes(termo: str, limite: int = 10) -> list[dict]:

    _, _, _, filmes_df, _ = carregar_artefatos()

    termo_limpo = termo.strip()

    if not termo_limpo:
        return []

    mascara = filmes_df["title"].str.contains(
        termo_limpo,
        case=False,
        regex=False,
        na=False,
    )

    encontrados = filmes_df[mascara].head(limite)

    return [
        {
            "movie_id": int(row["movie_id"]),
            "title": str(row["title"]),
            "genres": list(row["genres"]),
            "overview": str(row["overview"] or ""),
        }
        for _, row in encontrados.iterrows()
    ]


def _formatar_termo(termo: str) -> str:

    return termo.replace("_", " ").title()


def _gerar_explicacao(
    indice_jogo: int,
    vetor_perfil: csr_matrix,
    vetores_filmes_escolhidos: csr_matrix,
    titulos_filmes: list[str],
    nomes_features: np.ndarray,
    matriz_jogos: csr_matrix,
) -> dict:

    vetor_jogo = matriz_jogos[indice_jogo]

    # Produto elemento a elemento revela os termos que mais contribuíram no cosseno
    contribuicao = (
        vetor_perfil.multiply(vetor_jogo)
        .toarray()
        .ravel()
    )

    indices_top = np.argsort(contribuicao)[::-1]

    termos_comuns = [
        _formatar_termo(nomes_features[idx])
        for idx in indices_top[:5]
        if contribuicao[idx] > 0
    ]

    # Identifica qual dos filmes escolhidos tem maior proximidade individual com o jogo
    sims_individuais = cosine_similarity(
        vetores_filmes_escolhidos,
        vetor_jogo,
    ).ravel()

    idx_mais_proximo = int(np.argmax(sims_individuais))

    filme_influente = titulos_filmes[idx_mais_proximo]

    if termos_comuns:

        lista_termos = ", ".join(termos_comuns[:4])

        justificativa = (
            f"Recomendado principalmente pela afinidade com '{filme_influente}' "
            f"e pelos elementos em comum: {lista_termos}."
        )

    else:

        justificativa = (
            f"Recomendado pela proximidade temática geral "
            f"com '{filme_influente}'."
        )

    return {
        "termos_em_comum": termos_comuns,
        "filme_mais_influente": filme_influente,
        "justificativa": justificativa,
    }


def _selecionar_top_jogos(
    similaridades: np.ndarray,
    jogos_df,
    quantidade: int,
    indices_permitidos: set[int] | None = None,
    indices_excluidos: set[int] | None = None,
) -> list[int]:

    indices_ordenados = np.argsort(similaridades)[::-1]

    selecionados = []
    nomes_usados = set()

    for idx in indices_ordenados:

        idx = int(idx)

        if (
            indices_permitidos is not None
            and idx not in indices_permitidos
        ):
            continue

        if (
            indices_excluidos is not None
            and idx in indices_excluidos
        ):
            continue

        nome_norm = (
            str(jogos_df.iloc[idx]["name"])
            .casefold()
            .strip()
        )

        if not nome_norm or nome_norm in nomes_usados:
            continue

        nomes_usados.add(nome_norm)

        selecionados.append(idx)

        if len(selecionados) >= quantidade:
            break

    return selecionados


def recomendar_jogos_por_perfil(
    movie_ids: list[int],
    notas: list[float] | None = None,
    quantidade: int = 10,
) -> dict:

    (
        nomes_features,
        matriz_filmes,
        matriz_jogos,
        filmes_df,
        jogos_df,
    ) = carregar_artefatos()

    indices_filmes = []
    filmes_selecionados = []

    for mid in movie_ids:

        matches = filmes_df.index[
            filmes_df["movie_id"] == mid
        ].tolist()

        if not matches:
            raise ValueError(
                f"Filme com movie_id={mid} não encontrado no catálogo."
            )

        idx = matches[0]

        indices_filmes.append(idx)

        row = filmes_df.iloc[idx]

        filmes_selecionados.append(
            {
                "movie_id": int(row["movie_id"]),
                "title": str(row["title"]),
                "genres": list(row["genres"]),
                "overview": str(row["overview"] or ""),
            }
        )

    vetores_selecionados = matriz_filmes[indices_filmes]

    pesos = np.array(
        notas if notas is not None
        else [1.0] * len(indices_filmes),
        dtype=float,
    )

    pesos = pesos / pesos.sum()

    # Vetor do perfil é a média ponderada normalizada (L2) dos filmes escolhidos
    vetor_perfil_denso = np.asarray(
        vetores_selecionados.T.dot(pesos)
    ).reshape(1, -1)

    vetor_perfil = csr_matrix(
        normalize(vetor_perfil_denso)
    )

    similaridades = cosine_similarity(
        vetor_perfil,
        matriz_jogos,
    ).ravel()

    # Identifica franquias de todos os filmes escolhidos para separar jogos licenciados
    franquias_ids = []
    indices_jogos_franquia = set()

    for filme in filmes_selecionados:

        fid = identificar_franquia(filme["title"])

        if fid and fid not in franquias_ids:

            franquias_ids.append(fid)

            mascara_franquia = jogos_df["name"].apply(
                lambda nome: jogo_pertence_franquia(
                    nome,
                    fid,
                )
            )

            indices_jogos_franquia.update(
                jogos_df.index[mascara_franquia].tolist()
            )

    indices_principais = _selecionar_top_jogos(
        similaridades=similaridades,
        jogos_df=jogos_df,
        quantidade=quantidade,
        indices_excluidos=indices_jogos_franquia,
    )

    indices_secundarios = []

    if indices_jogos_franquia:

        indices_secundarios = _selecionar_top_jogos(
            similaridades=similaridades,
            jogos_df=jogos_df,
            quantidade=10,
            indices_permitidos=indices_jogos_franquia,
        )

    titulos_selecionados = [
        f["title"]
        for f in filmes_selecionados
    ]

    def _montar_cards(
        indices: list[int],
        incluir_explicacao: bool,
    ) -> list[dict]:

        cards = []

        for idx in indices:

            row = jogos_df.iloc[idx]

            explicacao = (
                _gerar_explicacao(
                    indice_jogo=idx,
                    vetor_perfil=vetor_perfil,
                    vetores_filmes_escolhidos=vetores_selecionados,
                    titulos_filmes=titulos_selecionados,
                    nomes_features=nomes_features,
                    matriz_jogos=matriz_jogos,
                )
                if incluir_explicacao
                else None
            )

            cards.append(
                {
                    "game_id": int(row["game_id"]),
                    "name": str(row["name"]),
                    "similaridade": round(
                        float(similaridades[idx]),
                        4,
                    ),
                    "genres": list(row["genres"]),
                    "tags": list(row["tags"][:8]),
                    "header_image": (
                        str(row["header_image"])
                        if row["header_image"]
                        else None
                    ),
                    "explicacao": explicacao,
                }
            )

        return cards

    return {
        "filmes_selecionados": filmes_selecionados,

        "franquias_identificadas": [
            obter_nome_franquia(fid)
            for fid in franquias_ids
            if obter_nome_franquia(fid)
        ],

        "recomendacoes": _montar_cards(
            indices_principais,
            incluir_explicacao=True,
        ),

        "jogos_franquia": _montar_cards(
            indices_secundarios,
            incluir_explicacao=False,
        ),
    }
