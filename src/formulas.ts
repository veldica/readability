import type { FormulaResult, StructuralMetrics } from "./types.js";
import { round, safeDivide } from "./utils.js";
import { DALE_CHALL_EASY_WORDS } from "./data/daleChall.js";

/**
 * Flesch Reading Ease (FRE)
 * 
 * High scores indicate material that is easier to read; low scores indicate material that is more difficult to read.
 * 
 * @param stats - Structural metrics containing word, sentence, and syllable counts.
 * @returns A FormulaResult including the score (0-100) and interpretation.
 * @example
 * // Score of 60-70 is considered "Standard" (8th-9th grade)
 * const result = fleschReadingEase(stats);
 */
export function fleschReadingEase(stats: StructuralMetrics): FormulaResult {
  const wordsPerSentence = safeDivide(stats.counts.word_count, stats.counts.sentence_count);
  const syllablesPerWord = safeDivide(stats.counts.syllable_count, stats.counts.word_count);
  const score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  let interpretation = "";
  if (score >= 90) interpretation = "Very easy (5th grade)";
  else if (score >= 80) interpretation = "Easy (6th grade)";
  else if (score >= 70) interpretation = "Fairly easy (7th grade)";
  else if (score >= 60) interpretation = "Standard (8th-9th grade)";
  else if (score >= 50) interpretation = "Fairly difficult (10th-12th grade)";
  else if (score >= 30) interpretation = "Difficult (college)";
  else interpretation = "Very difficult (college graduate)";

  const dominantContributors: string[] = [];
  if (wordsPerSentence > 18) dominantContributors.push("high average sentence length");
  if (syllablesPerWord > 1.55) dominantContributors.push("high syllable density");

  return {
    metric: "flesch_reading_ease",
    name: "Flesch Reading Ease",
    formula: "206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)",
    score: round(score, 1),
    interpretation,
    inputs: { words_per_sentence: round(wordsPerSentence), syllables_per_word: round(syllablesPerWord) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Flesch-Kincaid Grade Level (FKGL)
 * 
 * Translates the Flesch Reading Ease score to a U.S. grade level.
 * 
 * @param stats - Structural metrics containing word, sentence, and syllable counts.
 * @returns A FormulaResult representing the approximate U.S. grade level.
 * @example
 * // A score of 8.0 means the text is appropriate for an 8th-grade student.
 * const result = fleschKincaidGradeLevel(stats);
 */
export function fleschKincaidGradeLevel(stats: StructuralMetrics): FormulaResult {
  const wordsPerSentence = safeDivide(stats.counts.word_count, stats.counts.sentence_count);
  const syllablesPerWord = safeDivide(stats.counts.syllable_count, stats.counts.word_count);
  const score = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const dominantContributors: string[] = [];
  if (wordsPerSentence > 18) dominantContributors.push("high average sentence length");
  if (syllablesPerWord > 1.5) dominantContributors.push("high syllable density");

  return {
    metric: "flesch_kincaid_grade_level",
    name: "Flesch-Kincaid Grade Level",
    formula: "0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59",
    score: Math.max(0, round(score, 1)),
    interpretation: `Approximate US grade level ${Math.max(0, Math.round(score))}`,
    inputs: { words_per_sentence: round(wordsPerSentence), syllables_per_word: round(syllablesPerWord) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Gunning Fog Index
 * 
 * Estimates the years of formal education a person needs to understand the text on the first reading.
 * 
 * @param stats - Structural metrics containing word, sentence, and complex word counts.
 * @returns A FormulaResult representing the approximate U.S. grade level.
 */
export function gunningFog(stats: StructuralMetrics): FormulaResult {
  const wordsPerSentence = safeDivide(stats.counts.word_count, stats.counts.sentence_count);
  const complexRatio = safeDivide(stats.counts.complex_word_count, stats.counts.word_count);
  const score = 0.4 * (wordsPerSentence + 100 * complexRatio);

  const dominantContributors: string[] = [];
  if (wordsPerSentence > 18) dominantContributors.push("high average sentence length");
  if (complexRatio > 0.12) dominantContributors.push("high complex-word density");

  return {
    metric: "gunning_fog",
    name: "Gunning Fog",
    formula: "0.4 * ((words / sentences) + 100 * (complex_words / words))",
    score: round(score, 1),
    interpretation: `Approximate US grade level ${Math.max(0, Math.round(score))}`,
    inputs: { words_per_sentence: round(wordsPerSentence), complex_word_ratio: round(complexRatio) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * SMOG (Simple Measure of Gobbledygook) Index
 * 
 * Estimates the years of education needed to understand a piece of writing.
 * Reliable primarily for texts of 3 or more sentences.
 * 
 * @param stats - Structural metrics containing sentence and polysyllable counts.
 */
export function smog(stats: StructuralMetrics): FormulaResult {
  const applicable = stats.counts.sentence_count >= 3;
  const score = applicable
    ? 1.043 * Math.sqrt(stats.counts.polysyllable_count * (30 / stats.counts.sentence_count)) + 3.1291
    : 0;

  return {
    metric: "smog",
    name: "SMOG",
    formula: "1.0430 * sqrt(polysyllables * (30 / sentences)) + 3.1291",
    score: round(score, 1),
    interpretation: applicable
      ? `Approximate US grade level ${Math.max(0, Math.round(score))}`
      : "Not reliable for fewer than 3 sentences",
    inputs: { polysyllables: stats.counts.polysyllable_count, sentences: stats.counts.sentence_count },
    revision_levers: ["reduce_complex_word_density"],
    applicable,
    target: null,
    pass: null,
    dominant_contributors: applicable && stats.counts.polysyllable_count > 0 ? ["high polysyllable count"] : [],
  };
}

/**
 * Coleman-Liau Index
 * 
 * Relies on characters instead of syllables per word.
 * 
 * @param stats - Structural metrics containing word, sentence, and letter counts.
 */
export function colemanLiau(stats: StructuralMetrics): FormulaResult {
  const lettersPer100Words = safeDivide(stats.counts.letter_count, stats.counts.word_count) * 100;
  const sentencesPer100Words = safeDivide(stats.counts.sentence_count, stats.counts.word_count) * 100;
  const score = 0.0588 * lettersPer100Words - 0.296 * sentencesPer100Words - 15.8;

  const dominantContributors: string[] = [];
  if (lettersPer100Words > 450) dominantContributors.push("long average word length");
  if (sentencesPer100Words < 5) dominantContributors.push("low sentence density");

  return {
    metric: "coleman_liau",
    name: "Coleman-Liau",
    formula: "0.0588 * L - 0.296 * S - 15.8",
    score: Math.max(0, round(score, 1)),
    interpretation: `Approximate US grade level ${Math.max(0, Math.round(score))}`,
    inputs: { letters_per_100_words: round(lettersPer100Words), sentences_per_100_words: round(sentencesPer100Words) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Automated Readability Index (ARI)
 * 
 * Designed for real-time monitoring of readability on electric typewriters.
 * 
 * @param stats - Structural metrics containing word, sentence, and character counts.
 */
export function automatedReadabilityIndex(stats: StructuralMetrics): FormulaResult {
  const charsPerWord = stats.lexical.avg_characters_per_word;
  const wordsPerSentence = safeDivide(stats.counts.word_count, stats.counts.sentence_count);
  const score = 4.71 * charsPerWord + 0.5 * wordsPerSentence - 21.43;

  const dominantContributors: string[] = [];
  if (charsPerWord > 4.8) dominantContributors.push("high average characters per word");
  if (wordsPerSentence > 18) dominantContributors.push("high average sentence length");

  return {
    metric: "automated_readability_index",
    name: "Automated Readability Index",
    formula: "4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43",
    score: Math.max(0, round(score, 1)),
    interpretation: `Approximate US grade level ${Math.max(0, Math.round(score))}`,
    inputs: { avg_characters_per_word: round(charsPerWord), words_per_sentence: round(wordsPerSentence) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Dale-Chall Formula (New)
 * 
 * Uses a list of 3,000 familiar words to determine readability.
 * 
 * @param stats - Structural metrics containing word, sentence, and difficult word counts.
 */
export function daleChall(stats: StructuralMetrics): FormulaResult {
  const difficultWordPercentage = safeDivide(stats.counts.difficult_word_count, stats.counts.word_count) * 100;
  const wordsPerSentence = safeDivide(stats.counts.word_count, stats.counts.sentence_count);

  let score = 0.1579 * difficultWordPercentage + 0.0496 * wordsPerSentence;
  if (difficultWordPercentage > 5) score += 3.6365;

  let interpretation = "";
  if (score <= 4.9) interpretation = "4th grade or below";
  else if (score <= 5.9) interpretation = "5th-6th grade";
  else if (score <= 6.9) interpretation = "7th-8th grade";
  else if (score <= 7.9) interpretation = "9th-10th grade";
  else if (score <= 8.9) interpretation = "11th-12th grade";
  else if (score <= 9.9) interpretation = "College";
  else interpretation = "College graduate";

  const dominantContributors: string[] = [];
  if (difficultWordPercentage > 8) dominantContributors.push("high difficult-word percentage");
  if (wordsPerSentence > 18) dominantContributors.push("high average sentence length");

  return {
    metric: "dale_chall",
    name: "Dale-Chall",
    formula: "0.1579 * difficult_word_percentage + 0.0496 * (words / sentences) [+ 3.6365 if difficult_word_percentage > 5]",
    score: round(score, 1),
    interpretation,
    inputs: { difficult_word_percentage: round(difficultWordPercentage), words_per_sentence: round(wordsPerSentence) },
    revision_levers: ["replace_difficult_words", "shorten_long_sentences"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Linsear Write
 * 
 * A formula originally developed for the United States Air Force to help calculate the readability of their technical manuals.
 * 
 * @param stats - Structural metrics containing word, sentence, and complex word counts.
 */
export function linsearWrite(stats: StructuralMetrics): FormulaResult {
  const easyWords = stats.counts.word_count - stats.counts.complex_word_count;
  const hardWords = stats.counts.complex_word_count;
  const rawScore = safeDivide(easyWords + 3 * hardWords, stats.counts.sentence_count);
  const score = rawScore <= 20 ? rawScore / 2 - 1 : rawScore / 2;

  const dominantContributors: string[] = [];
  if (safeDivide(hardWords, stats.counts.word_count) > 0.12) dominantContributors.push("high complex-word density");
  if (safeDivide(stats.counts.word_count, stats.counts.sentence_count) > 18) dominantContributors.push("high average sentence length");

  return {
    metric: "linsear_write",
    name: "Linsear Write",
    formula: "Normalized ((easy_words + 3 * hard_words) / sentences)",
    score: Math.max(0, round(score, 1)),
    interpretation: `Approximate US grade level ${Math.max(0, Math.round(score))}`,
    inputs: { complex_word_ratio: round(safeDivide(hardWords, stats.counts.word_count)), words_per_sentence: round(safeDivide(stats.counts.word_count, stats.counts.sentence_count)) },
    revision_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: dominantContributors,
  };
}

/**
 * Type-Token Ratio (TTR)
 * 
 * Measures lexical variety by comparing the number of unique words to the total number of words.
 * 
 * @param stats - Structural metrics containing word and unique word counts.
 */
export function typeTokenRatio(stats: StructuralMetrics): FormulaResult {
  const score = safeDivide(stats.counts.unique_word_count, stats.counts.word_count);

  return {
    metric: "type_token_ratio",
    name: "Type-Token Ratio",
    formula: "unique_words / total_words",
    score: round(score, 4),
    interpretation: score > 0.6 ? "High variety" : score > 0.4 ? "Moderate variety" : "Low variety / repetitive",
    inputs: { unique_words: stats.counts.unique_word_count, total_words: stats.counts.word_count },
    revision_levers: ["reduce_repetition"],
    applicable: true,
    target: null,
    pass: null,
    dominant_contributors: score < 0.45 ? ["low vocabulary variety"] : [],
  };
}
