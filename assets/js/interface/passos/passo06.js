import { paragrafo } from '../componentes.js';

export const titulo = '**Passo 6:** Simetria';

export function renderizar(destino) {
  paragrafo(
    destino,
    'O LGR é **simétrico em relação ao eixo real**, porque raízes complexas de polinômios com coeficientes reais sempre ocorrem em pares conjugados.',
  );
}
