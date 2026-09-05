import {
  formula,
  paragrafo,
  subtitulo,
  separador,
  aviso,
  quadroDeGrafico,
} from '../componentes.js';
import { complexoLatex } from '../../formatacao/latex.js';
import { fixoLatex } from '../../formatacao/numero.js';
import { paraCircunferencia } from '../../analise/criterios.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros, desenharRamos, desenharSetasDeAngulo, CORES } from '../../grafico/camadas.js';

export const titulo = '**Passo 10:** Ângulos de partida e chegada';

function renderizarPartida(destino, itens) {
  subtitulo(destino, 'Ângulos de partida (polos complexos)');
  paragrafo(destino, '**Fórmula:**');
  formula(
    destino,
    '\\theta_d = 180^\\circ - \\sum_{j \\neq k} \\angle(p_k - p_j) + \\sum_j \\angle(p_k - z_j)',
  );

  for (const item of itens) {
    separador(destino);
    paragrafo(destino, `**Polo $p_k = ${complexoLatex(item.ponto)}$:**`);

    paragrafo(destino, 'Ângulos dos outros polos:');
    for (const contribuicao of item.contribuicaoPolos) {
      formula(
        destino,
        `\\angle(p_k - p_j) = \\angle(${complexoLatex(item.ponto)} - (${complexoLatex(contribuicao.referencia)})) = \\angle(${complexoLatex(contribuicao.diferenca)}) = ${fixoLatex(contribuicao.angulo, 2)}^\\circ`,
      );
    }

    if (item.contribuicaoZeros.length > 0) {
      paragrafo(destino, 'Ângulos dos zeros:');
      for (const contribuicao of item.contribuicaoZeros) {
        formula(
          destino,
          `\\angle(p_k - z_j) = \\angle(${complexoLatex(item.ponto)} - (${complexoLatex(contribuicao.referencia)})) = \\angle(${complexoLatex(contribuicao.diferenca)}) = ${fixoLatex(contribuicao.angulo, 2)}^\\circ`,
        );
      }
    }

    paragrafo(destino, 'Somatórios:');
    formula(destino, `\\sum \\angle(p_k - p_j) = ${fixoLatex(item.somaPolos, 2)}^\\circ`);
    formula(destino, `\\sum \\angle(p_k - z_j) = ${fixoLatex(item.somaZeros, 2)}^\\circ`);

    paragrafo(destino, 'Resultado:');
    formula(
      destino,
      `\\theta_d = 180^\\circ - (${fixoLatex(item.somaPolos, 2)}^\\circ) + (${fixoLatex(item.somaZeros, 2)}^\\circ) = ${fixoLatex(paraCircunferencia(item.angulo), 2)}^\\circ`,
    );
    formula(destino, `\\text{Conjugado: } ${fixoLatex(paraCircunferencia(-item.angulo), 2)}^\\circ`);
  }
}

function renderizarChegada(destino, itens) {
  subtitulo(destino, 'Ângulos de chegada (zeros complexos)');
  paragrafo(destino, '**Fórmula:**');
  formula(
    destino,
    '\\theta_a = 180^\\circ - \\sum_{j \\neq k} \\angle(z_k - z_j) + \\sum_j \\angle(z_k - p_j)',
  );

  for (const item of itens) {
    separador(destino);
    paragrafo(destino, `**Zero $z_k = ${complexoLatex(item.ponto)}$:**`);

    paragrafo(destino, 'Ângulos dos outros zeros:');
    for (const contribuicao of item.contribuicaoZeros) {
      formula(destino, `\\angle(z_k - z_j) = ${fixoLatex(contribuicao.angulo, 2)}^\\circ`);
    }

    paragrafo(destino, 'Ângulos dos polos:');
    for (const contribuicao of item.contribuicaoPolos) {
      formula(destino, `\\angle(z_k - p_j) = ${fixoLatex(contribuicao.angulo, 2)}^\\circ`);
    }

    formula(destino, `\\sum \\angle(z_k - z_j) = ${fixoLatex(item.somaZeros, 2)}^\\circ`);
    formula(destino, `\\sum \\angle(z_k - p_j) = ${fixoLatex(item.somaPolos, 2)}^\\circ`);
    formula(
      destino,
      `\\theta_a = 180^\\circ - (${fixoLatex(item.somaZeros, 2)}^\\circ) + (${fixoLatex(item.somaPolos, 2)}^\\circ) = ${fixoLatex(paraCircunferencia(item.angulo), 2)}^\\circ`,
    );
    formula(destino, `\\text{Conjugado: } ${fixoLatex(paraCircunferencia(-item.angulo), 2)}^\\circ`);
  }
}

export function renderizar(destino, analise, contexto = {}) {
  const { partida, chegada } = analise;

  if (partida.length === 0 && chegada.length === 0) {
    aviso(destino, 'informacao', 'Sem polos ou zeros complexos. Este passo não se aplica.');
    return;
  }

  if (partida.length > 0) {
    renderizarPartida(destino, partida);
  }
  if (chegada.length > 0) {
    renderizarChegada(destino, chegada);
  }

  separador(destino);
  const plano = criarPlano(analise, 'Ângulos de partida e chegada do LGR', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharRamos(plano, analise.varredura, {
    cor: '#98a2b3',
    espessura: 1.6,
    opacidade: 0.55,
    legenda: 'Ramos do LGR',
  });
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  desenharSetasDeAngulo(plano, partida, CORES.partida, true);
  desenharSetasDeAngulo(plano, chegada, CORES.chegada, false);
  quadroDeGrafico(destino, plano.elemento());
}
