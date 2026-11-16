
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { buscarFilmes } from "../services/api";
import { FilmeResumo } from "../types/recomendacao";

interface SeletorFilmesProps {
  onEnviar: (filmes: FilmeResumo[]) => void;
  carregando: boolean;
}

export const SeletorFilmes: React.FC<SeletorFilmesProps> = ({
  onEnviar,
  carregando,
}) => {
  const [selecionados, setSelecionados] = useState<FilmeResumo[]>([]);
  const [opcoes, setOpcoes] = useState<FilmeResumo[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Busca de filmes na API
  useEffect(() => {
    const query = termoBusca.trim();
    let ativo = true;

    if (query.length < 2) {
      setOpcoes([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);

    const timer = setTimeout(async () => {
      try {
        const resultados = await buscarFilmes(query, 10);

        if (ativo) {
          setOpcoes(resultados);
        }
      } catch {
        if (ativo) {
          setOpcoes([]);
        }
      } finally {
        if (ativo) {
          setBuscando(false);
        }
      }
    }, 300);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termoBusca]);

  const podeEnviar =
    selecionados.length >= 2 &&
    selecionados.length <= 3 &&
    !carregando;

  const handleEnviar = () => {
    if (!podeEnviar) return;

    onEnviar(selecionados);
    setSelecionados([]);
    setTermoBusca("");
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* TÍTULO */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#171717",
          mb: 1,
        }}
      >
        Quais filmes você mais gosta?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#6B6B6B",
          mb: 3,
        }}
      >
        Escolha de 2 a 3 filmes para começarmos.
      </Typography>

      {/* CAMPO DE BUSCA */}
      <Autocomplete<FilmeResumo, true, false, false>
        multiple
        fullWidth
        options={opcoes}
        value={selecionados}
        loading={buscando}
        filterOptions={(x) => x}
        filterSelectedOptions
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(opt, val) =>
          opt.movie_id === val.movie_id
        }
        onInputChange={(_, novoTexto, reason) => {
          if (reason === "input") {
            setTermoBusca(novoTexto);
          } else if (
            reason === "clear" ||
            reason === "reset"
          ) {
            setTermoBusca("");
          }
        }}
        onChange={(_, novosValores) => {
          if (novosValores.length <= 3) {
            setSelecionados(novosValores);
          }
        }}
        noOptionsText={
          termoBusca.trim().length < 2
            ? "Digite pelo menos 2 letras..."
            : "Nenhum filme encontrado"
        }
        loadingText="Buscando filmes..."
        openOnFocus={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#FFFFFF",
              color: "#171717",
              border: "1px solid #E5E5E5",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              mt: 0.5,

              "& .MuiAutocomplete-noOptions": {
                color: "#777777",
              },

              "& .MuiAutocomplete-loading": {
                color: "#777777",
              },

              "& .MuiAutocomplete-option": {
                color: "#171717",
                borderBottom: "1px solid #F1F1F1",
              },

              "& .MuiAutocomplete-option:hover": {
                bgcolor: "#F5F8F4",
              },

              '& .MuiAutocomplete-option[aria-selected="true"]': {
                bgcolor: "#E9EFE7",
              },
            },
          },

          listbox: {
            sx: {
              maxHeight: 250,
              py: 0.5,
            },
          },
        }}
        renderTags={() => null}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start !important",
                px: 2,
                py: 1.5,
                cursor: "pointer",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#171717",
                }}
              >
                {option.title}
              </Typography>

              {option.genres.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#777777",
                    mt: 0.3,
                  }}
                >
                  {option.genres.join(" • ")}
                </Typography>
              )}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              selecionados.length >= 3
                ? "Limite de 3 filmes atingido"
                : "Buscar ou selecionar um filme..."
            }
            InputProps={{
              ...params.InputProps,

              startAdornment: (
                <>
                  <SearchIcon
                    sx={{
                      color: "#858585",
                      mr: 1,
                    }}
                  />
                  {params.InputProps.startAdornment}
                </>
              ),

              endAdornment: (
                <>
                  {buscando && (
                    <CircularProgress
                      size={18}
                      sx={{ color: "#285C36" }}
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                borderRadius: "10px",
                minHeight: 56,
                color: "#171717",

                "& fieldset": {
                  borderColor: "#D9D9D9",
                },

                "&:hover fieldset": {
                  borderColor: "#879C88",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#285C36",
                  borderWidth: "2px",
                },
              },

              // CORREÇÃO DO TEXTO DIGITADO
              "& .MuiInputBase-input": {
                color: "#171717 !important",
                WebkitTextFillColor: "#171717",
                fontSize: "15px",
              },

              // CORREÇÃO DO PLACEHOLDER
              "& .MuiInputBase-input::placeholder": {
                color: "#858585 !important",
                WebkitTextFillColor: "#858585",
                opacity: 1,
                fontSize: "15px",
              },

              "& .MuiAutocomplete-endAdornment .MuiIconButton-root": {
                color: "#666666",
              },
            }}
          />
        )}
      />

      {/* FILMES SELECIONADOS */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 2.5,
          minHeight: 38,
        }}
      >
        {selecionados.map((filme) => (
          <Chip
            key={filme.movie_id}
            label={filme.title}
            onDelete={() =>
              setSelecionados((prev) =>
                prev.filter(
                  (f) => f.movie_id !== filme.movie_id
                )
              )
            }
            sx={{
              bgcolor: "#E9EFE7",
              color: "#24492C",
              fontWeight: 500,
              borderRadius: "9px",

              "& .MuiChip-deleteIcon": {
                color: "#52735A",

                "&:hover": {
                  color: "#285C36",
                },
              },
            }}
          />
        ))}
      </Box>

      {/* CONTADOR */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "#858585",
          mt: 1,
        }}
      >
        {selecionados.length}/3 filmes selecionados
        (mínimo de 2)
      </Typography>

      {/* BOTÃO DE RECOMENDAÇÃO */}
      <Box
        sx={{
          borderTop: "1px solid #EAEAEA",
          mt: 3,
          pt: 2.5,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          endIcon={
            carregando ? (
              <CircularProgress
                size={18}
                sx={{ color: "#FFFFFF" }}
              />
            ) : (
              <ArrowForwardIcon />
            )
          }
          disabled={!podeEnviar}
          onClick={handleEnviar}
          sx={{
            bgcolor: "#285C36",
            color: "#FFFFFF",
            px: 3,
            py: 1.4,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",

            "&:hover": {
              bgcolor: "#1D4629",
              boxShadow: "none",
            },

            "&.Mui-disabled": {
              bgcolor: "#E9E9E9",
              color: "#999999",
            },
          }}
        >
          {carregando
            ? "Gerando..."
            : "Gerar recomendações"}
        </Button>
      </Box>
    </Box>
  );
};
