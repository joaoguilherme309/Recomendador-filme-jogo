import React, { useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Container,
  IconButton, Paper, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import VideogameAssetOutlinedIcon from "@mui/icons-material/VideogameAssetOutlined";
import { CabecalhoTransmutacao } from "./components/CabecalhoTransmutacao";
import { CardJogo } from "./components/CardJogo";
import { ListaFranquias } from "./components/ListaFranquias";
import { SeletorFilmes } from "./components/SeletorFilmes";
import { gerarRecomendacoes } from "./services/api";
import type { FilmeResumo, RecomendacaoResponse } from "./types/recomendacao";

type Tela = "inicio" | "explorar" | "historico" | "detalhes";
type ConsultaSalva = RecomendacaoResponse & { salva_em: string; nome: string };
const CHAVE_HISTORICO = "transmutia.historico.v1";
const LIMITE_HISTORICO = 40;

const c = {
  bg: "#1B2838", bgDeep: "#171D25", panel: "#202F40", panel2: "#26394D",
  panelHover: "#30465B", border: "#34495E", text: "#E6EDF3",
  muted: "#A7B8C8", dim: "#71869A", blue: "#66C0F4", blueStrong: "#1A9FFF",
  blueDark: "#16334A", green: "#A4D007", danger: "#D65C5C",
};

const imagemRoy = new URL("../public_mascote/mascote/roy.png", import.meta.url).href;

const gerarNomePadrao = (pesquisas: Array<{ nome: string }>) => {
  const numerosUsados = new Set(
    pesquisas
      .map((pesquisa) => pesquisa.nome.match(/^Pesquisa\s+(\d+)$/i))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => Number(match[1]))
      .filter((numero) => Number.isInteger(numero) && numero > 0)
  );

  let proximoNumero = 1;
  while (numerosUsados.has(proximoNumero)) proximoNumero++;
  return `Pesquisa ${proximoNumero}`;
};

const lerHistorico = (): ConsultaSalva[] => {
  try {
    const raw = localStorage.getItem(CHAVE_HISTORICO);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const validas = parsed.filter((item): item is RecomendacaoResponse & { salva_em?: string; nome?: string } =>
      !!item && typeof item === "object" &&
      typeof item.consulta_id === "number" &&
      Array.isArray(item.filmes_selecionados) &&
      Array.isArray(item.recomendacoes)
    );

    const normalizadas: ConsultaSalva[] = [];
    validas.forEach((item) => {
      const nome = typeof item.nome === "string" && item.nome.trim()
        ? item.nome.trim()
        : gerarNomePadrao(normalizadas);
      normalizadas.push({
        ...item,
        nome,
        salva_em: typeof item.salva_em === "string" ? item.salva_em : new Date().toISOString(),
      });
    });
    return normalizadas;
  } catch { return []; }
};

const dataFormatada = (valor: string) => {
  const date = new Date(valor);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
};

const Roy: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <Box component="img" src={imagemRoy} alt="Roy, guia alquímico"
    sx={{ width: compact ? 58 : 170, height: compact ? 68 : 180, objectFit: "contain", flexShrink: 0 }} />
);

const Brand = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
    <Box sx={{ width: 38, height: 38, display: "grid", placeItems: "center", bgcolor: c.blueDark, color: "#fff" }}>
      <ScienceOutlinedIcon />
    </Box>
    <Box>
      <Typography sx={{ color: c.text, fontSize: 19, fontWeight: 800, lineHeight: 1 }}>TRANSMUTIA</Typography>
      <Typography sx={{ color: c.dim, fontSize: 9, letterSpacing: 1.4, mt: .45 }}>CINEMA ENCONTRA JOGOS</Typography>
    </Box>
  </Box>
);

const navItems: { id: Tela; label: string; icon: React.ReactNode }[] = [
  { id: "inicio", label: "Início", icon: <HomeOutlinedIcon fontSize="small" /> },
  { id: "explorar", label: "Explorar", icon: <SearchRoundedIcon fontSize="small" /> },
  { id: "historico", label: "Histórico", icon: <HistoryRoundedIcon fontSize="small" /> },
];

interface AppProps { }
export const App: React.FC<AppProps> = () => {
  const [tela, setTela] = useState<Tela>("inicio");
  const [historico, setHistorico] = useState<ConsultaSalva[]>(lerHistorico);
  const [consultaAtual, setConsultaAtual] = useState<ConsultaSalva | null>(null);
  const [consultaDetalhe, setConsultaDetalhe] = useState<ConsultaSalva | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [decisaoSalvamento, setDecisaoSalvamento] = useState<"salva" | "nao-salva" | null>(null);
  const [dialogSalvarAberto, setDialogSalvarAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [nomeRascunho, setNomeRascunho] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [buscaHistorico, setBuscaHistorico] = useState("");

  useEffect(() => {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
  }, [historico]);

  const navegar = (destino: Tela) => {
    setErro(null);
    setTela(destino);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gerar = async (filmes: FilmeResumo[]) => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await gerarRecomendacoes({
        movie_ids: filmes.map((f) => f.movie_id),
        top_n: 10,
      });
      const novaConsulta: ConsultaSalva = {
        ...resposta,
        nome: "",
        salva_em: new Date().toISOString(),
      };
      setConsultaAtual(novaConsulta);
      setDecisaoSalvamento(null);
      navegar("explorar");
      setConsultaDetalhe(novaConsulta);
    } catch {
      setErro("Não foi possível gerar as recomendações. Confira se o backend está ativo.");
    } finally {
      setCarregando(false);
    }
  };

  const abrirHistorico = (item: ConsultaSalva) => {
    setConsultaDetalhe(item);
    navegar("detalhes");
  };

  const salvarConsulta = (nome?: string) => {
    if (!consultaAtual) return;
    const existente = historico.find((item) => item.consulta_id === consultaAtual.consulta_id);
    const consulta: ConsultaSalva = {
      ...consultaAtual,
      nome: nome?.trim() || existente?.nome || consultaAtual.nome || gerarNomePadrao(historico),
      salva_em: existente?.salva_em || consultaAtual.salva_em || new Date().toISOString(),
    };
    setHistorico((old) => [consulta, ...old.filter((item) => item.consulta_id !== consulta.consulta_id)].slice(0, LIMITE_HISTORICO));
    setConsultaAtual(consulta);
    setDecisaoSalvamento("salva");
    setDialogSalvarAberto(false);
    setNomeRascunho("");
  };

  const naoSalvarConsulta = () => {
    if (!consultaAtual) return;
    setHistorico((old) => old.filter((item) => item.consulta_id !== consultaAtual.consulta_id));
    setDecisaoSalvamento("nao-salva");
    setConsultaAtual({ ...consultaAtual, nome: "" });
  };

  const abrirEdicaoNome = (item: ConsultaSalva) => {
    setIdEditando(item.consulta_id);
    setNomeRascunho(item.nome);
    setDialogEditarAberto(true);
  };

  const confirmarEdicaoNome = () => {
    const nome = nomeRascunho.trim();
    if (!nome || idEditando === null) return;
    setHistorico((old) => old.map((item) => item.consulta_id === idEditando ? { ...item, nome } : item));
    setConsultaAtual((atual) => atual?.consulta_id === idEditando ? { ...atual, nome } : atual);
    setConsultaDetalhe((atual) => atual?.consulta_id === idEditando ? { ...atual, nome } : atual);
    setDialogEditarAberto(false);
    setIdEditando(null);
    setNomeRascunho("");
  };

  const remover = (id: number) => {
    setHistorico((old) => old.filter((x) => x.consulta_id !== id));
    if (consultaDetalhe?.consulta_id === id) setConsultaDetalhe(null);
    if (consultaAtual?.consulta_id === id) {
      setConsultaAtual(null);
      setDecisaoSalvamento(null);
    }
  };


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: c.bg, color: c.text, fontFamily: '"Motiva Sans", Arial, sans-serif' }}>
      <Box component="header" sx={{ bgcolor: c.bgDeep, borderBottom: `1px solid ${c.border}`, position: "sticky", top: 0, zIndex: 20 }}>
        <Container maxWidth="xl" sx={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box component="button" onClick={() => navegar("inicio")} sx={{ border: 0, bgcolor: "transparent", cursor: "pointer", p: 0 }}>
            <Brand />
          </Box>
          <Box component="nav" sx={{ display: "flex", gap: { xs: .2, sm: 1 }, alignItems: "center" }}>
            {navItems.map((item) => {
              const active = tela === item.id || (tela === "detalhes" && item.id === "historico");
              return <Button key={item.id} onClick={() => navegar(item.id)} startIcon={item.icon}
                sx={{
                  color: active ? "#fff" : c.muted, px: { xs: 1, sm: 1.8 }, py: 1.1,
                  borderRadius: 0, borderBottom: active ? `2px solid ${c.blue}` : "2px solid transparent",
                  fontSize: 13, fontWeight: active ? 800 : 600, textTransform: "none",
                  "&:hover": { bgcolor: "#243447", color: "#fff" },
                  "& .MuiButton-startIcon": { mr: .65 },
                }}>{item.label}{item.id === "historico" && historico.length > 0 ? ` (${historico.length})` : ""}</Button>;
            })}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 1.5, md: 3 } }}>
        {tela === "inicio" && (
          <Box sx={{ maxWidth: 1180, mx: "auto" }}>
            <CabecalhoTransmutacao />

            <Paper
              elevation={0}
              sx={{
                mt: 2.2,
                p: { xs: 2, sm: 2.8 },
                bgcolor: c.panel,
                border: `1px solid ${c.border}`,
                borderTop: `2px solid ${c.blue}`,
                borderRadius: 0,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: c.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1.1 }}>
                  COMO FUNCIONA
                </Typography>
                <Typography sx={{ color: c.text, fontSize: { xs: 17, sm: 20 }, fontWeight: 800, mt: .35 }}>
                  Do cinema para sua próxima aventura
                </Typography>
                <Typography sx={{ color: c.muted, fontSize: 12.5, mt: .45, lineHeight: 1.6 }}>
                  O Transmutia identifica características dos filmes escolhidos e procura jogos com temas, gêneros e atmosferas semelhantes.
                </Typography>
              </Box>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                borderTop: `1px solid ${c.border}`,
              }}>
                {[
                  { icon: <MovieOutlinedIcon />, numero: "01", titulo: "Escolha os filmes", texto: "Selecione de 2 a 3 filmes favoritos." },
                  { icon: <AutoAwesomeOutlinedIcon />, numero: "02", titulo: "Analisamos a essência", texto: "Extraímos gêneros, temas e características." },
                  { icon: <VideogameAssetOutlinedIcon />, numero: "03", titulo: "Descubra jogos", texto: "Explore recomendações e franquias relacionadas." },
                ].map((etapa, index) => (
                  <Box key={etapa.numero} sx={{
                    display: "flex", gap: 1.3, alignItems: "flex-start",
                    p: { xs: 1.4, sm: 1.8 },
                    borderRight: { xs: 0, sm: index < 2 ? `1px solid ${c.border}` : 0 },
                    borderBottom: { xs: index < 2 ? `1px solid ${c.border}` : 0, sm: 0 },
                  }}>
                    <Box sx={{ width: 38, height: 38, flexShrink: 0, display: "grid", placeItems: "center", bgcolor: "#26394D", color: c.blue, border: `1px solid #405A70` }}>
                      {etapa.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: c.blue, fontSize: 9, fontWeight: 800, letterSpacing: .8 }}>{etapa.numero}</Typography>
                      <Typography sx={{ color: c.text, fontSize: 12.5, fontWeight: 800, mt: .15 }}>{etapa.titulo}</Typography>
                      <Typography sx={{ color: c.muted, fontSize: 11, lineHeight: 1.5, mt: .35 }}>{etapa.texto}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
            <Button
              fullWidth
              onClick={() => navegar("explorar")}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                mt: 2.2,
                minHeight: 66,
                bgcolor: "#1A9FFF",
                color: "#fff",
                borderRadius: 0,
                fontSize: { xs: 16, sm: 19 },
                fontWeight: 800,
                letterSpacing: .2,
                textTransform: "none",
                boxShadow: "0 3px 10px rgba(0,0,0,.25)",
                "&:hover": { bgcolor: "#38B4FF" },
              }}
            >
              Descobrir novas aventuras
            </Button>
          </Box>
        )}

        {tela === "explorar" && (
          <Box>
            <Box sx={{ mb: 2.2, pb: 1.5, borderBottom: `1px solid ${c.border}` }}>
              <Typography sx={{ color: c.text, fontSize: 25, fontWeight: 750 }}>Explorar jogos a partir dos seus filmes</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.65fr) minmax(260px, .85fr)" }, gap: 2.2, alignItems: "start" }}>
              <Box sx={{ minWidth: 0 }}>
                <Paper elevation={0} sx={{ bgcolor: c.bgDeep, border: `1px solid ${c.border}`, borderRadius: 0, p: { xs: 1.5, md: 2 } }}>
                  <Typography sx={{ color: c.muted, fontSize: 11, fontWeight: 800, mb: 1, letterSpacing: .6 }}>PESQUISAR FILMES</Typography>
                  <SeletorFilmes onEnviar={gerar} carregando={carregando} />
                </Paper>
                {erro && <Alert severity="error" sx={{ mt: 2, borderRadius: 0 }}>{erro}</Alert>}
                {consultaAtual && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ bgcolor: c.panel, borderTop: `2px solid ${c.blue}`, px: 2, py: 1.3, mb: 1.2 }}>
                      <Typography sx={{ fontSize: 17, fontWeight: 750 }}>Última análise</Typography>
                      <Typography sx={{ color: c.muted, fontSize: 12, mt: .4 }}>
                        {consultaAtual.filmes_selecionados.map((f) => f.title).join(" · ")}
                      </Typography>
                    </Box>
                    {consultaAtual.recomendacoes.map((jogo, i) => (
                      <Box key={`${consultaAtual.consulta_id}-${jogo.game_id}`} sx={{ mb: 1 }}>
                        <CardJogo posicao={i + 1} jogo={jogo} consultaId={consultaAtual.consulta_id} />
                      </Box>
                    ))}
                    <ListaFranquias 
                    franquias={consultaAtual.franquias_identificadas ?? []} 
                    jogos={consultaAtual.jogos_franquia ?? []} 
                    consultaId={consultaAtual.consulta_id} />
                  </Box>
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={{ bgcolor: c.panel, border: `1px solid ${c.border}`, borderRadius: 0, overflow: "hidden" }}>
                <Box sx={{ bgcolor: "#26394D", px: 1.7, py: 1.1, borderBottom: `1px solid ${c.border}` }}>
                  <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>
                    {carregando ? "TRANSMUTAÇÃO EM ANDAMENTO" : consultaAtual ? "SUA ÚLTIMA TRANSMUTAÇÃO" : "CONHEÇA SEU GUIA ALQUÍMICO"}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.6 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "150px minmax(0, 1fr)", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Roy compact={false} /></Box>
                    <Box sx={{
                      position: "relative", bgcolor: "#F3E2BC", color: "#533B20",
                      border: "1px solid #B99456", boxShadow: "0 4px 14px rgba(0,0,0,.18)",
                      p: 1.35, minWidth: 0,
                      "&:before": {
                        content: '""', position: "absolute", left: -8, top: "45%",
                        width: 14, height: 14, bgcolor: "#F3E2BC",
                        borderLeft: "1px solid #B99456", borderBottom: "1px solid #B99456",
                        transform: "rotate(45deg)",
                      },
                    }}>
                      <Typography sx={{ color: "#765329", fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 800, letterSpacing: .4, mb: .65 }}>ROY, O ALQUIMISTA</Typography>
                      <Typography sx={{ color: "#533B20", fontFamily: "Georgia, serif", fontSize: 12.2, lineHeight: 1.65 }}>
                        {carregando
                          ? "Um instante, viajante! Estou reunindo as essências dos seus filmes e preparando novas aventuras para você!"
                          : consultaAtual
                            ? `Ora, ora! Analisei ${consultaAtual.filmes_selecionados.map((f) => f.title).join(", ")} e encontrei jogos que compartilham elementos dessas histórias. Que tal descobrir sua próxima aventura?`
                            : "Saudações, viajante! Sou Roy, o alquimista do Transmutia! Escolha de 2 a 3 filmes que você adora e transformarei suas preferências em novas descobertas!"}
                      </Typography>
                    </Box>
                  </Box>
                  {carregando ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.1, py: 2.2 }}>
                      <CircularProgress size={18} sx={{ color: c.blue }} />
                      <Typography sx={{ color: c.muted, fontSize: 11.5 }}>Preparando sua transmutação...</Typography>
                    </Box>
                  ) : consultaAtual ? (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: .8, mb: .9 }}>
                        <AutoAwesomeOutlinedIcon sx={{ color: c.blue, fontSize: 18 }} />
                        <Typography sx={{ color: c.text, fontSize: 12, fontWeight: 800 }}>ESSÊNCIAS IDENTIFICADAS</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: .65 }}>
                        {[...new Set(consultaAtual.filmes_selecionados.flatMap((f) => f.genres ?? []))].slice(0, 6).map((genero) => (
                          <Chip key={genero} label={genero} size="small" sx={{ bgcolor: "#31485F", color: "#C6D4DF", border: "1px solid #405A70", borderRadius: 0, fontSize: 10 }} />
                        ))}
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 1.5 }}>
                        <Box sx={{ bgcolor: c.bgDeep, p: 1.2, border: `1px solid ${c.border}` }}>
                          <Typography sx={{ color: c.blue, fontSize: 21, fontWeight: 850 }}>{consultaAtual.filmes_selecionados.length}</Typography>
                          <Typography sx={{ color: c.muted, fontSize: 10 }}>Filmes analisados</Typography>
                        </Box>
                        <Box sx={{ bgcolor: c.bgDeep, p: 1.2, border: `1px solid ${c.border}` }}>
                          <Typography sx={{ color: c.blue, fontSize: 21, fontWeight: 850 }}>{consultaAtual.recomendacoes.length}</Typography>
                          <Typography sx={{ color: c.muted, fontSize: 10 }}>Jogos encontrados</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ color: c.text, fontSize: 12, fontWeight: 800, mb: .8 }}>COMO FUNCIONA A ALQUIMIA?</Typography>
                      {[
                        { icon: <MovieOutlinedIcon fontSize="small" />, title: "1. Escolha seus filmes", text: "Selecione de 2 a 3 filmes favoritos." },
                        { icon: <AutoAwesomeOutlinedIcon fontSize="small" />, title: "2. Extração das essências", text: "Analisamos gêneros, temas e características." },
                        { icon: <VideogameAssetOutlinedIcon fontSize="small" />, title: "3. Descubra novos jogos", text: "Receba recomendações personalizadas." },
                      ].map((step) => (
                        <Box key={step.title} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, mb: .7, bgcolor: c.bgDeep, border: `1px solid ${c.border}` }}>
                          <Box sx={{ width: 30, height: 30, display: "grid", placeItems: "center", bgcolor: "#26394D", color: c.blue, flexShrink: 0 }}>{step.icon}</Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: c.text, fontSize: 11.5, fontWeight: 800 }}>{step.title}</Typography>
                            <Typography sx={{ color: c.muted, fontSize: 10.5, mt: .15 }}>{step.text}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
              {consultaAtual && !carregando && (
                <Paper elevation={0} sx={{ mt: 1.5, p: 1.6, bgcolor: c.panel, border: `1px solid ${c.border}`, borderTop: `2px solid ${c.blue}`, borderRadius: 0 }}>
                  {decisaoSalvamento === null ? (
                    <>
                      <Typography sx={{ color: c.text, fontSize: 13, fontWeight: 800, mb: .5 }}>
                        O que deseja fazer com esta pesquisa?
                      </Typography>
                      <Typography sx={{ color: c.muted, fontSize: 11.5, mb: 1.3, lineHeight: 1.5 }}>
                        Suas recomendações continuam disponíveis nesta sessão mesmo que você não as salve.
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column", lg: "row" }, flexWrap: "wrap", gap: 1 }}>
                        <Button onClick={() => { setNomeRascunho(""); setDialogSalvarAberto(true); }} variant="contained" sx={{ bgcolor: c.blueStrong, borderRadius: 0, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#38B4FF" } }}>Salvar como</Button>
                        <Button onClick={() => salvarConsulta()} variant="outlined" sx={{ color: c.blue, borderColor: c.border, borderRadius: 0, textTransform: "none" }}>Salvar</Button>
                        <Button onClick={naoSalvarConsulta} color="inherit" sx={{ color: c.muted, borderRadius: 0, textTransform: "none" }}>Não salvar</Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ color: c.text, fontSize: 13, fontWeight: 800, mb: .5 }}>
                        {decisaoSalvamento === "salva" ? "Pesquisa salva no histórico" : "Pesquisa não salva"}
                      </Typography>
                      <Typography sx={{ color: c.muted, fontSize: 11.5, lineHeight: 1.5 }}>
                        {decisaoSalvamento === "salva"
                          ? `A pesquisa foi salva como “${consultaAtual.nome}”. Você pode encontrá-la no histórico.`
                          : "Esta pesquisa não foi adicionada ao histórico, mas seus resultados continuam disponíveis nesta sessão."}
                      </Typography>
                    </>
                  )}
                </Paper>
              )}
              </Box>
            </Box>
          </Box>
        )}

        {tela === "historico" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
              <Box>
                <Typography sx={{ color: c.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>SUA BIBLIOTECA DE DESCOBERTAS</Typography>
                <Typography sx={{ color: c.text, fontSize: 27, fontWeight: 800, mt: .35 }}>Histórico de transmutação</Typography>
                <Typography sx={{ color: c.muted, fontSize: 13, mt: .4 }}>Pesquisas recentes e recomendações anteriores.</Typography>
              </Box>
              <Button onClick={() => navegar("explorar")} startIcon={<SearchRoundedIcon />}
                sx={{ bgcolor: "#1A9FFF", color: "#fff", px: 2, py: 1, borderRadius: 0, textTransform: "none", fontWeight: 750, "&:hover": { bgcolor: "#38B4FF" } }}>Nova pesquisa</Button>
            </Box>
            <TextField
              fullWidth
              value={buscaHistorico}
              onChange={(e) => setBuscaHistorico(e.target.value)}
              placeholder="Pesquisar pelo nome..."
              size="small"
              InputProps={{ startAdornment: <SearchRoundedIcon sx={{ color: c.dim, mr: 1 }} /> }}
              sx={{ mb: 2.5, maxWidth: 520, "& .MuiOutlinedInput-root": { bgcolor: c.bgDeep, color: c.text, borderRadius: 0, "& fieldset": { borderColor: c.border }, "&:hover fieldset": { borderColor: c.blue } }, "& input::placeholder": { color: c.dim, opacity: 1 } }}
            />
            {historico.length === 0 ? (
              <Paper sx={{ p: 5, bgcolor: c.bgDeep, border: `1px solid ${c.border}`, borderRadius: 0, textAlign: "center" }}>
                <HistoryRoundedIcon sx={{ color: c.dim, fontSize: 36 }} />
                <Typography sx={{ color: c.text, fontSize: 18, fontWeight: 700, mt: 1 }}>Nenhuma pesquisa salva</Typography>
                <Typography sx={{ color: c.muted, fontSize: 13, mt: .6 }}>Suas pesquisas aparecerão aqui quando você escolher salvá-las.</Typography>
              </Paper>
            ) : (() => {
              const termo = buscaHistorico.trim().toLocaleLowerCase("pt-BR");
              const filtradas = historico.filter((item) => item.nome.toLocaleLowerCase("pt-BR").includes(termo));
              const atual = filtradas.find((item) => item.consulta_id === consultaAtual?.consulta_id) ?? filtradas[0];
              const anteriores = filtradas.filter((item) => item.consulta_id !== atual?.consulta_id);
              if (filtradas.length === 0) return (
                <Paper sx={{ p: 4, bgcolor: c.bgDeep, border: `1px solid ${c.border}`, borderRadius: 0, textAlign: "center" }}>
                  <Typography sx={{ color: c.text, fontWeight: 700 }}>Nenhuma pesquisa encontrada</Typography>
                  <Typography sx={{ color: c.muted, fontSize: 12, mt: .5 }}>Tente outro nome.</Typography>
                </Paper>
              );
              return <>
                {atual && <>
                  <SectionTitle title="Pesquisa atual" subtitle="Sua transmutação mais recente" />
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.6, mb: 3 }}>
                    <HistoryCard item={atual} index={0} onOpen={() => abrirHistorico(atual)} onDelete={() => remover(atual.consulta_id)} onRename={() => abrirEdicaoNome(atual)} />
                  </Box>
                </>}
                {anteriores.length > 0 && <>
                  <SectionTitle title={atual ? "Pesquisas anteriores" : "Pesquisas encontradas"} subtitle="Continue explorando suas descobertas salvas" />
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.6 }}>
                    {anteriores.map((item, index) => <HistoryCard key={item.consulta_id} item={item} index={index + 1} onOpen={() => abrirHistorico(item)} onDelete={() => remover(item.consulta_id)} onRename={() => abrirEdicaoNome(item)} />)}
                  </Box>
                </>}
              </>;
            })()}

          </Box>
        )}

        {tela === "detalhes" && consultaDetalhe && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography sx={{ color: c.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1.4 }}>RESULTADOS DA TRANSMUTAÇÃO</Typography>
                <Typography sx={{ color: c.text, fontSize: 25, fontWeight: 800, mt: .3 }}>Jogos recomendados</Typography>
                <Typography sx={{ color: c.muted, fontSize: 12, mt: .4 }}>{consultaDetalhe.filmes_selecionados.map((f) => f.title).join(" · ")}</Typography>
              </Box>
              <Button onClick={() => navegar("historico")} startIcon={<ArrowBackRoundedIcon />} sx={{ color: c.blue, textTransform: "none", fontWeight: 700 }}>Voltar ao histórico</Button>
            </Box>
            {consultaDetalhe.recomendacoes.map((jogo, i) => (
              <Box key={`${consultaDetalhe.consulta_id}-${jogo.game_id}`} sx={{ mb: 1 }}>
                <CardJogo posicao={i + 1} jogo={jogo} consultaId={consultaDetalhe.consulta_id} />
              </Box>
            ))}
            <ListaFranquias 
            franquias={consultaDetalhe.franquias_identificadas ?? []} 
            jogos={consultaDetalhe.jogos_franquia ?? []} 
            consultaId={consultaDetalhe.consulta_id} />
          </Box>
        )}
        {tela === "detalhes" && !consultaDetalhe && (
          <Box><Typography sx={{ color: c.text }}>Pesquisa não encontrada.</Typography><Button onClick={() => navegar("historico")}>Voltar ao histórico</Button></Box>
        )}
        <Dialog open={dialogSalvarAberto} onClose={() => setDialogSalvarAberto(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: c.panel, color: c.text, borderRadius: 0, border: `1px solid ${c.border}` } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Salvar pesquisa como</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: c.muted, fontSize: 12, mb: 1.5 }}>Escolha um nome fácil de reconhecer no histórico.</Typography>
            <TextField autoFocus fullWidth value={nomeRascunho} onChange={(e) => setNomeRascunho(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && nomeRascunho.trim()) salvarConsulta(nomeRascunho); }} placeholder="Nome da pesquisa" size="small" sx={{ "& .MuiOutlinedInput-root": { color: c.text, borderRadius: 0, "& fieldset": { borderColor: c.border } } }} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogSalvarAberto(false)} sx={{ color: c.muted, textTransform: "none" }}>Cancelar</Button>
            <Button onClick={() => salvarConsulta(nomeRascunho)} disabled={!nomeRascunho.trim()} variant="contained" sx={{ bgcolor: c.blueStrong, borderRadius: 0, textTransform: "none" }}>Salvar pesquisa</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={dialogEditarAberto} onClose={() => setDialogEditarAberto(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: c.panel, color: c.text, borderRadius: 0, border: `1px solid ${c.border}` } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Editar nome da pesquisa</DialogTitle>
          <DialogContent>
            <TextField autoFocus fullWidth value={nomeRascunho} onChange={(e) => setNomeRascunho(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmarEdicaoNome(); }} size="small" sx={{ mt: 1, "& .MuiOutlinedInput-root": { color: c.text, borderRadius: 0, "& fieldset": { borderColor: c.border } } }} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogEditarAberto(false)} sx={{ color: c.muted, textTransform: "none" }}>Cancelar</Button>
            <Button onClick={confirmarEdicaoNome} disabled={!nomeRascunho.trim()} variant="contained" sx={{ bgcolor: c.blueStrong, borderRadius: 0, textTransform: "none" }}>Salvar nome</Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Box component="footer" sx={{ bgcolor: c.bgDeep, borderTop: `1px solid ${c.border}`, mt: 5 }}>
        <Container maxWidth="xl" sx={{ py: 1.8, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Typography sx={{ color: c.dim, fontSize: 11 }}>Transmutia · Cinema encontra jogos</Typography>
          <Typography sx={{ color: c.dim, fontSize: 11 }}>As pesquisas são salvas neste navegador.</Typography>
        </Container>
      </Box>
    </Box>
  );
};

const SectionTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <Box sx={{ borderBottom: `1px solid ${c.border}`, pb: 1, mb: 1.5 }}>
    <Typography sx={{ color: c.text, fontSize: 17, fontWeight: 800 }}>{title}</Typography>
    <Typography sx={{ color: c.dim, fontSize: 11, mt: .25 }}>{subtitle}</Typography>
  </Box>
);

const HistoryCard: React.FC<{
  item: ConsultaSalva; index: number; onOpen: () => void; onDelete: () => void; onRename: () => void;
}> = ({ item, onOpen, onDelete, onRename }) => {
  const thumbs = item.recomendacoes.slice(0, 3);
  return (
    <Paper component="div" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }} elevation={0}
      sx={{
        textAlign: "left", display: "block", width: "100%", minWidth: 0, p: 1.5,
        bgcolor: c.panel, color: c.text, border: `1px solid ${c.border}`, borderRadius: 0,
        cursor: "pointer", transition: "background .15s, border-color .15s",
        "&:hover": { bgcolor: c.panelHover, borderColor: "#5B7892" },
        "&:focus-visible": { outline: `2px solid ${c.blue}`, outlineOffset: 2 },
      }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: c.text, fontSize: 14, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis" }}>{item.nome}</Typography>
          <Typography sx={{ color: c.dim, fontSize: 10.5, mt: .35 }}>{dataFormatada(item.salva_em)}</Typography>
        </Box>
        <Box sx={{ display: "flex", flexShrink: 0 }}>
          <IconButton size="small" aria-label="Editar nome da pesquisa" onClick={(e) => { e.stopPropagation(); onRename(); }}
            sx={{ color: c.dim, borderRadius: 0, "&:hover": { color: c.blue, bgcolor: c.blueDark } }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Excluir pesquisa" onClick={(e) => { e.stopPropagation(); onDelete(); }}
            sx={{ color: c.dim, borderRadius: 0, "&:hover": { color: "#fff", bgcolor: "#713B43" } }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography sx={{ color: c.muted, fontSize: 11.5, mt: 1, mb: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.filmes_selecionados.map((f) => f.title).join(" + ")}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: .8 }}>
        {thumbs.map((game, i) => (
          <Box key={game.game_id} sx={{ minWidth: 0, aspectRatio: "16 / 9", bgcolor: c.bgDeep, overflow: "hidden", position: "relative" }}>
            {game.header_image ? <Box component="img" src={game.header_image} alt={game.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : (
              <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: c.dim, fontSize: 10, textAlign: "center", p: .5 }}>{game.name}</Box>
            )}
            <Box sx={{ position: "absolute", left: 0, bottom: 0, px: .65, py: .3, bgcolor: "rgba(10,17,24,.86)", color: "#fff", fontSize: 9, fontWeight: 800 }}>#{i + 1}</Box>
          </Box>
        ))}
        {Array.from({ length: Math.max(0, 3 - thumbs.length) }).map((_, i) => <Box key={`empty-${i}`} sx={{ aspectRatio: "16 / 9", bgcolor: c.bgDeep }} />)}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.2, pt: 1, borderTop: `1px solid ${c.border}` }}>
        <Typography sx={{ color: c.muted, fontSize: 11 }}>{item.recomendacoes.length} jogos · {item.filmes_selecionados.length} filmes</Typography>
        <Typography sx={{ color: c.blue, fontSize: 11, fontWeight: 800 }}>Ver resultados →</Typography>
      </Box>
    </Paper>
  );
};

export default App;
