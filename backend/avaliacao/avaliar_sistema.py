# Função no sistema: Executar o protocolo de avaliação offline sem vazamento de dados
# (seed=42), comparando o modelo FBC com os baselines e salvando tabelas e exemplos.

import ast
import json
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

from backend.avaliacao.baselines import obter_ranking_populares, recomendar_aleatorio
from backend.avaliacao.metricas import (
    cobertura_catalogo,
    diversidade_intra_lista,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = BASE_DIR / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

SEED = 42

# Arquétipos usados para simular 60 perfis de usuários e definir relevância externa (ground truth)
ARQUETIPOS = [
    {
        "nome": "Fantasia Medieval e Épica",
        "generos_filme": {"fantasy", "adventure"},
        "tags_jogo_alvo": {"fantasy", "medieval", "rpg", "dark_fantasy", "open_world"},
    },
    {
        "nome": "Ficção Científica e Espaço",
        "generos_filme": {"science_fiction"},
        "tags_jogo_alvo": {"science_fiction", "space", "cyberpunk", "futuristic"},
    },
    {
        "nome": "Terror e Sobrevivência",
        "generos_filme": {"horror"},
        "tags_jogo_alvo": {"horror", "survival", "zombie", "psychological_horror", "dark"},
    },
    {
        "nome": "Mistério e Investigação",
        "generos_filme": {"mystery", "crime"},
        "tags_jogo_alvo": {"mystery", "detective", "investigation", "noir", "crime"},
    },
    {
        "nome": "Ação Tática e Guerra",
        "generos_filme": {"action", "war"},
        "tags_jogo_alvo": {"action", "war", "military", "shooter", "stealth"},
    },
    {
        "nome": "Suspense Psicológico",
        "generos_filme": {"thriller"},
        "tags_jogo_alvo": {"thriller", "psychological", "suspense", "story_rich"},
    },
]


def _converter_lista(valor) -> list[str]:
    if isinstance(valor, list):
        return valor
    if not isinstance(valor, str) or not valor.strip():
        return []
    try:
        res = ast.literal_eval(valor)
        return res if isinstance(res, list) else []
    except (ValueError, SyntaxError):
        return []


def _construir_perfis_teste(filmes_df: pd.DataFrame, rng: np.random.Generator) -> list[dict]:
    perfis = []
    for arq in ARQUETIPOS:
        elegiveis = filmes_df[
            filmes_df["generos_padronizados"].apply(
                lambda gs: bool(set(gs) & arq["generos_filme"])
            )
        ]
        indices = elegiveis.index.to_numpy()
        if len(indices) < 30:
            continue

        # Gera 10 usuários simulados por arquétipo (total = 60 usuários, acima do mínimo de 50)
        amostrados = rng.choice(indices, size=(10, 3), replace=False)
        for trio in amostrados:
            perfis.append(
                {
                    "arquetipo": arq["nome"],
                    "filmes_treino": [int(trio[0]), int(trio[1])],
                    "filme_teste": int(trio[2]),
                    "tags_jogo_alvo": arq["tags_jogo_alvo"],
                }
            )
    return perfis


def _obter_jogos_relevantes(jogos_df: pd.DataFrame, tags_alvo: set[str]) -> set[int]:
    # Um jogo é relevante se possui pelo menos 2 tags/gêneros do arquétipo e boa aceitação
    relevantes = set()
    for idx, row in jogos_df.iterrows():
        if row["positive"] < 50:
            continue
        atributos = set(row["generos_padronizados"]) | set(row["tags_padronizadas"])
        if len(atributos & tags_alvo) >= 2:
            relevantes.add(int(idx))
    return relevantes


def executar_avaliacao():
    rng = np.random.default_rng(SEED)

    filmes = pd.read_csv(BASE_DIR / "data" / "filmes_padronizados.csv", low_memory=False)
    jogos = pd.read_csv(BASE_DIR / "data" / "jogos_padronizados.csv", low_memory=False)

    filmes["generos_padronizados"] = filmes["generos_padronizados"].apply(_converter_lista)
    jogos["generos_padronizados"] = jogos["generos_padronizados"].apply(_converter_lista)
    jogos["tags_padronizadas"] = jogos["tags_padronizadas"].apply(_converter_lista)

    filmes["overview_limpo"] = filmes["overview_limpo"].fillna("")
    jogos["description_limpa"] = jogos["description_limpa"].fillna("")

    # Treina TF-IDF exclusivamente nas descrições textuais para evitar vazamento das tags de teste
    vetorizador = TfidfVectorizer(max_features=15000, min_df=2, ngram_range=(1, 2))
    corpus = pd.concat([filmes["overview_limpo"], jogos["description_limpa"]], ignore_index=True)
    matriz = vetorizador.fit_transform(corpus)

    qtd_filmes = len(filmes)
    matriz_filmes = matriz[:qtd_filmes]
    matriz_jogos = matriz[qtd_filmes:]

    perfis = _construir_perfis_teste(filmes, rng)
    ranking_populares = obter_ranking_populares(jogos, max_k=20)
    total_jogos = len(jogos)

    resultados = {
        "FBC (TF-IDF + Cosseno)": {
            "p5": [], "r5": [], "ndcg5": [],
            "p10": [], "r10": [], "ndcg10": [],
            "div10": [], "listas10": [],
        },
        "Baseline: Mais Populares": {
            "p5": [], "r5": [], "ndcg5": [],
            "p10": [], "r10": [], "ndcg10": [],
            "div10": [], "listas10": [],
        },
        "Baseline: Aleatório": {
            "p5": [], "r5": [], "ndcg5": [],
            "p10": [], "r10": [], "ndcg10": [],
            "div10": [], "listas10": [],
        },
    }

    exemplos_qualitativos = []

    for i, perfil in enumerate(perfis):
        relevantes = _obter_jogos_relevantes(jogos, perfil["tags_jogo_alvo"])

        # Perfil construído apenas com os filmes de treino (2 filmes)
        vetores_treino = matriz_filmes[perfil["filmes_treino"]]
        vetor_perfil = csr_matrix(normalize(np.asarray(vetores_treino.mean(axis=0))))
        sims = cosine_similarity(vetor_perfil, matriz_jogos).ravel()

        # Filtra jogos sem nome duplicado no Top-10 do FBC
        ordenados = np.argsort(sims)[::-1]
        rec_fbc = []
        nomes_usados = set()
        for idx in ordenados:
            idx = int(idx)
            nome_norm = str(jogos.iloc[idx]["name"]).casefold().strip()
            if nome_norm and nome_norm not in nomes_usados:
                nomes_usados.add(nome_norm)
                rec_fbc.append(idx)
                if len(rec_fbc) >= 10:
                    break

        rec_pop = ranking_populares[:10]
        rec_rand = recomendar_aleatorio(total_jogos, k=10, rng=rng)

        ofertas = {
            "FBC (TF-IDF + Cosseno)": rec_fbc,
            "Baseline: Mais Populares": rec_pop,
            "Baseline: Aleatório": rec_rand,
        }

        for modelo_nome, lista_rec in ofertas.items():
            reg = resultados[modelo_nome]
            reg["p5"].append(precision_at_k(lista_rec, relevantes, 5))
            reg["r5"].append(recall_at_k(lista_rec, relevantes, 5))
            reg["ndcg5"].append(ndcg_at_k(lista_rec, relevantes, 5))
            reg["p10"].append(precision_at_k(lista_rec, relevantes, 10))
            reg["r10"].append(recall_at_k(lista_rec, relevantes, 10))
            reg["ndcg10"].append(ndcg_at_k(lista_rec, relevantes, 10))
            reg["div10"].append(diversidade_intra_lista(lista_rec, matriz_jogos))
            reg["listas10"].append(lista_rec)

        if i in (0, 10, 20):
            exemplos_qualitativos.append(
                {
                    "arquetipo": perfil["arquetipo"],
                    "filmes_treino": [
                        filmes.iloc[idx]["title"] for idx in perfil["filmes_treino"]
                    ],
                    "filme_teste_oculto": filmes.iloc[perfil["filme_teste"]]["title"],
                    "top5_recomendados": [
                        {
                            "jogo": jogos.iloc[idx]["name"],
                            "relevante_ground_truth": idx in relevantes,
                        }
                        for idx in rec_fbc[:5]
                    ],
                }
            )

    linhas_tabela = []
    for modelo_nome, metricas in resultados.items():
        linhas_tabela.append(
            {
                "Modelo": modelo_nome,
                "Precision@5": round(float(np.mean(metricas["p5"])), 4),
                "Recall@5": round(float(np.mean(metricas["r5"])), 4),
                "nDCG@5": round(float(np.mean(metricas["ndcg5"])), 4),
                "Precision@10": round(float(np.mean(metricas["p10"])), 4),
                "Recall@10": round(float(np.mean(metricas["r10"])), 4),
                "nDCG@10": round(float(np.mean(metricas["ndcg10"])), 4),
                "Cobertura@10": round(
                    cobertura_catalogo(metricas["listas10"], total_jogos), 4
                ),
                "Diversidade@10": round(float(np.mean(metricas["div10"])), 4),
            }
        )

    df_resultados = pd.DataFrame(linhas_tabela)
    df_resultados.to_csv(DOCS_DIR / "resultados_avaliacao.csv", index=False)

    with open(DOCS_DIR / "resultados_avaliacao.md", "w", encoding="utf-8") as f:
        f.write("# Resultados da Avaliação Offline (Seed = 42, 60 Perfis)\n\n")
        f.write(df_resultados.to_markdown(index=False))
        f.write("\n")

    with open(DOCS_DIR / "exemplos_qualitativos.json", "w", encoding="utf-8") as f:
        json.dump(exemplos_qualitativos, f, ensure_ascii=False, indent=2)

    print("\n=== RESULTADOS DA AVALIAÇÃO OFFLINE ===")
    print(df_resultados.to_string(index=False))


if __name__ == "__main__":
    executar_avaliacao()