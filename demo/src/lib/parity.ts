export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ParityFixture {
  caseId: string;
  contract: {
    name: string;
    version: string;
  };
  note?: string;
  input: JsonValue;
  expectedOutput: JsonValue;
  implementations: Array<{
    name: string;
    language: string;
    output: JsonValue;
  }>;
}

export interface ImplementationCheck {
  name: string;
  language: string;
  matches: boolean;
  differences: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function display(value: unknown): string {
  if (value === undefined) return "ausente";
  return JSON.stringify(value);
}

export function compareOutputs(
  expected: unknown,
  actual: unknown,
  path = "$",
): string[] {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return [`${path}: esperado uma lista, recebido ${display(actual)}`];
    }

    const differences: string[] = [];
    if (expected.length !== actual.length) {
      differences.push(
        `${path}.length: esperado ${expected.length}, recebido ${actual.length}`,
      );
    }

    const sharedLength = Math.min(expected.length, actual.length);
    for (let index = 0; index < sharedLength; index += 1) {
      differences.push(
        ...compareOutputs(expected[index], actual[index], `${path}[${index}]`),
      );
    }
    return differences;
  }

  if (isRecord(expected)) {
    if (!isRecord(actual)) {
      return [`${path}: esperado um objeto, recebido ${display(actual)}`];
    }

    const differences: string[] = [];
    for (const key of Object.keys(expected)) {
      const childPath = `${path}.${key}`;
      if (!Object.hasOwn(actual, key)) {
        differences.push(
          `${childPath}: esperado ${display(expected[key])}, campo ausente`,
        );
      } else {
        differences.push(
          ...compareOutputs(expected[key], actual[key], childPath),
        );
      }
    }

    for (const key of Object.keys(actual)) {
      if (!Object.hasOwn(expected, key)) {
        differences.push(`${path}.${key}: campo inesperado`);
      }
    }
    return differences;
  }

  if (!Object.is(expected, actual)) {
    return [`${path}: esperado ${display(expected)}, recebido ${display(actual)}`];
  }

  return [];
}

export function checkFixture(
  fixture: ParityFixture,
): ImplementationCheck[] {
  return fixture.implementations.map((implementation) => {
    const differences = compareOutputs(
      fixture.expectedOutput,
      implementation.output,
    );
    return {
      name: implementation.name,
      language: implementation.language,
      matches: differences.length === 0,
      differences,
    };
  });
}
