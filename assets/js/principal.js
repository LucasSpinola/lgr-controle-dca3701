import { analisarSistema } from './analise/analise.js';
import { lerFormulario, conectarLimitesManuais } from './interface/formulario.js';
import { secao, aviso, elemento, limparNo } from './interface/componentes.js';
import { montarApresentacao, esconderRoteiro } from './interface/apresentacao.js';
import { aplicarEndereco, atualizarEndereco } from './interface/endereco.js';
import { montarBarraDeResultado, conectarImpressao } from './interface/ferramentas.js';
import { passos } from './interface/passos/indice.js';
import * as graficoCompleto from './interface/passos/graficoCompleto.js';

function renderizarResultado(destino, analise, contexto) {
  montarBarraDeResultado(destino);
  for (const passo of passos) {
    const corpo = secao(destino, passo.titulo, passo.abertoPorPadrao === true);
    passo.renderizar(corpo, analise, contexto);
  }
  graficoCompleto.renderizar(destino, analise, contexto);
}

function executar(destino, rolar = true) {
  const leitura = lerFormulario();
  limparNo(destino);

  if (leitura.erro) {
    aviso(destino, 'erro', leitura.erro);
    return;
  }

  atualizarEndereco();
  destino.appendChild(elemento('p', 'carregando', 'Calculando'));

  window.requestAnimationFrame(() => {
    try {
      const analise = analisarSistema(leitura.entrada);
      limparNo(destino);
      esconderRoteiro();
      renderizarResultado(destino, analise, { limitesManuais: leitura.limitesManuais });
      if (rolar) {
        destino.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    } catch (falha) {
      limparNo(destino);
      aviso(destino, 'erro', `Não foi possível concluir o cálculo: ${falha.message}`);
    }
  });
}

function iniciar() {
  const destino = document.getElementById('resultado');
  const formulario = document.getElementById('formulario');

  const veioDoEndereco = aplicarEndereco();
  montarApresentacao();
  conectarLimitesManuais();
  conectarImpressao();

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    executar(destino);
  });

  if (veioDoEndereco) {
    executar(destino, false);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
