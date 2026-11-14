# Função no sistema: Baixar os datasets originais do Hugging Face para data/raw/,
# registrar procedência (repositório, revisão, SHA-256) e garantir que não sejam alterados.

import hashlib
import json
import os
import stat
from datetime import datetime, timezone

from backend.config import DATASETS, MANIFESTO_RAW, RAW_DIR, caminho_bruto


class DatasetAlteradoError(RuntimeError):
    """O arquivo original não corresponde ao hash registrado no manifesto."""


def calcular_sha256(caminho, tamanho_bloco: int = 1 << 20) -> str:
    sha = hashlib.sha256()
    with open(caminho, "rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(tamanho_bloco), b""):
            sha.update(bloco)
    return sha.hexdigest()


def _ler_manifesto() -> dict:
    if not MANIFESTO_RAW.exists():
        return {}
    return json.loads(MANIFESTO_RAW.read_text(encoding="utf-8"))


def _salvar_manifesto(manifesto: dict) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    MANIFESTO_RAW.write_text(
        json.dumps(manifesto, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def _proteger_contra_escrita(caminho) -> None:
    os.chmod(caminho, stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)


def _liberar_escrita(caminho) -> None:
    os.chmod(caminho, stat.S_IREAD | stat.S_IWRITE)


def baixar_datasets(forcar: bool = False) -> dict:
    """Baixa cada dataset na revisão fixada em `backend.config.DATASETS`.

    Arquivos já presentes, íntegros e na mesma revisão não são baixados novamente.
    Depois do download, o arquivo fica somente leitura e seu SHA-256 vai para o manifesto.
    """
    from huggingface_hub import hf_hub_download

    manifesto = _ler_manifesto()

    for nome, fonte in DATASETS.items():
        destino = caminho_bruto(nome)
        registro = manifesto.get(nome, {})
        mesma_revisao = registro.get("revisao") == fonte["revisao"]

        if destino.exists() and mesma_revisao and not forcar:
            if calcular_sha256(destino) == registro.get("sha256"):
                print(f"[{nome}] já disponível e íntegro: {destino}")
                continue
            raise DatasetAlteradoError(
                f"O arquivo original {destino} foi modificado. "
                "Rode com --forcar para baixar novamente."
            )

        if destino.exists():
            _liberar_escrita(destino)

        print(f"[{nome}] baixando {fonte['repo_id']}/{fonte['arquivo']} @ {fonte['revisao'][:7]}...")
        # local_dir grava direto em data/raw/<nome>/, sem duplicar no cache global
        destino.parent.mkdir(parents=True, exist_ok=True)
        hf_hub_download(
            repo_id=fonte["repo_id"],
            filename=fonte["arquivo"],
            repo_type="dataset",
            revision=fonte["revisao"],
            local_dir=destino.parent,
        )
        _proteger_contra_escrita(destino)

        manifesto[nome] = {
            "repo_id": fonte["repo_id"],
            "arquivo": fonte["arquivo"],
            "revisao": fonte["revisao"],
            "url": (
                f"https://huggingface.co/datasets/{fonte['repo_id']}"
                f"/blob/{fonte['revisao']}/{fonte['arquivo']}"
            ),
            "sha256": calcular_sha256(destino),
            "tamanho_bytes": destino.stat().st_size,
            "baixado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        _salvar_manifesto(manifesto)
        print(f"[{nome}] salvo em {destino}")

    return manifesto


def verificar_datasets() -> dict:
    """Confere se os originais existem e batem com o manifesto. Retorna o manifesto."""
    manifesto = _ler_manifesto()
    for nome in DATASETS:
        destino = caminho_bruto(nome)
        if not destino.exists() or nome not in manifesto:
            raise FileNotFoundError(
                f"Dataset '{nome}' ausente. Rode: python scripts/baixar_datasets.py"
            )
        if calcular_sha256(destino) != manifesto[nome]["sha256"]:
            raise DatasetAlteradoError(
                f"O arquivo original {destino} não corresponde ao manifesto."
            )
    return manifesto


def preparar_datasets() -> dict:
    """Etapa do pipeline: baixa o que faltar e valida a integridade dos já existentes."""
    return baixar_datasets()


def ler_manifesto_datasets() -> dict:
    return _ler_manifesto()
