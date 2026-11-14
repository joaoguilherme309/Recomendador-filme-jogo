# Função no sistema: Mapear as tabelas relacionais do SQLite (consultas de perfil
# e avaliações das recomendações) utilizando o ORM do SQLAlchemy.

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.db.database import Base


def _agora_utc():
    return datetime.now(timezone.utc)


class ConsultaPerfil(Base):
    __tablename__ = "consultas_perfil"

    id = Column(Integer, primary_key=True, index=True)
    filmes_ids = Column(String, nullable=False)
    filmes_titulos = Column(String, nullable=False)
    franquias_detectadas = Column(String, nullable=True)
    criado_em = Column(DateTime(timezone=True), default=_agora_utc, nullable=False)

    avaliacoes = relationship(
        "AvaliacaoRecomendacao",
        back_populates="consulta",
        cascade="all, delete-orphan",
    )


class AvaliacaoRecomendacao(Base):
    __tablename__ = "avaliacoes_recomendacao"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(
        Integer,
        ForeignKey("consultas_perfil.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    game_id = Column(Integer, nullable=False, index=True)
    game_name = Column(String, nullable=False)
    nota = Column(Integer, nullable=False)
    relevante = Column(Boolean, nullable=False)
    criado_em = Column(DateTime(timezone=True), default=_agora_utc, nullable=False)

    consulta = relationship("ConsultaPerfil", back_populates="avaliacoes")