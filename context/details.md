
---

## Quick facts 🔧
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

## Edge cases & rules to clarify with backend ❓

1. Are fractional weights  only integers DTO uses Integer — confirm.  

---

## File references & Postman 📁

- Controller: `ManualSelectionController.java` — POST `/api/portfolio/manual-selection`  
- DTOs: `ManualSelectionRequest`, `ManualSelectionItemRequest`, `ManualSelectionResult`  
- Service: `ManualSelectionService.replaceHoldingsWithManualSelection` (validation, ETL enrichment, upsert)  
- Postman examples: MutualFund_API.postman_collection.json → "Replace Holdings (Manual Selection)", "Search Funds (Catalog)"

---

> **Note:** Server strictly enforces XOR of `fundId`/`fundName` and that total `weightPct` == 100. Client-side enforcement significantly reduces failed requests.

6. **UX Best Practices**

- **Feature**	**Risk Profile**	**Manual Selection**
- **Form Type**	Multi-step wizard	Single-page dynamic list
- **Progress**	Step indicator dots	Weight total progress bar
- **Validation**	Per-step inline errors	Live XOR + sum validation
- **Loading**	Skeleton + spinner on submit	Per-row status indicators
- **Confirmation**	Summary before submit	Modal: "This replaces all holdings"
- **Success**	Charts + recommendations	Status table + analytics
- **Error**	Toast + highlight error step	Inline row errors + retry
- **Accessibility Checklist**
  - All inputs have associated labels (<label for="">)
  - Focus management between wizard steps
  - ARIA live regions for validation messages
  - Keyboard navigation for autocomplete
  - Screen reader announcements for chart data
  - Color contrast meets WCAG AA standards
  - Touch targets ≥ 44x44px on mobile


*Angular 20 + Tailwind + Chart.js Implementation*
*4.1 Component Architecture*
src/app/
├── features/
│   ├── risk-profile/
│   │   ├── risk-profile.component.ts       # Main wizard
│   │   ├── risk-profile.service.ts
│   │   ├── models/
│   │   │   ├── risk-profile-request.model.ts
│   │   │   └── risk-profile-response.model.ts
│   │   ├── steps/
│   │   │   ├── demographics-step.component.ts
│   │   │   ├── financials-step.component.ts
│   │   │   ├── behavioral-step.component.ts
│   │   │   ├── goals-step.component.ts
│   │   │   └── preferences-step.component.ts
│   │   └── result/
│   │       ├── risk-result.component.ts
│   │       ├── asset-allocation-chart.component.ts
│   │       ├── recommendations-list.component.ts
│   │       └── wealth-projection-chart.component.ts
│   └── manual-selection/
│       ├── manual-selection.component.ts   # Main form
│       ├── manual-selection.service.ts
│       ├── models/
│       │   ├── manual-selection-request.model.ts
│       │   └── manual-selection-response.model.ts
│       ├── components/
│       │   ├── selection-row.component.ts
│       │   ├── fund-search.component.ts
│       │   └── weight-total.component.ts
│       └── result/
│           ├── selection-result.component.ts
│           ├── portfolio-summary.component.ts
│           ├── holdings-list.component.ts
│           └── sector-chart.component.ts
└── shared/
    ├── components/
    │   ├── stepper.component.ts
    │   ├── currency-input.component.ts
    │   └── loading-skeleton.component.ts
    └── charts/
        ├── doughnut-chart.component.ts
        ├── line-chart.component.ts
        └── bar-chart.component.ts




        ┌─────────────────────────────────────────────────────────────┐
│  ● Demographics  ○ Financials  ○ Behavioral  ○ Goals  ○ Pref│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Tell us about yourself                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🎂 Age                                             │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │                    30                       │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  💰 Annual Income Range                             │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  ▼  15L - 25L                               │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  👨‍👩‍👧 Number of Dependents                          │    │
│  │          [ − ]      1      [ + ]                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                                        ┌────────────────┐   │
│                                        │    Next →      │   │
│                                        └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  🎯 Your Risk Profile                                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │    Score: 72/100        ┌──────────────────┐         │   │
│  │    ████████████████░░░░ │   AGGRESSIVE     │         │   │
│  │                         └──────────────────┘         │   │
│  │    "Based on your 20-year horizon and willingness    │   │
│  │     to buy more during market drops"                 │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │  Asset Allocation  │  │  Recommended Funds           │   │
│  │                    │  │                              │   │
│  │    ┌────────┐      │  │  📈 Large Cap (40%)          │   │
│  │    │ DONUT │      │  │  ┌────────────────────────┐  │   │
│  │    │ CHART │      │  │  │ HDFC Top 100 Fund      │  │   │
│  │    └────────┘      │  │  │ ⭐ Sharpe: 1.2         │  │   │
│  │                    │  │  └────────────────────────┘  │   │
│  │  ● Equity  70%     │  │                              │   │
│  │  ● Debt    20%     │  │  📊 Mid Cap (30%)            │   │
│  │  ● Gold    10%     │  │  ┌────────────────────────┐  │   │
│  │                    │  │  │ Axis Midcap Fund       │  │   │
│  └────────────────────┘  │  └────────────────────────┘  │   │
│                          └──────────────────────────────┘   │
│                                                             │
│  📈 Wealth Projection                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ╱─── Optimistic ₹1.2Cr                       │   │
│  │       ╱╱                                             │   │
│  │     ╱╱──── Expected ₹85L                             │   │
│  │   ╱╱                                                 │   │
│  │ ╱╱─────── Pessimistic ₹55L                           │   │
│  │╱                                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│    Year 1    Year 5    Year 10    Year 15    Year 20       │
└─────────────────────────────────────────────────────────────┘