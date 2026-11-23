# The missing center of cross-language parity

### A market study of tools that prove two implementations agree

- **Status:** public research snapshot
- **Date:** November 2026
- **Author:** Antonio Stein ([@Steinantonio](https://github.com/Steinantonio))
- **Reading time:** ~12 minutes
- **Scope:** public tools, standards suites and documented internal harnesses, as of November 2026

> **Short version:** differential testing is a 1998 technique, and language-agnostic conformance suites
> are standard. Strong tools exist for API schemas, protocols and SDK generation. What is missing is a
> **center**: a small, open-source, contract-first CLI for **algorithmic parity** — tokenizers, rankings,
> pricing, scoring — with hand-derived cases, explicit comparators, a version gate and a mutant that proves
> the suite can fail.

## 1. The question

Two implementations of the same contract drift silently. A `string.Split(' ')` in C# and `re.split(r'\s+')`
in Python tokenize differently. `ToLower()` and `ToLowerInvariant()` disagree on the Turkish `I`. A BM25
`dl` computed over characters instead of tokens changes every ranking. None of these throw. All of them are
invisible in a demo.

So I asked: **which tools already prove that two implementations of the same contract agree? And what is
actually missing?**

This study maps the public landscape. It is not a product announcement. It is an attempt to avoid claiming
to invent something that already exists — and to find the part that genuinely does not.

## 2. The short answer

- **The technique is old.** Differential testing was named by McKeeman in 1998 and has been used at scale
  for compilers (Csmith) and distributed systems.
- **Cross-language conformance suites are standard.** Protobuf, JSON Schema, WebSocket (Autobahn), MCP, W3C
  and Java TCKs all ship language-agnostic test suites.
- **Strong commercial tools exist.** Specmatic, PactFlow, Speakeasy and the official MCP conformance suite
  cover API schemas, service contracts and protocol behavior.
- **Many teams build their own parity harness.** cognee, HelixDB, Ably, Conduit, Flagsman, hgraph,
  GoldenMatch and others document the same shape internally.
- **The direct generic tools are early or abandoned.** `difftest` has 0 stars and its last push was April
  2026; `serify` has 2 stars and covers serialization only.
- **The gap is not a missing category. It is a missing center:** a small, open-source, contract-first CLI
  for algorithmic parity, with hand-derived cases, explicit comparators, a contract-version gate and a
  mutant that proves the suite can fail.

## 3. Method

- **Sources:** vendor documentation, GitHub repositories, academic papers and standards suites, read in
  November 2026.
- **GitHub metrics:** `api.github.com/repos/<owner>/<repo>` on 2026-11-21. Star counts are noisy and are
  used only to distinguish “active project” from “early or abandoned”.
- **Direct** means a tool a user could reasonably choose instead of a generic parity CLI for the same job.
- **Adjacent** means a tool that solves a neighboring problem and is often mentioned in the same
  conversation.
- **Prior art** means a standard, academic technique or domain-specific suite that establishes the idea.
- **Limitation:** private tools are invisible. “No public tool” is a claim about public artifacts, not about
  what companies run internally.

## 4. The landscape in one table

| Category | Examples | Relationship |
|---|---|---|
| Generic differential CLI | `difftest`, `Diferencia`, `DIFFER`, `diff <(a) <(b)` | Direct, at the basic level |
| Cross-language conformance harness (internal) | hgraph, GoldenMatch, herdr-annotate, cognee, HelixDB, Conduit, Ably, Flagsman, Cendor | Proof the problem is real; not products |
| SDK generation + contract tests | Speakeasy, Stainless, Fern, Glotto, SDK Parity | Adjacent, commercial |
| API contract testing | Pact/PactFlow, Specmatic, Spring Cloud Contract, Dredd, Schemathesis, Microcks | Adjacent, different object |
| Snapshot / approval / golden master | ApprovalTests, Jest snapshots, Insta, syrupy | Adjacent, single-language |
| Standards conformance suites | MCP conformance, JSON Schema Test Suite, Protobuf conformance, Autobahn, W3C, TCK | Prior art, domain-specific |
| Academic / foundational | McKeeman 1998, Csmith 2011, compiler-testing survey 2020, metamorphic testing | Prior art |
| Correctness platforms | Antithesis, Jepsen | Adjacent, high-end |

## 5. The strong tools solve a different problem

### 5.1 API and schema contracts

**Specmatic** treats an OpenAPI, WSDL or MCP specification as an executable contract. It runs contract
tests against a provider and can stub the same contract for consumers. The open-source core is free;
enterprise pricing is around US$10–50 per user per month.

What it proves: the API matches its schema and examples.
What it does not prove: two implementations of the same **algorithm** return the same answer.

**PactFlow** is the managed version of Pact’s consumer-driven contract testing. It stores contracts,
verifies providers and reports compatibility. Team pricing is around US$127 per month.

What it proves: a consumer and a provider agree on an interaction.
What it does not prove: a tokenizer, ranking function or pricing engine behaves identically across
languages.

**Speakeasy** generates and runs contract tests for SDKs from OpenAPI and Arazzo. It supports TypeScript,
Python, Go, Java, Ruby and C#, and is an enterprise add-on.

What it proves: generated SDK calls match the API contract.
What it does not prove: hand-derived algorithmic edge cases, or parity between two independent
implementations.

**The official MCP conformance suite** tests MCP clients and servers against the protocol specification,
with suites for core, auth and extensions, a GitHub Action and SDK tiers. It had 150 stars and 125 forks
on 2026-11-21.

What it proves: an MCP implementation follows the selected protocol revision.
What it does not prove: two MCP servers return the same domain output — the same citations, ranking or
score — for the same contract.

### 5.2 System correctness

**Antithesis** runs deterministic simulation testing: it boots a replica of the system in a deterministic
hypervisor, injects faults and explores edge cases. Teams pricing starts at US$2,999 per month.

What it proves: the system survives a simulated world of failures.
What it does not do: provide a five-minute CLI that compares two implementations against a hand-derived
contract.

**Jepsen** tests distributed systems for consistency under partitions. It is a research-grade tool for a
different question.

### 5.3 SDK generation

**Stainless**, **Fern**, **Glotto** and **SDK Parity** generate SDKs and test endpoints against mock
servers. They are generation-first: the tests verify that the generated client speaks the API, not that
two independently written implementations agree on an algorithm.

## 6. The direct generic tools are early

### `difftest` — the closest product

`difftest` is a Rust CLI that runs two programs with the same inputs and compares stdout, exit code and
(optionally) stderr. `cargo install difftest`; `difftest ./old ./new --inputs ...`. It is MIT, zero config
and CI-friendly, and its README is aimed at the same audience: AI rewrites, language migrations,
refactoring and compiler testing.

**Maturity:** created 2026-03-14, last push 2026-04-09, **0 stars and 0 forks** on 2026-11-21.

**What it does not have:** an external contract, expected values, a comparator registry, a contract-version
gate, a mutant, or a structured report. It compares stdout; it does not know what “correct” means.

For a quick “did the rewrite change stdout?” smoke test, it is the right tool. For a contract-based
conformance suite with rankings, tolerances, edge cases and audit evidence, it is not enough.

### `serify` — the closest harness shape

`serify` is a cross-language serialization conformance harness. You write a small worker per language; the
CLI drives all workers through the same cases and compares bytes. Its worker/NDJSON shape is close to the
one a generic harness needs.

**Maturity:** created 2026-06-29, last push 2026-09-24, **2 stars**, Apache-2.0.

**What it does not have:** a contract document, hand-derived expectations, a comparator registry, a version
gate, a mutant, or a general domain beyond serialization.

### The rest

`Diferencia` compares HTTP microservices; `DIFFER` validates debloated programs; `diff <(./a) <(b)` is a
one-off comparison with no batching, exit codes or reporting. All are narrow or manual.

## 7. The demand is visible in internal harnesses

| Project | What it compares | Public signal |
|---|---|---|
| [cognee](https://deepwiki.com/topoteretes/cognee-rs/10.3-cross-sdk-parity-harness) | Python vs Rust SDK, DB/vector/graph state | 33k stars |
| [HelixDB](https://deepwiki.com/HelixDB/helix-db/6.2-sdk-parity-testing) | Rust, TypeScript, Go, Python SDKs | 6.3k stars |
| [hgraph](https://hgraph.readthedocs.io/en/latest/developer_guide/parity_testing.html) | Python vs C++ runtime, Hypothesis recipes | Documented |
| [GoldenMatch](https://docs.bensevern.dev/docs/concepts/cross-language-parity) | Python vs TypeScript pipeline | Documented |
| [herdr-annotate](https://deepwiki.com/plannotator/herdr-annotate/4.3-typescript-rust-parity-verification) | TypeScript vs Rust | `scripts/parity-lite.py` |
| [Conduit](https://github.com/ConduitIO/conduit/pull/2948) | Six SDKs, conformance runner + mutant plugins | Public PR |
| [Ably](https://ably.com/blog/universal-test-suite-for-ably-sdks) | 11 SDKs, universal test suite | Public blog |
| [Flagsman](https://flagsman.com/blog/cross-language-conformance-testing) | 12 engines, generated corpus | Public blog |

Every one of these rebuilt the same shape: a corpus, a runner, a comparator, a report and a CI gate. That
is the strongest evidence that the problem is real — and the strongest warning that each team solves it
locally.

## 8. The prior art

| Source | What it establishes |
|---|---|
| **McKeeman, “Differential Testing for Software” (1998)** | The technique: two or more comparable systems, same cases, compare results |
| **Csmith (2011)** | Random C programs plus differential testing; 325+ compiler bugs reported |
| **A Survey of Compiler Testing (CSUR 2020)** | Taxonomy: cross-compiler, cross-optimization, cross-version |
| **JSON Schema Test Suite** | Language-agnostic test cases; 757 stars, active since 2012 |
| **Protobuf conformance** | 2,000+ tests over binary and JSON wire formats; testee communicates over a pipe |
| **Autobahn Testsuite** | 500+ WebSocket conformance cases; 1,698 stars, active since 2012 |
| **MCP conformance** | Protocol scenarios for clients and servers; 150 stars, active |
| **W3C test suites / Java TCK** | Cross-implementation conformance is long-standing practice |

These suites prove the **pattern** is standard: one language-agnostic corpus, many implementations, a
runner, a report. What they do not provide is a **generic** harness for an arbitrary contract.

## 9. The gap, precisely

| Layer | What exists | What is missing |
|---|---|---|
| Technique | Differential testing, conformance suites, property-based testing | — |
| API/schema | Specmatic, PactFlow, Speakeasy | Algorithm output |
| Protocol | MCP conformance, Autobahn, Protobuf conformance | Domain outputs |
| SDK generation | Stainless, Fern, Glotto, SDK Parity | A generic, contract-first CLI |
| Internal harnesses | cognee, HelixDB, Ably, Conduit, Flagsman | A reusable public standard |
| Generic CLI | `difftest`, `serify` | Contract, comparators, version gate, mutant |

The gap statement:

> No public, open-source, language-agnostic CLI combines an external contract, hand-derived expectations,
> explicit comparators, a contract-version gate and a mutant that proves the suite can fail.

That is narrower than “no one does this” — and more defensible. The strong tools are adjacent; the direct
tools are early; the internal harnesses are not products.

## 10. What is actually new

Not the technique. Not the conformance suite. Not the worker protocol. The **packaging**:

1. A small-surface, MIT, language-agnostic CLI where the contract is an external document, not a schema
   in a vendor platform.
2. Hand-derived expectations as the default, with `reference` and `llm` modes labeled and reviewed.
3. A comparator registry that makes the claim explicit: `ids`, `exact`, `json-subset`, `tolerance`.
4. A version gate that fails before any case runs.
5. A mutant command that proves the suite can fail — the anti-false-green control.
6. A five-minute path from `init` to a CI gate, with no account, no key, no cloud.

That combination is not common in a single open-source CLI. It is not invention; it is packaging and focus.

## 11. What this study does not prove

- It does not prove demand. It shows public artifacts and documented internal harnesses.
- It does not prove that a generic CLI will be adopted.
- It does not measure private tools inside companies.
- Star counts are noisy; a 0-star project can be useful and a 30k-star project can have a weak harness.
- The absence of a public tool is not proof that no one wants one.
- It does not claim correctness. Parity is agreement with a contract, not truth.

## 12. What we must not claim

| Avoid | Say instead |
|---|---|
| “We invented differential testing” | “Differential testing is a 1998 technique; this packages it for algorithmic parity.” |
| “The first cross-language parity harness” | “Conformance suites exist for Protobuf, JSON Schema, Autobahn and MCP; this makes the pattern generic and contract-first.” |
| “Unique” | “The combination of external contract, hand-derived cases, explicit comparators, version gate and mutant is uncommon in one open-source CLI.” |
| “Prevents LLM errors” | “Catches behavioral divergence between an LLM-generated implementation and a contract.” |
| “Replaces Pact or Specmatic” | “Complementary: they check API schemas; this checks algorithm output.” |
| “Works with any language” | “Works with any language that can speak the worker protocol; Python, Node and .NET first.” |
| “Certified” | “Matched against a frozen contract; not a proof of correctness.” |

## 13. Open questions

1. Who feels this pain most: SDK teams, MCP server authors, AI-port teams, or pricing/risk engines?
2. What is the minimum useful V1: which comparators, which report, which languages?
3. Is the first user a platform team with two SDKs, or a single developer porting a library with an LLM?
4. What would make you try it: a five-minute demo, a CI snippet, or a library API?
5. Which language pair hurts most today: Python/TypeScript, Python/.NET, or something else?
6. Would you trust a green run from a harness you did not write? What would it need to show?

## 14. Call for interviews

If you maintain two implementations of the same contract — two SDKs, an MCP server and a port, a legacy
engine and a rewrite — I would like to talk for 20 minutes. I am looking for the cases where the divergence
was silent: it compiled, the tests passed, and the behavior still differed.

Open an issue in this repository or send a message with:

- the two implementations and the contract between them;
- the kind of output that must match (tokens, ranking, price, score, payload);
- what you use today to check it;
- what fails silently.

The goal is not to sell anything. It is to decide whether a generic V1 is worth building, and for whom.

## 15. Sources

**Direct:** [difftest](https://github.com/nalediym/difftest) · [serify](https://github.com/chengxilo/serify) ·
[Specmatic](https://specmatic.io/pricing/) · [PactFlow](https://pactflow.io/pricing/) ·
[Speakeasy SDK contract testing](https://www.speakeasy.com/docs/sdk-contract-testing) ·
[MCP conformance](https://github.com/modelcontextprotocol/conformance)

**Adjacent:** [Stainless tests](https://www.stainless.com/docs/guides/tests) ·
[Fern testing](http://buildwithfern.com/learn/sdks/deep-dives/testing) ·
[Glotto comparison](https://glotto.dev/docs/sdk-generation-comparison/) ·
[SDK Parity](https://sdkparity.com/compare) · [Antithesis](https://antithesis.com/pricing/)

**Prior art:** [McKeeman 1998](https://www.cs.tufts.edu/comp/150FP/archive/bill-mckeeman/DifferentailTesting.pdf) ·
[Csmith](https://github.com/csmith-project/csmith) ·
[Compiler testing survey](https://dl.acm.org/doi/fullHtml/10.1145/3363562) ·
[JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) ·
[Protobuf conformance](https://github.com/protocolbuffers/protobuf/tree/main/conformance) ·
[Autobahn](https://github.com/crossbario/autobahn-testsuite)

**Internal harnesses:** [hgraph](https://hgraph.readthedocs.io/en/latest/developer_guide/parity_testing.html) ·
[GoldenMatch](https://docs.bensevern.dev/docs/concepts/cross-language-parity) ·
[herdr-annotate](https://deepwiki.com/plannotator/herdr-annotate/4.3-typescript-rust-parity-verification) ·
[cognee](https://deepwiki.com/topoteretes/cognee-rs/10.3-cross-sdk-parity-harness) ·
[HelixDB](https://deepwiki.com/HelixDB/helix-db/6.2-sdk-parity-testing) ·
[Conduit](https://github.com/ConduitIO/conduit/pull/2948) ·
[Ably](https://ably.com/blog/universal-test-suite-for-ably-sdks) ·
[Flagsman](https://flagsman.com/blog/cross-language-conformance-testing)
