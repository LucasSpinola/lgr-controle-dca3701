import { formula, paragrafo, separador, aviso, quadroDeGrafico } from '../componentes.js';
import { polinomioLatex, racionalLatex, condicaoLatex } from '../../formatacao/latex.js';
import { fixoLatex } from '../../formatacao/numero.js';
import { criarPlano } from '../../grafico/fabrica.js';
import { desenharPolosZeros, desenharRamos, desenharCruzamentos } from '../../grafico/camadas.js';

export const titulo = '**Passo 9:** Cruzamento com o eixo imaginário';

function montarTabela(routh) {
  const linhas = [];
  for (let i = 0; i <= routh.grau; i += 1) {
    const celulas = [];
    for (let j = 0; j < routh.colunas; j += 1) {
      celulas.push(racionalLatex(routh.tabela[i][j]));
    }
    linhas.push(`s^{${routh.grau - i}} & ${celulas.join(' & ')}`);
  }
  return [
    `\\begin{array}{c|${'c'.repeat(routh.colunas)}}`,
    '\\hline',
    linhas.join(' \\\\ '),
    '\\\\ \\hline',
    '\\end{array}',
  ].join(' ');
}

function renderizarObservacoes(destino, observacoes) {
  for (const observacao of observacoes) {
    if (observacao.tipo === 'linhaNula') {
      aviso(
        destino,
        'atencao',
        `**Linha nula em $s^{${observacao.expoente}}$.** A linha inteira zerou, então ela foi `
        + `substituída pela derivada do polinômio auxiliar de grau ${observacao.grauAuxiliar}, `
        + 'montado com a linha de cima. Isso aponta raízes simétricas em relação à origem, e o '
        + 'sistema não é assintoticamente estável nessa condição.',
      );
    } else if (observacao.tipo === 'epsilon') {
      aviso(
        destino,
        'atencao',
        `**Pivô nulo em $s^{${observacao.expoente}}$.** O primeiro elemento da linha é zero com o `
        + 'resto da linha diferente de zero. Foi aplicado o método do épsilon, trocando o pivô por '
        + '$\\varepsilon = 10^{-6}$, positivo e pequeno, para a divisão continuar.',
      );
    } else {
      aviso(
        destino,
        'erro',
        `**Tabela interrompida em $s^{${observacao.expoente}}$.** O pivô e o polinômio auxiliar são `
        + 'nulos, então as linhas seguintes não podem ser calculadas.',
      );
    }
  }
}

function renderizarRouth(destino, routh) {
  paragrafo(destino, '**Tabela de Routh-Hurwitz:**');
  paragrafo(destino, 'A partir da equação característica $D(s) + K \\cdot N(s) = 0$:');
  formula(destino, montarTabela(routh));
  renderizarObservacoes(destino, routh.observacoes);

  if (routh.condicoes.length > 0) {
    paragrafo(destino, '**Condições de estabilidade** (primeira coluna $> 0$):');
    for (const condicao of routh.condicoes) {
      formula(
        destino,
        `s^{${condicao.expoente}}: \\quad ${racionalLatex(condicao.elemento)} > 0 \\;\\Rightarrow\\; ${condicaoLatex(condicao.intervalos)}`,
      );
    }
  }

  if (routh.kCriticos.length > 0) {
    paragrafo(destino, '**Valores críticos de $K$** (onde a primeira coluna se anula):');
    for (const critico of routh.kCriticos) {
      formula(destino, `K_{\\text{crit}} = ${fixoLatex(critico, 4)}`);
    }
  }
}

function renderizarSubstituicao(destino, cruzamentoJw) {
  paragrafo(
    destino,
    '**Método alternativo:** substituindo $s = j\\omega$ na equação característica e separando partes real e imaginária:',
  );
  formula(destino, `\\text{Re}_D(\\omega) = ${polinomioLatex(cruzamentoJw.reD, '\\omega')}`);
  formula(destino, `\\text{Im}_D(\\omega) = ${polinomioLatex(cruzamentoJw.imD, '\\omega')}`);
  formula(destino, `\\text{Re}_N(\\omega) = ${polinomioLatex(cruzamentoJw.reN, '\\omega')}`);
  formula(destino, `\\text{Im}_N(\\omega) = ${polinomioLatex(cruzamentoJw.imN, '\\omega')}`);

  paragrafo(destino, 'Eliminando $K$ entre as equações real e imaginária:');
  formula(destino, '\\text{Re}_D \\cdot \\text{Im}_N - \\text{Im}_D \\cdot \\text{Re}_N = 0');
  formula(destino, `${polinomioLatex(cruzamentoJw.eliminacao, '\\omega')} = 0`);

  if (cruzamentoJw.cruzamentos.length === 0) {
    aviso(destino, 'informacao', 'O LGR não cruza o eixo imaginário para $K > 0$.');
    return;
  }

  paragrafo(destino, '**Soluções válidas** ($\\omega > 0$, $K > 0$):');
  for (const item of cruzamentoJw.cruzamentos) {
    const omega = fixoLatex(item.omega, 4);
    if (item.origem === 'imaginaria') {
      formula(
        destino,
        `\\omega = ${omega} \\;\\Rightarrow\\; K = -\\frac{\\text{Im}_D(${omega})}{\\text{Im}_N(${omega})} = -\\frac{${fixoLatex(item.valorImD, 4)}}{${fixoLatex(item.valorImN, 4)}} = ${fixoLatex(item.ganho, 4)}`,
      );
    } else {
      formula(
        destino,
        `\\omega = ${omega} \\;\\Rightarrow\\; K = -\\frac{\\text{Re}_D(${omega})}{\\text{Re}_N(${omega})} = -\\frac{${fixoLatex(item.valorReD, 4)}}{${fixoLatex(item.valorReN, 4)}} = ${fixoLatex(item.ganho, 4)}`,
      );
    }
    formula(destino, `\\therefore \\quad s = \\pm\\, ${omega}\\,j, \\quad K = ${fixoLatex(item.ganho, 4)}`);
  }
}

export function renderizar(destino, analise, contexto = {}) {
  renderizarRouth(destino, analise.routh);
  separador(destino);
  renderizarSubstituicao(destino, analise.cruzamentoJw);

  separador(destino);
  const plano = criarPlano(analise, 'Cruzamento do LGR com o eixo imaginário', {
    limitesManuais: contexto.limitesManuais,
  });
  desenharRamos(plano, analise.varredura, {
    cor: '#98a2b3',
    espessura: 1.6,
    opacidade: 0.55,
    legenda: 'Ramos do LGR',
  });
  desenharPolosZeros(plano, analise.polos, analise.zeros);
  desenharCruzamentos(plano, analise.cruzamentoJw.cruzamentos);
  quadroDeGrafico(destino, plano.elemento());
}
