# Software requirements (auto opt-in co-reg)
## 1) Subdomain landing page hosting (in your app)

Wildcard DNS: *.yourdomain.com → your app

Host-based routing: subdomain → Campaign/LP

Template-based page builder (start with 1–3 templates)

Draft/preview/publish + versioning

## 2) Form + disclosure (must be configurable per campaign)

Email capture form (optionally first name)

A required consent checkbox (or equivalent consent mechanism) with campaign-specific text

Disclosure block on the lander that clearly states:

the primary publisher you’re subscribing them to

the additional publishers they’ll also receive emails from (Co-reg A, Co-reg B)

links to each publisher’s privacy policy (and optionally terms)

Store the exact disclosure version shown (text hash/version id)

## 3) Consent ledger + audit trail (non-negotiable)

For every lead, persist:

Email

Timestamp

Campaign + page version

Disclosure text version/hash

Consent event (checkbox checked) timestamp

Source metadata (UTMs, referrer, click IDs)

IP + user agent (recommended)

This is what protects you and makes sponsor ops comfortable.

## 4) Lead routing + delivery (auto)

All base opt-ins delivered to:

Primary sponsor

Co-reg A

Co-reg B

Suppression lists per sponsor (recommended)

Upload hashed emails (SHA-256) or plaintext

If suppressed for a sponsor, do not deliver to that sponsor

Delivery methods (pick 1–2 first):

Webhook POST

Secure daily CSV download

(Optional) SFTP

## 5) Billing (clean + simple)

Because every opt-in goes to all sponsors (minus suppression), pricing can be dead simple:

Each sponsor pays $X per delivered lead

Monthly invoicing via Stripe

Metered counts are based on successful deliveries (net of suppression + bounces if you choose)

## 6) Reporting (minimum)

Per sponsor + campaign:

Total opt-ins generated

Net delivered (after suppression)

Delivery success rate

Effective CPL (if you track ad spend)