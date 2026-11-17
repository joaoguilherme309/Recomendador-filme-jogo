import React, { useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import type { JogoRecomendado } from "../types/recomendacao";
import { AvaliacaoUsuario, TipoVoto } from "./AvaliacaoUsuario";
import { DetalhesJogo } from "./DetalhesJogo";
import { enviarFeedback } from "../services/api";

interface CardJogoProps {
  posicao?: number;
  jogo: JogoRecomendado;
  consultaId?: number;
  variante?: "principal" | "franquia";
}

const paleta = {
  texto: "#E6EDF3",
  secundario: "#A7B8C8",
  azul: "#66C0F4",
  azulClaro: "#26394D",
  verde: "#A4D007",
  borda: "#34495E",
  fundo: "#1B2838",
};

export const CardJogo: React.FC<CardJogoProps> = ({
  posicao,
  jogo,
  consultaId,
  variante = "principal",
}) => {
  const ehFranquia = variante === "franquia";
  const podeAbrirDetalhes = consultaId !== undefined;
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [voto, setVoto] = useState<TipoVoto>(null);
  const [enviandoVoto, setEnviandoVoto] = useState(false);

  const termos = jogo.explicacao?.termos_em_comum?.length
    ? jogo.explicacao.termos_em_comum
    : [...(jogo.genres ?? []), ...(jogo.tags ?? [])].slice(0, 5);

  const registrarVoto = async (relevante: boolean) => {
    if (enviandoVoto || consultaId === undefined) return;
    setEnviandoVoto(true);
    try {
      await enviarFeedback({
        consulta_id: consultaId,
        game_id: jogo.game_id,
        game_name: jogo.name,
        nota: relevante ? 5 : 1,
        relevante,
      });
      setVoto(relevante ? "positivo" : "negativo");
    } catch (erro) {
      console.error("Erro ao registrar avaliação:", erro);
    } finally {
      setEnviandoVoto(false);
    }
  };

  const abrirDetalhes = () => {
    if (podeAbrirDetalhes) setDetalhesAberto(true);
  };

  const tratarTecla = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (podeAbrirDetalhes && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      abrirDetalhes();
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(150px, 220px) minmax(0, 1fr)" },
          gap: { xs: 1.5, sm: 2.2 },
          p: { xs: 1.4, sm: 1.6 },
          bgcolor: ehFranquia ? "#24384A" : "#202F40",
          border: `1px solid ${paleta.borda}`,
          borderLeft: `3px solid ${ehFranquia ? "#4D91C8" : posicao === 1 ? "#A4D007" : paleta.azul}`,
          borderRadius: "0px",
          boxShadow: "none",
          transition: "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            bgcolor: "#2A4055",
            borderColor: "#5B7892",
            boxShadow: "none",
          },
        }}
      >
        <Box
          onClick={abrirDetalhes}
          onKeyDown={tratarTecla}
          role={podeAbrirDetalhes ? "button" : undefined}
          tabIndex={podeAbrirDetalhes ? 0 : undefined}
          aria-label={podeAbrirDetalhes ? `Ver detalhes de ${jogo.name}` : undefined}
          sx={{
            minWidth: 0,
            cursor: podeAbrirDetalhes ? "pointer" : "default",
            alignSelf: "start",
            "&:focus-visible": { outline: "2px solid #66A5D2", outlineOffset: 3 },
          }}
        >
          {jogo.header_image ? (
            <Box
              component="img"
              src={jogo.header_image}
              alt={`Capa de ${jogo.name}`}
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                bgcolor: "#172432",
                borderRadius: "0px",
                border: "1px solid #405A70",
              }}
            />
          ) : (
            <Box sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: "#172432", display: "grid", placeItems: "center", color: paleta.secundario, borderRadius: "0px" }}>
              <Typography variant="caption">Imagem indisponível</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.9 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                onClick={abrirDetalhes}
                sx={{
                  color: paleta.texto,
                  fontWeight: 750,
                  fontSize: { xs: 15, sm: 16 },
                  lineHeight: 1.3,
                  cursor: podeAbrirDetalhes ? "pointer" : "default",
                  overflowWrap: "anywhere",
                  "&:hover": podeAbrirDetalhes ? { color: "#2879B9" } : {},
                }}
              >
                {!ehFranquia && posicao !== undefined ? `${posicao}. ` : ""}{jogo.name}
              </Typography>
              <Typography sx={{ color: paleta.secundario, fontSize: 11, mt: 0.35 }}>
                {ehFranquia ? "Relacionado à franquia" : "Recomendação baseada nos filmes selecionados"}
              </Typography>
            </Box>
            <Chip
              label={`${(jogo.similaridade * 100).toFixed(1)}%`}
              size="small"
              sx={{
                flexShrink: 0,
                height: 24,
                bgcolor: "#31485F",
                color: "#8CCBEE",
                fontWeight: 800,
                fontSize: 11,
                borderRadius: "0px",
              }}
            />
          </Box>

          {jogo.explicacao?.justificativa && (
            <Typography sx={{ color: paleta.secundario, fontSize: 12.5, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {jogo.explicacao.justificativa}
            </Typography>
          )}

          {termos.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.55, mt: 0.2 }}>
              {termos.slice(0, 6).map((termo, index) => (
                <Chip
                  key={`${termo}-${index}`}
                  label={termo}
                  size="small"
                  sx={{ height: 21, bgcolor: "#31485F", color: "#C6D4DF", fontSize: 10, borderRadius: "0px", border: "1px solid #405A70", "& .MuiChip-label": { px: 0.8 } }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ mt: "auto", pt: 0.7, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
            {ehFranquia ? (
              <Typography sx={{ color: "#66C0F4", fontSize: 11, fontWeight: 650 }}>Mesmo universo dos filmes</Typography>
            ) : (
              <Typography sx={{ color: "#8299AD", fontSize: 10.5 }}>Similaridade calculada pelo recomendador</Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {!ehFranquia && consultaId !== undefined && (
                <AvaliacaoUsuario voto={voto} enviando={enviandoVoto} onVotar={registrarVoto} />
              )}
              {podeAbrirDetalhes && <OpenInNewRoundedIcon sx={{ color: "#7D91A1", fontSize: 17 }} />}
            </Box>
          </Box>
        </Box>
      </Paper>

      {podeAbrirDetalhes && (
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
      )}
    </>
  );
};
