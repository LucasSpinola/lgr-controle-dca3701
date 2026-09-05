import * as C from './complexo.js';
import * as P from './polinomio.js';

const TOLERANCIA = 1e-14;
const MAXIMO_ITERACOES = 400;

function limiteCauchy(monico) {
  let maior = 0;
  for (let i = 1; i < monico.length; i += 1) {
    maior = Math.max(maior, Math.abs(monico[i]));
  }
  return 1 + maior;
}

function sementesIniciais(quantidade, raio) {
  const base = { re: 0.4, im: 0.9 };
  const saida = [];
  let atual = { re: 1, im: 0 };
  for (let i = 0; i < quantidade; i += 1) {
    atual = C.multiplicar(atual, base);
    saida.push(C.escalar(atual, raio / C.modulo(atual)));
  }
  return saida;
}

function resolverQuadratica(a, b, c) {
  const delta = b * b - 4 * a * c;
  if (delta >= 0) {
    const r = Math.sqrt(delta);
    const q = b >= 0 ? -0.5 * (b + r) : -0.5 * (b - r);
    if (Math.abs(q) < 1e-300) {
      return [C.complexo(0), C.complexo(0)];
    }
    return [C.complexo(q / a), C.complexo(c / q)];
  }
  const parteReal = -b / (2 * a);
  const parteImaginaria = Math.sqrt(-delta) / (2 * a);
  return [C.complexo(parteReal, parteImaginaria), C.complexo(parteReal, -parteImaginaria)];
}

function refinarNewton(monico, z) {
  const derivada = P.derivar(monico);
  let atual = z;
  for (let i = 0; i < 12; i += 1) {
    const valor = P.avaliarComplexo(monico, atual);
    const inclinacao = P.avaliarComplexo(derivada, atual);
    if (C.modulo(inclinacao) < 1e-300) {
      break;
    }
    const passo = C.dividir(valor, inclinacao);
    if (!C.ehFinito(passo)) {
      break;
    }
    atual = C.subtrair(atual, passo);
    if (C.modulo(passo) < TOLERANCIA * (1 + C.modulo(atual))) {
      break;
    }
  }
  return atual;
}

function afastar(z, indice, total, escala) {
  const angulo = (2 * Math.PI * (indice + 1)) / total + 0.7;
  const raio = 1e-4 * Math.max(1, escala);
  return { re: z.re + raio * Math.cos(angulo), im: z.im + raio * Math.sin(angulo) };
}

function separarSementes(lista) {
  const n = lista.length;
  const saida = lista.map((z) => ({ re: z.re, im: z.im }));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const escala = 1 + Math.max(C.modulo(saida[i]), C.modulo(saida[j]));
      if (C.distancia(saida[i], saida[j]) < 1e-6 * escala) {
        saida[i] = afastar(saida[i], i, n, escala);
      }
    }
  }
  return saida;
}

function coerenteComVieta(monico, encontradas) {
  const n = monico.length - 1;
  let soma = { re: 0, im: 0 };
  let produto = { re: 1, im: 0 };
  for (const z of encontradas) {
    soma = C.somar(soma, z);
    produto = C.multiplicar(produto, z);
  }

  const somaEsperada = -monico[1];
  const produtoEsperado = (n % 2 === 0 ? 1 : -1) * monico[n];
  const erroSoma = C.modulo(C.subtrair(soma, C.complexo(somaEsperada)));
  const erroProduto = C.modulo(C.subtrair(produto, C.complexo(produtoEsperado)));

  return erroSoma < 1e-6 * Math.max(1, Math.abs(somaEsperada))
    && erroProduto < 1e-6 * Math.max(1, Math.abs(produtoEsperado));
}

function iterar(monico, iniciais, raio) {
  const n = monico.length - 1;
  const atuais = iniciais.map((z) => ({ re: z.re, im: z.im }));

  for (let iteracao = 0; iteracao < MAXIMO_ITERACOES; iteracao += 1) {
    let maiorPasso = 0;
    for (let i = 0; i < n; i += 1) {
      const valor = P.avaliarComplexo(monico, atuais[i]);
      let denominador = { re: 1, im: 0 };
      for (let j = 0; j < n; j += 1) {
        if (j !== i) {
          denominador = C.multiplicar(denominador, C.subtrair(atuais[i], atuais[j]));
        }
      }
      if (C.modulo(denominador) < 1e-280) {
        atuais[i] = afastar(atuais[i], i, n, raio);
        maiorPasso = Math.max(maiorPasso, 1e-4 * Math.max(1, raio));
        continue;
      }
      const passo = C.dividir(valor, denominador);
      if (!C.ehFinito(passo)) {
        atuais[i] = afastar(atuais[i], i, n, raio);
        continue;
      }
      atuais[i] = C.subtrair(atuais[i], passo);
      maiorPasso = Math.max(maiorPasso, C.modulo(passo));
    }
    if (maiorPasso < TOLERANCIA * (1 + raio)) {
      break;
    }
  }
  return atuais.map((z) => refinarNewton(monico, z));
}

function durandKerner(monico, sementes) {
  const n = monico.length - 1;
  const raio = limiteCauchy(monico);

  if (sementes && sementes.length === n) {
    const aproximadas = iterar(monico, separarSementes(sementes), raio);
    if (coerenteComVieta(monico, aproximadas)) {
      return aproximadas;
    }
  }
  return iterar(monico, sementesIniciais(n, raio), raio);
}

function simetrizar(lista, escala) {
  const tolerancia = 1e-7 * Math.max(1, escala);
  const saida = lista.map((z) => ({ re: z.re, im: z.im }));
  for (const z of saida) {
    if (Math.abs(z.im) < tolerancia) {
      z.im = 0;
    }
  }
  const usados = new Set();
  for (let i = 0; i < saida.length; i += 1) {
    if (usados.has(i) || saida[i].im <= 0) {
      continue;
    }
    let melhor = -1;
    let menorDistancia = Infinity;
    for (let j = 0; j < saida.length; j += 1) {
      if (j === i || usados.has(j) || saida[j].im >= 0) {
        continue;
      }
      const distancia = C.distancia(saida[i], C.conjugado(saida[j]));
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhor = j;
      }
    }
    if (melhor >= 0 && menorDistancia < 1e-6 * Math.max(1, escala)) {
      const re = (saida[i].re + saida[melhor].re) / 2;
      const im = (saida[i].im - saida[melhor].im) / 2;
      saida[i] = { re, im };
      saida[melhor] = { re, im: -im };
      usados.add(i);
      usados.add(melhor);
    }
  }
  return saida;
}

export function raizes(coeficientes, sementes = null) {
  const p = P.normalizar(coeficientes);
  if (p.length <= 1) {
    return [];
  }

  let corte = p.length;
  while (corte > 1 && Math.abs(p[corte - 1]) < 1e-14 * Math.max(1, P.maiorCoeficiente(p))) {
    corte -= 1;
  }
  const zerosNaOrigem = p.length - corte;
  const reduzido = p.slice(0, corte);

  let encontradas = [];
  if (reduzido.length === 2) {
    encontradas = [C.complexo(-reduzido[1] / reduzido[0])];
  } else if (reduzido.length === 3) {
    encontradas = resolverQuadratica(reduzido[0], reduzido[1], reduzido[2]);
  } else if (reduzido.length > 3) {
    const monico = reduzido.map((v) => v / reduzido[0]);
    const sementesUteis = sementes && sementes.length >= monico.length - 1
      ? sementes.slice(0, monico.length - 1)
      : null;
    encontradas = durandKerner(monico, sementesUteis);
  }

  const escala = encontradas.reduce((maior, z) => Math.max(maior, C.modulo(z)), 1);
  const completas = simetrizar(encontradas, escala);
  for (let i = 0; i < zerosNaOrigem; i += 1) {
    completas.push(C.complexo(0));
  }
  return completas;
}

export function ordenarParaExibicao(lista) {
  return lista.slice().sort((a, b) => {
    if (Math.abs(a.re - b.re) > 1e-9) {
      return b.re - a.re;
    }
    return b.im - a.im;
  });
}

export function casarPorProximidade(anteriores, atuais) {
  const n = atuais.length;
  const saida = new Array(n);
  const usados = new Set();
  for (let i = 0; i < n; i += 1) {
    let melhor = -1;
    let menorDistancia = Infinity;
    for (let j = 0; j < n; j += 1) {
      if (usados.has(j)) {
        continue;
      }
      const distancia = C.distancia(anteriores[i], atuais[j]);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhor = j;
      }
    }
    saida[i] = atuais[melhor];
    usados.add(melhor);
  }
  return saida;
}

export function raizesReaisPositivas(coeficientes, tolerancia = 1e-7) {
  return raizes(coeficientes)
    .filter((z) => Math.abs(z.im) < tolerancia && z.re > tolerancia)
    .map((z) => z.re)
    .sort((a, b) => a - b);
}
