import { formula, paragrafo, colunas, quadroDeGrafico } from '../componentes.js';
import { complexoLatex } from '../../formatacao/latex.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros } from '../../grafico/camadas.js';

export const titulo = '**Passo 3:** Polos e zeros no plano $s$';

export function renderizar(destino, analise, contexto = {}) {
  const plano = criarPlano(analise, 'Polos e zeros no plano s', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharPolosZeros(plano, analise.polos, analise.zeros, { rotular: true });
  quadroDeGrafico(destino, plano.elemento());

  const [esquerda, direita] = colunas(destino, 2);

  paragrafo(esquerda, `**Polos** ($n_p = ${analise.polos.length}$)`);
  analise.polos.forEach((p, indice) => {
    formula(esquerda, `p_{${indice + 1}} = ${complexoLatex(p)}`);
  });

  paragrafo(direita, `**Zeros** ($n_z = ${analise.zeros.length}$)`);
  if (analise.zeros.length > 0) {
    analise.zeros.forEach((z, indice) => {
      formula(direita, `z_{${indice + 1}} = ${complexoLatex(z)}`);
    });
  } else {
    paragrafo(direita, 'Nenhum zero finito.');
  }
}
