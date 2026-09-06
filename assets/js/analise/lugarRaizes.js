import { raizes, casarPorProximidade } from '../nucleo/raizes.js';
import * as C from '../nucleo/complexo.js';

const AMOSTRAS_INICIAIS = 200;
const AMOSTRAS_LOGARITMICAS = 2400;
const FOLGA_ALEM_DA_JANELA = 1.6;
const GANHO_MAXIMO_ABSOLUTO = 1e9;
const FRACAO_DA_TOLERANCIA_NO_ZERO = 0.005;
const FATOR_DA_BUSCA = 10;
const PASSOS_DO_REFINO = 8;
const DESVIOS_AO_REDOR_DO_NOTAVEL = [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 5e-2];

function grauEfetivo(coeficientes) {
  const escala = coeficientes.reduce((maior, valor) => Math.max(maior, Math.abs(valor)), 0);
  const desprezivel = 1e-14 * Math.max(1, escala);
  let inicio = 0;
  while (inicio < coeficientes.length - 1 && Math.abs(coeficientes[inicio]) <= desprezivel) {
    inicio += 1;
  }
  return coeficientes.length - 1 - inicio;
}

function combinar(denominador, numerador, ganho) {
  return denominador.map((d, i) => d + ganho * numerador[i]);
}

function maiorModulo(numerador, denominador, ganho) {
  const encontradas = raizes(combinar(denominador, numerador, ganho));
  return encontradas.reduce((total, z) => Math.max(total, C.modulo(z)), 0);
}

function maiorFolgaAteOsZeros(numerador, denominador, zeros, ganho) {
  const encontradas = raizes(combinar(denominador, numerador, ganho));
  if (encontradas.length === 0) {
    return Infinity;
  }
  return zeros.reduce((maior, zero) => {
    const proxima = encontradas.reduce((menor, s) => Math.min(menor, C.distancia(s, zero)), Infinity);
    return Math.max(maior, proxima);
  }, 0);
}

export function estimarGanhoMaximo(numerador, denominador, raioDeInteresse = 10) {
  const alvo = Math.max(raioDeInteresse, 1) * FOLGA_ALEM_DA_JANELA;

  let inferior = 0;
  let superior = 0;
  let anterior = -Infinity;

  for (let expoente = 0; expoente <= 9; expoente += 1) {
    const ganho = 10 ** expoente;
    const modulo = maiorModulo(numerador, denominador, ganho);
    if (modulo >= alvo) {
      superior = ganho;
      break;
    }
    if (modulo <= anterior * 1.0001 && expoente > 2) {
      return ganho;
    }
    anterior = modulo;
    inferior = ganho;
  }

  if (superior === 0) {
    return GANHO_MAXIMO_ABSOLUTO;
  }

  for (let passo = 0; passo < 24; passo += 1) {
    const meio = (inferior + superior) / 2;
    if (maiorModulo(numerador, denominador, meio) >= alvo) {
      superior = meio;
    } else {
      inferior = meio;
    }
  }
  return Math.max(superior, 1e-3);
}

export function estimarGanhoParaFecharNosZeros(numerador, denominador, opcoes = {}) {
  const raioDeInteresse = Math.max(opcoes.raioDeInteresse || 0, 1);
  const alvo = raioDeInteresse * FOLGA_ALEM_DA_JANELA;
  const finitos = opcoes.zeros || raizes(numerador);
  const zeros = finitos.filter((z) => C.modulo(z) <= alvo);
  if (zeros.length === 0) {
    return 0;
  }

  const tolerancia = raioDeInteresse * FRACAO_DA_TOLERANCIA_NO_ZERO;
  const folga = (ganho) => maiorFolgaAteOsZeros(numerador, denominador, zeros, ganho);

  let superior = 1;
  while (folga(superior) > tolerancia) {
    if (superior >= GANHO_MAXIMO_ABSOLUTO) {
      return GANHO_MAXIMO_ABSOLUTO;
    }
    superior = Math.min(superior * FATOR_DA_BUSCA, GANHO_MAXIMO_ABSOLUTO);
  }

  let inferior = superior / FATOR_DA_BUSCA;
  for (let passo = 0; passo < PASSOS_DO_REFINO; passo += 1) {
    const meio = Math.sqrt(inferior * superior);
    if (folga(meio) <= tolerancia) {
      superior = meio;
    } else {
      inferior = meio;
    }
  }
  return superior;
}

export function limitesDeGanho(numerador, denominador, opcoes = {}) {
  const ganhoDaJanela = estimarGanhoMaximo(numerador, denominador, opcoes.raioDeInteresse);
  const ganhoDosZeros = estimarGanhoParaFecharNosZeros(numerador, denominador, {
    zeros: opcoes.zeros,
    raioDeInteresse: opcoes.raioDeInteresse,
  });
  const ramosQueFogem = grauEfetivo(denominador) - grauEfetivo(numerador);

  let limite = Math.max(ganhoDaJanela, ganhoDosZeros);
  if (ramosQueFogem === 0 && ganhoDosZeros > 0) {
    limite = ganhoDosZeros;
  }

  return { limite, ganhoDaJanela, ganhoDosZeros, ramosQueFogem };
}

function acrescentarNotaveis(lista, notaveis, limite) {
  for (const notavel of notaveis) {
    if (!Number.isFinite(notavel) || notavel <= 0 || notavel > limite) {
      continue;
    }
    lista.push(notavel);
    for (const desvio of DESVIOS_AO_REDOR_DO_NOTAVEL) {
      lista.push(notavel * (1 - desvio));
      const acima = notavel * (1 + desvio);
      if (acima <= limite) {
        lista.push(acima);
      }
    }
  }
}

function montarGanhos(ganhoMaximo, amostras, notaveis = []) {
  const limite = Math.max(ganhoMaximo, 1e-3);
  const iniciais = Math.max(20, Math.round(amostras * 0.08));
  const logaritmicas = Math.max(40, amostras - iniciais);
  const inicioLinear = Math.min(0.1, limite / 20);

  const lista = [];
  for (let i = 0; i < iniciais; i += 1) {
    lista.push((inicioLinear * i) / (iniciais - 1));
  }

  const expoenteInicial = Math.log10(Math.max(inicioLinear, 1e-6));
  const expoenteFinal = Math.log10(limite);
  for (let i = 0; i < logaritmicas; i += 1) {
    const t = i / (logaritmicas - 1);
    lista.push(10 ** (expoenteInicial + t * (expoenteFinal - expoenteInicial)));
  }

  acrescentarNotaveis(lista, notaveis, limite);

  lista.sort((a, b) => a - b);
  const saida = [];
  for (const valor of lista) {
    if (saida.length === 0 || valor - saida[saida.length - 1] > 1e-12) {
      saida.push(valor);
    }
  }
  return saida;
}

export function calcularLugarRaizes(numerador, denominador, opcoes = {}) {
  const ramos = denominador.length - 1;
  const amostras = opcoes.amostras || AMOSTRAS_INICIAIS + AMOSTRAS_LOGARITMICAS;
  const estimativa = opcoes.ganhoMaximo
    ? { limite: opcoes.ganhoMaximo, ganhoDaJanela: opcoes.ganhoMaximo, ganhoDosZeros: 0 }
    : limitesDeGanho(numerador, denominador, opcoes);
  const { limite, ganhoDaJanela, ganhoDosZeros } = estimativa;
  const ganhos = montarGanhos(limite, amostras, opcoes.ganhosNotaveis || []);

  const re = new Float64Array(ganhos.length * ramos);
  const im = new Float64Array(ganhos.length * ramos);
  let anteriores = null;

  for (let i = 0; i < ganhos.length; i += 1) {
    let atuais = raizes(combinar(denominador, numerador, ganhos[i]), anteriores);

    if (atuais.length < ramos && anteriores) {
      const faltantes = anteriores.slice(atuais.length);
      atuais = atuais.concat(faltantes.map((z) => C.escalar(z, 10)));
    }
    while (atuais.length < ramos) {
      atuais.push(C.complexo(0, 0));
    }
    if (atuais.length > ramos) {
      atuais = atuais.slice(0, ramos);
    }
    if (anteriores) {
      atuais = casarPorProximidade(anteriores, atuais);
    }

    for (let j = 0; j < ramos; j += 1) {
      re[i * ramos + j] = atuais[j].re;
      im[i * ramos + j] = atuais[j].im;
    }
    anteriores = atuais;
  }

  return {
    ganhos,
    re,
    im,
    ramos,
    amostras: ganhos.length,
    ganhoMaximo: limite,
    ganhoDaJanela,
    ganhoDosZeros,
  };
}

export function extrairRamo(varredura, indice) {
  const { amostras, ramos, re, im } = varredura;
  const pontos = new Array(amostras);
  for (let i = 0; i < amostras; i += 1) {
    pontos[i] = { re: re[i * ramos + indice], im: im[i * ramos + indice] };
  }
  return pontos;
}
