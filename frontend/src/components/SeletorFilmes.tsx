// SeletorFilmes.tsx

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
import type { FilmeResumo } from "../types/recomendacao";

interface SeletorFilmesProps {
  onEnviar: (filmes: FilmeResumo[]) => void;
  carregando: boolean;
}

export const SeletorFilmes: React.FC<SeletorFilmesProps> = ({
  onEnviar,
  carregando,
}) => {
  const [selecionados, setSelecionados] = useState<FilmeResumo[]>(
    []
  );

  const [opcoes, setOpcoes] = useState<FilmeResumo[]>([]);

  // Texto controlado pelo React
  const [termoBusca, setTermoBusca] = useState("");

  const [buscando, setBuscando] = useState(false);

  // BUSCA DE FILMES NA API
  useEffect(() => {
    const query = termoBusca.trim();

    let ativo = true;

    if (query.length < 2 || selecionados.length >= 3) {
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
  }, [termoBusca, selecionados.length]);

  // VALIDAÇÃO DO ENVIO
  const podeEnviar =
    selecionados.length >= 2 &&
    selecionados.length <= 3 &&
    !carregando;

  // ENVIO DAS RECOMENDAÇÕES
  const handleEnviar = () => {
    if (!podeEnviar) return;

    onEnviar([...selecionados]);

    setSelecionados([]);
    setTermoBusca("");
    setOpcoes([]);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* TÍTULO */}

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontSize: 17,
          color: "#E6EDF3",
          mb: 1,
        }}
      >
        Quais filmes você mais gosta?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#A7B8C8",
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

        // CORREÇÃO: O TEXTO AGORA É CONTROLADO
        inputValue={termoBusca}

        loading={buscando}
        filterOptions={(x) => x}
        filterSelectedOptions
        disabled={carregando}

        getOptionLabel={(option) => option.title}

        isOptionEqualToValue={(opt, val) =>
          opt.movie_id === val.movie_id
        }

        // CORREÇÃO: PRESERVA O TEXTO AO PERDER O FOCO
        onInputChange={(_, novoTexto, reason) => {
          if (reason === "input") {
            if (selecionados.length < 3) {
              setTermoBusca(novoTexto);
            }
          }

          if (reason === "clear") {
            setTermoBusca("");
          }

          // Ignoramos "blur" e "reset".
          // Assim, o texto não desaparece ao clicar fora.
        }}

        // SELEÇÃO DOS FILMES
        onChange={(_, novosValores, reason) => {
          if (novosValores.length <= 3) {
            setSelecionados(novosValores);

            if (
              reason === "selectOption" ||
              reason === "clear"
            ) {
              // Limpa a pesquisa apenas depois da seleção
              // ou quando o usuário limpa o campo.
              setTermoBusca("");
              setOpcoes([]);
            }
          }
        }}

        noOptionsText={
          selecionados.length >= 3
            ? "Limite de 3 filmes atingido"
            : termoBusca.trim().length < 2
            ? "Digite pelo menos 2 letras..."
            : "Nenhum filme encontrado"
        }

        loadingText="Buscando filmes..."

        openOnFocus={false}
        clearOnBlur={false}
        clearOnEscape={false}

        slotProps={{
          paper: {
            sx: {
              bgcolor: "#1B2A3A",
              color: "#DCE5ED",
              border: "1px solid #34485B",
              borderRadius: "4px",
              boxShadow: "0 12px 28px rgba(10,25,40,0.22)",
              mt: 0.5,

              "& .MuiAutocomplete-noOptions": {
                color: "#A9B8C5",
              },

              "& .MuiAutocomplete-loading": {
                color: "#A9B8C5",
              },

              "& .MuiAutocomplete-option": {
                color: "#DCE5ED",
                borderBottom: "1px solid #2B3D4F",
              },

              "& .MuiAutocomplete-option:hover": {
                bgcolor: "#2A4055",
              },

              '& .MuiAutocomplete-option[aria-selected="true"]': {
                bgcolor: "#314B62",
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

        // OCULTA AS TAGS DENTRO DO CAMPO
        renderTags={() => null}

        // LISTA DE RESULTADOS
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
                  color: "#E6EDF3",
                }}
              >
                {option.title}
              </Typography>

              {(option.genres ?? []).length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#A9B8C5",
                    mt: 0.3,
                  }}
                >
                  {option.genres.join(" • ")}
                </Typography>
              )}
            </Box>
          );
        }}

        // CAMPO DE TEXTO
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
                      color: "#91A4B7",
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
                      sx={{ color: "#66C0F4" }}
                    />
                  )}

                  {params.InputProps.endAdornment}
                </>
              ),
            }}

            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#26394B",
                borderRadius: "4px",
                minHeight: 54,
                color: "#E6EDF3",

                "& fieldset": {
                  borderColor: "#506477",
                },

                "&:hover fieldset": {
                  borderColor: "#78A6C9",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#66A5D2",
                  borderWidth: "2px",
                },
              },

              "& .MuiInputBase-input": {
                color: "#E6EDF3 !important",
                WebkitTextFillColor: "#E6EDF3",
                fontSize: "15px",
              },

              "& .MuiInputBase-input::placeholder": {
                color: "#A9B8C5 !important",
                WebkitTextFillColor: "#A9B8C5",
                opacity: 1,
                fontSize: "15px",
              },

              "& .MuiAutocomplete-endAdornment .MuiIconButton-root": {
                color: "#B4C1CC",
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
              bgcolor: "#314B62",
              color: "#E6EDF3",
              fontWeight: 500,
              borderRadius: "3px",

              "& .MuiChip-deleteIcon": {
                color: "#9BBAD2",

                "&:hover": {
                  color: "#D6E8F5",
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
          color: "#91A4B7",
          mt: 1,
        }}
      >
        {selecionados.length}/3 filmes selecionados
        {" "}(mínimo de 2)
      </Typography>

      {/* BOTÃO DE RECOMENDAÇÃO */}

      <Box
        sx={{
          borderTop: "1px solid #34495E",
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
            bgcolor: "#D6E8F5",
            color: "#FFFFFF",
            px: 3,
            py: 1.4,
            borderRadius: "2px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",

            "&:hover": {
              bgcolor: "#285477",
              boxShadow: "none",
            },

            "&.Mui-disabled": {
              bgcolor: "#34495E",
              color: "#A7B8C8",
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
