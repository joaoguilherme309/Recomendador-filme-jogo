# Função no sistema: Limpar o catálogo bruto da Steam, corrigir colunas desalinhadas,
# filtrar jogos sem metadados ou avaliações e estruturar gêneros, tags e descrições.
#
# Regras de limpeza, na ordem aplicada (efeito registrado em docs/dados/limpeza_jogos.json):
#   1. Sem nome.
#   2. Sem texto: sem descrição, sem gêneros e sem tags (nada para vetorizar).
#   3. Sem avaliação: menos de MIN_AVALIACOES avaliações (positivas + negativas).
#      Demos, playtests, soundtracks e DLCs ficam isentos: a Steam não permite avaliar
#      playtests, então a regra os eliminaria por definição.
#   4. Software: todos os gêneros são de aplicativo (Utilities, Video Production...),
#      sem nenhum gênero de jogo. Demos, playtests, soundtracks e DLCs ficam isentos.
#   5. Conteúdo sexual explícito (gênero ou tag em TERMOS_CONTEUDO_SEXUAL), se
#      REMOVER_CONTEUDO_SEXUAL for True.
#   6. Título predominantemente não latino (< 50% de letras latinas).
#   7. Descrição predominantemente não latina: o tratamento textual (stopwords e
#      lematização) é feito só em inglês, então esses textos virariam ruído.
#   8. Nome duplicado (após normalização): mantém o registro com mais avaliações.
#   9. AppID duplicado.
# Tratamentos sem remoção:
#   - Cabeçalho "DiscountDLC count" é separado em duas colunas apenas na leitura.
#   - `tipo_item` classifica o registro em jogo, demo, playtest, soundtrack ou dlc.
#   - `release_date` vira data ISO e `ano`; `header_image` ausente vira texto vazio.
#   - `suporta_ingles`, `texto_curto` e `idade_minima` ficam como sinalizações.

import re

import pandas as pd

from backend.config import caminho_bruto, caminho_processado
from backend.ml.qualidade_dados import FunilLimpeza, proporcao_latina, texto_preenchido

MIN_AVALIACOES = 1
LIMITE_LATINO = 0.5
TAMANHO_TEXTO_CURTO = 100
REMOVER_CONTEUDO_SEXUAL = True

TERMOS_CONTEUDO_SEXUAL = {"Sexual Content", "Nudity", "NSFW", "Hentai"}

# Gêneros da Steam usados por aplicativos, não por jogos
GENEROS_SOFTWARE = {
    "Accounting",
    "Animation & Modeling",
    "Audio Production",
    "Design & Illustration",
    "Education",
    "Game Development",
    "Photo Editing",
    "Software Training",
    "Utilities",
    "Video Production",
    "Web Publishing",
}

# Ordem importa: "Demo Playtest" é classificado como playtest
TIPOS_ESPECIAIS = {
    "playtest": re.compile(r"\bplaytest\b", re.IGNORECASE),
    "demo": re.compile(r"\bdemo\b", re.IGNORECASE),
    "soundtrack": re.compile(r"\bsoundtrack\b", re.IGNORECASE),
    "dlc": re.compile(r"\bdlc\b", re.IGNORECASE),
}


def converter_lista(texto):
    if not isinstance(texto, str) or not texto.strip():
        return []
    return [termo.strip() for termo in texto.split(",") if termo.strip()]


def classificar_tipo_item(nome: str) -> str:
    for tipo, padrao in TIPOS_ESPECIAIS.items():
        if padrao.search(nome):
            return tipo
    return "jogo"


def _ler_bruto() -> pd.DataFrame:
    # Lê o original em data/raw/ sem alterá-lo; a correção do cabeçalho é feita só na leitura
    caminho_jogos = caminho_bruto("jogos")
    colunas = pd.read_csv(caminho_jogos, nrows=0).columns.tolist()
    if "DiscountDLC count" in colunas:
        indice = colunas.index("DiscountDLC count")
        colunas[indice : indice + 1] = ["Discount", "DLC count"]
        return pd.read_csv(
            caminho_jogos, header=0, names=colunas, index_col=False, low_memory=False
        )
    return pd.read_csv(caminho_jogos, low_memory=False)


def executar_preprocessamento_jogos():
    jogos = _ler_bruto()

    jogos = jogos[
        [
            "AppID",
            "Name",
            "Release date",
            "About the game",
            "Genres",
            "Tags",
            "Positive",
            "Negative",
            "Recommendations",
            "Header image",
            "Supported languages",
            "Required age",
        ]
    ].copy()

    jogos = jogos.rename(
        columns={
            "AppID": "game_id",
            "Name": "name",
            "Release date": "release_date",
            "About the game": "description",
            "Genres": "genres",
            "Tags": "tags",
            "Positive": "positive",
            "Negative": "negative",
            "Recommendations": "recommendations",
            "Header image": "header_image",
            "Supported languages": "supported_languages",
            "Required age": "idade_minima",
        }
    )

    jogos["name"] = jogos["name"].fillna("").str.strip()
    jogos["description"] = jogos["description"].fillna("").str.strip()
    jogos["header_image"] = jogos["header_image"].fillna("").str.strip()
    for coluna in ("positive", "negative", "recommendations", "idade_minima"):
        jogos[coluna] = pd.to_numeric(jogos[coluna], errors="coerce").fillna(0).astype(int)

    jogos["genres"] = jogos["genres"].apply(converter_lista)
    jogos["tags"] = jogos["tags"].apply(converter_lista)
    jogos["avaliacoes"] = jogos["positive"] + jogos["negative"]
    jogos["tipo_item"] = jogos["name"].map(classificar_tipo_item)
    especial = jogos["tipo_item"] != "jogo"

    funil = FunilLimpeza("jogos", jogos)

    jogos = funil.remover("sem nome", jogos["name"] == "", "nome vazio")

    jogos = funil.remover(
        "sem texto (descrição, gêneros e tags vazios)",
        ~texto_preenchido(jogos["description"])
        & (jogos["genres"].str.len() == 0)
        & (jogos["tags"].str.len() == 0),
        "nada para vetorizar",
    )

    jogos = funil.remover(
        "sem avaliação" if MIN_AVALIACOES == 1 else f"menos de {MIN_AVALIACOES} avaliações",
        (jogos["avaliacoes"] < MIN_AVALIACOES) & ~especial.reindex(jogos.index),
        "sem sinal de que o jogo foi publicado e jogado; demos, playtests, soundtracks e DLCs isentos",
    )

    so_software = jogos["genres"].map(lambda gs: bool(gs) and set(gs) <= GENEROS_SOFTWARE)
    jogos = funil.remover(
        "software (só gêneros de aplicativo)",
        so_software & ~especial.reindex(jogos.index),
        "aplicativo, não jogo; demos, playtests, soundtracks e DLCs isentos",
    )

    conteudo_sexual = jogos.apply(
        lambda j: bool(TERMOS_CONTEUDO_SEXUAL & set(j["genres"] + j["tags"])), axis=1
    )
    if REMOVER_CONTEUDO_SEXUAL:
        jogos = funil.remover(
            "conteúdo sexual explícito",
            conteudo_sexual,
            f"gênero ou tag em {sorted(TERMOS_CONTEUDO_SEXUAL)}",
        )

    jogos = funil.remover(
        "título não latino",
        jogos["name"].map(proporcao_latina) < LIMITE_LATINO,
        f"menos de {LIMITE_LATINO:.0%} das letras do título são latinas",
    )

    jogos = funil.remover(
        "descrição não latina",
        jogos["description"].map(proporcao_latina) < LIMITE_LATINO,
        "o tratamento textual é feito só em inglês",
    )

    nome_normalizado = jogos["name"].str.casefold().str.split().str.join(" ")
    por_avaliacoes = jogos.assign(_nome=nome_normalizado).sort_values(
        "avaliacoes", ascending=False, kind="stable"
    )
    jogos = funil.remover(
        "nome duplicado",
        por_avaliacoes.duplicated(subset=["_nome"], keep="first").reindex(jogos.index),
        "mesmo nome após normalização; mantido o registro com mais avaliações",
    )

    jogos = funil.remover(
        "AppID duplicado", jogos.duplicated(subset=["game_id"]), "registro repetido"
    )

    jogos = jogos.reset_index(drop=True)

    datas = pd.to_datetime(jogos["release_date"], format="mixed", errors="coerce")
    jogos["release_date"] = datas.dt.strftime("%Y-%m-%d")
    jogos["ano"] = datas.dt.year.astype("Int64")
    jogos["suporta_ingles"] = jogos["supported_languages"].fillna("").str.contains("English")
    jogos["texto_curto"] = jogos["description"].str.len() < TAMANHO_TEXTO_CURTO
    jogos = jogos.drop(columns=["supported_languages"])

    jogos["texto_combinado"] = jogos.apply(
        lambda j: f"{' '.join(j['genres'])} {' '.join(j['tags'])} {j['description']}".strip(),
        axis=1,
    )

    caminho_saida = caminho_processado("jogos_processados.csv")
    jogos.to_csv(caminho_saida, index=False, encoding="utf-8")

    funil.imprimir()
    funil.salvar(
        {
            "parametros": {
                "min_avaliacoes": MIN_AVALIACOES,
                "limite_latino": LIMITE_LATINO,
                "remover_conteudo_sexual": REMOVER_CONTEUDO_SEXUAL,
                "tamanho_texto_curto": TAMANHO_TEXTO_CURTO,
            },
            "tipos_item": jogos["tipo_item"].value_counts().to_dict(),
            "sinalizacoes": {
                "sem_tags": int((jogos["tags"].str.len() == 0).sum()),
                "texto_curto": int(jogos["texto_curto"].sum()),
                "sem_suporte_ingles": int((~jogos["suporta_ingles"]).sum()),
                "idade_minima_18": int((jogos["idade_minima"] >= 18).sum()),
                "sem_imagem": int((jogos["header_image"] == "").sum()),
                "sem_data": int(jogos["ano"].isna().sum()),
            },
        }
    )
    print(f"Jogos processados: {len(jogos)} -> {caminho_saida}")


if __name__ == "__main__":
    executar_preprocessamento_jogos()
