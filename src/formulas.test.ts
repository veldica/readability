import { describe, it } from "node:test";
import assert from "node:assert";
import * as formulas from "./formulas.js";
import type { StructuralMetrics } from "./types.js";

const baseStats: StructuralMetrics = {
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

describe("Individual Formulas", () => {
  it("Flesch Reading Ease", () => {
    const result = formulas.fleschReadingEase(baseStats);
    assert.strictEqual(result.metric, "flesch_reading_ease");
    assert.ok(result.score > 0 && result.score <= 100);
  });

  it("Flesch-Kincaid Grade Level", () => {
    const result = formulas.fleschKincaidGradeLevel(baseStats);
    assert.strictEqual(result.metric, "flesch_kincaid_grade_level");
    assert.ok(result.score >= 0);
  });

  it("Gunning Fog", () => {
    const result = formulas.gunningFog(baseStats);
    assert.strictEqual(result.metric, "gunning_fog");
    assert.ok(result.score >= 0);
  });

  it("SMOG", () => {
    const result = formulas.smog(baseStats);
    assert.strictEqual(result.metric, "smog");
    assert.strictEqual(result.applicable, true);
  });

  it("SMOG Non-Applicable", () => {
    const lowStats = { ...baseStats, counts: { ...baseStats.counts, sentence_count: 2 } };
    const result = formulas.smog(lowStats);
    assert.strictEqual(result.applicable, false);
    assert.strictEqual(result.score, 0);
  });

  it("Coleman-Liau", () => {
    const result = formulas.colemanLiau(baseStats);
    assert.strictEqual(result.metric, "coleman_liau");
    assert.ok(result.score >= 0);
  });

  it("ARI", () => {
    const result = formulas.automatedReadabilityIndex(baseStats);
    assert.strictEqual(result.metric, "automated_readability_index");
    assert.ok(result.score >= 0);
  });

  it("Dale-Chall", () => {
    const result = formulas.daleChall(baseStats);
    assert.strictEqual(result.metric, "dale_chall");
    assert.ok(result.score >= 0);
  });

  it("Linsear Write", () => {
    const result = formulas.linsearWrite(baseStats);
    assert.strictEqual(result.metric, "linsear_write");
    assert.ok(result.score >= 0);
  });

  it("Type-Token Ratio", () => {
    const result = formulas.typeTokenRatio(baseStats);
    assert.strictEqual(result.metric, "type_token_ratio");
    assert.strictEqual(result.score, 0.8);
  });
});

describe("Golden Sample Precision", () => {
  it("should match standard results for a controlled input", () => {
    const controlledStats: StructuralMetrics = {
      ...baseStats,
      counts: {
        ...baseStats.counts,
        word_count: 100,
        sentence_count: 5,
        syllable_count: 150, // 1.5 syllables per word
        complex_word_count: 15,
        letter_count: 500,
      },
      lexical: {
        ...baseStats.lexical,
        avg_characters_per_word: 5,
      }
    };

    // FKGL = 0.39 * (100/5) + 11.8 * (150/100) - 15.59
    // FKGL = 0.39 * 20 + 11.8 * 1.5 - 15.59 = 7.8 + 17.7 - 15.59 = 9.91 -> 9.9
    const fkgl = formulas.fleschKincaidGradeLevel(controlledStats);
    assert.strictEqual(fkgl.score, 9.9);

    // FRE = 206.835 - 1.015 * (100/5) - 84.6 * (150/100)
    // FRE = 206.835 - 20.3 - 126.9 = 59.635 -> 59.6
    const fre = formulas.fleschReadingEase(controlledStats);
    assert.strictEqual(fre.score, 59.6);
  });
});

describe("Edge Cases & Safety", () => {
  it("Handle Zero Sentences gracefully (no division by zero)", () => {
    const zeroStats = { 
      ...baseStats, 
      counts: { ...baseStats.counts, sentence_count: 0 } 
    };
    const result = formulas.fleschReadingEase(zeroStats);
    assert.ok(!isNaN(result.score));
    assert.ok(isFinite(result.score));
  });

  it("Handle Zero Words gracefully", () => {
    const zeroStats = { 
      ...baseStats, 
      counts: { ...baseStats.counts, word_count: 0 } 
    };
    const result = formulas.fleschReadingEase(zeroStats);
    assert.ok(!isNaN(result.score));
  });
});
