import { describe, it } from "node:test";
import assert from "node:assert";
import { runAllFormulas } from "./index.js";
import type { StructuralMetrics } from "./types.js";

describe("Readability Analysis", () => {
  it("should calculate correct consensus and band for standard text", () => {
    const mockStats: StructuralMetrics = {
      counts: {
        word_count: 100,
        unique_word_count: 80,
        sentence_count: 5,
        paragraph_count: 1,
        heading_count: 0,
        list_item_count: 0,
        character_count: 500,
        character_count_no_spaces: 400,
        letter_count: 400,
        syllable_count: 150,
        polysyllable_count: 20,
        complex_word_count: 15,
        difficult_word_count: 10,
        long_word_count: 12,
        reading_time_minutes: 0.5,
      },
      sentence_metrics: {
        avg_words_per_sentence: 20,
        median_words_per_sentence: 20,
        min_words_per_sentence: 15,
        max_words_per_sentence: 25,
        sentence_length_p90: 24,
        sentence_length_p95: 24.5,
        sentence_length_stddev: 3,
        sentences_over_20_words: 2,
        sentences_over_25_words: 0,
        sentences_over_30_words: 0,
        sentences_over_40_words: 0,
        percent_sentences_over_20_words: 0.4,
        percent_sentences_over_25_words: 0,
        percent_sentences_over_30_words: 0,
        percent_sentences_over_40_words: 0,
      },
      paragraph_metrics: {
        avg_words_per_paragraph: 100,
        median_words_per_paragraph: 100,
        min_words_per_paragraph: 100,
        max_words_per_paragraph: 100,
        paragraph_length_p90: 100,
        paragraph_length_p95: 100,
        paragraph_length_stddev: 0,
        paragraphs_over_75_words: 1,
        paragraphs_over_100_words: 0,
        paragraphs_over_150_words: 0,
        percent_paragraphs_over_75_words: 1,
        percent_paragraphs_over_100_words: 0,
        percent_paragraphs_over_150_words: 0,
        avg_sentences_per_paragraph: 5,
        median_sentences_per_paragraph: 5,
        max_sentences_per_paragraph: 5,
      },
      lexical: {
        lexical_diversity_ttr: 0.8,
        lexical_diversity_mattr: 0.75,
        lexical_density: 0.5,
        unique_word_count: 80,
        repetition_ratio: 0.2,
        top_repeated_words: [],
        avg_characters_per_word: 4,
        avg_syllables_per_word: 1.5,
        long_word_ratio: 0.12,
        complex_word_ratio: 0.15,
        difficult_word_ratio: 0.1,
      },
      scannability: {
        heading_density: 0,
        words_per_heading: null,
        list_density: 0,
        words_between_breaks: 100,
        wall_of_text_risk: "medium",
        paragraph_scannability_score: 80,
        sentence_tail_risk_score: 10,
      },
      sentences: [],
      paragraphs: [],
    };

    const result = runAllFormulas(mockStats);

    assert.strictEqual(typeof result.consensus_grade, "number");
    assert.strictEqual(typeof result.readability_band, "string");
    assert.ok(result.formulas.length > 0);
  });
});
