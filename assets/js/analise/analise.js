import { montarMalhaAberta, polosEZeros, lugaresSeparados } from './malhaAberta.js';
import { segmentosEixoReal } from './eixoReal.js';
import { calcularAssintotas } from './assintotas.js';
import { analisarDescolamento } from './descolamento.js';
import { tabelaRouth } from './routh.js';
import { analisarCruzamentoJw } from './cruzamentoJw.js';
import { calcularLugarRaizes } from './lugarRaizes.js';
import { pontosNotaveis, raioDeInteresse } from './pontosNotaveis.js';
import {
  angulosDePartida,
  angulosDeChegada,
  criterioDeAngulo,
  criterioDeModulo,
} from './criterios.js';

const AMOSTRAS_DO_ESBOCO = 260;

function geometria(nG, dG, nH, dH, pontoTeste) {
  const { numerador, denominador } = montarMalhaAberta(nG, dG, nH, dH);
  const { zeros, polos } = polosEZeros(numerador, denominador);
  return {
    entrada: { nG, dG, nH, dH, pontoTeste },
    numerador,
    denominador,
    zeros,
    polos,
    segmentos: segmentosEixoReal(zeros, polos),
    assintotas: calcularAssintotas(zeros, polos),
  };
}

export function analisarSistema(entrada) {
  const { nG, dG, nH, dH, pontoTeste } = entrada;
  const base = geometria(nG, dG, nH, dH, pontoTeste);
  const { numerador, denominador, zeros, polos } = base;

  const analise = {
    ...base,
    lugaresSeparados: lugaresSeparados(polos, zeros),
    descolamento: analisarDescolamento(numerador, denominador, polos, zeros),
    routh: tabelaRouth(denominador, numerador),
    cruzamentoJw: analisarCruzamentoJw(denominador, numerador),
    partida: angulosDePartida(polos, zeros),
    chegada: angulosDeChegada(polos, zeros),
    criterioAngulo: criterioDeAngulo(pontoTeste, zeros, polos),
    criterioModulo: criterioDeModulo(pontoTeste, zeros, polos),
  };

  analise.varredura = calcularLugarRaizes(numerador, denominador, {
    raioDeInteresse: raioDeInteresse(pontosNotaveis(analise, { incluirPontoTeste: true })),
  });

  return analise;
}

export function esbocarSistema(nG, dG, nH, dH) {
  const base = geometria(nG, dG, nH, dH, { re: 0, im: 0 });
  const analise = {
    ...base,
    descolamento: { pontosReaisValidos: [] },
    cruzamentoJw: { cruzamentos: [] },
  };

  analise.varredura = calcularLugarRaizes(base.numerador, base.denominador, {
    amostras: AMOSTRAS_DO_ESBOCO,
    raioDeInteresse: raioDeInteresse(pontosNotaveis(analise)),
  });

  return analise;
}
