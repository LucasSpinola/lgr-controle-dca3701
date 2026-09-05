import * as P from '../nucleo/polinomio.js';
import * as R from '../nucleo/racional.js';
import { raizesReaisPositivas } from '../nucleo/raizes.js';

export const EPSILON_DE_ROUTH = 1e-6;

function intervalosPositivos(elemento) {
  const cortes = Array.from(new Set([
    ...raizesReaisPositivas(elemento.numerador),
    ...raizesReaisPositivas(elemento.denominador),
  ].map((v) => Number(v.toPrecision(10))))).sort((a, b) => a - b);

  const bordas = [0, ...cortes, Infinity];
  const intervalos = [];

  for (let i = 0; i < bordas.length - 1; i += 1) {
    const inferior = bordas[i];
    const superior = bordas[i + 1];
    const amostra = Number.isFinite(superior)
      ? (inferior + superior) / 2
      : inferior + Math.max(1, Math.abs(inferior));
    const valor = R.avaliar(elemento, amostra);
    if (Number.isFinite(valor) && valor > 0) {
      intervalos.push({ inferior, superior });
    }
  }
  return intervalos;
}

function linhaEhNula(linha) {
  return linha.every(R.ehZero);
}

function derivarLinhaAuxiliar(linhaAcima, expoente, colunas) {
  const nova = [];
  for (let j = 0; j < colunas; j += 1) {
    const potencia = expoente - 2 * j;
    nova.push(potencia > 0
      ? R.multiplicar(linhaAcima[j], R.constante(potencia))
      : R.constante(0));
  }
  return nova;
}

function tratarPivoNulo(tabela, i, grau, colunas, observacoes) {
  if (linhaEhNula(tabela[i - 1])) {
    const expoente = grau - (i - 2);
    const auxiliar = derivarLinhaAuxiliar(tabela[i - 2], expoente, colunas);
    if (linhaEhNula(auxiliar)) {
      return false;
    }
    for (let j = 0; j < colunas; j += 1) {
      tabela[i - 1][j] = auxiliar[j];
    }
    observacoes.push({ tipo: 'linhaNula', expoente: grau - (i - 1), grauAuxiliar: expoente });
  }

  if (R.ehZero(tabela[i - 1][0])) {
    tabela[i - 1][0] = R.constante(EPSILON_DE_ROUTH);
    observacoes.push({ tipo: 'epsilon', expoente: grau - (i - 1) });
  }
  return true;
}

export function tabelaRouth(denominador, numerador) {
  const tamanho = Math.max(denominador.length, numerador.length);
  const den = P.preencher(denominador, tamanho);
  const num = P.preencher(numerador, tamanho);

  const coeficientes = den.map((d, i) => R.racional([num[i], d]));
  const grau = coeficientes.length - 1;
  const colunas = Math.floor((grau + 2) / 2);

  const tabela = [];
  for (let i = 0; i <= grau; i += 1) {
    tabela.push(new Array(colunas).fill(null).map(() => R.constante(0)));
  }

  for (let j = 0; j < colunas; j += 1) {
    if (2 * j < coeficientes.length) {
      tabela[0][j] = coeficientes[2 * j];
    }
    if (2 * j + 1 < coeficientes.length) {
      tabela[1][j] = coeficientes[2 * j + 1];
    }
  }

  const observacoes = [];
  let linhasValidas = grau;

  for (let i = 2; i <= grau; i += 1) {
    if (R.ehZero(tabela[i - 1][0]) && !tratarPivoNulo(tabela, i, grau, colunas, observacoes)) {
      linhasValidas = i - 1;
      observacoes.push({ tipo: 'interrompida', expoente: grau - (i - 1) });
      break;
    }

    const pivo = tabela[i - 1][0];
    for (let j = 0; j < colunas - 1; j += 1) {
      const termo = R.subtrair(
        R.multiplicar(tabela[i - 1][0], tabela[i - 2][j + 1]),
        R.multiplicar(tabela[i - 2][0], tabela[i - 1][j + 1]),
      );
      tabela[i][j] = R.dividir(termo, pivo);
    }
  }

  const condicoes = [];
  const criticos = new Set();
  for (let i = 0; i <= linhasValidas; i += 1) {
    const elemento = tabela[i][0];
    if (!R.dependeDeK(elemento)) {
      continue;
    }
    condicoes.push({
      expoente: grau - i,
      elemento,
      intervalos: intervalosPositivos(elemento),
    });
    for (const k of raizesReaisPositivas(elemento.numerador)) {
      criticos.add(Number(k.toPrecision(8)));
    }
  }

  return {
    tabela,
    grau,
    colunas,
    linhasValidas,
    condicoes,
    observacoes,
    kCriticos: Array.from(criticos).sort((a, b) => a - b),
  };
}
