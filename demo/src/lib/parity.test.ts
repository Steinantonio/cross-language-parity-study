import assert from "node:assert/strict";
import test from "node:test";
import { compareOutputs } from "./parity";

test("considera iguais objetos com as mesmas propriedades", () => {
  assert.deepEqual(
    compareOutputs(
      { total: 62.8, boxCount: 2 },
      { boxCount: 2, total: 62.8 },
    ),
    [],
  );
});

test("detecta um campo de contrato ausente", () => {
  assert.deepEqual(compareOutputs({ boxCount: 2 }, {}), [
    "$.boxCount: esperado 2, campo ausente",
  ]);
});

test("detecta valores e campos inesperados", () => {
  assert.deepEqual(
    compareOutputs({ total: 62.8 }, { total: 60, debug: true }),
    [
      "$.total: esperado 62.8, recebido 60",
      "$.debug: campo inesperado",
    ],
  );
});
