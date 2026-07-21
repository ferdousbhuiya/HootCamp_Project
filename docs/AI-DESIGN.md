# AI Design

## Purpose

AI converts unstructured career documents into transparent, actionable recommendations. It does not make hiring decisions; it provides guidance that users can inspect and edit.

## Provider strategy

```text
Document text
    ↓
Local LM Studio (development)
    ↓ failure/unavailable
Configured cloud provider (production fallback)
    ↓
JSON parsing and validation
    ↓
Skills and match results
```

LM Studio uses an OpenAI-compatible local endpoint:

```text
LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODEL=llama-3.2-3b-instruct
```

Local inference is optional. Slow or unavailable local hardware must not block application development; production can use the configured cloud provider.

## Skill extraction flow

1. Server extracts text from PDF, DOCX, or TXT.
2. Parser trims and normalizes text.
3. Prompt asks model to identify explicit skills only.
4. Model returns structured JSON.
5. Parser validates fields and confidence ranges.
6. Valid skills are saved with source and confidence metadata.
7. User can edit or delete results.

## Expected skill output

```json
{
  "skills": [
    {
      "name": "SQL",
      "category": "Database",
      "confidence": 0.88,
      "evidence": "Built reporting queries for customer data"
    }
  ]
}
```

Rules:

- `name` must be concise and non-empty.
- `category` describes skill family.
- `confidence` is normalized from 0 to 1.
- Evidence should refer to document content.
- Unknown or unsupported fields are ignored.

## Match generation

Matcher compares user skills against a curated recommendation prompt. Each result includes:

- match type
- title
- organization/provider when available
- score
- matched skills
- missing skills
- explanation

This keeps recommendations explainable instead of returning an opaque score.

## Reliability controls

- Provider timeout and catch path.
- Automatic fallback when local provider fails.
- JSON extraction from model response.
- Schema validation before database persistence.
- Safe empty-state when no skills are found.
- User-editable output to correct false positives.

## Limitations

- Model may miss implicit skills.
- Confidence is model-generated, not a certified probability.
- Recommendations can become stale.
- Small local models may produce slower or less complete output.
- Results require human review before career decisions.

## Privacy

Documents contain sensitive personal information. Processing should use minimum necessary text, keep keys server-side, protect database rows with RLS, and avoid logging raw resume content.
