import * as P from './polinomio.js';

export function racional(numerador, denominador = [1]) {
  return reduzir({ numerador: numerador.slice(), denominador: denominador.slice() });
}

export function constante(valor) {
  return racional([valor], [1]);
}

export function ehZero(r) {
  return P.ehNulo(r.numerador);
}

export function ehConstante(r) {
  return P.grau(r.numerador) === 0 && P.grau(r.denominador) === 0;
}

export function dependeDeK(r) {
  return P.grau(r.numerador) > 0 || P.grau(r.denominador) > 0;
}

export function reduzir(r) {
  let numerador = P.normalizar(r.numerador);
  let denominador = P.normalizar(r.denominador);

  if (P.ehNulo(numerador)) {
    return { numerador: [0], denominador: [1] };
  }
  if (P.ehNulo(denominador)) {
    return { numerador: [0], denominador: [1] };
  }

  if (P.grau(denominador) > 0) {
    const quociente = P.dividirExato(numerador, denominador);
    if (quociente !== null) {
      numerador = P.normalizar(quociente);
      denominador = [1];
    }
  }

  const pivo = denominador[0];
  numerador = numerador.map((v) => v / pivo);
  denominador = denominador.map((v) => v / pivo);

  const escala = Math.max(P.maiorCoeficiente(numerador), P.maiorCoeficiente(denominador));
  if (escala > 1e6 || (escala > 0 && escala < 1e-6)) {
    numerador = numerador.map((v) => v / escala);
    denominador = denominador.map((v) => v / escala);
  }

  return { numerador, denominador };
}

export function somar(a, b) {
  return reduzir({
    numerador: P.somar(
      P.multiplicar(a.numerador, b.denominador),
      P.multiplicar(b.numerador, a.denominador),
    ),
    denominador: P.multiplicar(a.denominador, b.denominador),
  });
}

export function subtrair(a, b) {
  return reduzir({
    numerador: P.subtrair(
      P.multiplicar(a.numerador, b.denominador),
      P.multiplicar(b.numerador, a.denominador),
    ),
    denominador: P.multiplicar(a.denominador, b.denominador),
  });
}

export function multiplicar(a, b) {
  return reduzir({
    numerador: P.multiplicar(a.numerador, b.numerador),
    denominador: P.multiplicar(a.denominador, b.denominador),
  });
}

export function dividir(a, b) {
  return reduzir({
    numerador: P.multiplicar(a.numerador, b.denominador),
    denominador: P.multiplicar(a.denominador, b.numerador),
  });
}

export function avaliar(r, k) {
  const denominador = P.avaliar(r.denominador, k);
  if (Math.abs(denominador) < 1e-300) {
    return NaN;
  }
  return P.avaliar(r.numerador, k) / denominador;
}
