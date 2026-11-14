// Função no sistema: Orquestrar a interface principal estilo chatbot em fundo preto,
// integrando SeletorFilmes, CardJogo, ListaFranquias e o protótipo TelaLoginMockup.

import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Typography } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import { CardJogo } from "./components/CardJogo";
import { ListaFranquias } from "./components/ListaFranquias";
import { SeletorFilmes } from "./components/SeletorFilmes";
import { TelaLoginMockup } from "./components/TelaLogin";
import { gerarRecomendacoes } from "./services/api";
import { FilmeResumo, RecomendacaoResponse } from "./types/recomendacao";

export const App: React.FC = () => {
  const [exibirLoginMockup, setExibirLoginMockup] = useState(false);
  const [historico, setHistorico] = useState<RecomendacaoResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimChatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fimChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historico]);

  if (exibirLoginMockup) {
    return <TelaLoginMockup onVoltar={() => setExibirLoginMockup(false)} />;
  }

  const handleGerarRecomendacoes = async (filmes: FilmeResumo[]) => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await gerarRecomendacoes({
        movie_ids: filmes.map((f) => f.movie_id),
        top_n: 10,
      });
      setHistorico((prev) => [...prev, resposta]);
    } catch {
      setErro(
        "Não foi possível conectar à API. Verifique se o servidor FastAPI está em execução na porta 8000."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho minimalista com acesso ao protótipo de Login/Cadastro */}
      <Box
        sx={{
          px: 3,
          py: 1.8,
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SportsEsportsOutlinedIcon sx={{ color: "#ffffff" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
            CineGame Recommender
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonOutlineIcon />}
          onClick={() => setExibirLoginMockup(true)}
          sx={{
            color: "#e5e5e5",
            borderColor: "#2e2e2e",
            borderRadius: "20px",
            textTransform: "none",
            px: 2,
            "&:hover": { borderColor: "#525252", bgcolor: "#121212" },
          }}
        >
          Entrar / Criar conta
        </Button>
      </Box>

      {/* Área central de conversa estilo chatbot */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 860,
          mx: "auto",
          px: 2,
          py: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: historico.length === 0 ? "center" : "flex-start",
        }}
      >
        {historico.length === 0 ? (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1.5, color: "#f5f5f5" }}>
              Quais filmes você mais gosta?
            </Typography>
            <Typography variant="body1" sx={{ color: "#8e8e8e", maxWidth: 540, mx: "auto" }}>
              Escolha de 2 a 3 filmes abaixo. Analisamos os gêneros, temáticas e ambientações para
              recomendar jogos equivalentes.
            </Typography>
          </Box>
        ) : (
          historico.map((item) => (
            <Box
              key={item.consulta_id}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}
            >
              {/* Mensagem do usuário à direita */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "#1f1f1f",
                    color: "#ffffff",
                    px: 2.5,
                    py: 1.5,
                    borderRadius: "20px 20px 4px 20px",
                    maxWidth: "75%",
                    border: "1px solid #2e2e2e",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mb: 0.5 }}>
                    Filmes escolhidos:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {item.filmes_selecionados.map((filme) => (
                      <Chip
                        key={filme.movie_id}
                        label={filme.title}
                        size="small"
                        sx={{ bgcolor: "#2e2e2e", color: "#ffffff", fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>

              {/* Resposta do sistema à esquerda */}
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: "#1a1a1a",
                    border: "1px solid #2e2e2e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ color: "#ffffff", fontSize: 18 }} />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: "#d4d4d4", mb: 2 }}>
                    Com base nas características dos filmes selecionados, estes são os{" "}
                    <strong>{item.recomendacoes.length} jogos mais compatíveis</strong>:
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {item.recomendacoes.map((jogo, idx) => (
                      <CardJogo
                        key={jogo.game_id}
                        posicao={idx + 1}
                        jogo={jogo}
                        consultaId={item.consulta_id}
                      />
                    ))}
                  </Box>

                  <ListaFranquias
                    franquias={item.franquias_identificadas}
                    jogos={item.jogos_franquia}
                  />
                </Box>
              </Box>
            </Box>
          ))
        )}

        {erro && (
          <Alert
            severity="error"
            sx={{ mb: 2, bgcolor: "#2a1215", color: "#fecaca", border: "1px solid #5c1d24" }}
          >
            {erro}
          </Alert>
        )}

        <div ref={fimChatRef} />
      </Box>

      {/* Caixa de entrada fixa na base */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#000000",
          px: 2,
          pb: 2.5,
          pt: 1,
        }}
      >
        <SeletorFilmes onEnviar={handleGerarRecomendacoes} carregando={carregando} />
      </Box>
    </Box>
  );
};

export default App;