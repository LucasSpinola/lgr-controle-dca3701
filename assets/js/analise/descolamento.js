import * as P from '../nucleo/polinomio.js';
import * as C from '../nucleo/complexo.js';
import { raizes } from '../nucleo/raizes.js';
import { raizesReais, pertenceAoLugar } from './eixoReal.js';

export function analisarDescolamento(numerador, denominador, polos, zeros) {
  const derivadaNumerador = P.derivar(numerador);
  const derivadaDenominador = P.derivar(denominador);
  const equacao = P.subtrair(
    P.multiplicar(numerador, derivadaDenominador),
    P.multiplicar(denominador, derivadaNumerador),
  );

  const reais = raizesReais(polos, zeros);
  const candidatos = raizes(equacao).map((r) => {
    const valorNumerador = P.avaliarComplexo(numerador, r);
    const ganho = C.modulo(valorNumerador) > 1e-12
      ? C.negar(C.dividir(P.avaliarComplexo(denominador, r), valorNumerador))
      : null;

    if (Math.abs(r.im) < 1e-6) {
      const parteReal = r.re;
      const noLugar = pertenceAoLugar(parteReal, reais);
      const ganhoReal = ganho ? ganho.re : Infinity;
      return {
        s: C.complexo(parteReal, 0),
        real: true,
        ganho: ganhoReal,
        noLugar,
        valido: noLugar && ganhoReal > 0,
      };
    }

    const ganhoValido = ganho !== null && Math.abs(ganho.im) < 1e-6 && ganho.re > 0;
    return {
      s: r,
      real: false,
      ganho: ganho ? ganho.re : Infinity,
      ganhoComplexo: ganho,
      noLugar: ganhoValido,
      valido: ganhoValido,
    };
  });

  return {
    derivadaNumerador,
    derivadaDenominador,
    equacao,
    candidatos,
    pontosValidos: candidatos.filter((item) => item.valido),
    pontosReaisValidos: candidatos.filter((item) => item.valido && item.real),
  };
}
