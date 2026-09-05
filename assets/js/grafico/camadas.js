import { extrairRamo } from '../analise/lugarRaizes.js';
import { fixo } from '../formatacao/numero.js';

export const CORES = {
  polo: '#d0342c',
  zero: '#1f9d55',
  segmento: '#2b6cd9',
  assintota: '#e08b1a',
  ramo: '#2b6cd9',
  ramoFundo: '#98a2b3',
  centroide: '#1f2933',
  descolamento: '#a435c9',
  cruzamento: '#12b0c8',
  cruzamentoBorda: '#123c8c',
  pertence: '#1f9d55',
  naoPertence: '#d0342c',
  partida: '#8c1c13',
  chegada: '#14532d',
};

function fatiar(pontos, janela) {
  const folgaX = (janela.xMax - janela.xMin) * 3;
  const folgaY = (janela.yMax - janela.yMin) * 3;
  const dentro = (ponto) => ponto.re >= janela.xMin - folgaX
    && ponto.re <= janela.xMax + folgaX
    && ponto.im >= janela.yMin - folgaY
    && ponto.im <= janela.yMax + folgaY;

  const trechos = [];
  let atual = [];
  for (let i = 0; i < pontos.length; i += 1) {
    if (dentro(pontos[i])) {
      if (atual.length === 0 && i > 0) {
        atual.push(pontos[i - 1]);
      }
      atual.push(pontos[i]);
    } else if (atual.length > 0) {
      atual.push(pontos[i]);
      trechos.push(atual);
      atual = [];
    }
  }
  if (atual.length > 0) {
    trechos.push(atual);
  }
  return trechos;
}

export function desenharRamos(plano, varredura, opcoes = {}) {
  const cor = opcoes.cor || CORES.ramo;
  const espessura = opcoes.espessura || 2.4;
  const opacidade = opcoes.opacidade ?? 0.9;

  for (let j = 0; j < varredura.ramos; j += 1) {
    for (const trecho of fatiar(extrairRamo(varredura, j), plano.janela)) {
      plano.caminho(trecho, {
        stroke: cor,
        'stroke-width': espessura,
        'stroke-opacity': opacidade,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      });
    }
  }
  if (opcoes.legenda) {
    plano.registrarLegenda('linha', cor, opcoes.legenda);
  }
}

export function desenharPolosZeros(plano, polos, zeros, opcoes = {}) {
  polos.forEach((p, indice) => {
    plano.cruz(p, { stroke: CORES.polo, 'stroke-width': 2.4 });
    if (opcoes.rotular) {
      plano.rotulo(p, `p${indice + 1}`, { fill: CORES.polo });
    }
  });
  zeros.forEach((z, indice) => {
    plano.circulo(z, { stroke: CORES.zero, 'stroke-width': 2.2, fill: 'none' });
    if (opcoes.rotular) {
      plano.rotulo(z, `z${indice + 1}`, { fill: CORES.zero });
    }
  });

  plano.registrarLegenda('x', CORES.polo, 'Polos');
  if (zeros.length > 0) {
    plano.registrarLegenda('circulo', CORES.zero, 'Zeros');
  }
}

export function desenharSegmentos(plano, segmentos) {
  if (segmentos.length === 0) {
    return;
  }
  const folga = (plano.janela.xMax - plano.janela.xMin) * 2;
  for (const segmento of segmentos) {
    const inicio = Number.isFinite(segmento.inicio) ? segmento.inicio : plano.janela.xMin - folga;
    const fim = Number.isFinite(segmento.fim) ? segmento.fim : plano.janela.xMax + folga;
    plano.linha({ re: inicio, im: 0 }, { re: fim, im: 0 }, {
      stroke: CORES.segmento,
      'stroke-width': 6,
      'stroke-opacity': 0.55,
      'stroke-linecap': 'round',
    });
  }
  plano.registrarLegenda('linha', CORES.segmento, 'Segmento no eixo real');
}

export function desenharAssintotas(plano, assintotas) {
  if (!assintotas) {
    return;
  }
  const comprimento = Math.hypot(
    plano.janela.xMax - plano.janela.xMin,
    plano.janela.yMax - plano.janela.yMin,
  );
  for (const grau of assintotas.angulos) {
    const radiano = (grau * Math.PI) / 180;
    plano.linha(
      { re: assintotas.centroide, im: 0 },
      {
        re: assintotas.centroide + comprimento * Math.cos(radiano),
        im: comprimento * Math.sin(radiano),
      },
      {
        stroke: CORES.assintota,
        'stroke-width': 1.8,
        'stroke-dasharray': '7 5',
        'stroke-opacity': 0.85,
      },
    );
  }
  plano.registrarLegenda('tracejada', CORES.assintota, 'Assíntotas');
}

export function desenharCentroide(plano, assintotas) {
  if (!assintotas) {
    return;
  }
  plano.mais({ re: assintotas.centroide, im: 0 }, { stroke: CORES.centroide, 'stroke-width': 2.4 });
  plano.registrarLegenda('linha', CORES.centroide, `Centroide σa = ${fixo(assintotas.centroide, 2)}`);
}

export function desenharDescolamento(plano, pontos) {
  if (pontos.length === 0) {
    return;
  }
  for (const item of pontos) {
    plano.losango(item.s, { fill: CORES.descolamento, stroke: '#5b1a72', 'stroke-width': 1.4 });
    plano.rotulo(item.s, `K = ${fixo(item.ganho, 2)}`, { fill: CORES.descolamento });
  }
  plano.registrarLegenda('linha', CORES.descolamento, 'Saída/entrada do eixo real');
}

export function desenharCruzamentos(plano, cruzamentos) {
  if (cruzamentos.length === 0) {
    return;
  }
  for (const item of cruzamentos) {
    for (const sinal of [1, -1]) {
      plano.quadrado({ re: 0, im: sinal * item.omega }, {
        fill: CORES.cruzamento,
        stroke: CORES.cruzamentoBorda,
        'stroke-width': 1.8,
      }, 5.5);
    }
    plano.rotulo({ re: 0, im: item.omega }, `jω = ${fixo(item.omega, 2)} (K = ${fixo(item.ganho, 2)})`, {
      fill: CORES.cruzamentoBorda,
    });
  }
  plano.registrarLegenda('linha', CORES.cruzamento, 'Cruzamento com jω');
}

export function desenharPontoTeste(plano, ponto, pertence) {
  const cor = pertence ? CORES.pertence : CORES.naoPertence;
  if (pertence) {
    plano.estrela(ponto, { fill: cor, stroke: '#1f2933', 'stroke-width': 1.2 });
  } else {
    plano.cruz(ponto, { stroke: cor, 'stroke-width': 3 }, 8);
  }
  plano.registrarLegenda('linha', cor, pertence ? 's0 pertence ao LGR' : 's0 não pertence ao LGR');
}

export function desenharVetores(plano, polos, zeros, ponto) {
  for (const p of polos) {
    plano.linha(p, ponto, {
      stroke: CORES.polo, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', 'stroke-opacity': 0.6,
    });
  }
  for (const z of zeros) {
    plano.linha(z, ponto, {
      stroke: CORES.zero, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', 'stroke-opacity': 0.6,
    });
  }
}

export function desenharSetasDeAngulo(plano, itens, cor, incluirConjugado = false) {
  if (itens.length === 0) {
    return;
  }
  const comprimento = (plano.janela.xMax - plano.janela.xMin) * 0.16;
  for (const item of itens) {
    const radiano = (item.angulo * Math.PI) / 180;
    const destino = {
      re: item.ponto.re + comprimento * Math.cos(radiano),
      im: item.ponto.im + comprimento * Math.sin(radiano),
    };
    plano.seta(item.ponto, destino, { stroke: cor, 'stroke-width': 2 });
    plano.rotulo(destino, `${fixo(((item.angulo % 360) + 360) % 360, 1)}°`, { fill: cor });

    if (incluirConjugado) {
      const radianoConjugado = (-item.angulo * Math.PI) / 180;
      const espelho = { re: item.ponto.re, im: -item.ponto.im };
      plano.seta(espelho, {
        re: espelho.re + comprimento * Math.cos(radianoConjugado),
        im: espelho.im + comprimento * Math.sin(radianoConjugado),
      }, { stroke: cor, 'stroke-width': 2 });
    }
  }
}
