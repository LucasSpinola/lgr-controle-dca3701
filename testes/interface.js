import assert from 'node:assert/strict';

class NoFalso {
  constructor(tag, espaco = null) {
    this.tagName = tag;
    this.namespaceURI = espaco;
    this.children = [];
    this.attributes = {};
    this.ouvintes = {};
    this.className = '';
    this.hidden = false;
    this.open = false;
    this.type = '';
    this.value = '';
    this.conteudo = '';
    this.classList = {
      add: (nome) => {
        this.className = `${this.className} ${nome}`.trim();
      },
      remove: (nome) => {
        this.className = this.className.split(' ').filter((item) => item !== nome).join(' ');
      },
      contains: (nome) => this.className.split(' ').includes(nome),
    };
  }

  setAttribute(nome, valor) {
    this.attributes[nome] = String(valor);
  }

  getAttribute(nome) {
    return this.attributes[nome];
  }

  appendChild(filho) {
    this.children.push(filho);
    return filho;
  }

  insertBefore(filho) {
    this.children.unshift(filho);
    return filho;
  }

  removeChild(filho) {
    this.children = this.children.filter((item) => item !== filho);
  }

  addEventListener(nome, funcao) {
    this.ouvintes[nome] = funcao;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  set textContent(valor) {
    this.conteudo = String(valor);
    this.children = [];
  }

  get textContent() {
    return this.conteudo;
  }

  serializar() {
    const atributos = Object.entries(this.attributes)
      .map(([chave, valor]) => `${chave}="${valor}"`)
      .join(' ');
    const interno = this.conteudo
      + this.children.map((filho) => (filho.serializar ? filho.serializar() : String(filho))).join('');
    return `<${this.tagName}${atributos ? ` ${atributos}` : ''}>${interno}</${this.tagName}>`;
  }
}

const registrados = new Map();

globalThis.document = {
  createElement: (tag) => new NoFalso(tag),
  createElementNS: (espaco, tag) => new NoFalso(tag, espaco),
  createTextNode: (texto) => ({ texto, serializar: () => texto }),
  getElementById: (identificador) => {
    if (!registrados.has(identificador)) {
      registrados.set(identificador, new NoFalso('div'));
    }
    return registrados.get(identificador);
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  readyState: 'complete',
  styleSheets: [],
};

globalThis.window = {
  requestAnimationFrame: (funcao) => funcao(),
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  setTimeout: () => 0,
  clearTimeout: () => {},
};

const { analisarSistema, esbocarSistema } = await import('../assets/js/analise/analise.js');
const { passos } = await import('../assets/js/interface/passos/indice.js');
const graficoCompleto = await import('../assets/js/interface/passos/graficoCompleto.js');
const { secao } = await import('../assets/js/interface/componentes.js');
const { criarPlano, LIMITES_COMPACTOS } = await import('../assets/js/grafico/fabrica.js');
const { desenharRamos, desenharPolosZeros } = await import('../assets/js/grafico/camadas.js');

let executados = 0;
let falhas = 0;

function teste(nome, corpo) {
  executados += 1;
  try {
    corpo();
    console.log(`ok   ${nome}`);
  } catch (erro) {
    falhas += 1;
    console.log(`FALHA ${nome}`);
    console.log(`      ${erro.message}`);
  }
}

const CASOS = [
  {
    nome: 'zero real com integrador',
    entrada: { nG: [1, 2], dG: [1, 4, 0], nH: [1], dH: [1, 1], pontoTeste: { re: -1, im: 2 } },
  },
  {
    nome: 'tres polos reais',
    entrada: { nG: [1], dG: [1, 3, 2, 0], nH: [1], dH: [1], pontoTeste: { re: 0, im: 1.4142 } },
  },
  {
    nome: 'polos complexos com zero',
    entrada: { nG: [1, 3], dG: [1, 2, 5, 0], nH: [1], dH: [1], pontoTeste: { re: -2, im: 1 } },
  },
  {
    nome: 'quarta ordem sem zeros',
    entrada: { nG: [1], dG: [1, 6, 11, 6, 0], nH: [1], dH: [1], pontoTeste: { re: -0.5, im: 0 } },
  },
  {
    nome: 'mesmo numero de polos e zeros',
    entrada: { nG: [1, 1], dG: [1, 2], nH: [1], dH: [1], pontoTeste: { re: -1.5, im: 0 } },
  },
  {
    nome: 'ponto de teste sobre um polo',
    entrada: { nG: [1], dG: [1, 1, 0], nH: [1], dH: [1], pontoTeste: { re: 0, im: 0 } },
  },
];

function renderizarTudo(analise, contexto = {}) {
  const raiz = new NoFalso('div');
  for (const passo of passos) {
    const corpo = secao(raiz, passo.titulo, false);
    passo.renderizar(corpo, analise, contexto);
  }
  graficoCompleto.renderizar(raiz, analise, contexto);
  return raiz.serializar();
}

for (const caso of CASOS) {
  teste(`os doze passos renderizam para ${caso.nome}`, () => {
    const analise = analisarSistema(caso.entrada);
    const html = renderizarTudo(analise);
    assert.ok(html.length > 1000, 'saida curta demais');
    assert.ok(!html.includes('undefined'), 'saida contem undefined');
    assert.ok(!html.includes('NaN'), 'saida contem NaN');
  });
}

teste('cada passo produz um bloco proprio', () => {
  const analise = analisarSistema(CASOS[0].entrada);
  const raiz = new NoFalso('div');
  for (const passo of passos) {
    const corpo = secao(raiz, passo.titulo, false);
    passo.renderizar(corpo, analise, {});
  }
  assert.equal(raiz.children.length, passos.length);
  assert.equal(raiz.children.filter((item) => item.tagName === 'details').length, 12);
});

teste('limites manuais chegam ao plano pelo contexto', () => {
  const analise = analisarSistema(CASOS[1].entrada);
  const manuais = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

  const automatico = criarPlano(analise, 'automatico', {});
  const manual = criarPlano(analise, 'manual', { limitesManuais: manuais });

  assert.ok(manual.janela.xMin <= manuais.xMin + 1e-9);
  assert.ok(manual.janela.xMax >= manuais.xMax - 1e-9);
  assert.ok(
    manual.janela.xMax - manual.janela.xMin > automatico.janela.xMax - automatico.janela.xMin,
    'a janela manual deveria ser maior que a automatica neste caso',
  );
});

teste('o esboco da miniatura desenha sem depender da analise completa', () => {
  const esboco = esbocarSistema([1, 3], [1, 2, 5, 0], [1], [1]);
  assert.equal(esboco.polos.length, 3);
  assert.ok(esboco.varredura.amostras < 400, 'o esboco deveria usar poucas amostras');

  const plano = criarPlano(esboco, '', { limites: LIMITES_COMPACTOS, semLegenda: true });
  desenharRamos(plano, esboco.varredura, { espessura: 2 });
  desenharPolosZeros(plano, esboco.polos, esboco.zeros);
  assert.equal(plano.itensDaLegenda.length, 0, 'a miniatura nao deveria registrar legenda');

  const svg = plano.elemento();
  assert.ok(svg.serializar().includes('<title>'), 'o svg precisa de titulo acessivel');
});

teste('o plano completo mantem legenda e titulo', () => {
  const analise = analisarSistema(CASOS[0].entrada);
  const plano = criarPlano(analise, 'Lugar geométrico das raízes', {});
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  assert.ok(plano.itensDaLegenda.length >= 2);
  assert.ok(plano.elemento().serializar().includes('Lugar'));
});

const { montarApresentacao } = await import('../assets/js/interface/apresentacao.js');

function aplicarSegundoExemplo() {
  const lista = document.getElementById('exemplos');
  lista.children[1].ouvintes.click();
}

function editarCoeficiente(valor) {
  const campo = document.getElementById('numerador-g');
  campo.value = valor;
  campo.ouvintes.input();
}

teste('editar coeficiente descarta o ponto de teste herdado do exemplo', () => {
  montarApresentacao();
  aplicarSegundoExemplo();
  assert.equal(document.getElementById('ponto-real').value, '-0.4226');

  editarCoeficiente('2 0.2 4');
  assert.equal(document.getElementById('ponto-real').value, '0');
  assert.equal(document.getElementById('ponto-imaginario').value, '0');
});

teste('ponto de teste digitado pelo usuario sobrevive a troca de coeficientes', () => {
  aplicarSegundoExemplo();
  const real = document.getElementById('ponto-real');
  real.value = '-1.5';
  real.ouvintes.input();

  editarCoeficiente('1 3');
  assert.equal(real.value, '-1.5');
});

console.log(`\n${executados - falhas}/${executados} testes de interface passaram`);
if (falhas > 0) {
  process.exitCode = 1;
}
