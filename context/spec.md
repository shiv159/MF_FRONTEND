# UI Form Spec — Risk Profile & Manual Selection

**Last updated:** 2025-12-29

**TL;DR:** This spec maps backend DTOs and validations into UI fields, labels, controls, client validations, error handling, UX notes, example payloads, and file references so UI engineers can implement forms matching backend expectations and reducing validation round-trips.

---

## 1) Risk Profile — Form Spec

**Endpoint:** `POST /api/onboarding/risk-profile`  
**Controller / DTO:** `OnboardingController` / `RiskProfileRequest`  
**Response highlights:** `riskProfile` (score, level, rationale), `assetAllocation` (equity, debt, gold), `recommendations`, `portfolioHealth`.

### Structure
- `demographics` (object) — required  
- `financials` (object) — required  
- `behavioral` (object) — required  
- `goals` (object) — required  
- `preferences` (object) — optional

### Fields (table)

| JSON property | Label | Type | Example | Required | Validation | UI control | Help text |
|---|---|---:|---:|---:|---|---|---|
| `demographics.age` | **Age** | integer | `30` | **Yes** | Min `18` | number (min=18) | "Enter age (≥18)" |
| `demographics.incomeRange` | **Income range** | string | `"15L-25L"` | **Yes** | NotNull | dropdown (preferred) | "Select income range" |
| `demographics.dependents` | **Dependents** | integer | `1` | **Yes** | Min `0` | number |  |
| `financials.emergencyFundMonths` | **Emergency fund (months)** | integer | `6` | **Yes** | Min `0` | number | "Months of emergency fund" |
| `financials.existingEmiForLoans` | **Existing EMI (monthly)** | number | `15000.0` | No | Min `0` | currency input | "Optional: current EMI" |
| `financials.financialKnowledge` | **Financial knowledge** | string (enum) | `"INTERMEDIATE"` | No | Suggested enums: `BEGINNER, INTERMEDIATE, ADVANCED` | dropdown |  |
| `financials.monthlyInvestmentAmount` | **Monthly investment (SIP)** | number | `10000.0` | No | Min `500` (if provided) | currency input | "Monthly SIP amount (min ₹500)" |
| `behavioral.marketDropReaction` | **Reaction to market drop** | string (enum) | `"BUY_MORE"` | **Yes** | NotNull: `BUY_MORE/HOLD/SELL/PANIC_SELL` | radio / dropdown | "How would you react to a 30% market drop?" |
| `behavioral.investmentPeriodExperience` | **Investment experience** | string | `"3-5_YEARS"` | No | free text / picklist | dropdown |  |
| `goals.primaryGoal` | **Primary goal** | string | `"RETIREMENT"` | **Yes** | NotNull | dropdown/text |  |
| `goals.timeHorizonYears` | **Time horizon (years)** | integer | `20` | **Yes** | Positive | number |  |
| `goals.targetAmount` | **Target amount** | number | `10000000.0` | No | Positive | currency input |  |
| `preferences.preferredInvestmentStyle` | **Investment style** | string | `"PASSIVE"` | No | Suggested: `ACTIVE/PASSIVE/HYBRID` | dropdown |  |
| `preferences.taxSavingNeeded` | **Tax saving required** | boolean | `false` | No |  | toggle |  |

### Example request (Risk Profile)
```json
{
  "demographics": {"age":30,"incomeRange":"15L-25L","dependents":1},
  "financials":{"emergencyFundMonths":6,"existingEmiForLoans":15000,"financialKnowledge":"INTERMEDIATE","monthlyInvestmentAmount":10000},
  "behavioral":{"marketDropReaction":"BUY_MORE","investmentPeriodExperience":"3-5_YEARS"},
  "goals":{"primaryGoal":"RETIREMENT","timeHorizonYears":20,"targetAmount":10000000},
  "preferences":{"preferredInvestmentStyle":"PASSIVE","taxSavingNeeded":false}
}




- **Endpoint:** `POST /api/portfolio/manual-selection`  
- **Controller / DTO:** `ManualSelectionController` / `ManualSelectionRequest`  
- **Key invariants:**  
  - Exactly one of `fundId` or `fundName` per item (XOR).  
  - Sum of all `weightPct` must equal **100** (server-enforced).

> ⚠️ Important: Server rejects submissions where XOR or weight-sum rules fail. Validate on client to avoid failed POSTs.

---

## Request structure & example 🔁

Top-level:
```json
{
  "selections": [
    {
      "fundId": "uuid-or-null",
      "fundName": "string-or-null",
      "weightPct": 40
    }
  ]
}
```

Example payload:
```json
{
  "selections": [
    { "fundId": "c1a8cafe-0000-0000-0000-000000000001", "weightPct": 60 },
    { "fundName": "HDFC Mid-Cap Opportunities Fund", "weightPct": 40 }
  ]
}
```

---

## Field-level spec (copyable) 🧾

| JSON property | **Label** | Type | Example | Required | Validation | UI control | Notes |
|---|---|---:|---:|---:|---|---|---|
| `fundId` | Fund (ID) | UUID | `c1a8...` | XOR w/ `fundName` | Optional; if provided must resolve to fund | Autocomplete select (stores `fundId`) | Prefer selection via search (resolves `fundId`) |
| `fundName` | Fund name | string | `HDFC Mid-Cap Opportunities Fund` | XOR w/ `fundId` | Optional; triggers ETL resolution | Free-text input (or manual entry mode) | Server will call ETL to resolve/create fund |
| `weightPct` | Weight (%) | integer | `40` | **Yes** | Integer, Min 1, Max 100; sum of all items == 100 | Number input (integer) | Server requires total == 100; client should enforce live |

---

## Expected response (summary) ✅

- **200 OK**: Returns:
  - `results[]` — per-item status objects:
    - `inputFundId`, `inputFundName`
    - `status` (e.g., `RESOLVED_FROM_DB`, `ENRICHED_FROM_ETL`, `CREATED_FROM_ETL`, `ERROR`)
    - `fundId`, `fundName`, `isin`, `message`
  - `portfolio` — summary (totalHoldings, totalWeightPct, holdings list)
  - `analysis` — portfolio health/analytics (optional)

Sample per-item result:
```json
{
  "inputFundId": null,
  "inputFundName": "HDFC Mid-Cap Opportunities Fund",
  "status": "ENRICHED_FROM_ETL",
  "fundId": "c1a8cafe-0000-0000-0000-000000000002",
  "fundName": "HDFC Mid-Cap Opportunities Fund",
  "isin": "INF0000XYZ",
  "message": "Enriched and upserted"
}
```

---

## Error mapping & examples ⚠️

- **400 Bad Request** — validation errors:
  - Example: total weights ≠ 100
  - Example body:
    ```json
    {
      "status": 400,
      "message": "Validation failed",
      "errors": [
        { "field": "selections", "message": "Total weightPct must equal 100. Received: 90" }
      ]
    }
    ```
- **404 Not Found** — invalid `fundId`.
- **409 Conflict** — duplicate/constraint conflicts.
- **503 Service Unavailable** — ETL / enrichment failure (retryable).
- **500 Internal Server Error** — generic server error.

UI handling rules:
- Map 400 field errors to inline messages.
- For 503 ETL errors: show a prominent banner with "Retry" and optionally persist rows to retry later.
- For 409/500: show modal / notification with explanation and contact option.

---

## UI behaviors & recommendations 💡

- Row editor layout:
  - Column 1: Fund selector (autocomplete) OR manual fund name (mutually exclusive).
  - Column 2: ISIN (read-only if resolved).
  - Column 3: Weight (%) — integer input.
  - Column 4: Status/message (after submit).
  - Actions: Remove / Reorder row.

- Autocomplete details:
  - Use GET `/api/funds?query=<text>` (catalog search).
  - Debounce 300–500ms, show `fundName`, `amc`, `isin`.
  - Selecting an item sets `fundId` (hidden) and prefills `fundName`.

- XOR enforcement:
  - Provide UI that makes it clear you can either "Select from catalog" OR "Enter fund name".
  - Disable the alternate field when one is used.

- Weight handling:
  - Live running total displayed persistently.
  - Use color indicators: red if <100 or >100, green when =100.
  - Prevent submit until total == 100.

- Submit UX:
  - Confirm modal: "Replacing holdings will remove existing holdings and insert these selections. Proceed?"
  - Show per-item progress statuses and a final summary on success.
  - If ETL operation is slow, show spinner and allow asynchronous polling or retry.

---

## Edge cases & rules to clarify with backend

1. Are fractional weights (decimals) allowed or only integers DTO uses Integer — confirm.  
  
3. On ETL-created funds (`CREATED_FROM_ETL`), should UI present a special notification?  -NO


---

## File references & Postman 📁

- Controller: `ManualSelectionController.java` — POST `/api/portfolio/manual-selection`  
- DTOs: `ManualSelectionRequest`, `ManualSelectionItemRequest`, `ManualSelectionResult`  
- Service: `ManualSelectionService.replaceHoldingsWithManualSelection` (validation, ETL enrichment, upsert)  


---

> **Note:** Server strictly enforces XOR of `fundId`/`fundName` and that total `weightPct` == 100. Client-side enforcement significantly reduces failed requests.

---

