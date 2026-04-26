import { countSyllables, safeDivide, round, calculateMedian } from "./utils.js";
import { DALE_CHALL_EASY_WORDS } from "./data/daleChall.js";
import { splitParagraphs, splitSentences, splitWords, getStructureCounts } from "@veldica/prose-tokenizer";
import type { StructuralMetrics, SentenceDetail, ParagraphDetail } from "./types.js";

/**
 * A robust analyzer that produces StructuralMetrics from raw text.
 * This serves as a "bridge" utility to quickly get readability scores.
 * 
 * Performance & Architecture:
 * - Integrates @veldica/prose-tokenizer for high-precision, deterministic splitting.
 * - Uses O(N) Quickselect for median calculations.
 * - Uses an internal size-limited syllable cache to optimize throughput.
 */
export function getStructuralMetrics(text: string): StructuralMetrics {
  const paragraphs = splitParagraphs(text);
  const structureCounts = getStructureCounts(text);
  
  const paragraphDetails: ParagraphDetail[] = [];
  const sentenceDetails: SentenceDetail[] = [];
  
  let totalSyllableCount = 0;
  let totalPolysyllableCount = 0;
  let totalComplexWordCount = 0;
  let totalDifficultWordCount = 0;
  let totalLetterCount = 0;
  let totalLongWordCount = 0;
  const uniqueWordsMap = new Map<string, number>();

  paragraphs.forEach((pText, pIndex) => {
    const sentences = splitSentences(pText);
    let pWordCount = 0;
    
    sentences.forEach((sText) => {
      const words = splitWords(sText);
      let sSyllableCount = 0;
      let sComplexWordCount = 0;
      let sDifficultWordCount = 0;

      words.forEach(wordStr => {
        const lowerWord = wordStr.toLowerCase();
        const syllables = countSyllables(wordStr);
        
        pWordCount++;
        sSyllableCount += syllables;
        totalLetterCount += wordStr.length;
        
        uniqueWordsMap.set(lowerWord, (uniqueWordsMap.get(lowerWord) || 0) + 1);

        if (syllables >= 3) {
          sComplexWordCount++;
          totalPolysyllableCount++;
          totalComplexWordCount++;
        }

        if (wordStr.length >= 7) {
          totalLongWordCount++;
        }

        if (!DALE_CHALL_EASY_WORDS.has(lowerWord)) {
          sDifficultWordCount++;
          totalDifficultWordCount++;
        }
      });

      sentenceDetails.push({
        index: sentenceDetails.length,
        text: sText,
        word_count: words.length,
        syllable_count: sSyllableCount,
        complex_word_count: sComplexWordCount,
        difficult_word_count: sDifficultWordCount
      });

      totalSyllableCount += sSyllableCount;
    });

    paragraphDetails.push({
      index: pIndex,
      text: pText,
      word_count: pWordCount,
      sentence_count: sentences.length
    });
  });

  const wordCount = structureCounts.word_count;
  const sentenceCount = sentenceDetails.length;
  const paragraphCount = paragraphDetails.length;

  const sentenceWordCounts = sentenceDetails.map(s => s.word_count);
  const paragraphWordCounts = paragraphDetails.map(p => p.word_count);

  const topRepeatedWords = Array.from(uniqueWordsMap.entries())
    .map(([word, count]) => ({ word, count, ratio: round(count / wordCount, 4) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    counts: {
      word_count: wordCount,
      unique_word_count: uniqueWordsMap.size,
      sentence_count: sentenceCount,
      paragraph_count: paragraphCount,
      heading_count: structureCounts.heading_count,
      list_item_count: structureCounts.list_item_count,
      character_count: structureCounts.character_count,
      character_count_no_spaces: structureCounts.character_count_no_spaces,
      letter_count: structureCounts.letter_count,
      syllable_count: totalSyllableCount,
      polysyllable_count: totalPolysyllableCount,
      complex_word_count: totalComplexWordCount,
      difficult_word_count: totalDifficultWordCount,
      long_word_count: totalLongWordCount,
      reading_time_minutes: round(wordCount / 200, 2)
    },
    sentence_metrics: {
      avg_words_per_sentence: round(safeDivide(wordCount, sentenceCount)),
      median_words_per_sentence: calculateMedian(sentenceWordCounts),
      min_words_per_sentence: sentenceWordCounts.length > 0 ? Math.min(...sentenceWordCounts) : 0,
      max_words_per_sentence: sentenceWordCounts.length > 0 ? Math.max(...sentenceWordCounts) : 0,
      sentence_length_p90: 0,
      sentence_length_p95: 0,
      sentence_length_stddev: 0,
      sentences_over_20_words: sentenceWordCounts.filter(c => c > 20).length,
      sentences_over_25_words: sentenceWordCounts.filter(c => c > 25).length,
      sentences_over_30_words: sentenceWordCounts.filter(c => c > 30).length,
      sentences_over_40_words: sentenceWordCounts.filter(c => c > 40).length,
      percent_sentences_over_20_words: round(safeDivide(sentenceWordCounts.filter(c => c > 20).length, sentenceCount)),
      percent_sentences_over_25_words: round(safeDivide(sentenceWordCounts.filter(c => c > 25).length, sentenceCount)),
      percent_sentences_over_30_words: round(safeDivide(sentenceWordCounts.filter(c => c > 30).length, sentenceCount)),
      percent_sentences_over_40_words: round(safeDivide(sentenceWordCounts.filter(c => c > 40).length, sentenceCount))
    },
    paragraph_metrics: {
      avg_words_per_paragraph: round(safeDivide(wordCount, paragraphCount)),
      median_words_per_paragraph: calculateMedian(paragraphWordCounts),
      min_words_per_paragraph: paragraphWordCounts.length > 0 ? Math.min(...paragraphWordCounts) : 0,
      max_words_per_paragraph: paragraphWordCounts.length > 0 ? Math.max(...paragraphWordCounts) : 0,
      paragraph_length_p90: 0,
      paragraph_length_p95: 0,
      paragraph_length_stddev: 0,
      paragraphs_over_75_words: paragraphWordCounts.filter(c => c > 75).length,
      paragraphs_over_100_words: paragraphWordCounts.filter(c => c > 100).length,
      paragraphs_over_150_words: paragraphWordCounts.filter(c => c > 150).length,
      percent_paragraphs_over_75_words: round(safeDivide(paragraphWordCounts.filter(c => c > 75).length, paragraphCount)),
      percent_paragraphs_over_100_words: round(safeDivide(paragraphWordCounts.filter(c => c > 100).length, paragraphCount)),
      percent_paragraphs_over_150_words: round(safeDivide(paragraphWordCounts.filter(c => c > 150).length, paragraphCount)),
      avg_sentences_per_paragraph: round(safeDivide(sentenceCount, paragraphCount)),
      median_sentences_per_paragraph: 0,
      max_sentences_per_paragraph: 0
    },
    lexical: {
      lexical_diversity_ttr: round(safeDivide(uniqueWordsMap.size, wordCount), 4),
      lexical_diversity_mattr: 0,
      lexical_density: 0,
      unique_word_count: uniqueWordsMap.size,
      repetition_ratio: round(1 - safeDivide(uniqueWordsMap.size, wordCount), 4),
      top_repeated_words: topRepeatedWords,
      avg_characters_per_word: round(safeDivide(structureCounts.letter_count, wordCount)),
      avg_syllables_per_word: round(safeDivide(totalSyllableCount, wordCount)),
      long_word_ratio: round(safeDivide(totalLongWordCount, wordCount)),
      complex_word_ratio: round(safeDivide(totalComplexWordCount, wordCount)),
      difficult_word_ratio: round(safeDivide(totalDifficultWordCount, wordCount))
    },
    scannability: {
      heading_density: round(safeDivide(structureCounts.heading_count, wordCount), 4),
      words_per_heading: structureCounts.heading_count > 0 ? round(safeDivide(wordCount, structureCounts.heading_count)) : null,
      list_density: round(safeDivide(structureCounts.list_item_count, wordCount), 4),
      words_between_breaks: round(safeDivide(wordCount, structureCounts.paragraph_count + structureCounts.heading_count + structureCounts.list_item_count)),
      wall_of_text_risk: paragraphWordCounts.some(c => c > 100) ? "high" : "low",
      paragraph_scannability_score: 100, // Placeholder
      sentence_tail_risk_score: 0 // Placeholder
    },
    sentences: sentenceDetails,
    paragraphs: paragraphDetails
  };
}
