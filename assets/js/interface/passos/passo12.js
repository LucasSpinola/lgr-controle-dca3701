import { formula, paragrafo, separador, aviso } from '../componentes.js';
import { complexoLatex } from '../../formatacao/latex.js';
import { fixoLatex } from '../../formatacao/numero.js';

export const titulo = '**Passo 12:** Cálculo de $K$';

export function renderizar(destino, analise, contexto = {}) {
  const criterio = analise.criterioModulo;
  const pontoTeste = analise.entrada.pontoTeste;

  paragrafo(destino, '**Fórmula do critério de módulo:**');
  formula(destino, 'K = \\frac{\\prod_{i} |s_0 - p_i|}{\\prod_{j} |s_0 - z_j|}');
  paragrafo(destino, `**Ponto:** $s_0 = ${complexoLatex(pontoTeste)}$`);

  separador(destino);
  paragrafo(destino, '**Distâncias dos polos:**');
  criterio.distanciasPolos.forEach((item, indice) => {
    formula(
      destino,
      `|s_0 - p_{${indice + 1}}| = |${complexoLatex(pontoTeste)} - (${complexoLatex(item.referencia)})| = |${complexoLatex(item.diferenca)}| = ${fixoLatex(item.valor, 4)}`,
    );
  });
  paragrafo(destino, 'Produto das distâncias dos polos:');
  formula(
    destino,
    `\\prod |s_0 - p_i| = ${criterio.distanciasPolos.map((item) => fixoLatex(item.valor, 4)).join(' \\cdot ')} = ${fixoLatex(criterio.produtoPolos, 4)}`,
  );

  if (criterio.distanciasZeros.length > 0) {
    separador(destino);
    paragrafo(destino, '**Distâncias dos zeros:**');
    criterio.distanciasZeros.forEach((item, indice) => {
      formula(
        destino,
        `|s_0 - z_{${indice + 1}}| = |${complexoLatex(pontoTeste)} - (${complexoLatex(item.referencia)})| = |${complexoLatex(item.diferenca)}| = ${fixoLatex(item.valor, 4)}`,
      );
    });
    paragrafo(destino, 'Produto das distâncias dos zeros:');
    formula(
      destino,
      `\\prod |s_0 - z_j| = ${criterio.distanciasZeros.map((item) => fixoLatex(item.valor, 4)).join(' \\cdot ')} = ${fixoLatex(criterio.produtoZeros, 4)}`,
    );
  } else {
    paragrafo(destino, 'Sem zeros finitos: $\\prod |s_0 - z_j| = 1$');
  }

  separador(destino);
  paragrafo(destino, '**Resultado:**');

  if (!criterio.definido) {
    aviso(destino, 'erro', 'Não é possível calcular $K$: o ponto coincide com um zero.');
    return;
  }

  formula(
    destino,
    `K = \\frac{${fixoLatex(criterio.produtoPolos, 4)}}{${fixoLatex(criterio.produtoZeros, 4)}} = ${fixoLatex(criterio.ganho, 4)}`,
  );

  if (analise.criterioAngulo.pertence) {
    aviso(destino, 'sucesso', `O ponto pertence ao LGR. $K = ${fixoLatex(criterio.ganho, 6)}$`);
  } else {
    aviso(
      destino,
      'atencao',
      `O ponto não pertence ao LGR. $K = ${fixoLatex(criterio.ganho, 6)}$ (valor de referência)`,
    );
  }
}
