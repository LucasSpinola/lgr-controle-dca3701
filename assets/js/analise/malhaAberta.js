import * as P from '../nucleo/polinomio.js';
import { raizes, ordenarParaExibicao } from '../nucleo/raizes.js';

export function montarMalhaAberta(nG, dG, nH, dH) {
  const numeradorBruto = P.multiplicar(nG, nH);
  const denominadorBruto = P.multiplicar(dG, dH);
  const tamanho = Math.max(numeradorBruto.length, denominadorBruto.length);
  return {
    numerador: P.preencher(numeradorBruto, tamanho),
    denominador: P.preencher(denominadorBruto, tamanho),
  };
}

export function polosEZeros(numerador, denominador) {
  return {
    zeros: ordenarParaExibicao(raizes(numerador)),
    polos: ordenarParaExibicao(raizes(denominador)),
  };
}

export function lugaresSeparados(polos, zeros) {
  return Math.max(polos.length, zeros.length);
}
