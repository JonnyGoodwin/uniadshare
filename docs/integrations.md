# Integrations

This document covers webhook delivery for sponsor integrations and admin-facing API access.

## Sponsor Webhook Delivery
When a lead is ingested (`POST /api/leads`), the system enqueues deliveries to all sponsors on the pod. If a pod has no sponsors, it uses `WEBHOOK_DEFAULT_ENDPOINT`.

### Request
- Method: `POST`
- Content-Type: `application/json`
- Retries: up to 3 attempts, 5s timeout per attempt, linear backoff (`100ms * attempt`).

Payload shape:
```json
{
  "lead": {
    "id": "uuid",
    "email": "user@example.com",
    "podId": "uuid",
    "landingPageVersionId": "uuid",
    "disclosureVersionId": "uuid",
    "disclosureHash": "sha256-hex",
    "metadata": {
      "utmSource": "newsletter",
      "utmMedium": "email",
      "utmCampaign": "spring-promo",
      "utmTerm": "string",
      "utmContent": "string",
      "referrer": "string",
      "clickId": "string",
      "ip": "string",
      "userAgent": "string"
    }
  },
  "sponsor": {
    "id": "uuid",
    "role": "primary"
  }
}
```
Notes:
- `landingPageVersionId`, `disclosureVersionId`, and `metadata` are optional depending on the intake request.
- A non-2xx response is treated as failed and retried.

### Response Expectations
Any 2xx response marks the delivery as `sent`. Non-2xx or network errors mark it as `failed` after retries.

## Admin API Access
Admin endpoints (e.g., `GET /api/deliveries`, `GET /api/consent`) require `x-admin-key` if `ADMIN_API_KEY` is set in the backend environment. Set `VITE_ADMIN_KEY` in the frontend to pass this header automatically.

### Consent Evidence Endpoint
- Endpoint: `GET /api/consent`
- Auth: `x-admin-key` required when backend `ADMIN_API_KEY` is configured.
- Query params:
  - `email` (required, valid email)
  - `podId` (optional)

Response shape:
```json
{
  "leads": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "podId": "uuid",
      "landingPageVersionId": "uuid",
      "disclosureVersionId": "uuid",
      "metadata": {
        "ip": "string",
        "userAgent": "string"
      },
      "consentedAt": "2026-01-01T00:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```
