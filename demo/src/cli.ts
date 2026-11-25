import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkFixture, type ParityFixture } from "./lib/parity";

async function main(): Promise<void> {
  const defaultFixture = fileURLToPath(
    new URL("./data/purchase-case.json", import.meta.url),
  );
  const fixturePath = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : defaultFixture;

  const fixture = JSON.parse(
    await readFile(fixturePath, "utf8"),
  ) as ParityFixture;
  const checks = checkFixture(fixture);
  const passed = checks.filter((check) => check.matches).length;
  const failed = checks.length - passed;

  console.log(`\nParidade · ${fixture.contract.name}@${fixture.contract.version}`);
  console.log(`Caso: ${fixture.caseId}`);
  console.log(`Fixture: ${fixturePath}\n`);

  for (const check of checks) {
    console.log(
      `${check.matches ? "PASS" : "FAIL"}  ${check.name} (${check.language})`,
    );
    for (const difference of check.differences) {
      console.log(`      ${difference}`);
    }
  }

  console.log(`\n${passed}/${checks.length} saídas correspondem ao contrato.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Falha ao executar a comparação: ${message}`);
  process.exitCode = 2;
});
