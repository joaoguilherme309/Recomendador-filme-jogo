# Função no sistema: Gerar gráficos comparativos com Matplotlib a partir dos resultados
# da avaliação offline para inclusão no relatório técnico e nos slides da apresentação.

from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = BASE_DIR / "docs"
FIGURAS_DIR = DOCS_DIR / "figuras"
FIGURAS_DIR.mkdir(parents=True, exist_ok=True)


def gerar_todos_graficos():
    caminho_csv = DOCS_DIR / "resultados_avaliacao.csv"
    df = pd.read_csv(caminho_csv)

    modelos = df["Modelo"].tolist()
    cores = ["#1976d2", "#ed6c02", "#757575"]

    # Gráfico 1: Comparação de Precision@10, Recall@10 e nDCG@10 entre modelos
    metricas_acuracia = ["Precision@10", "Recall@10", "nDCG@10"]
    x = np.arange(len(metricas_acuracia))
    largura = 0.25

    fig, ax = plt.subplots(figsize=(9, 5))
    for i, (_, row) in enumerate(df.iterrows()):
        valores = [row[m] for m in metricas_acuracia]
        barras = ax.bar(x + i * largura, valores, largura, label=row["Modelo"], color=cores[i])
        ax.bar_label(barras, fmt="%.3f", padding=3, fontsize=8)

    ax.set_title("Desempenho de Ranking (Top-10): FBC vs. Baselines")
    ax.set_xticks(x + largura)
    ax.set_xticklabels(metricas_acuracia)
    ax.set_ylabel("Pontuação Média")
    ax.set_ylim(0, max(df[metricas_acuracia].max()) * 1.25 + 0.05)
    ax.legend()
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(FIGURAS_DIR / "comparacao_metricas_top10.png", dpi=300)
    plt.close()

    # Gráfico 2: Comparação Precision@5 vs Precision@10 e nDCG@5 vs nDCG@10
    metricas_k = ["Precision@5", "Precision@10", "nDCG@5", "nDCG@10"]
    x_k = np.arange(len(metricas_k))

    fig, ax = plt.subplots(figsize=(9, 5))
    for i, (_, row) in enumerate(df.iterrows()):
        valores = [row[m] for m in metricas_k]
        barras = ax.bar(x_k + i * largura, valores, largura, label=row["Modelo"], color=cores[i])
        ax.bar_label(barras, fmt="%.3f", padding=3, fontsize=8)

    ax.set_title("Comparação de Métricas de Corte: N=5 vs. N=10")
    ax.set_xticks(x_k + largura)
    ax.set_xticklabels(metricas_k)
    ax.set_ylabel("Pontuação Média")
    ax.set_ylim(0, max(df[metricas_k].max()) * 1.25 + 0.05)
    ax.legend()
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(FIGURAS_DIR / "comparacao_n5_vs_n10.png", dpi=300)
    plt.close()

    # Gráfico 3: Métricas Além da Acurácia (Cobertura de Catálogo e Diversidade Intra-Lista)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5))

    barras_cov = ax1.bar(modelos, df["Cobertura@10"] * 100, color=cores)
    ax1.set_title("Cobertura de Catálogo (%)")
    ax1.set_ylabel("% de Jogos Recomendados")
    ax1.tick_params(axis="x", rotation=15)
    ax1.bar_label(barras_cov, fmt="%.2f%%", padding=3, fontsize=8)
    ax1.set_ylim(0, max(df["Cobertura@10"] * 100) * 1.25 + 1)
    ax1.grid(axis="y", linestyle="--", alpha=0.4)

    barras_div = ax2.bar(modelos, df["Diversidade@10"], color=cores)
    ax2.set_title("Diversidade Intra-Lista (1 - Sim. Média)")
    ax2.set_ylabel("Índice de Diversidade")
    ax2.tick_params(axis="x", rotation=15)
    ax2.bar_label(barras_div, fmt="%.3f", padding=3, fontsize=8)
    ax2.set_ylim(0, 1.15)
    ax2.grid(axis="y", linestyle="--", alpha=0.4)

    plt.tight_layout()
    plt.savefig(FIGURAS_DIR / "cobertura_e_diversidade.png", dpi=300)
    plt.close()

    print(f"Gráficos salvos em: {FIGURAS_DIR}")


if __name__ == "__main__":
    gerar_todos_graficos()