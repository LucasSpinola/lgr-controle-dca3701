import { interpretarCoeficientes } from '../nucleo/entrada.js';
import { razaoLatex } from '../formatacao/latex.js';
import { esbocarSistema } from '../analise/analise.js';
import { criarPlano, LIMITES_COMPACTOS } from '../grafico/fabrica.js';
import { desenharPolosZeros, desenharRamos } from '../grafico/camadas.js';
import { elemento, escrever, formula, limparNo } from './componentes.js';
import { passos } from './passos/indice.js';

const ESPERA_DA_MINIATURA = 320;
let agendamentoDaMiniatura = null;

const EXEMPLOS = [
  {
    nome: 'Integrador com zero',
    nG: '1 2',
    dG: '1 4 0',
    nH: '1',
    dH: '1 1',
    real: '0',
    imaginario: '0',
  },
  {
    nome: 'Três polos reais',
    nG: '1',
    dG: '1 3 2 0',
    nH: '1',
    dH: '1',
    real: '-0.4226',
    imaginario: '0',
  },
  {
    nome: 'Polos complexos',
    nG: '1 3',
    dG: '1 2 5 0',
    nH: '1',
    dH: '1',
    real: '-1',
    imaginario: '2',
  },
  {
    nome: 'Quarta ordem',
    nG: '1',
    dG: '1 6 11 6 0',
    nH: '1',
    dH: '1',
    real: '-0.38',
    imaginario: '0',
  },
];

const CAMPOS_DA_PREVIA = [
  { numerador: 'numerador-g', denominador: 'denominador-g', destino: 'previa-g', ganho: true },
  { numerador: 'numerador-h', denominador: 'denominador-h', destino: 'previa-h', ganho: false },
];

function atualizarPrevia(configuracao) {
  const destino = document.getElementById(configuracao.destino);
  const numerador = interpretarCoeficientes(document.getElementById(configuracao.numerador).value);
  const denominador = interpretarCoeficientes(
    document.getElementById(configuracao.denominador).value,
  );

  limparNo(destino);
  destino.classList.remove('previa-invalida');

  if (numerador === null || denominador === null) {
    destino.classList.add('previa-invalida');
    escrever(destino, 'Coeficientes inválidos');
    return;
  }

  const razao = razaoLatex(numerador, denominador);
  const nome = configuracao.ganho ? 'G(s)' : 'H(s)';
  const prefixo = configuracao.ganho ? 'K \\cdot ' : '';
  formula(destino, `${nome} = ${prefixo}${razao}`);
}

function desenharMiniatura() {
  const destino = document.getElementById('miniatura');
  if (!destino) {
    return;
  }

  const coeficientes = ['numerador-g', 'denominador-g', 'numerador-h', 'denominador-h']
    .map((identificador) => interpretarCoeficientes(document.getElementById(identificador).value));

  limparNo(destino);

  if (coeficientes.some((item) => item === null)) {
    destino.appendChild(elemento('p', 'capa-figura-vazia', 'Aguardando coeficientes válidos'));
    return;
  }

  try {
    const esboco = esbocarSistema(...coeficientes);
    if (esboco.polos.length === 0) {
      destino.appendChild(elemento('p', 'capa-figura-vazia', 'Sem polos para traçar'));
      return;
    }
    const plano = criarPlano(esboco, '', { limites: LIMITES_COMPACTOS, semLegenda: true });
    desenharRamos(plano, esboco.varredura, { espessura: 2.2, opacidade: 0.95 });
    desenharPolosZeros(plano, esboco.polos, esboco.zeros);
    destino.appendChild(plano.elemento());
  } catch (falha) {
    destino.appendChild(elemento('p', 'capa-figura-vazia', 'Traçado indisponível'));
  }
}

function agendarMiniatura() {
  window.clearTimeout(agendamentoDaMiniatura);
  agendamentoDaMiniatura = window.setTimeout(desenharMiniatura, ESPERA_DA_MINIATURA);
}

function limparSelecaoDeExemplo() {
  document.querySelectorAll('.pilula-ativa').forEach((item) => {
    item.classList.remove('pilula-ativa');
  });
}

function conectarPrevias() {
  for (const configuracao of CAMPOS_DA_PREVIA) {
    const campos = [configuracao.numerador, configuracao.denominador];
    for (const identificador of campos) {
      document.getElementById(identificador).addEventListener('input', () => {
        limparSelecaoDeExemplo();
        atualizarPrevia(configuracao);
        agendarMiniatura();
      });
    }
    atualizarPrevia(configuracao);
  }
}

function aplicarExemplo(exemplo) {
  document.getElementById('numerador-g').value = exemplo.nG;
  document.getElementById('denominador-g').value = exemplo.dG;
  document.getElementById('numerador-h').value = exemplo.nH;
  document.getElementById('denominador-h').value = exemplo.dH;
  document.getElementById('ponto-real').value = exemplo.real;
  document.getElementById('ponto-imaginario').value = exemplo.imaginario;
  CAMPOS_DA_PREVIA.forEach(atualizarPrevia);
  agendarMiniatura();
}

function montarExemplos() {
  const lista = document.getElementById('exemplos');
  EXEMPLOS.forEach((exemplo, indice) => {
    const botao = elemento('button', 'pilula', exemplo.nome);
    botao.type = 'button';
    if (indice === 0) {
      botao.classList.add('pilula-ativa');
    }
    botao.addEventListener('click', () => {
      limparSelecaoDeExemplo();
      botao.classList.add('pilula-ativa');
      aplicarExemplo(exemplo);
    });
    lista.appendChild(botao);
  });
}

function montarRoteiro() {
  const lista = document.getElementById('roteiro-lista');
  passos.forEach((passo, indice) => {
    const texto = passo.titulo.replace(/\*\*/g, '').replace(/\$/g, '');
    const item = elemento('li', 'roteiro-item');
    item.appendChild(elemento('span', 'roteiro-numero', String(indice + 1)));
    item.appendChild(elemento('span', 'roteiro-texto', texto.split(': ')[1] || texto));
    lista.appendChild(item);
  });
}

function formatarTextosEstaticos() {
  for (const no of document.querySelectorAll('[data-formatar]')) {
    const conteudo = no.textContent.trim().replace(/\s+/g, ' ');
    escrever(limparNo(no), conteudo);
  }
}

export function montarApresentacao() {
  formatarTextosEstaticos();
  montarExemplos();
  montarRoteiro();
  conectarPrevias();
  desenharMiniatura();
}

export function esconderRoteiro() {
  const roteiro = document.getElementById('roteiro');
  if (roteiro) {
    roteiro.hidden = true;
  }
}
