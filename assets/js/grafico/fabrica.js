import { Plano, areaDoPlano, dimensoesParaProporcao } from './plano.js';
import { limitesBrutos, equalizarEscala } from './janela.js';
import { pontosNotaveis } from '../analise/pontosNotaveis.js';

export const LIMITES_COMPACTOS = {
  larguraMaxima: 322,
  larguraMinima: 236,
  alturaMinima: 208,
  alturaMaxima: 288,
  margem: { esquerda: 28, direita: 12, topo: 10, base: 24 },
  compacto: true,
};

export function criarPlano(analise, titulo, opcoes = {}) {
  const pontos = pontosNotaveis(analise, opcoes).concat(opcoes.pontosExtras || []);
  const base = opcoes.limitesManuais || limitesBrutos(pontos);
  const proporcao = (base.xMax - base.xMin) / (base.yMax - base.yMin);
  const dimensoes = dimensoesParaProporcao(proporcao, opcoes.limites);
  const area = areaDoPlano(dimensoes);
  const plano = new Plano(equalizarEscala(base, area.largura, area.altura), titulo, dimensoes);

  if (opcoes.semLegenda) {
    plano.legendaAtiva = false;
  }
  return plano;
}
