import { syllable } from "syllable";
import type { StructuralMetrics } from "./types.js";

/**
 * Rounds a number to a specified number of decimal places.
 */
export function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Performs division but returns 0 if the denominator is 0 to avoid Infinity/NaN.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Validates structural metrics to ensure they are present and non-negative.
 * Returns a list of errors, or an empty array if valid.
 */
export function validateMetrics(stats: StructuralMetrics): string[] {
  const errors: string[] = [];
  if (!stats.counts) errors.push("Missing 'counts' object");
  else {
    if (stats.counts.word_count < 0) errors.push("word_count cannot be negative");
    if (stats.counts.sentence_count < 0) errors.push("sentence_count cannot be negative");
  }
  if (!stats.lexical) errors.push("Missing 'lexical' object");
  return errors;
}

/**
 * SYLLABLE_CACHE is a simple Map to prevent redundant syllable calculations.
 * For high-throughput analysis of large documents, this prevents the event
 * loop from stalling on repetitive common words.
 */
const SYLLABLE_CACHE = new Map<string, number>();

/**
 * Deterministic syllable counting for English using a proven local package,
 * with a small fallback for short acronym-like tokens that contain no vowels.
 * Includes an internal cache to optimize performance on large texts.
 */
export function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.length === 0) return 0;

  const cached = SYLLABLE_CACHE.get(normalized);
  if (cached !== undefined) return cached;

  let count: number;
  if (!/[aeiouy]/.test(normalized) && normalized.length <= 4) {
    count = normalized.length;
  } else {
    count = Math.max(1, syllable(normalized));
  }

  SYLLABLE_CACHE.set(normalized, count);
  return count;
}

/**
 * Clears the syllable cache. Useful for long-running processes to manage memory.
 */
export function clearSyllableCache(): void {
  SYLLABLE_CACHE.clear();
}

/**
 * Implements the Quickselect algorithm to find the k-th smallest element.
 * Used for efficient O(N) median calculation.
 */
function quickselect(arr: number[], k: number): number {
  if (arr.length === 1) return arr[0];

  const pivot = arr[Math.floor(Math.random() * arr.length)];
  const lows = arr.filter(x => x < pivot);
  const highs = arr.filter(x => x > pivot);
  const pivots = arr.filter(x => x === pivot);

  if (k < lows.length) return quickselect(lows, k);
  if (k < lows.length + pivots.length) return pivot;
  return quickselect(highs, k - lows.length - pivots.length);
}

/**
 * Calculates the median of an array of numbers using the Quickselect algorithm.
 * This is significantly faster than sorting for large arrays (O(N) vs O(N log N)).
 */
export function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const k = Math.floor(arr.length / 2);
  return quickselect(arr, k);
}

/**
 * Checks if a word is "polysyllabic" (3 or more syllables).
 */
export function isPolysyllabic(word: string): boolean {
  return countSyllables(word) >= 3;
}
