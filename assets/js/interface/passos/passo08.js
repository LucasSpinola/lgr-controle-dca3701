import { formula, paragrafo, separador, aviso, quadroDeGrafico } from '../componentes.js';
import { polinomioLatex, complexoLatex } from '../../formatacao/latex.js';
import { fixoLatex } from '../../formatacao/numero.js';
import { criarPlano } from '../../grafico/fabrica.js';
import {
  desenharPolosZeros,
  desenharSegmentos,
  desenharAssintotas,
  desenharDescolamento,
} from '../../grafico/camadas.js';

export const titulo = '**Passo 8:** Pontos de saída e entrada do eixo real';

export function renderizar(destino, analise, contexto = {}) {
  const { descolamento } = analise;
  const numerador = polinomioLatex(analise.numerador);
  const denominador = polinomioLatex(analise.denominador);

  paragrafo(destino, '**1) Isolar $K$ na equação característica:**');
  formula(destino, 'D(s) + K \\cdot N(s) = 0 \\;\\Longrightarrow\\; K = -\\frac{D(s)}{N(s)}');
  formula(destino, `K = -\\frac{${denominador}}{${numerador}}`);

  paragrafo(destino, '**2) Condição de descolamento** $\\frac{dK}{ds} = 0$:');
  formula(destino, '\\frac{dK}{ds} = -\\frac{D\'(s) \\cdot N(s) - D(s) \\cdot N\'(s)}{N(s)^2} = 0');
  paragrafo(destino, 'Para o numerador ser zero:');
  formula(destino, 'D\'(s) \\cdot N(s) - D(s) \\cdot N\'(s) = 0');

  paragrafo(destino, '**3) Calculando as derivadas:**');
  formula(destino, `N(s) = ${numerador}`);
  formula(destino, `N'(s) = ${polinomioLatex(descolamento.derivadaNumerador)}`);
  formula(destino, `D(s) = ${denominador}`);
  formula(destino, `D'(s) = ${polinomioLatex(descolamento.derivadaDenominador)}`);

  paragrafo(destino, '**4) Equação de descolamento:**');
  formula(destino, `${polinomioLatex(descolamento.equacao)} = 0`);

  paragrafo(destino, '**5) Raízes da equação de descolamento:**');
  for (const item of descolamento.candidatos) {
    if (item.real) {
      let situacao = item.noLugar ? '\\text{pertence ao LGR}' : '\\text{fora do LGR}';
      if (item.degenerado) {
        situacao = '\\text{coincide com polo ou zero, não é descolamento}';
      }
      formula(
        destino,
        `s = ${fixoLatex(item.s.re, 4)}, \\quad K = ${fixoLatex(item.ganho, 4)} \\quad [${situacao}]`,
      );
      if (item.valido) {
        aviso(
          destino,
          'sucesso',
          `Ponto de descolamento válido: $s = ${fixoLatex(item.s.re, 4)}$ com $K = ${fixoLatex(item.ganho, 4)}$`,
        );
      }
    } else {
      const ganhoTexto = item.ganhoComplexo ? complexoLatex(item.ganhoComplexo) : '\\infty';
      const situacao = item.valido ? '\\text{no LGR}' : '\\text{fora}';
      formula(destino, `s = ${complexoLatex(item.s)}, \\quad K = ${ganhoTexto} \\quad [${situacao}]`);
    }
  }

  separador(destino);
  const plano = criarPlano(analise, 'Pontos de saída e entrada do LGR', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharSegmentos(plano, analise.segmentos);
  desenharAssintotas(plano, analise.assintotas);
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  desenharDescolamento(plano, descolamento.pontosReaisValidos);
  quadroDeGrafico(destino, plano.elemento());
}
