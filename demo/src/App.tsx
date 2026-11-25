import rawFixture from "./data/purchase-case.json";
import {
  checkFixture,
  type JsonValue,
  type ParityFixture,
} from "./lib/parity";

interface PurchaseItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseInput {
  orderId: string;
  customer: string;
  date: string;
  currency: string;
  taxRate: number;
  items: PurchaseItem[];
  discount: number;
  deliveryFee: number;
}

const fixture = rawFixture as unknown as ParityFixture;
const purchase = fixture.input as unknown as PurchaseInput;
const expected = fixture.expectedOutput as Record<string, JsonValue>;
const checks = checkFixture(fixture);
const passingCount = checks.filter((check) => check.matches).length;
const firstDifference = checks.find((check) => !check.matches)?.differences[0];

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: purchase.currency,
  }).format(value);
}

function outputAmount(
  output: Record<string, JsonValue>,
  field: string,
): string {
  const value = output[field];
  return typeof value === "number" ? money(value) : "—";
}

function App() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Paridade Lab, início">
          <span className="brand-mark" aria-hidden="true">
            p
          </span>
          <span>
            paridade<span className="brand-light">lab</span>
          </span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" />
          Demonstração local
        </div>
      </header>

      <main className="page">
        <section className="intro">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PROTÓTIPO · CASO SINTÉTICO
          </div>
          <h1>Relatório de compra</h1>
          <p>
            A cesta contém um pirulito e três balas. O imposto de 5% arredonda
            diferente nas duas implementações, mudando o total em um centavo.
          </p>
        </section>

        <section className="report-card" aria-labelledby="report-title">
          <div className="report-heading">
            <div>
              <div className="card-kicker">ENTRADA COMPARTILHADA</div>
              <h2 id="report-title">Pedido {purchase.orderId}</h2>
            </div>
            <div className="report-date">
              <span className="date-label">DATA DA COMPRA</span>
              <span>{purchase.date}</span>
            </div>
          </div>

          <div className="customer-line">
            <span className="customer-avatar" aria-hidden="true">
              {purchase.customer.charAt(0)}
            </span>
            <span>
              <span className="customer-label">Cliente</span>
              <strong>{purchase.customer}</strong>
            </span>
            <span className="order-state">
              <span className="state-dot" />
              Mesmo pedido para ambas
            </span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">PRODUTO</th>
                  <th scope="col">SKU</th>
                  <th scope="col">QTD.</th>
                  <th scope="col">PREÇO</th>
                  <th scope="col" className="amount-cell">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => (
                  <tr key={item.sku}>
                    <td className="product-cell">{item.name}</td>
                    <td className="sku-cell">{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.unitPrice)}</td>
                    <td className="amount-cell">
                      {money(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="outputs-section" aria-labelledby="outputs-title">
          <div className="outputs-heading">
            <div>
              <div className="card-kicker">RELATÓRIOS GERADOS</div>
              <h2 id="outputs-title">O mesmo pedido, duas saídas</h2>
              <p>
                O contrato define imposto de {purchase.taxRate}% com empate
                arredondado para cima. Total esperado:{" "}
                <strong>{money(Number(expected.total))}</strong>.
                Veja o que cada implementação retornou.
              </p>
            </div>
            <span className="contract-version">
              {fixture.contract.name} · v{fixture.contract.version}
            </span>
          </div>

          <div className="outputs-grid">
            {fixture.implementations.map((implementation, index) => {
              const check = checks[index];
              const output = implementation.output as Record<string, JsonValue>;
              const outputTotal =
                typeof output.total === "number" ? output.total : Number.NaN;
              const difference = Math.abs(Number(expected.total) - outputTotal);

              return (
                <article
                  className={`output-card ${check.matches ? "is-match" : "is-mismatch"}`}
                  key={`${implementation.language}-${implementation.name}`}
                >
                  <header className="output-card-header">
                    <div className="output-identity">
                      <span>{implementation.language} · saída simulada</span>
                      <h3>{implementation.name}</h3>
                    </div>
                    <span className="output-status">
                      {check.matches ? "Em conformidade" : "Divergência"}
                    </span>
                  </header>

                  <div className="output-total">
                    <span>Total do pedido</span>
                    <strong>{outputAmount(output, "total")}</strong>
                  </div>

                  <dl className="output-breakdown">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{outputAmount(output, "subtotal")}</dd>
                    </div>
                    <div>
                      <dt>Imposto ({purchase.taxRate}%)</dt>
                      <dd>{outputAmount(output, "tax")}</dd>
                    </div>
                    <div>
                      <dt>Desconto</dt>
                      <dd>{outputAmount(output, "discount")}</dd>
                    </div>
                    <div>
                      <dt>Entrega</dt>
                      <dd>{outputAmount(output, "deliveryFee")}</dd>
                    </div>
                  </dl>

                  <div
                    className={`contract-value ${check.matches ? "contract-value-match" : "contract-value-mismatch"}`}
                  >
                    <span>Total no contrato</span>
                    <strong>{money(Number(expected.total))}</strong>
                    <small>
                      {check.matches
                        ? "A saída coincide com o valor esperado."
                        : `Diferença nesta saída: ${money(difference)}.`}
                    </small>
                  </div>

                  {!check.matches && (
                    <div className="difference-detail">
                      {check.differences.map((difference) => (
                        <code key={difference}>{difference}</code>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="why-section" aria-labelledby="why-title">
          <div className="why-heading">
            <div>
              <div className="card-kicker">COMO ISSO PODE ACONTECER</div>
              <h2 id="why-title">
                A mesma regra pode arredondar diferente
              </h2>
              <p>
                A cesta soma R$ 2,50. O imposto de 5% dá R$ 0,125 — 12,5
                centavos, exatamente entre R$ 0,12 e R$ 0,13.
              </p>
            </div>
            <span className="illustrative-tag">Exemplos ilustrativos</span>
          </div>

          <div className="code-examples">
            <article className="code-example">
              <div className="code-example-header">
                <span className="language-tag">TypeScript</span>
                <span>Math.round</span>
              </div>
              <pre>
                <code>{`function taxInCents(subtotal: number) {
  // Calcula 5% e arredonda o resultado para centavos.
  return Math.round(subtotal * 0.05 * 100) / 100;
}

# Mesmo teste local: R$ 2,00 gera R$ 0,10 de imposto.
expect(taxInCents(2.00)).toBe(0.10); // passa

// No pedido de R$ 2,50, Math.round sobe o empate para R$ 0,13.
taxInCents(2.50); // 0.13`}</code>
              </pre>
            </article>

            <article className="code-example">
              <div className="code-example-header">
                <span className="language-tag">Python</span>
                <span>round</span>
              </div>
              <pre>
                <code>{`def tax_in_cents(subtotal):
    # No empate, round escolhe o centavo par mais próximo.
    return round(subtotal * 0.05, 2)

// Mesmo teste local: R$ 2,00 gera R$ 0,10 de imposto.
assert tax_in_cents(2.00) == 0.10  # passa

# R$ 0,125 fica no meio; round escolhe R$ 0,12.
tax_in_cents(2.50)  # 0.12`}</code>
              </pre>
            </article>
          </div>

          <div className="contract-example">
            <div className="contract-example-copy">
              <strong>O comparador olha além do caso comum</strong>
              <span>
                O contrato fixa a regra de empate; o comparador verifica a
                mesma cesta nas duas saídas.
              </span>
            </div>
            <pre>
              <code>{`# R$ 2,50 × 5% = R$ 0,125 (12,5 centavos)
# Cada linguagem arredonda esse empate de um jeito:
Esperado:  {"tax": 0.13, "total": 2.63}
TypeScript: {"tax": 0.13, "total": 2.63}
Python:     {"tax": 0.12, "total": 2.62}
FAIL        $.tax — esperado 0.13, recebido 0.12`}</code>
            </pre>
          </div>

          <p className="code-example-note">
            Fragmentos simplificados e ilustrativos; não são executados pela
            demo. Não é um problema específico de uma linguagem: o contrato
            precisa definir a regra de arredondamento.
          </p>
        </section>

        <section className="parity-card" aria-labelledby="parity-title">
          <div className="parity-heading">
            <div>
              <h2 id="parity-title" className="cli-result-title">
                RESULTADO DO COMPARADOR CLI
              </h2>
              <p className="cli-result-subtitle">
                {passingCount} de {checks.length} saídas em conformidade
              </p>
              <p className="cli-result-detail">
                {firstDifference ? (
                  <>
                    Divergência: <code>{firstDifference}</code>
                  </>
                ) : (
                  "Todas as saídas correspondem ao contrato."
                )}
              </p>
            </div>
            <span className="contract-version">
              {fixture.contract.name} · v{fixture.contract.version}
            </span>
          </div>

          <div className="proof-note">
            <span className="proof-icon" aria-hidden="true">
              i
            </span>
            <p>
              Exemplo ilustrativo: o CLI compara JSON neutro e sinaliza a
              divergência. Este protótipo não executa código nas linguagens
              listadas.
            </p>
            <code className="command">npm run parity:demo</code>
          </div>
        </section>

        <footer className="page-footer">
          <span>Paridade Lab</span>
          <span>Uma demonstração de contrato compartilhado</span>
        </footer>
      </main>
    </>
  );
}

export default App;
