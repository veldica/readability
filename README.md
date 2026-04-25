# @veldica/readability

[![NPM Version](https://img.shields.io/npm/v/@veldica/readability?color=blue)](https://www.npmjs.com/package/@veldica/readability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dependency Count](https://img.shields.io/badge/dependencies-1-blue)](package.json)

Consolidated deterministic readability formulas for English prose. This library provides high-precision, rule-based implementations of major readability metrics with zero external bloat. Designed for use in AI editorial pipelines, content analysis tools, and automated writing feedback systems.

## Features

- **Deterministic Rule-Based Logic**: Mathematical implementations that provide consistent, predictable scores.
- **Consensus Grade Scoring**: Aggregated difficulty levels derived from multiple industry-standard formulas.
- **Precision Hardened**: Comprehensive input validation to prevent `NaN` or `Infinity` errors in production.
- **Agentic Ready**: Includes `GEMINI.md` for AI-assisted maintenance and integration.
- **Ultra-Lightweight**: Only one tiny dependency (`syllable`) for high-performance execution.
- **Tree-Shakable**: ESM-first design with modular exports for individual formulas.

## Supported Metrics

| Metric | Grade Level | Best For |
| :--- | :---: | :--- |
| **Flesch Reading Ease** | No | General consumer content and web copy |
| **Flesch-Kincaid Grade Level** | Yes | Education, technical manuals, and government docs |
| **Gunning Fog Index** | Yes | Business and corporate communications |
| **SMOG Index** | Yes | Healthcare and high-stakes safety information |
| **Coleman-Liau Index** | Yes | Rapid character-based analysis without syllable counting |
| **Automated Readability Index** | Yes | Real-time technical documentation assessment |
| **Dale-Chall Formula** | Yes | Assessing vocabulary difficulty based on familiar words |
| **Linsear Write** | Yes | United States Air Force style technical prose |
| **Type-Token Ratio** | No | Evaluating lexical variety and vocabulary repetition |

## Installation

```bash
npm install @veldica/readability
```

## Quick Start

### Basic Analysis (Automatic)
The easiest way to get started is using the built-in `getStructuralMetrics` bridge utility.

```ts
import { runAllFormulas, getStructuralMetrics } from "@veldica/readability";

const text = "Consolidated deterministic readability formulas for English prose.";
const stats = getStructuralMetrics(text);
const results = runAllFormulas(stats);

console.log(results.consensus_grade);  // 12
console.log(results.readability_band);  // "Standard / High School"
```

### High-Precision Analysis
For production systems, we recommend using `@veldica/prose-tokenizer` to generate more accurate structural metrics.

```ts
import { runAllFormulas } from "@veldica/readability";

// If manually populating, ensure all fields in StructuralMetrics are provided
const stats = {
  counts: {
    word_count: 100,
    sentence_count: 5,
    syllable_count: 150,
    polysyllable_count: 20,    // 3+ syllables
    complex_word_count: 20,    // Usually same as polysyllable_count
    difficult_word_count: 15,  // Not in DALE_CHALL_EASY_WORDS
    letter_count: 500,
    character_count: 600,
    character_count_no_spaces: 500,
    unique_word_count: 80,
    paragraph_count: 1,
    heading_count: 0,
    list_item_count: 0,
    reading_time_minutes: 0.5,
    long_word_count: 10
  },
  lexical: {
    avg_characters_per_word: 5.0,
    avg_syllables_per_word: 1.5,
    complex_word_ratio: 0.2,
    difficult_word_ratio: 0.15,
    lexical_diversity_ttr: 0.8,
    // ... complete list in types.ts
  },
  sentences: [],
  paragraphs: []
};

const results = runAllFormulas(stats);
```

## API Reference

### `getStructuralMetrics(text: string): StructuralMetrics`
A bridge utility that performs basic tokenization and syllable counting to produce the metrics required for the formulas. Best for quick integrations.

### `runAllFormulas(stats: StructuralMetrics): AnalysisResults`
The primary entry point. Validates inputs and executes all supported formulas. Returns:
- `formulas`: An array of `FormulaResult` objects.
- `consensus_grade`: The averaged grade level (rounded).
- `readability_band`: A human-readable difficulty label.

### `DALE_CHALL_EASY_WORDS: Set<string>`
The official 3,000 "easy word" list used by the Dale-Chall formula. Exported as a `Set` for $O(1)$ lookup performance.

### `calculateConsensus(formulas: FormulaResult[]): number`
Calculates the average grade level from a set of results, automatically excluding non-grade metrics (FRE and TTR).

### `getReadabilityBand(grade: number): string`
Maps a numeric grade level to a Veldica standard difficulty band (e.g., "Standard / High School").

### `validateMetrics(stats: StructuralMetrics): string[]`
Internal utility to ensure metrics are non-negative and correctly structured.

## Practical Use Cases

- **AI Editorial Pipelines**: Filter or flag AI-generated content that exceeds specific difficulty thresholds.
- **Linguistic Analysis**: Track changes in writing style or complexity across large datasets.
- **Accessibility Compliance**: Ensure public-facing content meets "Plain English" standards.
- **Content Optimization**: Identify specific "revision levers" to lower the grade level of complex text.

## Limitations

- **Language Support**: Formulas are specifically tuned for English prose.
- **Context Awareness**: Readability scores do not account for the emotional or conceptual depth of the text.
- **Input Requirements**: Requires pre-tokenized metrics (use `@veldica/prose-tokenizer` for best results).

## Contributing

Contributions are welcome! Please follow our established technical mandates:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFormula`)
3. Ensure all formulas pass the `Golden Sample` test suite.
4. Push to the Branch (`git push origin feature/NewFormula`)
5. Open a Pull Request

## Ownership & Authority

This package is maintained by **Veldica** as a core part of our writing analysis platform. It is built for production environments that demand mathematical precision and deterministic reliability.

- **Full Documentation**: [veldica.com/readability](https://veldica.com/readability)
- **Veldica Platform**: [veldica.com](https://veldica.com)
- **Report Bugs**: [GitHub Issues](https://github.com/veldica/readability/issues)

## License

MIT © [Veldica](https://veldica.com)
