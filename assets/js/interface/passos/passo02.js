import { formula, paragrafo } from '../componentes.js';
import { fatoradoLatex } from '../../formatacao/latex.js';

export const titulo = '**Passo 2:** Forma fatorada de $P(s)$';

export function renderizar(destino, analise, contexto = {}) {
  paragrafo(destino, 'Fatorando numerador e denominador de $P(s)$:');
  formula(
    destino,
    `P(s) = \\frac{${fatoradoLatex(analise.zeros)}}{${fatoradoLatex(analise.polos)}}`,
  );
}
