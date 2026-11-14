# Função no sistema: Funções de qualidade de dados compartilhadas pela limpeza de filmes
# e jogos, e registro do funil de limpeza (quantos registros cada regra removeu).

import json
import unicodedata
from datetime import datetime, timezone

import pandas as pd

from backend.config import BASE_DIR

DOCS_DADOS_DIR = BASE_DIR / "docs" / "dados"


def proporcao_latina(texto) -> float:
    """Fração das letras do texto que pertencem ao alfabeto latino (1.0 se não houver letras)."""
    letras = [c for c in str(texto) if c.isalpha()]
    if not letras:
        return 1.0
    latinas = sum("LATIN" in unicodedata.name(c, "") for c in letras)
    return latinas / len(letras)


def texto_preenchido(serie: pd.Series) -> pd.Series:
    return serie.fillna("").astype(str).str.strip() != ""


class FunilLimpeza:
    """Aplica regras de remoção em sequência e registra o efeito de cada uma.

    O relatório gerado documenta a limpeza e mantém os números do README em dia.
    """

    def __init__(self, dataset: str, df: pd.DataFrame):
        self.dataset = dataset
        self.df = df
        self.etapas = [{"etapa": "registros brutos", "removidos": 0, "restantes": len(df)}]

    def remover(self, etapa: str, mascara_remover: pd.Series, motivo: str) -> pd.DataFrame:
        removidos = int(mascara_remover.sum())
        self.df = self.df[~mascara_remover].copy()
        self.etapas.append(
            {"etapa": etapa, "motivo": motivo, "removidos": removidos, "restantes": len(self.df)}
        )
        return self.df

    def salvar(self, extras: dict | None = None) -> None:
        DOCS_DADOS_DIR.mkdir(parents=True, exist_ok=True)
        relatorio = {
            "dataset": self.dataset,
            "gerado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "etapas": self.etapas,
            **(extras or {}),
        }
        caminho = DOCS_DADOS_DIR / f"limpeza_{self.dataset}.json"
        caminho.write_text(json.dumps(relatorio, indent=2, ensure_ascii=False), encoding="utf-8")

    def imprimir(self) -> None:
        print(f"\nFunil de limpeza — {self.dataset}")
        for etapa in self.etapas:
            print(f"  {etapa['etapa']:<45} -{etapa['removidos']:>7}  = {etapa['restantes']:>7}")
