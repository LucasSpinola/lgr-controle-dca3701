const CAMPOS = {
  ng: 'numerador-g',
  dg: 'denominador-g',
  nh: 'numerador-h',
  dh: 'denominador-h',
  re: 'ponto-real',
  im: 'ponto-imaginario',
};

const CAMPOS_DE_LIMITE = {
  xmin: 'x-minimo',
  xmax: 'x-maximo',
  ymin: 'y-minimo',
  ymax: 'y-maximo',
};

export function aplicarEndereco() {
  const parametros = new URLSearchParams(window.location.search);
  let aplicou = false;

  for (const [chave, identificador] of Object.entries(CAMPOS)) {
    if (parametros.has(chave)) {
      document.getElementById(identificador).value = parametros.get(chave);
      aplicou = true;
    }
  }

  const usarLimites = parametros.get('limites') === '1';
  if (usarLimites) {
    for (const [chave, identificador] of Object.entries(CAMPOS_DE_LIMITE)) {
      if (parametros.has(chave)) {
        document.getElementById(identificador).value = parametros.get(chave);
      }
    }
    document.getElementById('usar-limites').checked = true;
    aplicou = true;
  }

  return aplicou;
}

export function atualizarEndereco() {
  const parametros = new URLSearchParams();

  for (const [chave, identificador] of Object.entries(CAMPOS)) {
    parametros.set(chave, document.getElementById(identificador).value.trim());
  }

  if (document.getElementById('usar-limites').checked) {
    parametros.set('limites', '1');
    for (const [chave, identificador] of Object.entries(CAMPOS_DE_LIMITE)) {
      parametros.set(chave, document.getElementById(identificador).value.trim());
    }
  }

  window.history.replaceState(null, '', `${window.location.pathname}?${parametros}`);
}
