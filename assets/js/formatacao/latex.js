import { numeroLatex, fixoLatex } from './numero.js';
import * as P from '../nucleo/polinomio.js';

const EPS = 1e-12;

export function polinomioLatex(coeficientes, variavel = 's') {
  const grau = coeficientes.length - 1;
  const partes = [];
  coeficientes.forEach((c, k) => {
    const expoente = grau - k;
    if (Math.abs(c) < EPS) {
      return;
    }
    const absoluto = Math.abs(c);
    let coeficienteTexto;
    if (expoente === 0) {
      coeficienteTexto = numeroLatex(absoluto);
    } else if (Math.abs(absoluto - 1) < EPS) {
      coeficienteTexto = '';
    } else {
      coeficienteTexto = numeroLatex(absoluto);
    }

    let termo;
    if (expoente === 0) {
      termo = coeficienteTexto;
    } else if (expoente === 1) {
      termo = coeficienteTexto ? `${coeficienteTexto}${variavel}` : variavel;
    } else {
      termo = coeficienteTexto
        ? `${coeficienteTexto}${variavel}^{${expoente}}`
        : `${variavel}^{${expoente}}`;
    }

    if (partes.length === 0) {
      partes.push(c < 0 ? `-${termo}` : termo);
    } else {
      partes.push(c < 0 ? ` - ${termo}` : ` + ${termo}`);
    }
  });
  return partes.length > 0 ? partes.join('') : '0';
}

export function razaoLatex(numerador, denominador, variavel = 's') {
  const den = P.normalizar(denominador);
  const num = polinomioLatex(numerador, variavel);
  if (den.length === 1 && Math.abs(den[0] - 1) < 1e-12) {
    return num;
  }
  return `\\frac{${num}}{${polinomioLatex(den, variavel)}}`;
}

export function complexoLatex(z, decimais = 4) {
  const re = Number(z.re.toFixed(decimais));
  const im = Number(z.im.toFixed(decimais));
  if (Math.abs(im) < 1e-10) {
    return numeroLatex(re);
  }
  if (Math.abs(re) < 1e-10) {
    if (Math.abs(Math.abs(im) - 1) < 1e-10) {
      return im > 0 ? 'j' : '-j';
    }
    return `${numeroLatex(im)}j`;
  }
  const sinal = im >= 0 ? '+' : '-';
  return `${numeroLatex(re)} ${sinal} ${numeroLatex(Math.abs(im))}j`;
}

export function fatoradoLatex(raizes, variavel = 's') {
  if (raizes.length === 0) {
    return '1';
  }
  const fatores = raizes.map((r) => {
    if (Math.abs(r.im) < 1e-8) {
      const valor = Number(r.re.toFixed(4));
      if (Math.abs(valor) < 1e-8) {
        return variavel;
      }
      if (valor > 0) {
        return `(${variavel} - ${numeroLatex(valor)})`;
      }
      return `(${variavel} + ${numeroLatex(Math.abs(valor))})`;
    }
    return `\\left(${variavel} - (${complexoLatex(r)})\\right)`;
  });

  const ordem = [];
  const contagem = new Map();
  for (const fator of fatores) {
    if (!contagem.has(fator)) {
      contagem.set(fator, 0);
      ordem.push(fator);
    }
    contagem.set(fator, contagem.get(fator) + 1);
  }
  return ordem
    .map((fator) => (contagem.get(fator) === 1 ? fator : `${fator}^{${contagem.get(fator)}}`))
    .join('');
}

function arredondarCoeficientes(coeficientes) {
  const escala = P.maiorCoeficiente(coeficientes) || 1;
  return coeficientes.map((v) => (Math.abs(v) < 1e-10 * escala ? 0 : Number(v.toPrecision(6))));
}

export function racionalLatex(r, variavel = 'K') {
  if (P.grau(r.denominador) === 0) {
    const pivo = r.denominador[r.denominador.length - 1];
    const ajustado = Math.abs(pivo - 1) < 1e-12 ? r.numerador : r.numerador.map((v) => v / pivo);
    return polinomioLatex(arredondarCoeficientes(ajustado), variavel);
  }
  const numerador = polinomioLatex(arredondarCoeficientes(r.numerador), variavel);
  const denominador = polinomioLatex(arredondarCoeficientes(r.denominador), variavel);
  return `\\dfrac{${numerador}}{${denominador}}`;
}

export function grausLatex(valor, casas = 2) {
  return `${fixoLatex(valor, casas)}^\\circ`;
}

export function intervaloLatex(intervalo) {
  const temInferior = Number.isFinite(intervalo.inferior) && intervalo.inferior > 0;
  const temSuperior = Number.isFinite(intervalo.superior);
  if (temInferior && temSuperior) {
    return `${numeroLatex(intervalo.inferior)} < K < ${numeroLatex(intervalo.superior)}`;
  }
  if (temInferior) {
    return `K > ${numeroLatex(intervalo.inferior)}`;
  }
  if (temSuperior) {
    return `0 < K < ${numeroLatex(intervalo.superior)}`;
  }
  return '\\forall\\; K > 0';
}

export function condicaoLatex(intervalos) {
  if (!intervalos || intervalos.length === 0) {
    return '\\nexists\\; K > 0';
  }
  return intervalos.map(intervaloLatex).join(' \\quad \\text{ou} \\quad ');
}
