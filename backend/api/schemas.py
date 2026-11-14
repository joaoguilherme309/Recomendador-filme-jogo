# Função no sistema: Validar os dados de entrada e estruturar os contratos JSON de saída
# da API FastAPI utilizando modelos Pydantic.

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class FilmeResumo(BaseModel):
    movie_id: int
    title: str
    genres: list[str] = []
    overview: str = ""


class ExplicacaoRecomendacao(BaseModel):
    termos_em_comum: list[str]
    filme_mais_influente: str
    justificativa: str


class JogoRecomendado(BaseModel):
    game_id: int
    name: str
    similaridade: float
    genres: list[str] = []
    tags: list[str] = []
    header_image: str | None = None
    explicacao: ExplicacaoRecomendacao | None = None


class RecomendacaoRequest(BaseModel):
    movie_ids: list[int] = Field(
        ...,
        min_length=2,
        max_length=3,
        description="Lista com 2 ou 3 IDs de filmes favoritos do usuário",
    )
    notas: list[float] | None = Field(
        default=None,
        description="Pesos/notas opcionais (1 a 5) correspondentes a cada filme",
    )
    top_n: int = Field(default=10, ge=1, le=30)

    @model_validator(mode="after")
    def validar_notas(self):
        if self.notas is not None and len(self.notas) != len(self.movie_ids):
            raise ValueError("A quantidade de notas deve ser igual à de filmes selecionados.")
        return self


class RecomendacaoResponse(BaseModel):
    consulta_id: int
    filmes_selecionados: list[FilmeResumo]
    franquias_identificadas: list[str]
    recomendacoes: list[JogoRecomendado]
    jogos_franquia: list[JogoRecomendado]


class FeedbackRequest(BaseModel):
    consulta_id: int
    game_id: int
    game_name: str
    nota: int = Field(..., ge=1, le=5)
    relevante: bool


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    consulta_id: int
    game_id: int
    nota: int
    relevante: bool
    criado_em: datetime


class ConsultaHistoricoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filmes_ids: str
    filmes_titulos: str
    franquias_detectadas: str | None
    criado_em: datetime