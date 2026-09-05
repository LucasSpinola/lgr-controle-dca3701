import * as P from '../nucleo/polinomio.js';
import { raizes } from '../nucleo/raizes.js';

export function separarJw(coeficientes) {
  const grau = coeficientes.length - 1;
  const parteReal = new Map();
  const parteImaginaria = new Map();

  coeficientes.forEach((c, k) => {
    const potencia = grau - k;
    const resto = ((potencia % 4) + 4) % 4;
    if (resto === 0) {
      parteReal.set(potencia, (parteReal.get(potencia) || 0) + c);
    } else if (resto === 1) {
      parteImaginaria.set(potencia, (parteImaginaria.get(potencia) || 0) + c);
    } else if (resto === 2) {
      parteReal.set(potencia, (parteReal.get(potencia) || 0) - c);
    } else {
      parteImaginaria.set(potencia, (parteImaginaria.get(potencia) || 0) - c);
    }
  });

  const montar = (mapa) => {
    if (mapa.size === 0) {
      return [0];
    }
    const maior = Math.max(...mapa.keys());
    const saida = new Array(maior + 1).fill(0);
    for (const [potencia, valor] of mapa) {
      saida[maior - potencia] = valor;
    }
    return saida;
  };

  return { re: montar(parteReal), im: montar(parteImaginaria) };
}

export function analisarCruzamentoJw(denominador, numerador) {
  const separadoDen = separarJw(denominador);
  const separadoNum = separarJw(numerador);

  const eliminacao = P.normalizar(P.subtrair(
    P.multiplicar(separadoDen.re, separadoNum.im),
    P.multiplicar(separadoDen.im, separadoNum.re),
  ));

  const info = {
    reD: separadoDen.re,
    imD: separadoDen.im,
    reN: separadoNum.re,
    imN: separadoNum.im,
    eliminacao,
  };

  if (eliminacao.length <= 1) {
    return { ...info, cruzamentos: [] };
  }

  const cruzamentos = [];
  for (const w of raizes(eliminacao)) {
    if (Math.abs(w.im) > 1e-6 || w.re < 1e-8) {
      continue;
    }
    const omega = w.re;
    const valorImN = P.avaliar(info.imN, omega);
    const valorImD = P.avaliar(info.imD, omega);
    const valorReN = P.avaliar(info.reN, omega);
    const valorReD = P.avaliar(info.reD, omega);

    let ganho;
    let origem;
    if (Math.abs(valorImN) > 1e-12) {
      ganho = -valorImD / valorImN;
      origem = 'imaginaria';
    } else if (Math.abs(valorReN) > 1e-12) {
      ganho = -valorReD / valorReN;
      origem = 'real';
    } else {
      continue;
    }

    if (ganho <= 1e-10) {
      continue;
    }
    const repetido = cruzamentos.some(
      (item) => Math.abs(item.ganho - ganho) < 1e-4 && Math.abs(item.omega - omega) < 1e-4,
    );
    if (!repetido) {
      cruzamentos.push({ ganho, omega, origem, valorImD, valorImN, valorReD, valorReN });
    }
  }

  return { ...info, cruzamentos };
}
