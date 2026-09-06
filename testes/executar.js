import assert from 'node:assert/strict';

import { raizes, ordenarParaExibicao } from '../assets/js/nucleo/raizes.js';
import * as P from '../assets/js/nucleo/polinomio.js';
import { montarMalhaAberta, polosEZeros } from '../assets/js/analise/malhaAberta.js';
import { segmentosEixoReal } from '../assets/js/analise/eixoReal.js';
import { calcularAssintotas } from '../assets/js/analise/assintotas.js';
import { analisarDescolamento } from '../assets/js/analise/descolamento.js';
import { tabelaRouth } from '../assets/js/analise/routh.js';
import { analisarCruzamentoJw } from '../assets/js/analise/cruzamentoJw.js';
import { calcularLugarRaizes, extrairRamo } from '../assets/js/analise/lugarRaizes.js';
import { criterioDeAngulo, criterioDeModulo } from '../assets/js/analise/criterios.js';
import { calcularJanela } from '../assets/js/grafico/janela.js';
import { pontosNotaveis } from '../assets/js/analise/pontosNotaveis.js';
import { areaDoPlano } from '../assets/js/grafico/plano.js';
import { analisarSistema } from '../assets/js/analise/analise.js';
import { racionalLatex, condicaoLatex } from '../assets/js/formatacao/latex.js';

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

function perto(recebido, esperado, tolerancia = 1e-6) {
  assert.ok(
    Math.abs(recebido - esperado) < tolerancia,
    `esperado ${esperado}, recebido ${recebido}`,
  );
}

function reaisOrdenadas(lista) {
  return lista.map((z) => z.re).sort((a, b) => a - b);
}

teste('raizes de polinomio quadratico', () => {
  const encontradas = ordenarParaExibicao(raizes([1, 3, 2]));
  const valores = reaisOrdenadas(encontradas);
  perto(valores[0], -2);
  perto(valores[1], -1);
});

teste('raizes com par conjugado exato', () => {
  const encontradas = raizes([1, 2, 5]);
  perto(encontradas[0].re, -1);
  perto(Math.abs(encontradas[0].im), 2);
  perto(encontradas[0].re, encontradas[1].re);
  perto(encontradas[0].im, -encontradas[1].im);
});

teste('raizes de grau 5 com raiz na origem', () => {
  const coeficientes = P.multiplicar([1, 0], P.multiplicar([1, 1], P.multiplicar([1, 2], [1, 4, 13])));
  const encontradas = raizes(coeficientes);
  assert.equal(encontradas.length, 5);
  const reais = encontradas.filter((z) => Math.abs(z.im) < 1e-6).map((z) => z.re).sort((a, b) => a - b);
  perto(reais[0], -2, 1e-8);
  perto(reais[1], -1, 1e-8);
  perto(reais[2], 0, 1e-8);
  const complexos = encontradas.filter((z) => Math.abs(z.im) > 1e-6);
  perto(complexos[0].re, -2, 1e-8);
  perto(Math.abs(complexos[0].im), 3, 1e-8);
});

teste('malha aberta combina G e H', () => {
  const { numerador, denominador } = montarMalhaAberta([1, 2], [1, 4, 0], [1], [1, 1]);
  assert.deepEqual(denominador, [1, 5, 4, 0]);
  assert.deepEqual(numerador, [0, 0, 1, 2]);
});

teste('polos e zeros do sistema padrao', () => {
  const { numerador, denominador } = montarMalhaAberta([1, 2], [1, 4, 0], [1], [1, 1]);
  const { polos, zeros } = polosEZeros(numerador, denominador);
  assert.deepEqual(reaisOrdenadas(polos).map((v) => Number(v.toFixed(8))), [-4, -1, 0]);
  perto(zeros[0].re, -2);
});

teste('segmentos do eixo real', () => {
  const { numerador, denominador } = montarMalhaAberta([1, 2], [1, 4, 0], [1], [1, 1]);
  const { polos, zeros } = polosEZeros(numerador, denominador);
  const segmentos = segmentosEixoReal(zeros, polos);
  assert.equal(segmentos.length, 2);
  perto(segmentos[0].inicio, -1);
  perto(segmentos[0].fim, 0);
  perto(segmentos[1].inicio, -4);
  perto(segmentos[1].fim, -2);
});

teste('assintotas do sistema padrao', () => {
  const { numerador, denominador } = montarMalhaAberta([1, 2], [1, 4, 0], [1], [1, 1]);
  const { polos, zeros } = polosEZeros(numerador, denominador);
  const assintotas = calcularAssintotas(zeros, polos);
  assert.equal(assintotas.quantidade, 2);
  perto(assintotas.centroide, -1.5);
  assert.deepEqual(assintotas.angulos, [90, 270]);
});

teste('sem assintotas quando np igual nz', () => {
  const { numerador, denominador } = montarMalhaAberta([1, 1], [1, 2], [1], [1]);
  const { polos, zeros } = polosEZeros(numerador, denominador);
  assert.equal(calcularAssintotas(zeros, polos), null);
});

teste('descolamento do integrador triplo', () => {
  const denominador = [1, 3, 2, 0];
  const numerador = [0, 0, 0, 1];
  const { polos, zeros } = polosEZeros(numerador, denominador);
  const resultado = analisarDescolamento(numerador, denominador, polos, zeros);
  assert.equal(resultado.pontosReaisValidos.length, 1);
  perto(resultado.pontosReaisValidos[0].s.re, -0.42264973, 1e-6);
  perto(resultado.pontosReaisValidos[0].ganho, 0.3849002, 1e-6);
});

teste('routh encontra K critico do integrador triplo', () => {
  const routh = tabelaRouth([1, 3, 2, 0], [0, 0, 0, 1]);
  assert.equal(routh.grau, 3);
  assert.equal(routh.kCriticos.length, 1);
  perto(routh.kCriticos[0], 6, 1e-6);
  const primeiraColuna = routh.condicoes.map((c) => c.expoente);
  assert.deepEqual(primeiraColuna, [1, 0]);
  const condicao = routh.condicoes.find((c) => c.expoente === 1);
  assert.equal(condicao.intervalos.length, 1);
  perto(condicao.intervalos[0].inferior, 0);
  perto(condicao.intervalos[0].superior, 6, 1e-6);
});

teste('routh do sistema padrao e estavel para todo K positivo', () => {
  const routh = tabelaRouth([1, 5, 4, 0], [0, 0, 1, 2]);
  assert.equal(routh.kCriticos.length, 0);
  for (const condicao of routh.condicoes) {
    assert.equal(condicao.intervalos.length, 1);
    perto(condicao.intervalos[0].inferior, 0);
    assert.equal(Number.isFinite(condicao.intervalos[0].superior), false);
  }
  assert.equal(condicaoLatex(routh.condicoes[0].intervalos), '\\forall\\; K > 0');
});

teste('routh gera latex legivel', () => {
  const routh = tabelaRouth([1, 3, 2, 0], [0, 0, 0, 1]);
  assert.equal(racionalLatex(routh.tabela[0][0]), '1');
  assert.equal(racionalLatex(routh.tabela[0][1]), '2');
  assert.equal(racionalLatex(routh.tabela[1][0]), '3');
  assert.equal(racionalLatex(routh.tabela[1][1]), 'K');
});

teste('routh trata linha inteiramente nula', () => {
  const routh = tabelaRouth([1, 2, 24, 48, -25, -50], [0, 0, 0, 0, 0, 0]);
  const observacao = routh.observacoes.find((item) => item.tipo === 'linhaNula');
  assert.ok(observacao, 'esperava observacao de linha nula');
  assert.equal(observacao.expoente, 3);
  assert.equal(observacao.grauAuxiliar, 4);
  perto(routh.tabela[2][0].numerador[0], 8, 1e-9);
  perto(routh.tabela[2][1].numerador[0], 96, 1e-9);
  assert.equal(routh.linhasValidas, 5);
});

teste('routh aplica o metodo do epsilon no pivo nulo', () => {
  const routh = tabelaRouth([1, 1, 2, 2, 3], [0, 0, 0, 0, 0]);
  const observacao = routh.observacoes.find((item) => item.tipo === 'epsilon');
  assert.ok(observacao, 'esperava observacao de epsilon');
  assert.equal(observacao.expoente, 2);
  assert.ok(routh.tabela[2][0].numerador[0] > 0);
  assert.equal(routh.linhasValidas, 4);
});

teste('routh sem casos especiais nao gera observacoes', () => {
  const routh = tabelaRouth([1, 3, 2, 0], [0, 0, 0, 1]);
  assert.equal(routh.observacoes.length, 0);
});

teste('cruzamento com eixo imaginario do integrador triplo', () => {
  const resultado = analisarCruzamentoJw([1, 3, 2, 0], [0, 0, 0, 1]);
  assert.equal(resultado.cruzamentos.length, 1);
  perto(resultado.cruzamentos[0].omega, Math.SQRT2, 1e-6);
  perto(resultado.cruzamentos[0].ganho, 6, 1e-6);
});

teste('sistema padrao nao cruza o eixo imaginario', () => {
  const resultado = analisarCruzamentoJw([1, 5, 4, 0], [0, 0, 1, 2]);
  assert.equal(resultado.cruzamentos.length, 0);
});

teste('varredura comeca nos polos e mantem ramos', () => {
  const denominador = [1, 3, 2, 0];
  const numerador = [0, 0, 0, 1];
  const varredura = calcularLugarRaizes(numerador, denominador);
  assert.equal(varredura.ramos, 3);
  const iniciais = [];
  for (let j = 0; j < varredura.ramos; j += 1) {
    iniciais.push(Number(varredura.re[j].toFixed(6)));
  }
  assert.deepEqual(iniciais.sort((a, b) => a - b), [-2, -1, 0]);
  for (let i = 0; i < varredura.re.length; i += 1) {
    assert.ok(Number.isFinite(varredura.re[i]) && Number.isFinite(varredura.im[i]));
  }
});

teste('varredura satisfaz a equacao caracteristica', () => {
  const denominador = [1, 3, 2, 0];
  const numerador = [0, 0, 0, 1];
  const varredura = calcularLugarRaizes(numerador, denominador);
  const indice = Math.floor(varredura.amostras / 2);
  const ganho = varredura.ganhos[indice];
  const polinomio = denominador.map((d, i) => d + ganho * numerador[i]);
  for (let j = 0; j < varredura.ramos; j += 1) {
    const raiz = {
      re: varredura.re[indice * varredura.ramos + j],
      im: varredura.im[indice * varredura.ramos + j],
    };
    const valor = P.avaliarComplexo(polinomio, raiz);
    assert.ok(Math.hypot(valor.re, valor.im) < 1e-6, `residuo alto: ${Math.hypot(valor.re, valor.im)}`);
  }
});

teste('criterio de angulo reconhece ponto do lugar', () => {
  const denominador = [1, 3, 2, 0];
  const numerador = [0, 0, 0, 1];
  const { polos, zeros } = polosEZeros(numerador, denominador);
  const dentro = criterioDeAngulo({ re: -0.42264973, im: 0 }, zeros, polos);
  assert.equal(dentro.pertence, true);
  const fora = criterioDeAngulo({ re: 1, im: 1 }, zeros, polos);
  assert.equal(fora.pertence, false);
});

teste('criterio de modulo devolve o ganho do ponto', () => {
  const denominador = [1, 3, 2, 0];
  const numerador = [0, 0, 0, 1];
  const { polos, zeros } = polosEZeros(numerador, denominador);
  const resultado = criterioDeModulo({ re: 0, im: Math.SQRT2 }, zeros, polos);
  perto(resultado.ganho, 6, 1e-6);
});

teste('janela mantem escala igual nos dois eixos', () => {
  const pontos = [{ re: 0, im: 0 }, { re: -4, im: 0 }, { re: -1, im: 0 }];
  const janela = calcularJanela(pontos, 700, 430);
  const escalaX = (janela.xMax - janela.xMin) / 700;
  const escalaY = (janela.yMax - janela.yMin) / 430;
  perto(escalaX, escalaY, 1e-9);
});

teste('janela cobre todos os pontos de interesse', () => {
  const pontos = [{ re: 0, im: 0 }, { re: -4, im: 0 }, { re: 0, im: 3.5 }, { re: 0, im: -3.5 }];
  const janela = calcularJanela(pontos, 700, 430);
  for (const ponto of pontos) {
    assert.ok(ponto.re > janela.xMin && ponto.re < janela.xMax, 'ponto fora em x');
    assert.ok(ponto.im > janela.yMin && ponto.im < janela.yMax, 'ponto fora em y');
  }
});

teste('janela do grafico final cobre polos, centroide, descolamento e cruzamentos', () => {
  const analise = analisarSistema({
    nG: [1],
    dG: [1, 3, 2, 0],
    nH: [1],
    dH: [1],
    pontoTeste: { re: 0, im: 0 },
  });
  const area = areaDoPlano();
  const janela = calcularJanela(pontosNotaveis(analise), area.largura, area.altura);

  perto((janela.xMax - janela.xMin) / area.largura, (janela.yMax - janela.yMin) / area.altura, 1e-9);

  const obrigatorios = [
    ...analise.polos,
    { re: analise.assintotas.centroide, im: 0 },
    ...analise.descolamento.pontosReaisValidos.map((item) => item.s),
    ...analise.cruzamentoJw.cruzamentos.flatMap((item) => [
      { re: 0, im: item.omega },
      { re: 0, im: -item.omega },
    ]),
  ];

  for (const ponto of obrigatorios) {
    assert.ok(ponto.re > janela.xMin && ponto.re < janela.xMax, `fora da janela em x: ${ponto.re}`);
    assert.ok(ponto.im > janela.yMin && ponto.im < janela.yMax, `fora da janela em y: ${ponto.im}`);
  }
});

teste('janela final acompanha polos complexos afastados', () => {
  const analise = analisarSistema({
    nG: [1, 3],
    dG: [1, 2, 5, 0],
    nH: [1],
    dH: [1],
    pontoTeste: { re: 0, im: 0 },
  });
  const area = areaDoPlano();
  const janela = calcularJanela(pontosNotaveis(analise), area.largura, area.altura);
  perto((janela.xMax - janela.xMin) / area.largura, (janela.yMax - janela.yMin) / area.altura, 1e-9);
  for (const polo of analise.polos) {
    assert.ok(polo.re > janela.xMin && polo.re < janela.xMax);
    assert.ok(polo.im > janela.yMin && polo.im < janela.yMax);
  }
});

teste('janela manual e expandida sem cortar a regiao pedida', () => {
  const manual = { xMin: -10, xMax: 2, yMin: -2, yMax: 2 };
  const janela = calcularJanela([], 700, 430, manual);
  assert.ok(janela.xMin <= manual.xMin + 1e-9);
  assert.ok(janela.xMax >= manual.xMax - 1e-9);
  assert.ok(janela.yMin <= manual.yMin + 1e-9);
  assert.ok(janela.yMax >= manual.yMax - 1e-9);
  perto((janela.xMax - janela.xMin) / 700, (janela.yMax - janela.yMin) / 430, 1e-9);
});

teste('a varredura fecha os ramos nos zeros finitos', () => {
  const analise = analisarSistema({
    nG: [2, 0.2, 4],
    dG: [1, 2, 2, 1],
    nH: [1],
    dH: [1, 2],
    pontoTeste: { re: 0, im: 0 },
  });

  const finais = [];
  for (let j = 0; j < analise.varredura.ramos; j += 1) {
    const ramo = extrairRamo(analise.varredura, j);
    finais.push(ramo[ramo.length - 1]);
  }

  for (const zero of analise.zeros) {
    const folga = finais.reduce(
      (menor, s) => Math.min(menor, Math.hypot(s.re - zero.re, s.im - zero.im)),
      Infinity,
    );
    assert.ok(folga < 0.02, `ramo parou a ${folga.toFixed(4)} do zero`);
  }
});

console.log(`\n${executados - falhas}/${executados} testes passaram`);
if (falhas > 0) {
  process.exitCode = 1;
}
