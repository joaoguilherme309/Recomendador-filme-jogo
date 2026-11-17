// frontend/src/data/exemplosTransmutacao.ts

// Função no sistema: Fornecer os exemplos estáticos exibidos no carrossel do
// CabecalhoTransmutacao (um filme de origem e três jogos relacionados por exemplo).
// As imagens ficam em frontend/public/imagens/ e são servidas a partir da raiz ("/").

export interface ItemTransmutacao {
  titulo: string;
  imagem: string;
}

export interface ExemploTransmutacao {
  id: string;
  filme: ItemTransmutacao;
  jogos: ItemTransmutacao[];
}

const filme = (arquivo: string) => `/imagens/filmes/${arquivo}.png`;
const jogo = (arquivo: string) => `/imagens/jogos/${arquivo}.png`;

export const exemplosTransmutacao: ExemploTransmutacao[] = [
  {
    id: "matrix",
    filme: { titulo: "Matrix", imagem: filme("matrix") },
    jogos: [
      { titulo: "Cyberpunk 2077", imagem: jogo("cyberpunk-2077") },
      { titulo: "Deus Ex", imagem: jogo("deus-ex") },
      { titulo: "SUPERHOT", imagem: jogo("superhot") },
    ],
  },
  {
    id: "interestelar",
    filme: { titulo: "Interestelar", imagem: filme("interestelar") },
    jogos: [
      { titulo: "No Man's Sky", imagem: jogo("no-mans-sky") },
      { titulo: "Outer Wilds", imagem: jogo("outer-wilds") },
      { titulo: "Mass Effect", imagem: jogo("mass-effect") },
    ],
  },
  {
    id: "john-wick",
    filme: { titulo: "John Wick", imagem: filme("john-wick") },
    jogos: [
      { titulo: "Hitman", imagem: jogo("hitman") },
      { titulo: "Max Payne 3", imagem: jogo("max-payne-3") },
      { titulo: "Sifu", imagem: jogo("sifu") },
    ],
  },
  {
    id: "mad-max",
    filme: { titulo: "Mad Max", imagem: filme("mad-max") },
    jogos: [
      { titulo: "Mad Max", imagem: jogo("mad-max-jogo") },
      { titulo: "RAGE 2", imagem: jogo("rage-2") },
      { titulo: "Days Gone", imagem: jogo("days-gone") },
    ],
  },
  {
    id: "jurassic-park",
    filme: { titulo: "Jurassic Park", imagem: filme("jurassic-park") },
    jogos: [
      { titulo: "Jurassic World Evolution 2", imagem: jogo("jurassic-world-evolution-2") },
      { titulo: "ARK: Survival Evolved", imagem: jogo("ark") },
      { titulo: "Dino Crisis", imagem: jogo("dino-crisis") },
    ],
  },
  {
    id: "senhor-dos-aneis",
    filme: { titulo: "O Senhor dos Anéis", imagem: filme("senhor-dos-aneis") },
    jogos: [
      { titulo: "Middle-earth: Shadow of Mordor", imagem: jogo("shadow-of-mordor") },
      { titulo: "The Elder Scrolls V: Skyrim", imagem: jogo("skyrim") },
      { titulo: "Dragon Age: Inquisition", imagem: jogo("dragon-age-inquisition") },
    ],
  },
  {
    id: "invocacao-do-mal",
    filme: { titulo: "Invocação do Mal", imagem: filme("invocacao-do-mal") },
    jogos: [
      { titulo: "Phasmophobia", imagem: jogo("phasmophobia") },
      { titulo: "Outlast", imagem: jogo("outlast") },
      { titulo: "Visage", imagem: jogo("visage") },
    ],
  },
];
