# @veldica/readability

[![NPM Version](https://img.shields.io/npm/v/@veldica/readability?color=blue)](https://www.npmjs.com/package/@veldica/readability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Easy-to-use readability formulas for English text. This library gives you precise, rule-based scores for all major metrics with no extra bloat.

## Why use @veldica/readability?

- **Stable Results**: Pure functions that give the same math output every time.
- **AI-Ready**: Includes a `GEMINI.md` guide for better use with AI agents.
- **Very Small**: Only has one tiny dependency (`syllable`).
- **Modern Design**: Built for ESM and supports tree-shaking to keep your app fast.
- **Safe Math**: Checks inputs to stop errors like `NaN` or `Infinity`.

## Supported Metrics

| Metric | Grade Level | Best For |
| :--- | :---: | :--- |
| **Flesch Reading Ease** | No | General web content |
| **Flesch-Kincaid Grade Level** | Yes | Schools and tech manuals |
| **Gunning Fog Index** | Yes | Business writing |
| **SMOG Index** | Yes | Health and safety text |
| **Coleman-Liau Index** | Yes | Fast character-based tests |
| **Automated Readability Index** | Yes | Technical guides |
| **Dale-Chall Formula** | Yes | Common word tests |
| **Linsear Write** | Yes | Short technical notes |
| **Type-Token Ratio** | No | Testing word variety |

## Installation

```bash
npm install @veldica/readability
```

## Usage

### Run All Formulas

```typescript
import { runAllFormulas } from '@veldica/readability';

const stats = {
  counts: {
    word_count: 100,
    sentence_count: 5,
    syllable_count: 150,
    complex_word_count: 15,
    // ... see Types for the full list
  },
  lexical: {
    avg_characters_per_word: 4.5,
    // ...
  }
};

const results = runAllFormulas(stats);

console.log(results.consensus_grade);  // Example: 8
console.log(results.readability_band);  // Example: "Middle School / Easy"
console.log(results.formulas);         // List of all formula results
```

### Run One Formula

```typescript
import { fleschKincaidGradeLevel } from '@veldica/readability/formulas';

const result = fleschKincaidGradeLevel(stats);
console.log(result.score); // 9.9
```

## Maintenance

We follow the rules in `GEMINI.md`. All code changes must pass the `Golden Sample` test in our suite.

## License

MIT © [Veldica](https://veldica.com)
