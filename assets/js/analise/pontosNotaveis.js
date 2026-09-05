function acrescentar(destino, lista) {
  for (const ponto of lista || []) {
    if (ponto && Number.isFinite(ponto.re) && Number.isFinite(ponto.im)) {
      destino.push({ re: ponto.re, im: ponto.im });
    }
  }
}

export function pontosNotaveis(analise, opcoes = {}) {
  const pontos = [];
  acrescentar(pontos, analise.polos);
  acrescentar(pontos, analise.zeros);

  if (analise.assintotas) {
    acrescentar(pontos, [{ re: analise.assintotas.centroide, im: 0 }]);
  }

  const descolamentos = (analise.descolamento && analise.descolamento.pontosReaisValidos) || [];
  acrescentar(pontos, descolamentos.map((item) => item.s));

  const cruzamentos = (analise.cruzamentoJw && analise.cruzamentoJw.cruzamentos) || [];
  for (const item of cruzamentos) {
    acrescentar(pontos, [{ re: 0, im: item.omega }, { re: 0, im: -item.omega }]);
  }

  for (const segmento of analise.segmentos || []) {
    acrescentar(pontos, [
      { re: segmento.inicio, im: 0 },
      { re: segmento.fim, im: 0 },
    ]);
  }

  if (opcoes.incluirPontoTeste && analise.entrada && analise.entrada.pontoTeste) {
    acrescentar(pontos, [analise.entrada.pontoTeste]);
  }

  return pontos;
}

export function raioDeInteresse(pontos) {
  let maior = 1;
  for (const ponto of pontos) {
    maior = Math.max(maior, Math.hypot(ponto.re, ponto.im));
  }
  return maior;
}
