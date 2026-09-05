import { formula } from '../componentes.js';

export const titulo = '**Passo 5:** Número de lugares separados';

export function renderizar(destino, analise, contexto = {}) {
  const totalPolos = analise.polos.length;
  const totalZeros = analise.zeros.length;

  formula(destino, `n_p = ${totalPolos}, \\quad n_z = ${totalZeros}`);
  formula(
    destino,
    `L_s = \\max(n_p,\\; n_z) = \\max(${totalPolos},\\; ${totalZeros}) = ${analise.lugaresSeparados}`,
  );
}
