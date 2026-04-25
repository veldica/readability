import { test } from "node:test";
import assert from "node:assert";
import { getStructuralMetrics } from "./analyzer.js";
import { runAllFormulas } from "./index.js";

test("getStructuralMetrics provides expected counts for basic text", () => {
  const text = "This is a simple sentence. This is another sentence with complex words like complexity and biological.";
  const stats = getStructuralMetrics(text);

  assert.strictEqual(stats.counts.sentence_count, 2);
  assert.strictEqual(stats.counts.word_count, 16);
  // "another" (3), "complexity" (4) and "biological" (4) are complex/polysyllabic
  assert.strictEqual(stats.counts.complex_word_count, 3);
  assert.strictEqual(stats.counts.polysyllable_count, 3);
  // "sentence" (8), "sentence" (8), "another" (7), "complex" (7), "complexity" (10), "biological" (10) are >= 7 chars
  assert.strictEqual(stats.counts.long_word_count, 6);
  assert.strictEqual(stats.lexical.top_repeated_words[0].word, "this");
});

test("runAllFormulas provides full transparency on consensus", () => {
  const text = "Short text."; // 1 sentence, SMOG should be non-applicable
  const stats = getStructuralMetrics(text);
  const results = runAllFormulas(stats);

  assert.ok(results.excluded_formulas.includes("SMOG"));
  assert.ok(results.excluded_formulas.includes("Flesch Reading Ease"));
  assert.ok(results.excluded_formulas.includes("Type-Token Ratio"));
  assert.ok(!results.consensus_sources.includes("SMOG"));
});

test("runAllFormulas works with metrics from getStructuralMetrics", () => {
  const text = `Readability formulas are indicators of the difficulty of a text. 
  They are often used to ensure that content is appropriate for its target audience. 
  High-precision analysis is essential for technical documentation.`;
  
  const stats = getStructuralMetrics(text);
  const results = runAllFormulas(stats);

  assert.ok(results.consensus_grade > 0);
  assert.ok(results.formulas.length > 0);
  assert.strictEqual(typeof results.readability_band, "string");
  assert.ok(results.consensus_sources.length > 0);
  assert.ok(results.consensus_sources.includes("Flesch-Kincaid Grade Level"));
});
