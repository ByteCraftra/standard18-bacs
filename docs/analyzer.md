# Analyzer Package

## Purpose
The `@standard18/analyzer` package provides statistical analysis of a parsed BACS Standard 18 file. It answers questions like:
- How many payments are in the file?
- What is the total value of credits and debits?
- Which destination accounts receive the most money?
- Are there duplicate references or amounts?

## API
### `analyze(bacsFile: BacsFile): AnalyzerResult`
Takes a parsed `BacsFile` (from `@standard18/parser`) and returns an analysis result.

## Data Model
See `packages/analyzer/src/types.ts` for the full `AnalyzerResult` interface. Key sections:
- `fileInfo` – record counts, processing date, originator details
- `payments` – debit/credit counts and amounts, averages
- `destinations` – unique accounts and top 10 by total amount
- `duplicates` – duplicate references and amount+account pairs
- `warnings` – informational warnings (e.g., large payments, multiple payments to same account)

## Integration
Used by the REST API endpoint `POST /api/v1/analyze`. The endpoint accepts the same inputs as `/validate` and `/parse` (file upload or JSON `{ content }`).

## Limitations
- Currently only supports 100-byte data record format; 106-byte analysis will be added later.
- `duplicateSUNs` is not applicable because the current file variant does not include SUN in data records; it is omitted from the result.
- Warnings are basic; more sophisticated analysis (e.g., machine learning for anomaly detection) is outside the scope.