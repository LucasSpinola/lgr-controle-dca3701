export function calcularAssintotas(zeros, polos) {
  const quantidade = polos.length - zeros.length;
  if (quantidade === 0) {
    return null;
  }

  const somaPolos = polos.reduce((total, p) => total + p.re, 0);
  const somaZeros = zeros.reduce((total, z) => total + z.re, 0);
  const centroide = (somaPolos - somaZeros) / quantidade;

  const angulos = [];
  for (let q = 0; q < quantidade; q += 1) {
    angulos.push(((2 * q + 1) * 180) / quantidade);
  }

  return { quantidade, centroide, angulos, somaPolos, somaZeros };
}
