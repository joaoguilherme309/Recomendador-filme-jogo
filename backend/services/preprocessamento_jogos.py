import pandas as pd
from pathlib import Path

# ==========================================
# 1. CARREGAR O NOVO DATASET DA STEAM
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

caminho_jogos = BASE_DIR / "data" / "games.csv"

# Corrigir o cabeçalho do CSV
colunas = pd.read_csv(
    caminho_jogos,
    nrows=0
).columns.tolist()

indice = colunas.index("DiscountDLC count")

colunas[indice:indice + 1] = [
    "Discount",
    "DLC count"
]

jogos = pd.read_csv(
    caminho_jogos,
    header=0,
    names=colunas,
    index_col=False,
    low_memory=False
)

print("\n=== DATASET ORIGINAL ===")
print(f"Total de jogos: {len(jogos)}")


# ==========================================
# 2. SELECIONAR COLUNAS IMPORTANTES
# ==========================================

jogos = jogos[[
    "AppID",
    "Name",
    "Release date",
    "About the game",
    "Genres",
    "Tags",
    "Positive",
    "Negative",
    "Recommendations",
    "Header image"
]].copy()

# Padronizar os nomes das colunas
jogos = jogos.rename(columns={
    "AppID": "game_id",
    "Name": "name",
    "Release date": "release_date",
    "About the game": "description",
    "Genres": "genres",
    "Tags": "tags",
    "Positive": "positive",
    "Negative": "negative",
    "Recommendations": "recommendations",
    "Header image": "header_image"
})


# ==========================================
# 3. TRATAR VALORES AUSENTES
# ==========================================

jogos["name"] = jogos["name"].fillna("")
jogos["description"] = jogos["description"].fillna("")
jogos["genres"] = jogos["genres"].fillna("")
jogos["tags"] = jogos["tags"].fillna("")

# Remover registros sem nome
jogos = jogos[jogos["name"].str.strip() != ""]

# Remover registros sem nenhuma característica textual
jogos = jogos[
    (jogos["description"].str.strip() != "") |
    (jogos["genres"].str.strip() != "") |
    (jogos["tags"].str.strip() != "")
].copy()


# ==========================================
# 4. ORGANIZAR GÊNEROS E TAGS
# ==========================================

# No novo CSV, gêneros e tags são separados por vírgulas
def converter_lista(texto):
    if not isinstance(texto, str) or not texto.strip():
        return []

    return [
        termo.strip()
        for termo in texto.split(",")
        if termo.strip()
    ]


jogos["genres"] = jogos["genres"].apply(converter_lista)
jogos["tags"] = jogos["tags"].apply(converter_lista)


# ==========================================
# 5. PREPARAR TEXTOS
# ==========================================

def preparar_texto_jogo(jogo):
    generos = " ".join(jogo["genres"])
    tags = " ".join(jogo["tags"])
    descricao = jogo["description"]

    return f"{generos} {tags} {descricao}".strip()


jogos["texto_combinado"] = jogos.apply(
    preparar_texto_jogo,
    axis=1
)


# ==========================================
# 6. EXIBIR RESULTADOS
# ==========================================

print("\n=== DATASET PROCESSADO ===")
print(f"Total de jogos após limpeza: {len(jogos)}")

print("\n=== EXEMPLOS ===")

for _, jogo in jogos.head(3).iterrows():
    print(f"\nJogo: {jogo['name']}")
    print(f"Gêneros: {jogo['genres']}")
    print(f"Tags: {jogo['tags'][:5]}")
    print(f"Texto: {jogo['texto_combinado'][:200]}")


# ==========================================
# 7. SALVAR DATASET PROCESSADO
# ==========================================

caminho_saida = BASE_DIR / "data" / "jogos_processados.csv"

jogos.to_csv(
    caminho_saida,
    index=False,
    encoding="utf-8"
)

print("\nDataset de jogos processado salvo com sucesso!")
print(f"Arquivo: {caminho_saida}")
