export type RevisionLeverId =
  | "add_more_content"
  | "trim_excess_content"
  | "shorten_long_sentences"
  | "split_oversized_paragraphs"
  | "replace_difficult_words"
  | "reduce_complex_word_density"
  | "reduce_repetition"
  | "add_breaks_to_dense_sections"
  | "break_sentence_tails"
  | "increase_heading_frequency"
  | "introduce_lists_for_scannability"
  | "reduce_abstract_wording"
  | "improve_dialogue_balance"
  | "tighten_scene_pacing"
  | "ground_with_sensory_details";

export interface FormulaResult {
  metric: string;
  name: string;
  formula: string;
  score: number;
  interpretation: string;
  inputs: Record<string, number>;
  revision_levers: RevisionLeverId[];
  applicable: boolean;
  target: {
    value: number;
    operator: "at_least" | "at_most";
  } | null;
  pass: boolean | null;
  dominant_contributors: string[];
}

export interface Counts {
  word_count: number;
  unique_word_count: number;
  sentence_count: number;
  paragraph_count: number;
  heading_count: number;
  list_item_count: number;
  character_count: number;
  character_count_no_spaces: number;
  letter_count: number;
  syllable_count: number;
  polysyllable_count: number;
  complex_word_count: number;
  difficult_word_count: number;
  long_word_count: number;
  reading_time_minutes: number;
}

export interface SentenceMetrics {
  avg_words_per_sentence: number;
  median_words_per_sentence: number;
  min_words_per_sentence: number;
  max_words_per_sentence: number;
  sentence_length_p90: number;
  sentence_length_p95: number;
  sentence_length_stddev: number;
  sentences_over_20_words: number;
  sentences_over_25_words: number;
  sentences_over_30_words: number;
  sentences_over_40_words: number;
  percent_sentences_over_20_words: number;
  percent_sentences_over_25_words: number;
  percent_sentences_over_30_words: number;
  percent_sentences_over_40_words: number;
}

export interface ParagraphMetrics {
  avg_words_per_paragraph: number;
  median_words_per_paragraph: number;
  min_words_per_paragraph: number;
  max_words_per_paragraph: number;
  paragraph_length_p90: number;
  paragraph_length_p95: number;
  paragraph_length_stddev: number;
  paragraphs_over_75_words: number;
  paragraphs_over_100_words: number;
  paragraphs_over_150_words: number;
  percent_paragraphs_over_75_words: number;
  percent_paragraphs_over_100_words: number;
  percent_paragraphs_over_150_words: number;
  avg_sentences_per_paragraph: number;
  median_sentences_per_paragraph: number;
  max_sentences_per_paragraph: number;
}

export interface LexicalMetrics {
  lexical_diversity_ttr: number;
  lexical_diversity_mattr: number;
  lexical_density: number;
  unique_word_count: number;
  repetition_ratio: number;
  top_repeated_words: {
    word: string;
    count: number;
    ratio: number;
  }[];
  avg_characters_per_word: number;
  avg_syllables_per_word: number;
  long_word_ratio: number;
  complex_word_ratio: number;
  difficult_word_ratio: number;
}

export interface ScannabilityMetrics {
  heading_density: number;
  words_per_heading: number | null;
  list_density: number;
  words_between_breaks: number;
  wall_of_text_risk: "low" | "medium" | "high";
  paragraph_scannability_score: number;
  sentence_tail_risk_score: number;
}

export interface FictionMetrics {
  dialogue_ratio: number;
  avg_dialogue_run_length: number;
  narration_vs_dialogue_balance: "narration_heavy" | "balanced" | "dialogue_heavy";
  scene_density_proxy: number;
  exposition_density_proxy: number;
  sensory_term_density: number;
  abstract_word_ratio: number;
  paragraph_cadence_variation: number;
}

export interface SentenceDetail {
  index: number;
  text: string;
  word_count: number;
  syllable_count: number;
  complex_word_count: number;
  difficult_word_count: number;
}

export interface ParagraphDetail {
  index: number;
  text: string;
  word_count: number;
  sentence_count: number;
}

export interface AnalysisResults {
  formulas: FormulaResult[];
  consensus_grade: number;
  readability_band: string;
  consensus_sources: string[];
  excluded_formulas: string[];
  warnings: string[];
}

export interface StructuralMetrics {
  counts: Counts;
  sentence_metrics: SentenceMetrics;
  paragraph_metrics: ParagraphMetrics;
  lexical: LexicalMetrics;
  scannability: ScannabilityMetrics;
  fiction?: FictionMetrics;
  sentences: SentenceDetail[];
  paragraphs: ParagraphDetail[];
}
