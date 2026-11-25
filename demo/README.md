# Demo de paridade

Protótipo de paridade contract-first com uma cesta sintética: um pirulito a
R$ 1,00 e três balas a R$ 0,50 cada. O subtotal é R$ 2,50; um imposto de 5%
resulta em R$ 0,125 antes do arredondamento. O contrato arredonda empates
positivos para cima: TypeScript retorna R$ 0,13, enquanto Python `round`
retorna R$ 0,12.

## Rodar

```sh
npm install
npm run dev
```

## Validar

```sh
npm run check
```

Para ver o CLI comparar o fixture:

```sh
npm run parity:demo
```

O CLI deve terminar com código `1` neste exemplo: o fixture contém saídas
sintéticas que divergem do contrato. Esse código de falha é o sinal que um job
de CI poderia usar para bloquear uma regressão.

## Limites deste protótipo

- O CLI lê JSON neutro e compara saídas fornecidas no fixture; não inicia
  processos nem executa workers nas linguagens indicadas.
- Os snippets e as saídas TypeScript/Python são ilustrativos; não são código
  executado pela demo.
- A demonstração ilustra comparação contra um contrato; não prova que o
  contrato esteja correto nem representa o produto completo descrito no estudo.
