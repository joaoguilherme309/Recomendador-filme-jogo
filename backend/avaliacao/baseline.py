# Função no sistema: Implementar os dois modelos de referência obrigatórios (baselines)
# para comparação experimental: recomendação aleatória e recomendação por popularidade.

import numpy as np
import pandas as pd


def recomendar_aleatorio(total_jogos: int, k: int, rng: np.random.Generator) -> list[int]:
    tamanho = min(k, total_jogos)
    return rng.choice(total_jogos, size=tamanho, replace=False).tolist()


def obter_ranking_populares(jogos_df: pd.DataFrame, max_k: int = 20) -> list[int]:
    # Ordena por total de recomendações e avaliações positivas na Steam
    ordenados = jogos_df.sort_values(
        by=["recommendations", "positive"],
        ascending=[False, False],
    )
    selecionados = []
    nomes_vistos = set()

    for idx, row in ordenados.iterrows():
        nome_norm = str(row["name"]).casefold().strip()
        if not nome_norm or nome_norm in nomes_vistos:
            continue
        nomes_vistos.add(nome_norm)
        selecionados.append(int(idx))
        if len(selecionados) >= max_k:
            break

    return selecionados