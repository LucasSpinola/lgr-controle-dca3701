export function complexo(re, im = 0) {
  return { re, im };
}

export function somar(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function subtrair(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function multiplicar(a, b) {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

export function dividir(a, b) {
  const d = b.re * b.re + b.im * b.im;
  if (d === 0) {
    return { re: Infinity, im: Infinity };
  }
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}

export function escalar(a, k) {
  return { re: a.re * k, im: a.im * k };
}

export function negar(a) {
  return { re: -a.re, im: -a.im };
}

export function conjugado(a) {
  return { re: a.re, im: -a.im };
}

export function modulo(a) {
  return Math.hypot(a.re, a.im);
}

export function argumento(a) {
  return Math.atan2(a.im, a.re);
}

export function argumentoGraus(a) {
  return (Math.atan2(a.im, a.re) * 180) / Math.PI;
}

export function distancia(a, b) {
  return Math.hypot(a.re - b.re, a.im - b.im);
}

export function ehReal(a, tolerancia = 1e-8) {
  return Math.abs(a.im) < tolerancia;
}

export function ehFinito(a) {
  return Number.isFinite(a.re) && Number.isFinite(a.im);
}
