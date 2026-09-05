export function limpar(valor) {
  if (Object.is(valor, -0)) {
    return 0;
  }
  return valor;
}

export function formatarG(valor, precisao = 6) {
  const v = limpar(valor);
  if (!Number.isFinite(v)) {
    return v > 0 ? 'infinito' : '-infinito';
  }
  if (v === 0) {
    return '0';
  }
  return String(Number(v.toPrecision(precisao)));
}

export function fixo(valor, casas = 4) {
  const v = limpar(valor);
  if (!Number.isFinite(v)) {
    return v > 0 ? 'infinito' : '-infinito';
  }
  return v.toFixed(casas);
}

export function significativo(valor, digitos = 4) {
  return formatarG(valor, digitos);
}

export function numeroLatex(valor, precisao = 6) {
  const v = limpar(valor);
  if (!Number.isFinite(v)) {
    return v > 0 ? '\\infty' : '-\\infty';
  }
  const texto = formatarG(v, precisao);
  if (!texto.includes('e')) {
    return texto;
  }
  const [mantissa, expoente] = texto.split('e');
  return `${mantissa} \\times 10^{${Number(expoente)}}`;
}

export function fixoLatex(valor, casas = 4) {
  const v = limpar(valor);
  if (!Number.isFinite(v)) {
    return v > 0 ? '\\infty' : '-\\infty';
  }
  return limpar(Number(v.toFixed(casas))).toFixed(casas);
}
