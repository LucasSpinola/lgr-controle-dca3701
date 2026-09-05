const AMPLITUDE_MINIMA = 1;
const FATOR_MARGEM = 0.18;
const MARGEM_MINIMA = 0.5;

export function limitesBrutos(pontos) {
  if (pontos.length === 0) {
    return { xMin: -1, xMax: 1, yMin: -1, yMax: 1 };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let moduloImaginario = 0;
  for (const ponto of pontos) {
    xMin = Math.min(xMin, ponto.re);
    xMax = Math.max(xMax, ponto.re);
    moduloImaginario = Math.max(moduloImaginario, Math.abs(ponto.im));
  }

  const amplitude = Math.max(xMax - xMin, 2 * moduloImaginario, AMPLITUDE_MINIMA);
  const margem = Math.max(MARGEM_MINIMA, FATOR_MARGEM * amplitude);
  const limiteImaginario = Math.max(
    moduloImaginario + margem,
    (xMax - xMin) * 0.35,
    margem,
  );

  return {
    xMin: xMin - margem,
    xMax: xMax + margem,
    yMin: -limiteImaginario,
    yMax: limiteImaginario,
  };
}

export function equalizarEscala(limites, largura, altura) {
  const larguraDados = Math.max(limites.xMax - limites.xMin, 1e-9);
  const alturaDados = Math.max(limites.yMax - limites.yMin, 1e-9);
  const escala = Math.max(larguraDados / largura, alturaDados / altura);

  const centroX = (limites.xMin + limites.xMax) / 2;
  const centroY = (limites.yMin + limites.yMax) / 2;
  const metadeLargura = (escala * largura) / 2;
  const metadeAltura = (escala * altura) / 2;

  return {
    xMin: centroX - metadeLargura,
    xMax: centroX + metadeLargura,
    yMin: centroY - metadeAltura,
    yMax: centroY + metadeAltura,
    unidadesPorPixel: escala,
  };
}

export function calcularJanela(pontos, largura, altura, limitesManuais = null) {
  const base = limitesManuais !== null ? limitesManuais : limitesBrutos(pontos);
  return equalizarEscala(base, largura, altura);
}
