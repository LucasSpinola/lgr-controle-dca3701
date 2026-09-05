import { elemento } from './componentes.js';

const NS = 'http://www.w3.org/2000/svg';

function regrasDoPlano() {
  const regras = [];
  for (const folha of document.styleSheets) {
    let lista;
    try {
      lista = folha.cssRules;
    } catch (falha) {
      continue;
    }
    for (const regra of lista) {
      if (regra.selectorText && regra.selectorText.includes('.plano')) {
        regras.push(regra.cssText);
      }
    }
  }
  return regras.join('\n');
}

function variaveisResolvidas(css) {
  const estilo = window.getComputedStyle(document.documentElement);
  const nomes = Array.from(new Set(css.match(/--[\w-]+/g) || []));
  const pares = nomes.map((nome) => `${nome}:${estilo.getPropertyValue(nome).trim()}`);
  return `:root{${pares.join(';')}}`;
}

export function baixarSvg(svg, nome) {
  const copia = svg.cloneNode(true);
  copia.setAttribute('xmlns', NS);
  copia.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  const css = regrasDoPlano();
  const estilo = document.createElementNS(NS, 'style');
  estilo.textContent = `${variaveisResolvidas(css)}\n${css}`;

  const fundo = document.createElementNS(NS, 'rect');
  fundo.setAttribute('x', '0');
  fundo.setAttribute('y', '0');
  fundo.setAttribute('width', copia.getAttribute('width') || '100%');
  fundo.setAttribute('height', copia.getAttribute('height') || '100%');
  fundo.setAttribute('fill', '#ffffff');

  copia.insertBefore(fundo, copia.firstChild);
  copia.insertBefore(estilo, copia.firstChild);

  const texto = new XMLSerializer().serializeToString(copia);
  const endereco = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml;charset=utf-8' }));
  const ligacao = document.createElement('a');
  ligacao.href = endereco;
  ligacao.download = nome;
  document.body.appendChild(ligacao);
  ligacao.click();
  document.body.removeChild(ligacao);
  URL.revokeObjectURL(endereco);
}

export function montarBotaoDeDownload(destino, svg, nome) {
  const botao = elemento('button', 'botao-secundario', 'Baixar SVG');
  botao.type = 'button';
  botao.addEventListener('click', () => baixarSvg(svg, nome));
  destino.appendChild(botao);
  return botao;
}

export function montarBarraDeResultado(destino) {
  const barra = elemento('div', 'barra-resultado');
  const botao = elemento('button', 'botao-secundario', 'Expandir todos os passos');
  botao.type = 'button';

  let expandido = false;
  botao.addEventListener('click', () => {
    expandido = !expandido;
    document.querySelectorAll('.passo').forEach((passo) => {
      passo.open = expandido;
    });
    botao.textContent = expandido ? 'Recolher todos os passos' : 'Expandir todos os passos';
  });

  barra.appendChild(botao);
  destino.appendChild(barra);
  return barra;
}

export function conectarImpressao() {
  let abertosAntes = [];

  window.addEventListener('beforeprint', () => {
    abertosAntes = [];
    document.querySelectorAll('.passo').forEach((passo) => {
      abertosAntes.push(passo.open);
      passo.open = true;
    });
  });

  window.addEventListener('afterprint', () => {
    document.querySelectorAll('.passo').forEach((passo, indice) => {
      passo.open = abertosAntes[indice] === true;
    });
  });
}
