
import axios from "axios";

import {
  FeedbackRequest,
  FilmeResumo,
  RecomendacaoRequest,
  RecomendacaoResponse,
  DetalhesJogoSteam,
} from "../types/recomendacao";

// Configuração da comunicação com o FastAPI
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 30000,
});

// Buscar filmes pelo título
export async function buscarFilmes(
  termo: string,
  limite = 10
): Promise<FilmeResumo[]> {
  const { data } = await api.get<FilmeResumo[]>(
    "/filmes/buscar",
    {
      params: {
        q: termo,
        limite,
      },
    }
  );

  return data;
}

// Gerar recomendações com base nos filmes selecionados
export async function gerarRecomendacoes(
  payload: RecomendacaoRequest
): Promise<RecomendacaoResponse> {
  const { data } = await api.post<RecomendacaoResponse>(
    "/recomendar",
    payload
  );

  return data;
}

// Enviar avaliações dos jogos recomendados
export async function enviarFeedback(
  payload: FeedbackRequest
): Promise<void> {
  await api.post("/feedback", payload);
}

// Buscar detalhes de um jogo na Steam
export async function buscarDetalhesJogo(
  gameId: number
): Promise<DetalhesJogoSteam> {
  const { data } = await api.get<DetalhesJogoSteam>(
    `/jogos/${gameId}`
  );

  return data;
}