# Integration tests

Integration tests cover BFF flows: form validation → persistence → CRM/email,
BFF endpoints, and the RAG pipeline with a mocked provider
(docs/PROJECT_BIBLE.md §32).

**Status:** pending. These require infrastructure that is blocked on open
decisions — CRM (DA-2), hosting/runtime (DA-3), PostgreSQL (DA-5), embeddings
(DA-10). They will be added in F1 alongside the BFF, using provider mocks.

The `npm run test:integration` script already targets this folder; it passes
with no tests until the first suites land here.
