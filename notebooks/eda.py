# Análise exploratória dos datasets de filmes e jogos (originais e após a limpeza).
#
# Pré-requisitos:
#   python scripts/baixar_datasets.py
#   python -m backend.ml.preprocessamento_filmes
#   python -m backend.ml.preprocessamento_jogos
#
# Uso:  python notebooks/eda.py
# Saídas: docs/figuras/eda/*.png e docs/dados/eda_resumo.md

import ast
import json
import sys
from pathlib import Path

import matplotlib
import matplotlib.ticker

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
from backend.config import caminho_bruto, caminho_processado  # noqa: E402

FIGURAS_DIR = BASE_DIR / "docs" / "figuras" / "eda"
DOCS_DADOS_DIR = BASE_DIR / "docs" / "dados"

# Paleta validada (categórica: azul = filmes, laranja = jogos) e tinta neutra
COR_FILMES = "#2a78d6"
COR_JOGOS = "#eb6834"
SUPERFICIE = "#fcfcfb"
TINTA = "#0b0b0b"
TINTA_SECUNDARIA = "#52514e"
TINTA_SUAVE = "#898781"
GRADE = "#e1e0d9"
EIXO = "#c3c2b7"

plt.rcParams.update(
    {
        "figure.facecolor": SUPERFICIE,
        "axes.facecolor": SUPERFICIE,
        "savefig.facecolor": SUPERFICIE,
        "axes.edgecolor": EIXO,
        "axes.labelcolor": TINTA_SECUNDARIA,
        "axes.titlecolor": TINTA,
        "axes.titlesize": 13,
        "axes.titleweight": "semibold",
        "axes.titlelocation": "left",
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.grid": True,
        "grid.color": GRADE,
        "grid.linewidth": 0.8,
        "axes.axisbelow": True,
        "xtick.color": TINTA_SUAVE,
        "ytick.color": TINTA_SUAVE,
        "xtick.labelcolor": TINTA_SECUNDARIA,
        "ytick.labelcolor": TINTA_SECUNDARIA,
        "font.size": 10,
        "legend.frameon": False,
        "legend.labelcolor": TINTA_SECUNDARIA,
    }
)

# Gêneros TMDB -> termos equivalentes nos gêneros/tags da Steam. O primeiro termo é o
# "mesmo termo" (nome idêntico após normalização); os demais são equivalências temáticas.
PONTE_GENEROS = {
    "Action": ["Action"],
    "Adventure": ["Adventure"],
    "Animation": ["Animation", "Cartoon", "Cartoony", "Anime", "Hand-drawn"],
    "Comedy": ["Comedy", "Funny"],
    "Crime": ["Crime"],
    "Documentary": ["Documentary"],
    "Drama": ["Drama", "Emotional"],
    "Family": ["Family", "Family Friendly"],
    "Fantasy": ["Fantasy", "Dark Fantasy"],
    "History": ["History", "Historical"],
    "Horror": ["Horror", "Psychological Horror", "Survival Horror"],
    "Music": ["Music", "Rhythm"],
    "Mystery": ["Mystery", "Detective"],
    "Romance": ["Romance"],
    "Science Fiction": ["Science Fiction", "Sci-fi", "Space", "Cyberpunk"],
    "TV Movie": ["TV Movie"],
    "Thriller": ["Thriller"],
    "War": ["War", "Military", "World War II"],
    "Western": ["Western"],
}


def _lista(valor):
    if isinstance(valor, list):
        return valor
    try:
        resultado = ast.literal_eval(valor) if isinstance(valor, str) else []
        return resultado if isinstance(resultado, list) else []
    except (ValueError, SyntaxError):
        return []


def _salvar(fig, nome):
    FIGURAS_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIGURAS_DIR / nome, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  figura: docs/figuras/eda/{nome}")


def _barras_horizontais(ax, rotulos, valores, cor, formato="{:,.0f}"):
    posicoes = np.arange(len(rotulos))
    ax.barh(posicoes, valores, height=0.7, color=cor, edgecolor=SUPERFICIE, linewidth=2)
    ax.set_yticks(posicoes, rotulos)
    ax.invert_yaxis()
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", length=0)
    maximo = max(valores) if len(valores) else 1
    for y, v in zip(posicoes, valores):
        ax.text(v + maximo * 0.01, y, formato.format(v).replace(",", "."),
                va="center", fontsize=9, color=TINTA_SECUNDARIA)
    ax.set_xlim(0, maximo * 1.15)


def _tabela_md(df: pd.DataFrame) -> str:
    cabecalho = "| " + " | ".join(map(str, df.columns)) + " |"
    separador = "|" + "|".join("---" for _ in df.columns) + "|"
    linhas = ["| " + " | ".join(map(str, linha)) + " |" for linha in df.itertuples(index=False)]
    return "\n".join([cabecalho, separador, *linhas])


def _ler_jogos_brutos():
    caminho = caminho_bruto("jogos")
    colunas = pd.read_csv(caminho, nrows=0).columns.tolist()
    indice = colunas.index("DiscountDLC count")
    colunas[indice : indice + 1] = ["Discount", "DLC count"]
    return pd.read_csv(caminho, header=0, names=colunas, index_col=False, low_memory=False)


def main():
    print("Carregando dados...")
    filmes_brutos = pd.read_csv(caminho_bruto("filmes")).drop(columns=["Unnamed: 0"])
    jogos_brutos = _ler_jogos_brutos()
    filmes = pd.read_csv(caminho_processado("filmes_processados.csv"), low_memory=False)
    jogos = pd.read_csv(caminho_processado("jogos_processados.csv"), low_memory=False)
    filmes["genres"] = filmes["genres"].map(_lista)
    jogos["genres"] = jogos["genres"].map(_lista)
    jogos["tags"] = jogos["tags"].map(_lista)
    funil_jogos = json.loads((DOCS_DADOS_DIR / "limpeza_jogos.json").read_text(encoding="utf-8"))
    funil_filmes = json.loads((DOCS_DADOS_DIR / "limpeza_filmes.json").read_text(encoding="utf-8"))
    resumo = ["# Análise exploratória dos dados", "",
              "Gerado por `notebooks/eda.py`. Figuras em `docs/figuras/eda/`.", ""]

    # 1. Funil de limpeza dos jogos -------------------------------------------------
    etapas = [e for e in funil_jogos["etapas"][1:] if e["removidos"] > 0]
    fig, ax = plt.subplots(figsize=(9, 4.2))
    _barras_horizontais(ax, [e["etapa"] for e in etapas], [e["removidos"] for e in etapas], COR_JOGOS)
    ax.xaxis.set_major_formatter(
        matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}".replace(",", "."))
    )
    ax.set_title(f"Jogos removidos por regra de limpeza "
                 f"({funil_jogos['etapas'][0]['restantes']:,} → {funil_jogos['etapas'][-1]['restantes']:,})"
                 .replace(",", "."))
    ax.set_xlabel("Registros removidos")
    _salvar(fig, "01_funil_limpeza_jogos.png")

    resumo += ["## 1. Funil de limpeza", ""]
    for nome, funil in (("Filmes", funil_filmes), ("Jogos", funil_jogos)):
        tabela = pd.DataFrame(funil["etapas"])[["etapa", "removidos", "restantes"]]
        tabela.columns = ["Etapa", "Removidos", "Restantes"]
        resumo += [f"**{nome}**", "", _tabela_md(tabela), ""]

    # 2. Valores ausentes nos jogos (antes x depois) --------------------------------
    pares = {
        "Descrição": ("About the game", "description"),
        "Gêneros": ("Genres", "genres"),
        "Tags": ("Tags", "tags"),
        "Imagem de capa": ("Header image", "header_image"),
    }

    def _vazio(serie):
        if serie.map(lambda v: isinstance(v, list)).any():
            return serie.map(len) == 0
        return serie.fillna("").astype(str).str.strip() == ""

    antes = [100 * _vazio(jogos_brutos[b]).mean() for b, _ in pares.values()]
    depois = [100 * _vazio(jogos[p]).mean() for _, p in pares.values()]
    fig, ax = plt.subplots(figsize=(8, 3.6))
    y = np.arange(len(pares))
    ax.barh(y - 0.19, antes, height=0.36, color=TINTA_SUAVE, edgecolor=SUPERFICIE, linewidth=2, label="Bruto")
    ax.barh(y + 0.19, depois, height=0.36, color=COR_JOGOS, edgecolor=SUPERFICIE, linewidth=2, label="Após limpeza")
    for yy, a, d in zip(y, antes, depois):
        ax.text(a + 0.5, yy - 0.19, f"{a:.1f}%", va="center", fontsize=9, color=TINTA_SECUNDARIA)
        ax.text(d + 0.5, yy + 0.19, f"{d:.1f}%", va="center", fontsize=9, color=TINTA_SECUNDARIA)
    ax.set_yticks(y, list(pares))
    ax.invert_yaxis()
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", length=0)
    ax.set_xlim(0, max(antes) * 1.2)
    ax.set_xlabel("% de registros com o campo vazio")
    ax.set_title("Campos vazios nos jogos: bruto × após limpeza")
    ax.legend(loc="lower right")
    _salvar(fig, "02_ausentes_jogos.png")

    ausentes = pd.DataFrame({"Campo": list(pares), "Bruto (%)": np.round(antes, 1),
                             "Após limpeza (%)": np.round(depois, 1)})
    resumo += ["## 2. Campos vazios", "", "**Jogos**", "", _tabela_md(ausentes), "",
               "**Filmes (bruto)**", "",
               _tabela_md(pd.DataFrame({
                   "Campo": ["overview", "genre_ids", "release_date"],
                   "Vazios": [int(_vazio(filmes_brutos["overview"]).sum()),
                              int((filmes_brutos["genre_ids"].fillna("[]") == "[]").sum()),
                              int(filmes_brutos["release_date"].isna().sum())],
               })), ""]

    # 3. Gêneros dos filmes ---------------------------------------------------------
    generos_filmes = filmes["genres"].explode().value_counts()
    fig, ax = plt.subplots(figsize=(8, 5.6))
    _barras_horizontais(ax, generos_filmes.index.tolist(), generos_filmes.values, COR_FILMES)
    ax.set_title(f"Gêneros dos filmes (n = {len(filmes):,})".replace(",", "."))
    ax.set_xlabel("Filmes (um filme pode ter vários gêneros)")
    _salvar(fig, "03_generos_filmes.png")

    # 4. Top 30 tags dos jogos ------------------------------------------------------
    tags_jogos = jogos["tags"].explode().value_counts().head(30)
    fig, ax = plt.subplots(figsize=(8, 8))
    _barras_horizontais(ax, tags_jogos.index.tolist(), tags_jogos.values, COR_JOGOS)
    ax.set_title(f"30 tags mais frequentes dos jogos (n = {len(jogos):,})".replace(",", "."))
    ax.set_xlabel("Jogos com a tag")
    _salvar(fig, "04_top_tags_jogos.png")

    resumo += ["## 3. Gêneros e tags", "",
               f"- Gêneros distintos nos filmes: **{filmes['genres'].explode().nunique()}**; "
               f"média de {filmes['genres'].str.len().mean():.1f} gêneros por filme.",
               f"- Tags distintas nos jogos: **{jogos['tags'].explode().nunique()}**; "
               f"média de {jogos['tags'].str.len().mean():.1f} tags por jogo.",
               f"- 5 tags mais comuns: {', '.join(tags_jogos.index[:5])}. Tags genéricas como "
               "*Indie* e *Singleplayer* descrevem o modelo de produção, não o tema, e pesam pouco "
               "na ponte com filmes.", ""]

    # 5. Ano de lançamento ----------------------------------------------------------
    anos_f = filmes["ano"].dropna().astype(int)
    anos_j = jogos["ano"].dropna().astype(int)
    inicio = 1970
    # O último ano dos dados está incompleto (captura no meio do ano) e é omitido do gráfico
    ultimo_completo = max(anos_f.max(), anos_j.max()) - 1
    eixo_anos = np.arange(inicio, ultimo_completo + 1)
    pf = anos_f[anos_f >= inicio].value_counts(normalize=True).reindex(eixo_anos, fill_value=0) * 100
    pj = anos_j[anos_j >= inicio].value_counts(normalize=True).reindex(eixo_anos, fill_value=0) * 100
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.plot(eixo_anos, pf, color=COR_FILMES, linewidth=2, label="Filmes")
    ax.plot(eixo_anos, pj, color=COR_JOGOS, linewidth=2, label="Jogos")
    ax.set_ylim(bottom=0)
    ax.set_ylabel("% dos itens da base")
    ax.set_title(f"Ano de lançamento ({inicio}–{ultimo_completo}; {ultimo_completo + 1} incompleto, omitido)")
    ax.legend(loc="upper left")
    _salvar(fig, "05_ano_lancamento.png")

    resumo += ["## 4. Ano de lançamento", "",
               f"- Filmes: mediana **{int(anos_f.median())}**, de {anos_f.min()} a {anos_f.max()}; "
               f"{(anos_f < 2000).mean():.0%} antes de 2000.",
               f"- Jogos: mediana **{int(anos_j.median())}**, de {anos_j.min()} a {anos_j.max()}; "
               f"{(anos_j >= 2015).mean():.0%} a partir de 2015 (crescimento da Steam).",
               "- As bases cobrem épocas diferentes: filmes clássicos têm poucos jogos contemporâneos.", ""]

    # 6. Tamanho dos textos ---------------------------------------------------------
    palavras_f = filmes["overview"].fillna("").str.split().str.len()
    palavras_j = jogos["description"].fillna("").str.split().str.len()
    fig, eixos = plt.subplots(1, 2, figsize=(10, 3.8), sharey=False)
    for ax, serie, cor, nome in ((eixos[0], palavras_f, COR_FILMES, "Sinopse dos filmes"),
                                 (eixos[1], palavras_j, COR_JOGOS, "Descrição dos jogos")):
        bins = np.logspace(0, np.log10(max(serie.max(), 10)), 40)
        ax.hist(serie[serie > 0], bins=bins, color=cor, edgecolor=SUPERFICIE, linewidth=1)
        ax.set_xscale("log")
        ax.axvline(serie.median(), color=TINTA_SECUNDARIA, linewidth=1, linestyle="--")
        ax.text(serie.median() * 1.08, ax.get_ylim()[1] * 0.92, f"mediana {serie.median():.0f}",
                fontsize=9, color=TINTA_SECUNDARIA)
        ax.set_title(nome, fontsize=11)
        ax.set_xlabel("Palavras (escala log)")
    eixos[0].set_ylabel("Itens")
    fig.suptitle("Tamanho dos textos usados na vetorização", x=0.06, ha="left",
                 fontsize=13, fontweight="semibold", color=TINTA)
    fig.tight_layout()
    _salvar(fig, "06_tamanho_textos.png")

    resumo += ["## 5. Tamanho dos textos", "",
               f"- Sinopses: mediana de **{palavras_f.median():.0f} palavras** (máx. {palavras_f.max()}).",
               f"- Descrições de jogos: mediana de **{palavras_j.median():.0f} palavras** "
               f"(máx. {palavras_j.max()}), cerca de {palavras_j.median() / palavras_f.median():.0f}× "
               "maiores. Sem normalização, os textos de jogos dominariam o vocabulário; "
               "o TF-IDF com `sublinear_tf` e a normalização L2 atenuam isso.", ""]

    # 7. Popularidade ---------------------------------------------------------------
    fig, eixos = plt.subplots(1, 2, figsize=(10, 3.8))
    for ax, serie, cor, nome in ((eixos[0], filmes_brutos["vote_count"], COR_FILMES, "Votos por filme (TMDB)"),
                                 (eixos[1], jogos["avaliacoes"], COR_JOGOS, "Avaliações por jogo (Steam, após limpeza)")):
        serie = serie[serie > 0]
        bins = np.logspace(0, np.log10(serie.max()), 40)
        ax.hist(serie, bins=bins, color=cor, edgecolor=SUPERFICIE, linewidth=1)
        ax.set_xscale("log")
        ax.axvline(serie.median(), color=TINTA_SECUNDARIA, linewidth=1, linestyle="--")
        ax.text(serie.median() * 1.1, ax.get_ylim()[1] * 0.92, f"mediana {serie.median():,.0f}".replace(",", "."),
                fontsize=9, color=TINTA_SECUNDARIA)
        ax.set_title(nome, fontsize=11)
        ax.set_xlabel("Escala log")
    eixos[0].set_ylabel("Itens")
    fig.suptitle("Popularidade", x=0.06, ha="left", fontsize=13, fontweight="semibold", color=TINTA)
    fig.tight_layout()
    _salvar(fig, "07_popularidade.png")

    aval_brutas = jogos_brutos["Positive"] + jogos_brutos["Negative"]
    limiares = pd.DataFrame({
        "Mínimo de avaliações": [1, 5, 10, 50, 100],
        "Jogos brutos que atendem": [f"{int((aval_brutas >= n).sum()):,}".replace(",", ".")
                                     for n in (1, 5, 10, 50, 100)],
    })
    resumo += ["## 6. Popularidade", "",
               f"- Filmes: mediana de **{filmes_brutos['vote_count'].median():,.0f} votos**; "
               "todos têm votos (a base já é um recorte dos 10 mil mais populares).".replace(",", "."),
               f"- Jogos brutos: {(aval_brutas == 0).mean():.0%} não têm nenhuma avaliação; "
               f"mediana de {aval_brutas.median():.0f}.",
               "- Sensibilidade do limite de avaliações (regra 3 da limpeza):", "",
               _tabela_md(limiares), ""]

    # 8. Ponte entre gêneros de filmes e vocabulário dos jogos -----------------------
    termos_jogos = (jogos["genres"] + jogos["tags"]).map(lambda ts: {t.casefold() for t in ts})
    linhas = []
    for genero, termos in PONTE_GENEROS.items():
        mesmo = termos[0].casefold()
        equivalentes = {t.casefold() for t in termos}
        linhas.append({
            "Gênero (filme)": genero,
            "Filmes": int(generos_filmes.get(genero, 0)),
            "mesmo": 100 * termos_jogos.map(lambda s: mesmo in s).mean(),
            "equiv": 100 * termos_jogos.map(lambda s: bool(s & equivalentes)).mean(),
            "Termos equivalentes": ", ".join(termos[1:]) or "—",
        })
    ponte = pd.DataFrame(linhas).sort_values("Filmes", ascending=False)

    fig, ax = plt.subplots(figsize=(9, 9))
    y = np.arange(len(ponte)) * 1.3
    ax.barh(y - 0.26, ponte["mesmo"], height=0.48, color=COR_JOGOS, edgecolor=SUPERFICIE,
            linewidth=2, label="Mesmo termo")
    ax.barh(y + 0.26, ponte["equiv"], height=0.48, color=COR_FILMES, edgecolor=SUPERFICIE,
            linewidth=2, label="Com termos equivalentes")
    for yy, m, e in zip(y, ponte["mesmo"], ponte["equiv"]):
        ax.text(m + 0.4, yy - 0.26, f"{m:.1f}%", va="center", fontsize=8.5, color=TINTA_SECUNDARIA)
        ax.text(e + 0.4, yy + 0.26, f"{e:.1f}%", va="center", fontsize=8.5, color=TINTA_SECUNDARIA)
    ax.set_yticks(y, ponte["Gênero (filme)"])
    ax.invert_yaxis()
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", length=0)
    ax.set_xlim(0, ponte[["mesmo", "equiv"]].values.max() * 1.25)
    ax.set_xlabel("% dos jogos com o gênero/tag correspondente")
    ax.set_title("Cobertura dos gêneros de filme no vocabulário da Steam\n"
                 "(ordenado pelo nº de filmes do gênero)", fontsize=12)
    ax.legend(loc="lower right")
    _salvar(fig, "08_ponte_generos.png")

    tabela_ponte = ponte.assign(
        **{"Mesmo termo (%)": ponte["mesmo"].round(1), "Com equivalentes (%)": ponte["equiv"].round(1)}
    )[["Gênero (filme)", "Filmes", "Mesmo termo (%)", "Com equivalentes (%)", "Termos equivalentes"]]
    sem_ponte = ponte.loc[ponte["mesmo"] < 0.5, "Gênero (filme)"].tolist()
    resumo += ["## 7. Ponte entre gêneros de filmes e vocabulário dos jogos", "",
               "Porcentagem dos jogos limpos que têm o gênero do filme entre seus gêneros/tags, "
               "pelo mesmo termo e por termos equivalentes (mapeamento em `PONTE_GENEROS`).", "",
               _tabela_md(tabela_ponte), "",
               f"- Gêneros praticamente sem o mesmo termo na Steam (< 0,5% dos jogos): "
               f"**{', '.join(sem_ponte)}**. Para eles, a ligação filme→jogo depende de "
               "sinônimos na padronização ou só das palavras da sinopse.", ""]

    # 9. Outros recortes ------------------------------------------------------------
    idiomas = filmes["original_language"].value_counts().head(8)
    tipos = jogos["tipo_item"].value_counts()
    resumo += ["## 8. Outros recortes", "",
               "**Idioma original dos filmes (top 8)**: "
               + ", ".join(f"{k} {v}" for k, v in idiomas.items())
               + ". As sinopses estão em inglês mesmo nos filmes não ingleses.", "",
               "**Tipos de item no catálogo de jogos**: "
               + ", ".join(f"{k} {v}" for k, v in tipos.items()) + ".", "",
               f"**Títulos de filme repetidos**: {int(filmes['titulo_repetido'].sum())} filmes "
               "compartilham título com outro (remakes e homônimos); use `titulo_exibicao`.", ""]

    DOCS_DADOS_DIR.mkdir(parents=True, exist_ok=True)
    (DOCS_DADOS_DIR / "eda_resumo.md").write_text("\n".join(resumo), encoding="utf-8")
    print("  resumo: docs/dados/eda_resumo.md")


if __name__ == "__main__":
    main()
