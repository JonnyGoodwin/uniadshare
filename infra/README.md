# Infra & CI/CD

Place infrastructure-as-code, CI workflows, and deployment config here.

- Add CI templates (lint, test, build) under `infra/ci/`.
- Keep secrets and environment variables out of the repo; document required keys and rotation in `infra/config.md`.
- For IaC (Terraform, Pulumi, etc.), create dedicated subfolders and provide state/backing service notes.
