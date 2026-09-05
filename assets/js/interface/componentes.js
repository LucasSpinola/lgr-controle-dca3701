export function elemento(tag, classe = '', conteudo = '') {
  const criado = document.createElement(tag);
  if (classe) {
    criado.className = classe;
  }
  if (conteudo) {
    criado.textContent = conteudo;
  }
  return criado;
}

function renderizarMatematica(destino, expressao, emBloco) {
  if (typeof window.katex === 'undefined') {
    destino.textContent = expressao;
    return;
  }
  window.katex.render(expressao, destino, {
    displayMode: emBloco,
    throwOnError: false,
    strict: 'ignore',
  });
}

function aplicarNegrito(fragmento, conteudo) {
  const partes = conteudo.split('**');
  partes.forEach((parte, indice) => {
    if (parte === '') {
      return;
    }
    if (indice % 2 === 1) {
      fragmento.appendChild(elemento('strong', '', parte));
    } else {
      fragmento.appendChild(document.createTextNode(parte));
    }
  });
}

export function limparNo(no) {
  while (no.firstChild) {
    no.removeChild(no.firstChild);
  }
  return no;
}

export function escrever(destino, conteudo) {
  const blocos = conteudo.split('$');
  blocos.forEach((bloco, indice) => {
    if (indice % 2 === 1) {
      const alvo = elemento('span', 'matematica-linha');
      renderizarMatematica(alvo, bloco, false);
      destino.appendChild(alvo);
    } else {
      aplicarNegrito(destino, bloco);
    }
  });
  return destino;
}

export function paragrafo(pai, conteudo) {
  const bloco = elemento('p', 'texto');
  escrever(bloco, conteudo);
  pai.appendChild(bloco);
  return bloco;
}

export function subtitulo(pai, conteudo) {
  const bloco = elemento('h3', 'subtitulo');
  escrever(bloco, conteudo);
  pai.appendChild(bloco);
  return bloco;
}

export function formula(pai, expressao) {
  const bloco = elemento('div', 'formula');
  renderizarMatematica(bloco, expressao, true);
  pai.appendChild(bloco);
  return bloco;
}

export function aviso(pai, tipo, conteudo) {
  const bloco = elemento('div', `aviso aviso-${tipo}`);
  escrever(bloco, conteudo);
  pai.appendChild(bloco);
  return bloco;
}

export function separador(pai) {
  pai.appendChild(elemento('hr', 'separador'));
}

export function colunas(pai, quantidade) {
  const grade = elemento('div', `colunas colunas-${quantidade}`);
  const celulas = [];
  for (let i = 0; i < quantidade; i += 1) {
    const celula = elemento('div', 'coluna');
    grade.appendChild(celula);
    celulas.push(celula);
  }
  pai.appendChild(grade);
  return celulas;
}

export function secao(pai, titulo, aberta = false) {
  const bloco = elemento('details', 'passo');
  bloco.open = aberta;
  const cabecalho = elemento('summary', 'passo-titulo');
  escrever(cabecalho, titulo);
  bloco.appendChild(cabecalho);
  const corpo = elemento('div', 'passo-corpo');
  bloco.appendChild(corpo);
  pai.appendChild(bloco);
  return corpo;
}

export function quadroDeGrafico(pai, svg) {
  const moldura = elemento('div', 'grafico');
  moldura.appendChild(svg);
  pai.appendChild(moldura);
  return moldura;
}
