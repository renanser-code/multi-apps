# Tanium Generator Maintenance

These instructions apply to changes to the Tanium generator, not unrelated apps.

- Read the current GitHub main before editing and preserve other changes.
- Run `npm run test:tanium` before publishing. Keep a rollback reference.
- Publish authorized generator changes to GitHub; do not ask the user to paste code.
- Update the local working distribution in `%USERPROFILE%\OneDrive - Claranet\Documentos\Manuais` as part of every generator delivery. If this directory is unavailable, report the local delivery as incomplete.
- Back up local files before replacing them. Preserve unrelated files.
- Synchronize the main HTML, its tests, KB catalogs, package manifests and relevant scripts. Keep an existing `_visa.html` copy identical to the main HTML to avoid a stale alternate entry point.
- Verify SHA-256 equality between the local distribution and the committed generator artifacts. Do not publish local evidence, credentials or private validation fixtures.
- Check the public GitHub Pages HTML separately from GitHub main. Report deployment as pending until the public content has been verified.
- Distinguish targets selected for Tanium from evidence that patches were actually applied.
