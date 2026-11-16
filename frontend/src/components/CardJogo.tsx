
import React, { useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";

import { JogoRecomendado } from "../types/recomendacao";
import { AvaliacaoUsuario, TipoVoto } from "./AvaliacaoUsuario";
import { DetalhesJogo } from "./DetalhesJogo";
import { enviarFeedback } from "../services/api";

interface CardJogoProps {
  posicao?: number;
  jogo: JogoRecomendado;
  consultaId?: number;
  variante?: "principal" | "franquia";
}

const cores = {
  branco: "#FFFFFF",
  texto: "#171717",
  secundario: "#666666",
  verde: "#285C36",
  verdeClaro: "#E9EFE7",
  borda: "#E7E5E1",
  azul: "#3283CE",
  azulClaro: "#EAF4FF",
};

// Aparência das posições do ranking principal
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
        medalha: "🥈",
      };

    case 3:
      return {
        borda: "#CD7F32",
        fundo: "#FFF9F4",
        selo: "Recomendado",
        seloFundo: "#FBE6D3",
        seloTexto: "#8A4F1D",
        medalha: "🥉",
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
  variante = "principal",
}) => {
  const ehFranquia = variante === "franquia";

  const ranking = obterEstiloRanking(posicao ?? 0);

  // Jogos de franquia possuem identidade azul
  const bordaCard = ehFranquia
    ? cores.azul
    : ranking.borda;

  const fundoCard = ehFranquia
    ? cores.branco
    : ranking.fundo;

  const corDestaque = ehFranquia
    ? cores.azul
    : cores.verde;

  const fundoDestaque = ehFranquia
    ? cores.azulClaro
    : cores.verdeClaro;

  const termosEmComum =
    jogo.explicacao?.termos_em_comum ?? [];

  const termosExibidos =
    termosEmComum.length > 0
      ? termosEmComum
      : ehFranquia
      ? [...(jogo.genres ?? []), ...(jogo.tags ?? [])].slice(0, 5)
      : [];

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
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: fundoCard,
        border: `2px solid ${bordaCard}`,
        borderRadius: "16px",
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        boxSizing: "border-box",

        boxShadow:
          !ehFranquia && posicao !== undefined && posicao <= 3
            ? "0 5px 20px rgba(0,0,0,0.055)"
            : "0 3px 12px rgba(0,0,0,0.035)",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: ehFranquia
            ? "0 8px 26px rgba(50,131,206,0.14)"
            : "0 8px 26px rgba(0,0,0,0.09)",
        },
      }}
    >
      {/* SELO DO RANKING PRINCIPAL */}

      {!ehFranquia && ranking.selo && (
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
            <span>{ranking.medalha}</span>
            {ranking.selo}
          </Box>
        </Box>
      )}

      {/* IMAGEM E INFORMAÇÕES PRINCIPAIS */}

      <Box
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
        {/* IMAGEM DO JOGO */}

        {jogo.header_image ? (
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

        {/* INFORMAÇÕES */}

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
          {/* NOME */}

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
            {!ehFranquia && posicao !== undefined
              ? `${posicao}. `
              : ""}
            {jogo.name}
          </Typography>

          {/* SIMILARIDADE */}

          <Chip
            label={`${(jogo.similaridade * 100).toFixed(1)}% de similaridade`}
            size="small"
            sx={{
              bgcolor: fundoDestaque,
              color: corDestaque,
              fontWeight: 700,
              fontSize: "0.72rem",
              borderRadius: "7px",
              height: 26,
              mb: 1.5,
            }}
          />

          {/* EXPLICAÇÃO */}

          {ehFranquia ? (
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
              Jogo relacionado à mesma franquia ou
              universo de um dos filmes selecionados.
              {jogo.explicacao?.justificativa
                ? ` ${jogo.explicacao.justificativa}`
                : ""}
            </Typography>
          ) : (
            jogo.explicacao && (
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
            )
          )}
        </Box>
      </Box>

      {/* TERMOS EM COMUM OU GÊNEROS */}

      {termosExibidos.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.8,
          }}
        >
          {termosExibidos.map((termo, index) => (
            <Chip
              key={`${termo}-${index}`}
              label={termo}
              size="small"
              sx={{
                bgcolor: ehFranquia
                  ? "#F0F6FC"
                  : "#F1F2EF",

                color: ehFranquia
                  ? "#27669C"
                  : "#555555",

                fontSize: "0.72rem",
                height: 25,
                borderRadius: "7px",

                border: ehFranquia
                  ? "1px solid #D6E8F7"
                  : "1px solid #E7E9E3",
              }}
            />
          ))}
        </Box>
      )}

      {/* RODAPÉ */}

      <Box
        sx={{
          mt: "auto",
          pt: 1.5,
          borderTop: ehFranquia
            ? "1px solid #D6E8F7"
            : "1px solid #EAEAEA",

          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minHeight: 42,
        }}
      >
        {/* AVALIAÇÃO APENAS NAS RECOMENDAÇÕES PRINCIPAIS */}

        {!ehFranquia && consultaId !== undefined ? (
          <AvaliacaoUsuario
            consultaId={consultaId}
            jogo={jogo}
          />
        ) : ehFranquia ? (
          <Typography
            variant="caption"
            sx={{
              color: cores.azul,
              fontWeight: 600,
            }}
          >
            Jogo da mesma franquia
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
};
