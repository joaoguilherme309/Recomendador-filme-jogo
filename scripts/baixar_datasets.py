# Função no sistema: Baixar (ou verificar) os datasets originais do Hugging Face em data/raw/.
#
# Uso:
#   python scripts/baixar_datasets.py            # baixa o que faltar
#   python scripts/baixar_datasets.py --verificar  # só confere a integridade
#   python scripts/baixar_datasets.py --forcar     # baixa novamente

import argparse
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.ml.datasets import baixar_datasets, verificar_datasets


def main():
    parser = argparse.ArgumentParser(description="Baixa os datasets originais para data/raw/.")
    grupo = parser.add_mutually_exclusive_group()
    grupo.add_argument("--forcar", action="store_true", help="baixa novamente mesmo se existir")
    grupo.add_argument("--verificar", action="store_true", help="apenas confere os hashes")
    args = parser.parse_args()

    if args.verificar:
        manifesto = verificar_datasets()
        for nome, info in manifesto.items():
            print(f"[{nome}] OK  {info['repo_id']} @ {info['revisao'][:7]}  sha256={info['sha256'][:12]}…")
        return

    baixar_datasets(forcar=args.forcar)


if __name__ == "__main__":
    main()
