import ast
import re
import pandas as pd
from pathlib import Path

# ==========================================
# 1. CONFIGURAÇÕES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SINONIMOS = {
    "science fiction": "science_fiction",
    "sci-fi": "science_fiction",
    "scifi": "science_fiction",
    "survival horror": "horror",
    "psychological thriller": "thriller"
}


# ==========================================
# 2. FUNÇÕES DE PADRONIZAÇÃO
# ==========================================

def normalizar_termo(termo):
    if not isinstance(termo, str):
        return ""

    termo = termo.lower().strip()

    return SINONIMOS.get(
        termo,
        re.sub(r"\s+", "_", termo)
    )


def converter_lista(valor):
    # Verificar se já é uma lista
    if isinstance(valor, list):
        return valor

    # Tratar valores ausentes
    if not isinstance(valor, str) or not valor.strip():
        return []

    try:
        resultado = ast.literal_eval(valor)

        if isinstance(resultado, list):
            return resultado

        return []

    except (ValueError, SyntaxError):
        return []


def limpar_descricao(texto):
    if not isinstance(texto, str):
        return ""

    # Remover espaços extras e converter para minúsculas
    return " ".join(texto.lower().split())


# ==========================================
# 3. CARREGAR DATASETS PROCESSADOS
# ==========================================

caminho_filmes = BASE_DIR / "data" / "filmes_processados.csv"
caminho_jogos = BASE_DIR / "data" / "jogos_processados.csv"

filmes = pd.read_csv(caminho_filmes, low_memory=False)
jogos = pd.read_csv(caminho_jogos, low_memory=False)

print("\n=== DATASETS CARREGADOS ===")
print(f"Filmes: {len(filmes)}")
print(f"Jogos: {len(jogos)}")


# ==========================================
# 4. PADRONIZAR GÊNEROS DOS FILMES
# ==========================================

filmes["genres"] = filmes["genres"].apply(converter_lista)

filmes["generos_padronizados"] = filmes["genres"].apply(
    lambda generos: [
        normalizar_termo(genero)
        for genero in generos
    ]
)

print("\n=== GÊNEROS PADRONIZADOS DOS FILMES ===")

print(
    filmes[["title", "genres", "generos_padronizados"]]
    .head(10)
    .to_string(index=False)
)


# ==========================================
# 5. PADRONIZAR GÊNEROS E TAGS DOS JOGOS
# ==========================================

# No novo dataset, ambas as colunas são listas
jogos["genres"] = jogos["genres"].apply(converter_lista)
jogos["tags"] = jogos["tags"].apply(converter_lista)

# Normalizar os gêneros
jogos["generos_padronizados"] = jogos["genres"].apply(
    lambda generos: [
        normalizar_termo(genero)
        for genero in generos
    ]
)

# Normalizar as tags
jogos["tags_padronizadas"] = jogos["tags"].apply(
    lambda tags: [
        normalizar_termo(tag)
        for tag in tags
    ]
)

print("\n=== GÊNEROS E TAGS PADRONIZADOS DOS JOGOS ===")

for _, jogo in jogos.head(3).iterrows():
    print(f"\nJogo: {jogo['name']}")
    print(f"Gêneros: {jogo['generos_padronizados']}")
    print(f"Tags: {jogo['tags_padronizadas']}")

print(f"\nTotal de jogos padronizados: {len(jogos)}")


# ==========================================
# 6. CRIAR TEXTOS FINAIS PADRONIZADOS
# ==========================================

# FILMES: gêneros + sinopse
filmes["texto_final"] = filmes.apply(
    lambda filme: " ".join(
        filme["generos_padronizados"]
    ) + " " + limpar_descricao(filme["overview"]),
    axis=1
)

# JOGOS: gêneros + tags + descrição
jogos["texto_final"] = jogos.apply(
    lambda jogo: " ".join(
        jogo["generos_padronizados"]
        + jogo["tags_padronizadas"]
    ) + " " + limpar_descricao(jogo["description"]),
    axis=1
)

# Remover espaços extras
filmes["texto_final"] = filmes["texto_final"].str.strip()
jogos["texto_final"] = jogos["texto_final"].str.strip()


# ==========================================
# 7. EXIBIR TEXTOS FINAIS
# ==========================================

print("\n=== TEXTOS FINAIS PADRONIZADOS ===")

print("\nFilme:")
print(filmes.iloc[0]["texto_final"][:300])

print("\nJogo:")
print(jogos.iloc[0]["texto_final"][:300])


# ==========================================
# 8. SALVAR DATASETS PADRONIZADOS
# ==========================================

saida_filmes = BASE_DIR / "data" / "filmes_padronizados.csv"
saida_jogos = BASE_DIR / "data" / "jogos_padronizados.csv"

filmes.to_csv(
    saida_filmes,
    index=False,
    encoding="utf-8"
)

jogos.to_csv(
    saida_jogos,
    index=False,
    encoding="utf-8"
)

print("\n=== DATASETS PADRONIZADOS SALVOS ===")

print(f"Filmes: {saida_filmes}")
print(f"Jogos: {saida_jogos}")

print(f"\nTotal de filmes: {len(filmes)}")
print(f"Total de jogos: {len(jogos)}")
