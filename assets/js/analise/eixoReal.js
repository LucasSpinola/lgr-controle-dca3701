const TOLERANCIA = 1e-8;

export function raizesReais(polos, zeros) {
  const saida = [];
  for (const p of polos) {
    if (Math.abs(p.im) < TOLERANCIA) {
      saida.push(p.re);
    }
  }
  for (const z of zeros) {
    if (Math.abs(z.im) < TOLERANCIA) {
      saida.push(z.re);
    }
  }
  return saida;
}

export function pertenceAoLugar(valorReal, reais) {
  const contagem = reais.filter((r) => r > valorReal + 1e-10).length;
  return contagem % 2 === 1;
}

export function segmentosEixoReal(zeros, polos) {
  const reais = raizesReais(polos, zeros);
  if (reais.length === 0) {
    return [];
  }

  const fronteiras = Array.from(new Set(reais.map((r) => Number(r.toFixed(8)))))
    .sort((a, b) => b - a);

  const segmentos = [];
  for (let i = 0; i < fronteiras.length - 1; i += 1) {
    const meio = (fronteiras[i] + fronteiras[i + 1]) / 2;
    if (pertenceAoLugar(meio, reais)) {
      segmentos.push({ inicio: fronteiras[i + 1], fim: fronteiras[i] });
    }
  }

  if (reais.length % 2 === 1) {
    segmentos.push({ inicio: -Infinity, fim: fronteiras[fronteiras.length - 1] });
  }
  return segmentos;
}
