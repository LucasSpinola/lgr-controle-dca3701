import assert from 'node:assert/strict';

import { raizes } from '../assets/js/nucleo/raizes.js';
import * as P from '../assets/js/nucleo/polinomio.js';
import * as C from '../assets/js/nucleo/complexo.js';

let executados = 0;
let falhas = 0;

function teste(nome, corpo) {
  executados += 1;
  try {
    corpo();
    console.log(`ok   ${nome}`);
  } catch (erro) {
    falhas += 1;
    console.log(`FALHA ${nome}`);
    console.log(`      ${erro.message}`);
  }
}

function sorteador(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return estado / 2147483648;
  };
}

function montarPolinomio(planejadas) {
  let coeficientes = [1];
  const usados = new Set();

  planejadas.forEach((raiz, indice) => {
    if (usados.has(indice)) {
      return;
    }
    if (Math.abs(raiz.im) < 1e-12) {
      coeficientes = P.multiplicar(coeficientes, [1, -raiz.re]);
      return;
    }
    coeficientes = P.multiplicar(coeficientes, [
      1,
      -2 * raiz.re,
      raiz.re * raiz.re + raiz.im * raiz.im,
    ]);
    usados.add(indice + 1);
  });

  return coeficientes;
}

function gerarRaizes(sortear, grau) {
  const planejadas = [];
  while (planejadas.length < grau) {
    const parteReal = Number((sortear() * 8 - 5).toFixed(3));
    const faltam = grau - planejadas.length;
    if (faltam >= 2 && sortear() > 0.5) {
      const parteImaginaria = Number((0.5 + sortear() * 3).toFixed(3));
      planejadas.push(C.complexo(parteReal, parteImaginaria));
      planejadas.push(C.complexo(parteReal, -parteImaginaria));
    } else {
      planejadas.push(C.complexo(parteReal, 0));
    }
  }
  return planejadas;
}

function proximas(planejadas, encontradas, tolerancia) {
  const disponiveis = encontradas.slice();
  for (const alvo of planejadas) {
    let melhor = -1;
    let menor = Infinity;
    disponiveis.forEach((candidata, indice) => {
      const distancia = C.distancia(alvo, candidata);
      if (distancia < menor) {
        menor = distancia;
        melhor = indice;
      }
    });
    if (menor > tolerancia) {
      return { ok: false, alvo, menor };
    }
    disponiveis.splice(melhor, 1);
  }
  return { ok: true };
}

for (let grau = 2; grau <= 8; grau += 1) {
  teste(`raizes de grau ${grau} batem com as raizes plantadas`, () => {
    const sortear = sorteador(9871 + grau * 137);
    for (let repeticao = 0; repeticao < 30; repeticao += 1) {
      const planejadas = gerarRaizes(sortear, grau);
      const coeficientes = montarPolinomio(planejadas);
      const encontradas = raizes(coeficientes);

      assert.equal(encontradas.length, grau, `grau ${grau}: contagem de raizes`);

      const escala = planejadas.reduce((maior, z) => Math.max(maior, C.modulo(z)), 1);
      const veredito = proximas(planejadas, encontradas, 1e-5 * escala);
      assert.ok(
        veredito.ok,
        `grau ${grau}, repeticao ${repeticao}: raiz ${JSON.stringify(veredito.alvo)} `
        + `ficou a ${veredito.menor}`,
      );
    }
  });
}

teste('residuo do polinomio nas raizes encontradas e desprezivel', () => {
  const sortear = sorteador(4242);
  for (let grau = 2; grau <= 8; grau += 1) {
    for (let repeticao = 0; repeticao < 20; repeticao += 1) {
      const coeficientes = montarPolinomio(gerarRaizes(sortear, grau));
      const escala = P.maiorCoeficiente(coeficientes);
      for (const raiz of raizes(coeficientes)) {
        const valor = P.avaliarComplexo(coeficientes, raiz);
        const modulo = C.modulo(raiz);
        const referencia = escala * Math.max(1, modulo ** grau);
        assert.ok(
          C.modulo(valor) < 1e-6 * referencia,
          `grau ${grau}: residuo ${C.modulo(valor)} alto demais`,
        );
      }
    }
  }
});

teste('raizes repetidas continuam sendo encontradas', () => {
  const coeficientes = P.multiplicar([1, 2, 1], [1, 2, 1]);
  const encontradas = raizes(coeficientes);
  assert.equal(encontradas.length, 4);
  for (const raiz of encontradas) {
    assert.ok(Math.abs(raiz.re + 1) < 1e-3, `esperava proximo de -1, veio ${raiz.re}`);
    assert.ok(Math.abs(raiz.im) < 1e-3);
  }
});

console.log(`\n${executados - falhas}/${executados} testes de raizes passaram`);
if (falhas > 0) {
  process.exitCode = 1;
}
