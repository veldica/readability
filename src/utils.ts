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
 * Deterministic syllable counting for English using a proven local package,
 * with a small fallback for short acronym-like tokens that contain no vowels.
 */
export function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.length === 0) return 0;

  if (!/[aeiouy]/.test(normalized) && normalized.length <= 4) {
    return normalized.length;
  }

  return Math.max(1, syllable(normalized));
}

/**
 * Checks if a word is "polysyllabic" (3 or more syllables).
 */
export function isPolysyllabic(word: string): boolean {
  return countSyllables(word) >= 3;
}
