# Função no sistema: Implementar as métricas obrigatórias de acurácia em ranking
# (Precision@N, Recall@N, nDCG@N) e métricas além da acurácia (Cobertura e Diversidade).

import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity


def precision_at_k(recomendados: list[int], relevantes: set[int], k: int) -> float:
    if k <= 0:
        return 0.0
    top_k = recomendados[:k]
    acertos = sum(1 for item in top_k if item in relevantes)
    return acertos / k


def recall_at_k(recomendados: list[int], relevantes: set[int], k: int) -> float:
    if not relevantes or k <= 0:
        return 0.0
    top_k = recomendados[:k]
    acertos = sum(1 for item in top_k if item in relevantes)
    return acertos / len(relevantes)


def ndcg_at_k(recomendados: list[int], relevantes: set[int], k: int) -> float:
    if not relevantes or k <= 0:
        return 0.0
    top_k = recomendados[:k]

    dcg = 0.0
    for pos, item in enumerate(top_k, start=1):
        if item in relevantes:
            dcg += 1.0 / np.log2(pos + 1)

    qtd_ideal = min(len(relevantes), k)
    idcg = sum(1.0 / np.log2(pos + 1) for pos in range(1, qtd_ideal + 1))

    return float(dcg / idcg) if idcg > 0 else 0.0


def cobertura_catalogo(todas_recomendacoes: list[list[int]], total_itens: int) -> float:
    if total_itens <= 0:
        return 0.0
    itens_distintos = {item for lista in todas_recomendacoes for item in lista}
    return len(itens_distintos) / total_itens


def diversidade_intra_lista(indices_recomendados: list[int], matriz_itens: csr_matrix) -> float:
    n = len(indices_recomendados)
    if n < 2:
        return 0.0

    submatriz = matriz_itens[indices_recomendados]
    sim_matriz = cosine_similarity(submatriz)

    # Soma apenas o triângulo superior (pares distintos) para calcular a dissimilaridade média
    soma_similaridades = (np.sum(sim_matriz) - np.trace(sim_matriz)) / 2.0
    total_pares = n * (n - 1) / 2.0
    similaridade_media = soma_similaridades / total_pares

    return float(1.0 - similaridade_media)