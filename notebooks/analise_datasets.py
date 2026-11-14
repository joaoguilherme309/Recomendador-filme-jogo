# Análise exploratória dos datasets originais (somente leitura, em data/raw/).
# Baixe-os antes com: python scripts/baixar_datasets.py

import sys
import pandas as pd
from pathlib import Path

# Diretório principal do projeto
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
from backend.config import DATASETS, caminho_bruto  # noqa: E402

# ==========================================
# 1. ANÁLISE DO DATASET DE FILMES
# ==========================================

caminho_filmes = caminho_bruto("filmes")

# Carregar dataset
filmes = pd.read_csv(caminho_filmes)

print("\n=== DATASET DE FILMES ===")
print(f"Fonte: {DATASETS['filmes']['repo_id']}")

print(f"\nQuantidade de filmes: {len(filmes)}")

print("\nColunas disponíveis:")
print(filmes.columns.tolist())

print("\nPrimeiros 5 registros:")
print(filmes.head().to_string(index=False))

print("\nValores ausentes por coluna:")
print(filmes.isnull().sum())

# ==========================================
# 2. ANÁLISE DO DATASET DE JOGOS
# ==========================================

caminho_jogos = caminho_bruto("jogos")

# O cabeçalho original junta duas colunas ("DiscountDLC count"); corrige só na leitura
colunas = pd.read_csv(caminho_jogos, nrows=0).columns.tolist()
if "DiscountDLC count" in colunas:
    indice = colunas.index("DiscountDLC count")
    colunas[indice : indice + 1] = ["Discount", "DLC count"]

jogos = pd.read_csv(
    caminho_jogos, header=0, names=colunas, index_col=False, low_memory=False
)

print("\n=== DATASET DE JOGOS ===")
print(f"Fonte: {DATASETS['jogos']['repo_id']}")

print(f"\nQuantidade de jogos: {len(jogos)}")

# ==========================================
# 3. IDENTIFICAR OS CAMPOS DOS JOGOS
# ==========================================

print("\n=== CAMPOS DISPONÍVEIS NOS JOGOS ===")

for campo in jogos.columns:
    print(campo)

# ==========================================
# 4. ANALISAR GÊNEROS E TAGS DOS JOGOS
# ==========================================

print("\n=== GÊNEROS E TAGS DOS JOGOS ===")

com_texto = jogos[jogos["About the game"].notna() & jogos["Tags"].notna()]
for _, jogo in com_texto.head(3).iterrows():
    print(f"\nJogo: {jogo['Name']}")
    print(f"ID: {jogo['AppID']}")
    print(f"Gêneros: {jogo['Genres']}")
    print(f"Tags: {jogo['Tags']}")
    print(f"Descrição curta: {str(jogo['About the game'])[:200]}")
