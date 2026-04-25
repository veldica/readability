# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-04-24

### Fixed
- Corrected copyright holder in `LICENSE` from Veldica to Veldica.

## [1.1.0] - 2026-04-24

### Added
- `getStructuralMetrics` bridge utility to generate formula inputs directly from raw text.
- Enhanced `README.md` with "Quick Start" examples for both automatic and manual analysis.
- Explicit documentation for `DALE_CHALL_EASY_WORDS` as a `Set` for performance.

## [1.0.0] - 2026-04-24

### Added
- Initial release of consolidated readability formulas.
- Supported metrics: Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog, SMOG, Coleman-Liau, ARI, Dale-Chall, Linsear Write, and Type-Token Ratio.
- Deterministic consensus scoring.
- TypeScript support with full type definitions.
- Sub-module exports for optimal tree-shaking.
