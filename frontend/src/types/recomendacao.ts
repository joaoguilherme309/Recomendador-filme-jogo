// Função no sistema: Definir as interfaces TypeScript que espelham os contratos JSON
// da API FastAPI para filmes, jogos recomendados, explicações e feedback do usuário.

export interface FilmeResumo {
  movie_id: number;
  title: string;
  genres: string[];
  overview: string;
}

export interface ExplicacaoRecomendacao {
  termos_em_comum: string[];
  filme_mais_influente: string;
  justificativa: string;
}

export interface JogoRecomendado {
  game_id: number;
  name: string;
  similaridade: number;
  genres: string[];
  tags: string[];
  header_image: string | null;
  explicacao: ExplicacaoRecomendacao | null;
}

export interface RecomendacaoRequest {
  movie_ids: number[];
  notas?: number[];
  top_n?: number;
}

export interface RecomendacaoResponse {
  consulta_id: number;
  filmes_selecionados: FilmeResumo[];
  franquias_identificadas: string[];
  recomendacoes: JogoRecomendado[];
  jogos_franquia: JogoRecomendado[];
}

export interface FeedbackRequest {
  consulta_id: number;
  game_id: number;
  game_name: string;
  nota: number;
  relevante: boolean;
}

export interface DetalhesJogoSteam {
  game_id: number;
  name: string;
  type: string;
  description: string;
  header_image: string | null;
  developers: string[];
  publishers: string[];
  release_date: string;
  genres: string[];
  screenshots: string[];
  store_url: string;
}