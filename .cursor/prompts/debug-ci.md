# Debug CI Failure Prompt

Use this prompt when CI fails:

---

## Context
My CI pipeline failed on GitHub Actions.

## What I Need
Help me debug and fix the failure.

## Information
- **Workflow Run:** [run number or link]
- **Failed Job:** [job name if known, otherwise "unknown"]
- **Branch:** [branch name]

## What You Should Do

1. **Read Configuration:**
   - Read `.github/ci-config.json`
   - Understand the pipeline structure

2. **Identify the Problem:**
   - If I don't know which job failed, guide me to download `ci-final-report`
   - Read `ci-report.json` to see all job statuses
   - Identify which job(s) failed

3. **Locate the Artifact:**
   - Based on failed job, tell me which artifact to download
   - Use `config.jobs[job_name].artifacts` to find it

4. **Guide Me Through Analysis:**
   - Tell me exactly which file to open
   - Parse the JSON report
   - Extract specific errors

5. **Provide Solutions:**
   - For each error, give specific fix
   - Show local commands to test
   - Explain how to verify fix

6. **Prevention:**
   - Suggest how to catch this before CI next time

## Example Workflow

If Code Quality failed:
1. Download `quality-reports` artifact
2. Open `eslint-report.json`
3. Parse errors
4. Fix with `npm run lint -- --fix`
5. Manual fixes for remaining
6. Verify with `npm run lint`
7. Push again

## Please Start

Read `.github/ci-config.json` and guide me through debugging this CI failure.
