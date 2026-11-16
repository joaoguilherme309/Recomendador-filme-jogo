# Função no sistema: Definir os endpoints HTTP da API FastAPI para busca de filmes,
# geração de recomendações de jogos por perfil cinematográfico e registro de feedback.

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.api import schemas
from backend.db import models
from backend.db.database import get_db
from backend.ml.modelo_recomendacao import (
    buscar_filmes,
    recomendar_jogos_por_perfil,
)

from backend.services.steam import buscar_detalhes_steam

router = APIRouter(tags=["Recomendação"])


@router.get("/filmes/buscar", response_model=list[schemas.FilmeResumo])
def endpoint_buscar_filmes(
    q: str = Query(..., min_length=2, description="Trecho do título do filme"),
    limite: int = Query(10, ge=1, le=30),
):
    resultados = buscar_filmes(termo=q, limite=limite)
    return resultados


@router.post("/recomendar", response_model=schemas.RecomendacaoResponse)
def endpoint_recomendar_jogos(
    payload: schemas.RecomendacaoRequest,
    db: Session = Depends(get_db),
):
    # Remove IDs duplicados preservando a ordem escolhida pelo usuário
    movie_ids_unicos = list(dict.fromkeys(payload.movie_ids))
    if len(movie_ids_unicos) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selecione pelo menos 2 filmes distintos para montar o perfil.",
        )

    try:
        resultado = recomendar_jogos_por_perfil(
            movie_ids=movie_ids_unicos,
            notas=payload.notas,
            quantidade=payload.top_n,
        )
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro

    # Registra a consulta no SQLite para histórico e vínculo com avaliações futuras
    titulos = [f["title"] for f in resultado["filmes_selecionados"]]
    nova_consulta = models.ConsultaPerfil(
        filmes_ids=",".join(map(str, movie_ids_unicos)),
        filmes_titulos=" | ".join(titulos),
        franquias_detectadas=", ".join(resultado["franquias_identificadas"]) or None,
    )
    db.add(nova_consulta)
    db.commit()
    db.refresh(nova_consulta)

    return {
        "consulta_id": nova_consulta.id,
        **resultado,
    }


@router.post(
    "/feedback",
    response_model=schemas.FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def endpoint_registrar_feedback(
    payload: schemas.FeedbackRequest,
    db: Session = Depends(get_db),
):
    consulta = (
        db.query(models.ConsultaPerfil)
        .filter(models.ConsultaPerfil.id == payload.consulta_id)
        .first()
    )
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta de recomendação não encontrada.",
        )

    avaliacao = models.AvaliacaoRecomendacao(
        consulta_id=payload.consulta_id,
        game_id=payload.game_id,
        game_name=payload.game_name,
        nota=payload.nota,
        relevante=payload.relevante,
    )
    db.add(avaliacao)
    db.commit()
    db.refresh(avaliacao)
    return avaliacao


@router.get("/historico", response_model=list[schemas.ConsultaHistoricoResponse])
def endpoint_listar_historico(
    limite: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ConsultaPerfil)
        .order_by(models.ConsultaPerfil.criado_em.desc())
        .limit(limite)
        .all()
    )

@router.get(
    "/jogos/{game_id}",
    response_model=schemas.DetalhesJogoSteam,
)
def endpoint_detalhes_jogo(game_id: int):
    if game_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de jogo inválido.",
        )

    try:
        return buscar_detalhes_steam(game_id)

    except LookupError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro

    except RuntimeError as erro:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(erro),
        ) from erro