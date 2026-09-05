import { interpretarCoeficientes, interpretarNumero } from '../nucleo/entrada.js';

const CAMPOS = {
  numeradorG: 'numerador-g',
  denominadorG: 'denominador-g',
  numeradorH: 'numerador-h',
  denominadorH: 'denominador-h',
  pontoReal: 'ponto-real',
  pontoImaginario: 'ponto-imaginario',
  usarLimites: 'usar-limites',
  xMinimo: 'x-minimo',
  xMaximo: 'x-maximo',
  yMinimo: 'y-minimo',
  yMaximo: 'y-maximo',
};

function campo(nome) {
  return document.getElementById(CAMPOS[nome]);
}

export function conectarLimitesManuais() {
  const seletor = campo('usarLimites');
  const painel = document.getElementById('painel-limites');
  const atualizar = () => {
    painel.hidden = !seletor.checked;
  };
  seletor.addEventListener('change', atualizar);
  atualizar();
}

export function lerFormulario() {
  const nG = interpretarCoeficientes(campo('numeradorG').value);
  const dG = interpretarCoeficientes(campo('denominadorG').value);
  const nH = interpretarCoeficientes(campo('numeradorH').value);
  const dH = interpretarCoeficientes(campo('denominadorH').value);

  if ([nG, dG, nH, dH].some((item) => item === null)) {
    return { erro: 'Confira os coeficientes: use números separados por espaço, em ordem decrescente de $s$.' };
  }
  if (dG.every((v) => v === 0) || dH.every((v) => v === 0)) {
    return { erro: 'O denominador de $G(s)$ e o de $H(s)$ não podem ser nulos.' };
  }

  const pontoTeste = {
    re: interpretarNumero(campo('pontoReal').value, 0),
    im: interpretarNumero(campo('pontoImaginario').value, 0),
  };

  let limitesManuais = null;
  if (campo('usarLimites').checked) {
    const xMin = interpretarNumero(campo('xMinimo').value, -10);
    const xMax = interpretarNumero(campo('xMaximo').value, 2);
    const yMin = interpretarNumero(campo('yMinimo').value, -10);
    const yMax = interpretarNumero(campo('yMaximo').value, 10);
    if (xMax <= xMin || yMax <= yMin) {
      return { erro: 'Os limites manuais precisam ter máximo maior que mínimo.' };
    }
    limitesManuais = { xMin, xMax, yMin, yMax };
  }

  return { entrada: { nG, dG, nH, dH, pontoTeste }, limitesManuais };
}
