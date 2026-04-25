import type { FormulaResult, StructuralMetrics, AnalysisResults } from "./types.js";
import {
  fleschReadingEase,
  fleschKincaidGradeLevel,
  gunningFog,
  smog,
  colemanLiau,
  automatedReadabilityIndex,
  daleChall,
  linsearWrite,
  typeTokenRatio,
} from "./formulas.js";
import { validateMetrics } from "./utils.js";

export * from "./formulas.js";
export * from "./utils.js";
export * from "./types.js";
export * from "./analyzer.js";

/**
 * The official Dale-Chall 3,000 "easy word" list used by the Dale-Chall formula.
 * Exported as a Set for O(1) lookup performance during custom analysis.
 */
export { DALE_CHALL_EASY_WORDS } from "./data/daleChall.js";

/**
 * Calculates a consolidated grade level by averaging all applicable grade-based formulas.
 * Excludes non-grade metrics like Reading Ease and Lexical Variety.
 */
export function calculateConsensus(formulas: FormulaResult[]): number {
  const applicableFormulas = formulas.filter(
    (f) => f.applicable && f.metric !== "flesch_reading_ease" && f.metric !== "type_token_ratio"
  );

  if (applicableFormulas.length === 0) return 0;

  const sum = applicableFormulas.reduce((acc, f) => acc + f.score, 0);
  return Math.round(sum / applicableFormulas.length);
}

/**
 * Maps a numeric grade level to a human-readable difficulty band.
 */
export function getReadabilityBand(grade: number): string {
  if (grade <= 6) return "Elementary / Very Easy";
  if (grade <= 8) return "Middle School / Easy";
  if (grade <= 12) return "Standard / High School";
  if (grade <= 16) return "College Graduate / Difficult";
  return "Professional / Very Difficult";
}

/**
 * Executes all readability formulas against the provided metrics.
 * Performs validation before execution.
 * 
 * @throws Error if metrics are invalid.
 */
export function runAllFormulas(stats: StructuralMetrics): AnalysisResults {
  const validationErrors = validateMetrics(stats);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid structural metrics: ${validationErrors.join(", ")}`);
  }

  const formulas: FormulaResult[] = [
    fleschReadingEase(stats),
    fleschKincaidGradeLevel(stats),
    gunningFog(stats),
    smog(stats),
    colemanLiau(stats),
    automatedReadabilityIndex(stats),
    daleChall(stats),
    linsearWrite(stats),
    typeTokenRatio(stats),
  ];

  const consensus_grade = calculateConsensus(formulas);
  const readability_band = getReadabilityBand(consensus_grade);
  const consensus_sources = formulas
    .filter((f) => f.applicable && f.metric !== "flesch_reading_ease" && f.metric !== "type_token_ratio")
    .map((f) => f.name);

  const excluded_formulas = formulas
    .filter((f) => !f.applicable || f.metric === "flesch_reading_ease" || f.metric === "type_token_ratio")
    .map((f) => f.name);

  return {
    formulas,
    consensus_grade,
    readability_band,
    consensus_sources,
    excluded_formulas,
  };
}
