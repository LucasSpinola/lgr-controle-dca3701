import { formatarG } from '../formatacao/numero.js';

const NS = 'http://www.w3.org/2000/svg';

export const DIMENSOES = {
  largura: 780,
  altura: 520,
  margem: { esquerda: 62, direita: 20, topo: 36, base: 50 },
};

const ALTURA_MINIMA_DA_AREA = 300;
const ALTURA_MAXIMA_DA_AREA = 620;
const LARGURA_MINIMA_DA_AREA = 420;

let contadorDeIdentificadores = 0;

export function areaDoPlano(dimensoes = DIMENSOES) {
  return {
    largura: dimensoes.largura - dimensoes.margem.esquerda - dimensoes.margem.direita,
    altura: dimensoes.altura - dimensoes.margem.topo - dimensoes.margem.base,
  };
}

function entre(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

export function dimensoesParaProporcao(proporcao, limites = {}) {
  const margem = limites.margem || DIMENSOES.margem;
  const larguraMaxima = limites.larguraMaxima
    || DIMENSOES.largura - DIMENSOES.margem.esquerda - DIMENSOES.margem.direita;
  const larguraMinima = limites.larguraMinima || LARGURA_MINIMA_DA_AREA;
  const alturaMinima = limites.alturaMinima || ALTURA_MINIMA_DA_AREA;
  const alturaMaxima = limites.alturaMaxima || ALTURA_MAXIMA_DA_AREA;
  const desejada = Number.isFinite(proporcao) && proporcao > 0 ? proporcao : 1.6;

  let largura = larguraMaxima;
  let altura = largura / desejada;

  if (altura > alturaMaxima || altura < alturaMinima) {
    altura = entre(altura, alturaMinima, alturaMaxima);
    largura = entre(altura * desejada, larguraMinima, larguraMaxima);
  }

  return {
    largura: largura + margem.esquerda + margem.direita,
    altura: altura + margem.topo + margem.base,
    margem,
    compacto: limites.compacto === true,
  };
}

function criar(nome, atributos = {}) {
  const elemento = document.createElementNS(NS, nome);
  for (const [chave, valor] of Object.entries(atributos)) {
    elemento.setAttribute(chave, String(valor));
  }
  return elemento;
}

function passoAgradavel(intervalo, alvo) {
  const bruto = intervalo / alvo;
  if (!Number.isFinite(bruto) || bruto <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(bruto));
  const normalizado = bruto / magnitude;
  let fator = 10;
  if (normalizado <= 1) {
    fator = 1;
  } else if (normalizado <= 2) {
    fator = 2;
  } else if (normalizado <= 5) {
    fator = 5;
  }
  return fator * magnitude;
}

function marcasDoEixo(minimo, maximo, alvo) {
  const passo = passoAgradavel(maximo - minimo, alvo);
  const inicio = Math.ceil(minimo / passo) * passo;
  const marcas = [];
  for (let valor = inicio; valor <= maximo + passo * 1e-6; valor += passo) {
    marcas.push(Number(valor.toPrecision(12)));
  }
  return marcas;
}

export class Plano {
  constructor(janela, titulo = '', dimensoes = DIMENSOES) {
    contadorDeIdentificadores += 1;
    this.identificador = `plano-${contadorDeIdentificadores}`;
    this.janela = janela;
    this.dimensoes = dimensoes;
    this.area = areaDoPlano(dimensoes);
    this.itensDaLegenda = [];
    this.legendaAtiva = true;

    this.svg = criar('svg', {
      viewBox: `0 0 ${dimensoes.largura} ${dimensoes.altura}`,
      class: 'plano',
      role: 'img',
    });

    const descricao = criar('title');
    descricao.textContent = titulo || 'Plano s com o lugar geométrico das raízes';
    this.svg.appendChild(descricao);
    this.svg.setAttribute('aria-label', descricao.textContent);

    const defs = criar('defs');
    const recorte = criar('clipPath', { id: `${this.identificador}-recorte` });
    recorte.appendChild(criar('rect', {
      x: dimensoes.margem.esquerda,
      y: dimensoes.margem.topo,
      width: this.area.largura,
      height: this.area.altura,
    }));
    defs.appendChild(recorte);
    this.svg.appendChild(defs);

    this.fundo = criar('g');
    this.conteudo = criar('g', { 'clip-path': `url(#${this.identificador}-recorte)` });
    this.frente = criar('g');
    this.svg.appendChild(this.fundo);
    this.svg.appendChild(this.conteudo);
    this.svg.appendChild(this.frente);

    this.desenharGrade();
    this.desenharEixos(titulo);
  }

  paraX(valor) {
    const { xMin, xMax } = this.janela;
    return this.dimensoes.margem.esquerda + ((valor - xMin) / (xMax - xMin)) * this.area.largura;
  }

  paraY(valor) {
    const { yMin, yMax } = this.janela;
    return this.dimensoes.margem.topo + ((yMax - valor) / (yMax - yMin)) * this.area.altura;
  }

  desenharGrade() {
    const { margem } = this.dimensoes;
    this.fundo.appendChild(criar('rect', {
      x: margem.esquerda,
      y: margem.topo,
      width: this.area.largura,
      height: this.area.altura,
      class: 'plano-fundo',
    }));

    const marcasEmX = this.dimensoes.compacto ? 5 : 9;
    const marcasEmY = this.dimensoes.compacto ? 4 : 6;

    for (const valor of marcasDoEixo(this.janela.xMin, this.janela.xMax, marcasEmX)) {
      const x = this.paraX(valor);
      this.fundo.appendChild(criar('line', {
        x1: x, y1: margem.topo, x2: x, y2: margem.topo + this.area.altura, class: 'plano-grade',
      }));
      const rotulo = criar('text', {
        x, y: margem.topo + this.area.altura + 18, class: 'plano-marca', 'text-anchor': 'middle',
      });
      rotulo.textContent = formatarG(valor, 3);
      this.fundo.appendChild(rotulo);
    }

    for (const valor of marcasDoEixo(this.janela.yMin, this.janela.yMax, marcasEmY)) {
      const y = this.paraY(valor);
      this.fundo.appendChild(criar('line', {
        x1: margem.esquerda, y1: y, x2: margem.esquerda + this.area.largura, y2: y, class: 'plano-grade',
      }));
      const rotulo = criar('text', {
        x: margem.esquerda - 8, y: y + 4, class: 'plano-marca', 'text-anchor': 'end',
      });
      rotulo.textContent = formatarG(valor, 3);
      this.fundo.appendChild(rotulo);
    }
  }

  desenharEixos(titulo) {
    const { margem, largura, altura } = this.dimensoes;

    if (this.janela.yMin <= 0 && this.janela.yMax >= 0) {
      const y = this.paraY(0);
      this.fundo.appendChild(criar('line', {
        x1: margem.esquerda, y1: y, x2: margem.esquerda + this.area.largura, y2: y, class: 'plano-eixo',
      }));
    }
    if (this.janela.xMin <= 0 && this.janela.xMax >= 0) {
      const x = this.paraX(0);
      this.fundo.appendChild(criar('line', {
        x1: x, y1: margem.topo, x2: x, y2: margem.topo + this.area.altura, class: 'plano-eixo',
      }));
    }

    this.fundo.appendChild(criar('rect', {
      x: margem.esquerda,
      y: margem.topo,
      width: this.area.largura,
      height: this.area.altura,
      class: 'plano-borda',
    }));

    if (this.dimensoes.compacto) {
      return;
    }

    const tituloElemento = criar('text', {
      x: largura / 2, y: 22, class: 'plano-titulo', 'text-anchor': 'middle',
    });
    tituloElemento.textContent = titulo;
    this.fundo.appendChild(tituloElemento);

    const rotuloX = criar('text', {
      x: margem.esquerda + this.area.largura / 2, y: altura - 12, class: 'plano-rotulo', 'text-anchor': 'middle',
    });
    rotuloX.textContent = 'Real (σ)';
    this.fundo.appendChild(rotuloX);

    const rotuloY = criar('text', {
      x: 16,
      y: margem.topo + this.area.altura / 2,
      class: 'plano-rotulo',
      'text-anchor': 'middle',
      transform: `rotate(-90 16 ${margem.topo + this.area.altura / 2})`,
    });
    rotuloY.textContent = 'Imaginário (jω)';
    this.fundo.appendChild(rotuloY);
  }

  caminho(pontos, atributos = {}) {
    if (pontos.length < 2) {
      return;
    }
    const partes = pontos.map((ponto, indice) => {
      const comando = indice === 0 ? 'M' : 'L';
      return `${comando}${this.paraX(ponto.re).toFixed(2)} ${this.paraY(ponto.im).toFixed(2)}`;
    });
    this.conteudo.appendChild(criar('path', { d: partes.join(' '), fill: 'none', ...atributos }));
  }

  linha(inicio, fim, atributos = {}) {
    this.conteudo.appendChild(criar('line', {
      x1: this.paraX(inicio.re),
      y1: this.paraY(inicio.im),
      x2: this.paraX(fim.re),
      y2: this.paraY(fim.im),
      ...atributos,
    }));
  }

  cruz(ponto, atributos = {}, tamanho = 6) {
    const x = this.paraX(ponto.re);
    const y = this.paraY(ponto.im);
    const grupo = criar('g', atributos);
    grupo.appendChild(criar('line', { x1: x - tamanho, y1: y - tamanho, x2: x + tamanho, y2: y + tamanho }));
    grupo.appendChild(criar('line', { x1: x - tamanho, y1: y + tamanho, x2: x + tamanho, y2: y - tamanho }));
    this.conteudo.appendChild(grupo);
  }

  mais(ponto, atributos = {}, tamanho = 7) {
    const x = this.paraX(ponto.re);
    const y = this.paraY(ponto.im);
    const grupo = criar('g', atributos);
    grupo.appendChild(criar('line', { x1: x - tamanho, y1: y, x2: x + tamanho, y2: y }));
    grupo.appendChild(criar('line', { x1: x, y1: y - tamanho, x2: x, y2: y + tamanho }));
    this.conteudo.appendChild(grupo);
  }

  circulo(ponto, atributos = {}, raio = 6) {
    this.conteudo.appendChild(criar('circle', {
      cx: this.paraX(ponto.re), cy: this.paraY(ponto.im), r: raio, ...atributos,
    }));
  }

  losango(ponto, atributos = {}, tamanho = 6) {
    const x = this.paraX(ponto.re);
    const y = this.paraY(ponto.im);
    this.conteudo.appendChild(criar('polygon', {
      points: `${x},${y - tamanho} ${x + tamanho},${y} ${x},${y + tamanho} ${x - tamanho},${y}`,
      ...atributos,
    }));
  }

  quadrado(ponto, atributos = {}, tamanho = 6) {
    this.conteudo.appendChild(criar('rect', {
      x: this.paraX(ponto.re) - tamanho,
      y: this.paraY(ponto.im) - tamanho,
      width: tamanho * 2,
      height: tamanho * 2,
      ...atributos,
    }));
  }

  estrela(ponto, atributos = {}, tamanho = 9) {
    const x = this.paraX(ponto.re);
    const y = this.paraY(ponto.im);
    const vertices = [];
    for (let i = 0; i < 10; i += 1) {
      const raio = i % 2 === 0 ? tamanho : tamanho * 0.45;
      const angulo = (Math.PI / 5) * i - Math.PI / 2;
      vertices.push(`${(x + raio * Math.cos(angulo)).toFixed(2)},${(y + raio * Math.sin(angulo)).toFixed(2)}`);
    }
    this.conteudo.appendChild(criar('polygon', { points: vertices.join(' '), ...atributos }));
  }

  seta(origem, destino, atributos = {}) {
    const x1 = this.paraX(origem.re);
    const y1 = this.paraY(origem.im);
    const x2 = this.paraX(destino.re);
    const y2 = this.paraY(destino.im);
    const angulo = Math.atan2(y2 - y1, x2 - x1);
    const tamanho = 8;

    const grupo = criar('g', atributos);
    grupo.appendChild(criar('line', { x1, y1, x2, y2 }));
    const pontaEsquerda = {
      x: x2 - tamanho * Math.cos(angulo - Math.PI / 7),
      y: y2 - tamanho * Math.sin(angulo - Math.PI / 7),
    };
    const pontaDireita = {
      x: x2 - tamanho * Math.cos(angulo + Math.PI / 7),
      y: y2 - tamanho * Math.sin(angulo + Math.PI / 7),
    };
    grupo.appendChild(criar('polygon', {
      points: `${x2},${y2} ${pontaEsquerda.x.toFixed(2)},${pontaEsquerda.y.toFixed(2)} ${pontaDireita.x.toFixed(2)},${pontaDireita.y.toFixed(2)}`,
      stroke: 'none',
      fill: atributos.stroke || 'currentColor',
    }));
    this.conteudo.appendChild(grupo);
  }

  rotulo(ponto, texto, atributos = {}, deslocamento = { x: 9, y: -9 }) {
    const { margem } = this.dimensoes;
    const esquerda = margem.esquerda + 4;
    const direita = margem.esquerda + this.area.largura - 4;
    const larguraEstimada = texto.length * 5.6;

    let x = this.paraX(ponto.re) + deslocamento.x;
    let ancoragem = 'start';
    if (x + larguraEstimada > direita) {
      x = this.paraX(ponto.re) - deslocamento.x;
      ancoragem = 'end';
    }
    x = Math.min(Math.max(x, ancoragem === 'start' ? esquerda : esquerda + larguraEstimada), direita);

    let y = this.paraY(ponto.im) + deslocamento.y;
    y = Math.min(Math.max(y, margem.topo + 12), margem.topo + this.area.altura - 6);

    const elemento = criar('text', {
      x,
      y,
      class: 'plano-anotacao',
      'text-anchor': ancoragem,
      ...atributos,
    });
    elemento.textContent = texto;
    this.conteudo.appendChild(elemento);
  }

  registrarLegenda(tipo, cor, rotulo) {
    if (!this.legendaAtiva || this.itensDaLegenda.some((item) => item.rotulo === rotulo)) {
      return;
    }
    this.itensDaLegenda.push({ tipo, cor, rotulo });
  }

  desenharSimbolo(grupo, item, x, y) {
    if (item.tipo === 'tracejada') {
      grupo.appendChild(criar('line', {
        x1: x - 8,
        y1: y,
        x2: x + 8,
        y2: y,
        stroke: item.cor,
        'stroke-width': 2,
        'stroke-dasharray': '5 4',
      }));
    } else if (item.tipo === 'circulo') {
      grupo.appendChild(criar('circle', {
        cx: x, cy: y, r: 5, fill: 'none', stroke: item.cor, 'stroke-width': 2,
      }));
    } else if (item.tipo === 'x') {
      grupo.appendChild(criar('line', {
        x1: x - 5, y1: y - 5, x2: x + 5, y2: y + 5, stroke: item.cor, 'stroke-width': 2,
      }));
      grupo.appendChild(criar('line', {
        x1: x - 5, y1: y + 5, x2: x + 5, y2: y - 5, stroke: item.cor, 'stroke-width': 2,
      }));
    } else {
      grupo.appendChild(criar('line', {
        x1: x - 8, y1: y, x2: x + 8, y2: y, stroke: item.cor, 'stroke-width': 2.5,
      }));
    }
  }

  desenharLegenda() {
    if (this.itensDaLegenda.length === 0) {
      return 0;
    }
    const alturaLinha = 19;
    const porLinha = Math.max(1, Math.floor(this.dimensoes.largura / 250));
    const linhas = Math.ceil(this.itensDaLegenda.length / porLinha);
    const larguraColuna = (this.dimensoes.largura - this.dimensoes.margem.esquerda) / porLinha;
    const grupo = criar('g');

    this.itensDaLegenda.forEach((item, indice) => {
      const linha = Math.floor(indice / porLinha);
      const coluna = indice % porLinha;
      const x = this.dimensoes.margem.esquerda + coluna * larguraColuna + 10;
      const y = this.dimensoes.altura + 6 + linha * alturaLinha;

      this.desenharSimbolo(grupo, item, x, y);
      const texto = criar('text', { x: x + 14, y: y + 4, class: 'plano-legenda-texto' });
      texto.textContent = item.rotulo;
      grupo.appendChild(texto);
    });

    this.svg.appendChild(grupo);
    return linhas * alturaLinha + 8;
  }

  elemento() {
    const alturaTotal = this.dimensoes.altura + this.desenharLegenda();
    this.svg.setAttribute('viewBox', `0 0 ${this.dimensoes.largura} ${alturaTotal}`);
    this.svg.setAttribute('width', String(Math.round(this.dimensoes.largura)));
    this.svg.setAttribute('height', String(Math.round(alturaTotal)));
    return this.svg;
  }
}
