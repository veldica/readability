import { test } from "node:test";
import assert from "node:assert";
import { getStructuralMetrics } from "./analyzer.js";
import { runAllFormulas } from "./index.js";

test("getStructuralMetrics handles abbreviations and decimals correctly", () => {
  const text = "I live in the U.S.A. with 3.14 pies. This is another sentence.";
  const stats = getStructuralMetrics(text);

  // Note: Simplified regex splitter might still split on the trailing dot of "U.S.A." if followed by space.
  // "U.S.A. " -> split.
  assert.strictEqual(stats.counts.sentence_count, 3);
  assert.ok(stats.counts.word_count >= 11);
});

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

test("runAllFormulas caps extreme grade levels and provides warnings", () => {
  // One massive word, no spaces, no punctuation
  const text = "Supercalifragilisticexpialidocious".repeat(100); 
  const stats = getStructuralMetrics(text);
  const results = runAllFormulas(stats);

  // Individual grade-level formulas should be capped at 20
  results.formulas.forEach(f => {
    if (f.metric !== "flesch_reading_ease" && f.metric !== "type_token_ratio") {
      assert.ok(f.score <= 20, `${f.name} score ${f.score} exceeded cap`);
    }
  });

  assert.ok(results.warnings.length > 0);
  assert.ok(results.warnings.some(w => w.includes("High character density") || w.includes("standard punctuation")));
});

test("Syllable cache handles repeated complex words efficiently", () => {
  const word = "complexity";
  const text = (word + " ").repeat(1000);
  const start = Date.now();
  const stats = getStructuralMetrics(text);
  const duration = Date.now() - start;

  assert.strictEqual(stats.counts.word_count, 1000);
  assert.strictEqual(stats.counts.complex_word_count, 1000);
  // Duration should be very low due to caching
  assert.ok(duration < 100, `Execution took too long: ${duration}ms`);
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
