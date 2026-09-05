import { formula, paragrafo, separador, quadroDeGrafico } from '../componentes.js';
import { fixoLatex, numeroLatex } from '../../formatacao/numero.js';
import { criarPlano } from '../../grafico/fabrica.js';
import {
  desenharPolosZeros,
  desenharSegmentos,
  desenharAssintotas,
  desenharCentroide,
} from '../../grafico/camadas.js';

export const titulo = '**Passo 7:** Assíntotas';

export function renderizar(destino, analise, contexto = {}) {
  const { assintotas, polos, zeros } = analise;

  if (!assintotas) {
    formula(destino, 'n_p = n_z \\;\\Rightarrow\\; \\text{sem assíntotas}');
    return;
  }

  paragrafo(destino, '**Número de assíntotas:**');
  formula(
    destino,
    `n_a = n_p - n_z = ${polos.length} - ${zeros.length} = ${assintotas.quantidade}`,
  );

  separador(destino);
  paragrafo(destino, '**Centroide (ponto de encontro das assíntotas):**');
  formula(
    destino,
    '\\sigma_a = \\frac{\\sum \\operatorname{Re}(p_i) - \\sum \\operatorname{Re}(z_j)}{n_p - n_z}',
  );

  paragrafo(destino, 'Soma das partes reais dos polos:');
  const termosPolos = polos.map((p) => `(${numeroLatex(p.re, 4)})`).join(' + ');
  formula(
    destino,
    `\\sum \\operatorname{Re}(p_i) = ${termosPolos} = ${fixoLatex(assintotas.somaPolos, 4)}`,
  );

  if (zeros.length > 0) {
    paragrafo(destino, 'Soma das partes reais dos zeros:');
    const termosZeros = zeros.map((z) => `(${numeroLatex(z.re, 4)})`).join(' + ');
    formula(
      destino,
      `\\sum \\operatorname{Re}(z_j) = ${termosZeros} = ${fixoLatex(assintotas.somaZeros, 4)}`,
    );
  } else {
    paragrafo(destino, 'Sem zeros finitos:');
    formula(destino, '\\sum \\operatorname{Re}(z_j) = 0');
  }

  paragrafo(destino, 'Substituindo:');
  formula(
    destino,
    `\\sigma_a = \\frac{(${fixoLatex(assintotas.somaPolos, 4)}) - (${fixoLatex(assintotas.somaZeros, 4)})}{${assintotas.quantidade}} = \\frac{${fixoLatex(assintotas.somaPolos - assintotas.somaZeros, 4)}}{${assintotas.quantidade}} = ${fixoLatex(assintotas.centroide, 4)}`,
  );

  separador(destino);
  paragrafo(destino, '**Ângulos das assíntotas:**');
  formula(
    destino,
    `\\phi_a = \\frac{(2q + 1) \\cdot 180^\\circ}{n_a} = \\frac{(2q + 1) \\cdot 180^\\circ}{${assintotas.quantidade}}`,
  );

  paragrafo(destino, 'Calculando para cada $q$:');
  assintotas.angulos.forEach((grau, q) => {
    formula(
      destino,
      `q = ${q}: \\quad \\phi_a = \\frac{(2 \\cdot ${q} + 1) \\cdot 180^\\circ}{${assintotas.quantidade}} = \\frac{${2 * q + 1} \\cdot 180^\\circ}{${assintotas.quantidade}} = ${fixoLatex(grau, 1)}^\\circ`,
    );
  });

  separador(destino);
  const plano = criarPlano(analise, 'Assíntotas do LGR', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharSegmentos(plano, analise.segmentos);
  desenharAssintotas(plano, assintotas);
  desenharPolosZeros(plano, polos, zeros);
  desenharCentroide(plano, assintotas);
  quadroDeGrafico(destino, plano.elemento());
}
