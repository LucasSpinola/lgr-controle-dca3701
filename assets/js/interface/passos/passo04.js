import { formula, paragrafo, aviso, quadroDeGrafico } from '../componentes.js';
import { fixoLatex } from '../../formatacao/numero.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros, desenharSegmentos } from '../../grafico/camadas.js';

export const titulo = '**Passo 4:** Segmentos no eixo real';

export function renderizar(destino, analise, contexto = {}) {
  const plano = criarPlano(analise, 'Segmentos do eixo real pertencentes ao LGR', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharSegmentos(plano, analise.segmentos);
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  quadroDeGrafico(destino, plano.elemento());

  paragrafo(
    destino,
    '**Regra:** pertencem ao LGR os segmentos do eixo real à esquerda de um número ímpar de polos e zeros reais.',
  );

  if (analise.segmentos.length === 0) {
    aviso(destino, 'informacao', 'Nenhum segmento do eixo real pertence ao LGR.');
    return;
  }

  for (const segmento of analise.segmentos) {
    const inicio = Number.isFinite(segmento.inicio) ? fixoLatex(segmento.inicio, 4) : '-\\infty';
    const fim = Number.isFinite(segmento.fim) ? fixoLatex(segmento.fim, 4) : '+\\infty';
    formula(destino, `\\left[${inicio}\\;,\\; ${fim}\\right]`);
  }
}
