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
 * Limited to 10,000 entries to prevent memory leaks in long-running processes.
 */
const SYLLABLE_CACHE = new Map<string, number>();
const MAX_CACHE_SIZE = 10000;

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

  // FIFO cache eviction to manage memory
  if (SYLLABLE_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = SYLLABLE_CACHE.keys().next().value;
    if (firstKey !== undefined) SYLLABLE_CACHE.delete(firstKey);
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
 * Iterative implementation to prevent stack overflow on large datasets.
 */
function quickselect(arr: number[], k: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (true) {
    if (left === right) return arr[left];

    const pivotIndex = left + Math.floor((right - left) / 2);
    const newPivotIndex = partition(arr, left, right, pivotIndex);

    if (k === newPivotIndex) {
      return arr[k];
    } else if (k < newPivotIndex) {
      right = newPivotIndex - 1;
    } else {
      left = newPivotIndex + 1;
    }
  }
}

/**
 * Helper for Quickselect to partition the array.
 */
function partition(arr: number[], left: number, right: number, pivotIndex: number): number {
  const pivotValue = arr[pivotIndex];
  [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];
  let storeIndex = left;

  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
      storeIndex++;
    }
  }

  [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
  return storeIndex;
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
