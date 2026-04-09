## Summary
- [ ] Briefly describe the problem and solution

## Validation
- [ ] Local tests run
- [ ] CI checks pass

## Migration Safety Checklist
- [ ] Schema changes include an Alembic migration
- [ ] Migration upgrade path validated on existing DB state
- [ ] Migration handles local/dev sqlite edge cases (if applicable)
- [ ] Startup/runtime behavior is safe when schema is stale
- [ ] Rollback/downgrade path considered

## Risk
- [ ] Backward compatibility reviewed
- [ ] Operational impact reviewed

## Production Promotion Checklist
- [ ] Staging deploy completed successfully
- [ ] Post-deploy staging smoke completed successfully
- [ ] Role management flows validated
- [ ] Role audit JSON and CSV validated
- [ ] Rollback trigger and owner assigned

## Migration safety
<!-- Required for any PR that touches alembic/versions/ or app/models/ -->

### Schema change evidence
<!-- Fill this section when schema changes exist -->

- Migration revision(s):
- Local commands run:
	- `python -m alembic upgrade head`
	- `python -m alembic downgrade -1`
	- `python -m alembic upgrade head`
- Startup schema guard result:

### Risk declaration
<!-- Explicitly call out destructive or high-risk operations -->

- [ ] No destructive operations in this PR
- [ ] Contains destructive operations (requires explicit reviewer sign-off)
- Destructive operations details (if any):

- [ ] New migration is backwards-compatible (columns are nullable or have a server default)
- [ ] `alembic upgrade head` runs cleanly on a fresh DB
- [ ] `alembic upgrade head` runs cleanly on an existing DB with live data (or N/A)
- [ ] `alembic downgrade -1` is implemented and tested (or downgrade path documented)
- [ ] Schema guard in `backend/app/startup.py` still passes after migration
- [ ] No data-destructive operations (DROP COLUMN, truncation) without explicit sign-off

<!-- If this PR has NO schema changes, check the box below and delete the checklist above. -->
- [ ] No schema changes in this PR
