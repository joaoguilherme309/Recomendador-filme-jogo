
import React, { useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";

import { JogoRecomendado } from "../types/recomendacao";
import { AvaliacaoUsuario, TipoVoto } from "./AvaliacaoUsuario";
import { DetalhesJogo } from "./DetalhesJogo";
import { enviarFeedback } from "../services/api";

interface CardJogoProps {
  posicao: number;
  jogo: JogoRecomendado;
  consultaId: number;
}

// Identidade visual do CineGame Recommender
const cores = {
  branco: "#FFFFFF",
  texto: "#171717",
  secundario: "#666666",
  verde: "#285C36",
  verdeClaro: "#E9EFE7",
  borda: "#E7E5E1",
};

// Define a aparência de cada posição do ranking
const obterEstiloRanking = (posicao: number) => {
  switch (posicao) {
    case 1:
      return {
        borda: "#D4AF37",
        fundo: "#FFFCF3",
        selo: "Recomendado",
        seloFundo: "#FFF0BF",
        seloTexto: "#806000",
        medalha: "🥇",
      };

    case 2:
      return {
        borda: "#B7BEC8",
        fundo: "#FAFBFC",
        selo: "Recomendado",
        seloFundo: "#E8ECF0",
        seloTexto: "#53606D",
      };

    case 3:
      return {
        borda: "#CD7F32",
        fundo: "#FFF9F4",
        selo: "Recomendado",
        seloFundo: "#FBE6D3",
        seloTexto: "#8A4F1D",
      };

    default:
      return {
        borda: cores.borda,
        fundo: cores.branco,
        selo: null,
        seloFundo: cores.verdeClaro,
        seloTexto: cores.verde,
        medalha: null,
      };
  }
};

export const CardJogo: React.FC<CardJogoProps> = ({
  posicao,
  jogo,
  consultaId,
}) => {
  const ranking = obterEstiloRanking(posicao);

  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [voto, setVoto] = useState<TipoVoto>(null);
  const [enviandoVoto, setEnviandoVoto] = useState(false);

  const abrirDetalhes = () => {
    setDetalhesAberto(true);
  };

  const tratarTecla = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirDetalhes();
    }
  };

  // Registra a avaliação do usuário
  const registrarVoto = async (relevante: boolean) => {
    if (enviandoVoto) return;

    setEnviandoVoto(true);

    try {
      await enviarFeedback({
        consulta_id: consultaId,
        game_id: jogo.game_id,
        game_name: jogo.name,
        nota: relevante ? 5 : 1,
        relevante,
      });

      // Atualiza o voto somente após o registro bem-sucedido
      setVoto(relevante ? "positivo" : "negativo");
    } catch (erro) {
      console.error("Erro ao registrar avaliação:", erro);
    } finally {
      setEnviandoVoto(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          bgcolor: ranking.fundo,
          border: `2px solid ${ranking.borda}`,
          borderRadius: "16px",
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          boxSizing: "border-box",
          boxShadow:
            posicao <= 3
              ? "0 5px 20px rgba(0,0,0,0.055)"
              : "0 3px 12px rgba(0,0,0,0.035)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",

          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 26px rgba(0,0,0,0.09)",
          },
        }}
      >
        {/* SELO DO RANKING */}
        {ranking.selo && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                bgcolor: ranking.seloFundo,
                color: ranking.seloTexto,
                px: 1.4,
                py: 0.6,
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {ranking.medalha && <span>{ranking.medalha}</span>}
              {ranking.selo}
            </Box>
          </Box>
        )}

        {/* IMAGEM E INFORMAÇÕES PRINCIPAIS */}
        <Box
          onClick={abrirDetalhes}
          onKeyDown={tratarTecla}
          role="button"
          tabIndex={0}
          aria-label={`Ver detalhes de ${jogo.name}`}
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: "flex-start",
            gap: 2,
            cursor: "pointer",
            borderRadius: "8px",

            "&:focus-visible": {
              outline: "2px solid #285C36",
              outlineOffset: "4px",
            },
          }}
        >
          {/* CAPA DO JOGO */}
          {jogo.header_image ? (
            <Box
              component="img"
              src={jogo.header_image}
              alt={`Imagem do jogo ${jogo.name}`}
              loading="lazy"
              sx={{
                width: {
                  xs: "100%",
                  sm: 165,
                },
                height: {
                  xs: 150,
                  sm: 105,
                },
                objectFit: "cover",
                borderRadius: "10px",
                flexShrink: 0,
                border: "1px solid #EAEAEA",
              }}
            />
          ) : (
            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: 165,
                },
                height: {
                  xs: 150,
                  sm: 105,
                },
                bgcolor: "#F0F0F0",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#888888" }}
              >
                Imagem indisponível
              </Typography>
            </Box>
          )}

          {/* DADOS DO JOGO */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
            }}
          >
            {/* NOME DO JOGO */}
            <Typography
              variant="subtitle1"
              sx={{
                color: cores.texto,
                fontWeight: 700,
                fontSize: "1rem",
                lineHeight: 1.4,
                overflowWrap: "anywhere",
                mb: 1,
              }}
            >
              {posicao}. {jogo.name}
            </Typography>

            {/* PONTUAÇÃO DE SIMILARIDADE */}
            <Chip
              label={`${(jogo.similaridade * 100).toFixed(1)}% de similaridade`}
              size="small"
              sx={{
                bgcolor: cores.verdeClaro,
                color: cores.verde,
                fontWeight: 700,
                fontSize: "0.72rem",
                borderRadius: "7px",
                height: 26,
                mb: 1.5,
              }}
            />

            {/* EXPLICAÇÃO DO MODELO */}
            {jogo.explicacao && (
              <Typography
                variant="body2"
                sx={{
                  color: cores.secundario,
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  overflowWrap: "anywhere",
                }}
              >
                {jogo.explicacao.justificativa}
              </Typography>
            )}
          </Box>
        </Box>

        {/* TERMOS EM COMUM */}
        {jogo.explicacao &&
          jogo.explicacao.termos_em_comum.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.8,
              }}
            >
              {jogo.explicacao.termos_em_comum.map(
                (termo, index) => (
                  <Chip
                    key={`${termo}-${index}`}
                    label={termo}
                    size="small"
                    sx={{
                      bgcolor: "#F1F2EF",
                      color: "#555555",
                      fontSize: "0.72rem",
                      height: 25,
                      borderRadius: "7px",
                      border: "1px solid #E7E9E3",
                    }}
                  />
                )
              )}
            </Box>
          )}

        {/* AVALIAÇÃO DO USUÁRIO */}
        <Box
          sx={{
            mt: "auto",
            pt: 1.5,
            borderTop: "1px solid #EAEAEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minHeight: 42,
          }}
        >
          <AvaliacaoUsuario
            voto={voto}
            enviando={enviandoVoto}
            onVotar={registrarVoto}
          />
        </Box>
      </Paper>

      {/* MODAL DE DETALHES DA STEAM */}
      <DetalhesJogo
        open={detalhesAberto}
        gameId={jogo.game_id}
        nomeFallback={jogo.name}
        imagemFallback={jogo.header_image}
        jogo={jogo}
        consultaId={consultaId}
        voto={voto}
        enviandoVoto={enviandoVoto}
        onVotar={registrarVoto}
        onClose={() => setDetalhesAberto(false)}
      />
    </>
  );
};
