import { elemento, paragrafo, quadroDeGrafico } from '../componentes.js';
import { montarBotaoDeDownload } from '../ferramentas.js';
import { formatarG } from '../../formatacao/numero.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros, desenharRamos, desenharCentroide } from '../../grafico/camadas.js';

export function renderizar(pai, analise, contexto = {}) {
  const bloco = elemento('section', 'grafico-final');
  const cabecalho = elemento('div', 'grafico-final-cabecalho');
  cabecalho.appendChild(elemento('h2', 'titulo-secao', 'Gráfico completo do LGR'));
  bloco.appendChild(cabecalho);

  const plano = criarPlano(analise, 'Lugar geométrico das raízes', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharRamos(plano, analise.varredura, { espessura: 2.6, opacidade: 0.95, legenda: 'Ramos do LGR' });
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  desenharCentroide(plano, analise.assintotas);

  const svg = plano.elemento();
  quadroDeGrafico(bloco, svg);
  montarBotaoDeDownload(cabecalho, svg, 'lugar-geometrico-das-raizes.svg');

  paragrafo(
    bloco,
    `Varredura de $K$ de $0$ até $${formatarG(analise.varredura.ganhoMaximo, 4)}$, com escala igual nos dois eixos.`,
  );

  pai.appendChild(bloco);
}
