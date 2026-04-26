import { test } from "node:test";
import assert from "node:assert";
import { getStructuralMetrics } from "./analyzer.js";
import { runAllFormulas } from "./index.js";
import { clearSyllableCache } from "./utils.js";

test("Stress: Massive Payload (100k words)", () => {
  const word = "supercalifragilisticexpialidocious ";
  const text = word.repeat(100000);
  
  const start = Date.now();
  const stats = getStructuralMetrics(text);
  const duration = Date.now() - start;

  assert.strictEqual(stats.counts.word_count, 100000);
  assert.ok(duration < 2000, `Massive payload took too long: ${duration}ms`);
});

test("Stress: Punctuation Soup (1MB)", () => {
  const soup = "...!!!??? ".repeat(100000); // approx 1MB
  
  const start = Date.now();
  const stats = getStructuralMetrics(soup);
  const duration = Date.now() - start;

  // Should handle without catastrophic backtracking
  assert.ok(duration < 1000, `Punctuation soup took too long: ${duration}ms`);
});

test("Stress: 50,000 Single-Word Sentences (Tokenizer Limit)", () => {
  const text = "Word. ".repeat(50000);
  
  const start = Date.now();
  const stats = getStructuralMetrics(text);
  const results = runAllFormulas(stats);
  const duration = Date.now() - start;

  assert.strictEqual(stats.counts.sentence_count, 50000);
  assert.strictEqual(stats.sentence_metrics.median_words_per_sentence, 1);
  assert.ok(duration < 2000, `Processing 50k sentences took too long: ${duration}ms`);
});

import { calculateMedian } from "./utils.js";
test("Stress: Quickselect on 500,000 elements", () => {
  const arr = Array.from({ length: 500000 }, () => Math.floor(Math.random() * 1000));
  
  const start = Date.now();
  const median = calculateMedian(arr);
  const duration = Date.now() - start;

  assert.ok(median >= 0 && median <= 1000);
  assert.ok(duration < 100, `Quickselect on 500k elements took too long: ${duration}ms`);
});

test("Robustness: Complex Abbreviations and Decimals", () => {
  const text = "Dr. Smith bought 3.14 units at 5.5% interest in the U.S.A. It was a good deal. Mrs. Jones agreed.";
  const stats = getStructuralMetrics(text);

  // Dr., 3.14, 5.5%, U.S.A., Mrs. should not break sentences improperly.
  // 1: Dr. ... U.S.A.
  // 2: It was ... deal.
  // 3: Mrs. Jones agreed.
  assert.strictEqual(stats.counts.sentence_count, 3);
});

test("Robustness: Zero Punctuation Massive Document", () => {
  const text = "longword ".repeat(5000);
  const stats = getStructuralMetrics(text);
  const results = runAllFormulas(stats);

  assert.strictEqual(stats.counts.sentence_count, 1);
  assert.ok(results.warnings.some(w => w.includes("punctuation")));
  assert.strictEqual(results.consensus_grade, 20); // Capped
});

test("Performance: Cache Eviction and Memory Safety", () => {
  clearSyllableCache();
  
  // Generate 12,000 unique words to trigger eviction (limit is 10,000)
  let text = "";
  for (let i = 0; i < 12000; i++) {
    text += `word${i} `;
  }

  const start = Date.now();
  getStructuralMetrics(text);
  const duration = Date.now() - start;

  assert.ok(duration < 2000, `Cache eviction test took too long: ${duration}ms`);
});
