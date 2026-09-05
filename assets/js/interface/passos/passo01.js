import { formula, paragrafo, separador } from '../componentes.js';
import { polinomioLatex, razaoLatex } from '../../formatacao/latex.js';

export const titulo = '**Passo 1:** Equação característica';
export const abertoPorPadrao = true;

export function renderizar(destino, analise, contexto = {}) {
  const { nG, dG, nH, dH } = analise.entrada;
  const numerador = polinomioLatex(analise.numerador);
  const denominador = polinomioLatex(analise.denominador);

  formula(destino, `G(s) = K \\cdot ${razaoLatex(nG, dG)}`);
  formula(destino, `H(s) = ${razaoLatex(nH, dH)}`);

  separador(destino);

  paragrafo(destino, 'Função de transferência de malha aberta:');
  formula(
    destino,
    `G(s)H(s) = K \\cdot ${razaoLatex(analise.numerador, analise.denominador)} = K \\cdot P(s)`,
  );

  paragrafo(destino, 'Equação característica:');
  formula(
    destino,
    `1 + K \\cdot P(s) = 0 \\;\\Longrightarrow\\; ${denominador} + K\\left(${numerador}\\right) = 0`,
  );
}
