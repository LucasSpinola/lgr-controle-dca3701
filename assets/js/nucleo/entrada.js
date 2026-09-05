export function interpretarCoeficientes(texto) {
  if (typeof texto !== 'string') {
    return null;
  }
  const itens = texto.trim().split(/[\s,;]+/).filter((item) => item.length > 0);
  if (itens.length === 0) {
    return null;
  }
  const valores = itens.map((item) => Number(item.replace(',', '.')));
  if (valores.some((valor) => !Number.isFinite(valor))) {
    return null;
  }
  return valores;
}

export function interpretarNumero(texto, padrao = 0) {
  if (typeof texto !== 'string' || texto.trim() === '') {
    return padrao;
  }
  const valor = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(valor) ? valor : padrao;
}
