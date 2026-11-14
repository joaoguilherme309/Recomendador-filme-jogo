// Função no sistema: Centralizar as chamadas HTTP (Axios) do frontend React para os
// endpoints do backend FastAPI (/filmes/buscar, /recomendar e /feedback).

import axios from "axios";
import {
  FeedbackRequest,
  FilmeResumo,
  RecomendacaoRequest,
  RecomendacaoResponse,
} from "../types/recomendacao";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 15000,
});

export async function buscarFilmes(termo: string, limite = 10): Promise<FilmeResumo[]> {
  const { data } = await api.get<FilmeResumo[]>("/filmes/buscar", {
    params: { q: termo, limite },
  });
  return data;
}

export async function gerarRecomendacoes(
  payload: RecomendacaoRequest
): Promise<RecomendacaoResponse> {
  const { data } = await api.post<RecomendacaoResponse>("/recomendar", payload);
  return data;
}

export async function enviarFeedback(payload: FeedbackRequest): Promise<void> {
  await api.post("/feedback", payload);
}