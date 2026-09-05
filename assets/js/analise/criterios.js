import * as C from '../nucleo/complexo.js';

export function normalizarGraus(valor) {
  return ((((valor + 180) % 360) + 360) % 360) - 180;
}

export function paraCircunferencia(valor) {
  return ((valor % 360) + 360) % 360;
}

export function angulosDePartida(polos, zeros) {
  const complexos = polos.filter((p) => p.im > 1e-8);
  return complexos.map((pk) => {
    const contribuicaoPolos = polos
      .filter((pj) => C.distancia(pj, pk) > 1e-10)
      .map((pj) => ({ referencia: pj, diferenca: C.subtrair(pk, pj), angulo: C.argumentoGraus(C.subtrair(pk, pj)) }));
    const contribuicaoZeros = zeros
      .map((zj) => ({ referencia: zj, diferenca: C.subtrair(pk, zj), angulo: C.argumentoGraus(C.subtrair(pk, zj)) }));

    const somaPolos = contribuicaoPolos.reduce((total, item) => total + item.angulo, 0);
    const somaZeros = contribuicaoZeros.reduce((total, item) => total + item.angulo, 0);
    const angulo = normalizarGraus(180 - somaPolos + somaZeros);

    return { ponto: pk, contribuicaoPolos, contribuicaoZeros, somaPolos, somaZeros, angulo };
  });
}

export function angulosDeChegada(polos, zeros) {
  const complexos = zeros.filter((z) => z.im > 1e-8);
  return complexos.map((zk) => {
    const contribuicaoZeros = zeros
      .filter((zj) => C.distancia(zj, zk) > 1e-10)
      .map((zj) => ({ referencia: zj, diferenca: C.subtrair(zk, zj), angulo: C.argumentoGraus(C.subtrair(zk, zj)) }));
    const contribuicaoPolos = polos
      .map((pj) => ({ referencia: pj, diferenca: C.subtrair(zk, pj), angulo: C.argumentoGraus(C.subtrair(zk, pj)) }));

    const somaZeros = contribuicaoZeros.reduce((total, item) => total + item.angulo, 0);
    const somaPolos = contribuicaoPolos.reduce((total, item) => total + item.angulo, 0);
    const angulo = normalizarGraus(180 - somaZeros + somaPolos);

    return { ponto: zk, contribuicaoPolos, contribuicaoZeros, somaPolos, somaZeros, angulo };
  });
}

export function criterioDeAngulo(pontoTeste, zeros, polos) {
  const contribuicaoPolos = polos.map((p) => ({
    referencia: p,
    diferenca: C.subtrair(pontoTeste, p),
    angulo: C.argumentoGraus(C.subtrair(pontoTeste, p)),
  }));
  const contribuicaoZeros = zeros.map((z) => ({
    referencia: z,
    diferenca: C.subtrair(pontoTeste, z),
    angulo: C.argumentoGraus(C.subtrair(pontoTeste, z)),
  }));

  const somaPolos = contribuicaoPolos.reduce((total, item) => total + item.angulo, 0);
  const somaZeros = contribuicaoZeros.reduce((total, item) => total + item.angulo, 0);
  const bruto = somaZeros - somaPolos;
  const normalizado = normalizarGraus(bruto);

  return {
    contribuicaoPolos,
    contribuicaoZeros,
    somaPolos,
    somaZeros,
    diferenca: somaPolos - somaZeros,
    bruto,
    normalizado,
    pertence: Math.abs(Math.abs(normalizado) - 180) < 5,
  };
}

export function criterioDeModulo(pontoTeste, zeros, polos) {
  const distanciasPolos = polos.map((p) => ({
    referencia: p,
    diferenca: C.subtrair(pontoTeste, p),
    valor: C.distancia(pontoTeste, p),
  }));
  const distanciasZeros = zeros.map((z) => ({
    referencia: z,
    diferenca: C.subtrair(pontoTeste, z),
    valor: C.distancia(pontoTeste, z),
  }));

  const produtoPolos = distanciasPolos.reduce((total, item) => total * item.valor, 1);
  const produtoZeros = distanciasZeros.reduce((total, item) => total * item.valor, 1);
  const definido = produtoZeros > 1e-12;

  return {
    distanciasPolos,
    distanciasZeros,
    produtoPolos,
    produtoZeros,
    definido,
    ganho: definido ? produtoPolos / produtoZeros : Infinity,
  };
}
