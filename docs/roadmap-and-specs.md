# Standard18 BACS – Feature Reference & Roadmap

## 1. Project Status (Current)

✅ **Shared** – Types, constants, field specs, utility functions  
✅ **Parser** – Converts raw Standard18 text → typed `BacsFile`  
✅ **Validator**  
   - Level 1: File emptiness  
   - Level 2: Record order (header/trailer)  
   - Level 3: Record length checks  
   - Level 4: Field validation (allowed values, custom validators for sort code, account, date, amount, SUN)  
   - Level 5: Basic business rules (EOF totals, duplicate references, contra)  
✅ **REST API** (`apps/api`)  
   - `/validate` and `/parse` endpoints with Swagger  
   - Zod validation, file upload support, Pino logging  
   - CORS, helmet, compression  

🟡 **Pending** – Analyzer, Generator, Repair, CLI, advanced business rules, test coverage >90%

---

## 2. Overall Roadmap (Phases)

### Phase 1 – Complete Validator + Analyzer (next)
- Extend business rules (detailed below)
- Build `@standard18/analyzer` package
- Expose `/analyze` endpoint
- Achieve >90% unit test coverage on validator, parser, shared

### Phase 2 – Generation & Repair
- `@standard18/generator` – JSON → Standard18 string
- `@standard18/repair` – auto‑fix spacing, padding, record lengths
- API endpoints `/generate`, `/repair`

### Phase 3 – Production Hardening
- Rate limiting, API key auth (if needed)
- Docker containerisation
- CI/CD (GitHub Actions) for lint, test, build
- Performance profiling for large files

### Phase 4 – Developer Tools
- CLI (`bacs validate`, `bacs analyze`, etc.)
- VS Code extension (real‑time validation)
- Comprehensive documentation site (Docusaurus/MkDocs)

---

## 3. Analyzer Package – Full Specification

### Purpose
Provide statistical analysis of a BACS Standard 18 file without full validation.  
It answers: “What’s inside this file?” – totals, breakdowns, potential issues.

### Data Model

```ts
export interface AnalyzerResult {
  fileInfo: {
    recordCount: number;
    controlRecords: number;
    dataRecords: number;
    currency: string;
    processingDate: string;
    fileLabel: string;
    originatorName: string;
    originatorSortCode: string;
    originatorAccountNumber: string;
  };
  payments: {
    totalCount: number;
    totalAmount: number;
    creditCount: number;
    creditAmount: number;
    debitCount: number;
    debitAmount: number;
    averageAmount: number;
  };
  destinationSummary: {
    uniqueSortCodes: number;
    uniqueAccounts: number;
    topDestinations: { sortCode: string; accountNumber: string; totalAmount: number; count: number }[];
  };
  duplicates: {
    duplicateReferences: string[];
    duplicateSUNs: string[];
    duplicateAmountAccountPairs: { account: string; amount: number; count: number }[];
  };
  warnings: AnalysisWarning[];
}

export interface AnalysisWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning';
}

// Working on workcode