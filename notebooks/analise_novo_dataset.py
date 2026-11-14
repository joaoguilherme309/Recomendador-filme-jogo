import pandas as pd
from pathlib import Path

# ==========================================
# 1. CARREGAR O NOVO DATASET
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

caminho_jogos = BASE_DIR / "data" / "games.csv"

# Ler os nomes originais das colunas
colunas = pd.read_csv(
    caminho_jogos,
    nrows=0
).columns.tolist()

# Corrigir o cabeçalho com duas colunas unidas
indice = colunas.index("DiscountDLC count")

colunas[indice:indice + 1] = [
    "Discount",
    "DLC count"
]

# Carregar o dataset com as colunas corrigidas
jogos = pd.read_csv(
    caminho_jogos,
    header=0,
    names=colunas,
    index_col=False,
    low_memory=False
)

# ==========================================
# 2. ANALISAR O DATASET
# ==========================================

print("\n=== NOVO DATASET DA STEAM ===")

print(f"\nQuantidade de jogos: {len(jogos)}")
print(f"Quantidade de colunas: {len(jogos.columns)}")

print("\n=== COLUNAS DISPONÍVEIS ===")
for coluna in jogos.columns:
    print(coluna)

print("\n=== PRIMEIROS 5 JOGOS ===")
print(
    jogos.head()[["AppID", "Name", "Release date"]]
    .to_string(index=False)
)

print("\n=== VALORES AUSENTES ===")
print(jogos.isnull().sum().to_string())

# ==========================================
# 3. VERIFICAR ALINHAMENTO DAS COLUNAS
# ==========================================

print("\n=== VERIFICAÇÃO DA ESTRUTURA ===")

print("\nPrimeiros 3 registros:")
print(
    jogos[[
        "AppID",
        "Name",
        "Release date",
        "Estimated owners",
        "Genres",
        "Tags"
    ]].head(3).to_string(index=False)
)

# ==========================================
# 4. VERIFICAR O ARQUIVO ORIGINAL
# ==========================================

print("\n=== PRIMEIRAS LINHAS DO ARQUIVO ORIGINAL ===")

with open(caminho_jogos, "r", encoding="utf-8-sig") as arquivo:
    for numero in range(3):
        linha = arquivo.readline()

        print(f"\nLinha {numero + 1}:")
        print(repr(linha[:600]))
