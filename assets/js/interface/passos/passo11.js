import { formula, paragrafo, separador, aviso, quadroDeGrafico } from '../componentes.js';
import { complexoLatex } from '../../formatacao/latex.js';
import { fixoLatex } from '../../formatacao/numero.js';
import { paraCircunferencia } from '../../analise/criterios.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros, desenharVetores, desenharPontoTeste } from '../../grafico/camadas.js';

export const titulo = '**Passo 11:** Critério de ângulo';

export function renderizar(destino, analise, contexto = {}) {
  const criterio = analise.criterioAngulo;
  const pontoTeste = analise.entrada.pontoTeste;

  paragrafo(destino, '**Condição de pertinência ao LGR:**');
  formula(
    destino,
    '\\sum \\angle(s_0 - z_j) - \\sum \\angle(s_0 - p_i) = \\pm 180^\\circ (2q+1)',
  );
  paragrafo(destino, `**Ponto de teste:** $s_0 = ${complexoLatex(pontoTeste)}$`);

  separador(destino);
  paragrafo(destino, '**Ângulos dos polos** ($\\theta_i$):');
  criterio.contribuicaoPolos.forEach((item, indice) => {
    formula(
      destino,
      `\\theta_{${indice + 1}} = \\angle(s_0 - p_{${indice + 1}}) = \\angle(${complexoLatex(pontoTeste)} - (${complexoLatex(item.referencia)})) = \\angle(${complexoLatex(item.diferenca)}) = ${fixoLatex(item.angulo, 2)}^\\circ`,
    );
  });
  formula(destino, `\\sum \\theta_i = ${fixoLatex(criterio.somaPolos, 2)}^\\circ`);

  if (criterio.contribuicaoZeros.length > 0) {
    paragrafo(destino, '**Ângulos dos zeros** ($\\phi_j$):');
    criterio.contribuicaoZeros.forEach((item, indice) => {
      formula(
        destino,
        `\\phi_{${indice + 1}} = \\angle(s_0 - z_{${indice + 1}}) = \\angle(${complexoLatex(pontoTeste)} - (${complexoLatex(item.referencia)})) = \\angle(${complexoLatex(item.diferenca)}) = ${fixoLatex(item.angulo, 2)}^\\circ`,
      );
    });
    formula(destino, `\\sum \\phi_j = ${fixoLatex(criterio.somaZeros, 2)}^\\circ`);
  } else {
    paragrafo(destino, 'Sem zeros finitos: $\\sum \\phi_j = 0^\\circ$');
  }

  separador(destino);
  paragrafo(destino, '**Avaliação:**');
  formula(
    destino,
    `\\Delta\\theta = \\sum \\theta_i - \\sum \\phi_j = ${fixoLatex(criterio.somaPolos, 2)}^\\circ - ${fixoLatex(criterio.somaZeros, 2)}^\\circ = ${fixoLatex(criterio.diferenca, 2)}^\\circ`,
  );

  const normalizado = fixoLatex(paraCircunferencia(criterio.normalizado), 2);
  formula(destino, `\\text{Ângulo normalizado: } ${normalizado}^\\circ`);

  if (criterio.pertence) {
    aviso(
      destino,
      'sucesso',
      `O ponto **pertence** ao LGR ($\\Delta\\theta = ${normalizado}^\\circ \\approx 180^\\circ$)`,
    );
  } else {
    aviso(
      destino,
      'atencao',
      `O ponto **não pertence** ao LGR ($\\Delta\\theta = ${normalizado}^\\circ \\neq 180^\\circ$)`,
    );
  }

  separador(destino);
  const plano = criarPlano(analise, 'Critério de ângulo', {
    limitesManuais: contexto.limitesManuais,
    incluirPontoTeste: true,
    pontosExtras: [pontoTeste],
  });
  desenharVetores(plano, analise.polos, analise.zeros, pontoTeste);
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  desenharPontoTeste(plano, pontoTeste, criterio.pertence);
  quadroDeGrafico(destino, plano.elemento());
}
