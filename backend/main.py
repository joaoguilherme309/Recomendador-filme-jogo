# Função no sistema: Inicializar a aplicação FastAPI, criar as tabelas do banco SQLite
# na subida do servidor, configurar CORS para o frontend React e registrar as rotas.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.db.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API - Recomendador de Jogos Baseado em Filmes",
    description="Sistema de Recomendação por Filtragem Baseada em Conteúdo (TF-IDF + Cosseno)",
    version="1.0.0",
)

# Libera requisições do servidor de desenvolvimento do Vite/React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}