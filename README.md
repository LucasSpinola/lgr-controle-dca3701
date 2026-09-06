<div align="center" markdown="1">

# LGR em 12 passos

**Traçado do lugar geométrico das raízes com a conta inteira, passo a passo.**

### [Abrir a aplicação →](https://lucasspinola.github.io/lgr-controle-dca3701/)

<img src="docs/assets/demo.png" alt="Página da aplicação, com a prévia do traçado e o formulário de entrada" width="820">

![Licença de código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e) ![Sem dependências](https://img.shields.io/badge/depend%C3%AAncias-nenhuma-brightgreen) ![Funciona offline](https://img.shields.io/badge/offline-sim-brightgreen)

**Lucas Augusto Spinola Pinto**<br>
DCA-3701 Projeto de Sistemas de Controle · DCA · UFRN

</div>

---

Informe $G(s)$ e $H(s)$ em coeficientes. A página percorre os doze passos clássicos do traçado e
mostra, em cada um, a fórmula, a substituição numérica e o resultado, com o plano $s$ redesenhado a
cada etapa. Serve para conferir exercício feito à mão e para entender por que o lugar tem a forma
que tem.

**[Os doze passos](#os-doze-passos)** · **[Rodar local](#rodar-local)** · **[Estrutura](#estrutura)** · **[Testes](#testes)**

## Destaques

| | |
|---|---|
| **A conta, não só o gráfico** | fórmula geral, substituição e resultado de cada passo, em LaTeX |
| **Matemática do zero** | Durand-Kerner com refino de Newton, Routh simbólica em $K$, varredura com continuação de ramo |
| **Escala honesta** | mesma escala nos dois eixos, então ângulo, arco e simetria saem com a geometria certa |
| **Funciona offline** | KaTeX embarcado em `assets/vendor/`, sem CDN |
| **Link que reabre o exercício** | os coeficientes vão para a barra de endereços |

## Os doze passos

| | Passo | O que aparece |
|---|---|---|
| 1 | Equação característica | $G(s)H(s)$ montado e $D(s) + K \cdot N(s) = 0$ |
| 2 | Forma fatorada | $P(s)$ escrito em fatores |
| 3 | Polos e zeros | plano $s$ com $p_i$ e $z_j$ identificados |
| 4 | Segmentos no eixo real | regra do número ímpar e os intervalos resultantes |
| 5 | Lugares separados | $L_s = \max(n_p, n_z)$ |
| 6 | Simetria | por que o traçado espelha o eixo real |
| 7 | Assíntotas | centroide $\sigma_a$ e ângulos $\phi_a$, com a conta de cada $q$ |
| 8 | Descolamento | $dK/ds = 0$, as raízes e quais pertencem ao LGR |
| 9 | Cruzamento com $j\omega$ | tabela de Routh, $K_{crit}$ e o método $s = j\omega$ |
| 10 | Partida e chegada | ângulo em cada polo e zero complexo, termo a termo |
| 11 | Critério de ângulo | soma dos ângulos no ponto de teste e o veredito |
| 12 | Critério de módulo | produto das distâncias e o valor de $K$ no ponto |

O passo 9 sinaliza os casos especiais de Routh: pivô nulo cai no método do épsilon, linha nula vira
a derivada do polinômio auxiliar. Depois dos doze passos vem o gráfico completo, com todos os ramos.

## Rodar local

A página usa módulos ES, então precisa ser servida por HTTP — abrir o `index.html` direto do disco
não funciona, o navegador bloqueia `import` em `file://`.

```bash
git clone https://github.com/LucasSpinola/lgr-controle-dca3701.git
cd lgr-controle-dca3701
npm start                    # ou: python -m http.server 8000
```

Depois abra <http://localhost:8000>.

**Como usar:** coeficientes em ordem decrescente de $s$, separados por espaço — `1 4 0` é
$s^2 + 4s$. Escolha o ponto de teste dos passos 11 e 12 e clique em **Calcular LGR**. O endereço
vira `?ng=1&dg=1+3+2+0&nh=1&dh=1&re=-0.4226&im=0` e reabrir esse link refaz a mesma análise. Dá
ainda para expandir todos os passos de uma vez, baixar o gráfico final em SVG e gerar PDF pela
folha de impressão.

## Estrutura

```
index.html              página única da aplicação
assets/
├── css/estilo.css      interface, planos e folha de impressão
├── vendor/katex/       KaTeX embarcado, sem CDN
└── js/
    ├── principal.js    ponto de entrada e orquestração
    ├── nucleo/         complexos, polinômios, raízes e funções racionais
    ├── analise/        as regras de traçado, uma por arquivo
    ├── formatacao/     números e conversão para LaTeX
    ├── grafico/        janela, plano SVG e camadas de desenho
    └── interface/      apresentação, formulário e os doze passos
testes/                 três suítes em Node puro
```

A direção de dependência é fixa: `nucleo` não conhece ninguém, `analise` usa `nucleo`, `grafico` e
`formatacao` só traduzem resultados, e `interface` é a única camada que toca o DOM. Cada passo do
roteiro é um módulo em `assets/js/interface/passos/`.

## Testes

```bash
npm run teste
```

`executar.js` cobre as regras de traçado, a tabela de Routh com os casos especiais e a janela dos
gráficos. `raizes.js` planta raízes de grau 2 a 8 e confere se o solver as reencontra.
`interface.js` renderiza os doze passos sobre um DOM falso, caçando exceção, `undefined` e `NaN`.

## Publicação

Site estático puro. Em **Settings › Pages**, escolha **Deploy from a branch**, `main` e `/ (root)`.
O `.nojekyll` na raiz impede o Jekyll de mexer nos arquivos.

## Licença

Código sob licença MIT, em [LICENSE](LICENSE). As marcas da UFRN e do DCA em `assets/img/`
pertencem às respectivas instituições e aparecem apenas para identificar a disciplina.
