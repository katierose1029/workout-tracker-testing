# workout-tracker-testing

End-to-end tests for [workout-tracker](https://github.com/katierose1029/workout-tracker), written with [Playwright](https://playwright.dev). This repo is also a place to learn Playwright, so the tests are numbered lessons with comments explaining each idea.

## Quick start

```bash
npm install
npx playwright install chromium   # downloads the browser (once)
npm run app:fetch                 # clones the app into ./app
npm test                          # runs every test on desktop and phone sizes
```

Other ways to run:

| Command | What it does |
| --- | --- |
| `npm run test:ui` | **Start here.** Opens Playwright's UI: pick a test, watch it step by step, time-travel through each action. |
| `npm run test:headed` | Runs with a visible browser window. |
| `npx playwright test tests/03-logging.spec.ts` | Runs one file. |
| `npx playwright test -g "notes"` | Runs tests whose name matches. |
| `npx playwright test --project=mobile` | Only the phone-sized run. |
| `npx playwright test --debug` | Pauses on each step with the inspector. |
| `npx playwright codegen http://127.0.0.1:4173` | Click around the app and Playwright writes the test code for you (start `npm run serve` first). |
| `npm run report` | Opens the HTML report from the last run. |

To test a branch of the app: `APP_REF=my-branch npm run app:fetch`.
To test the live site instead of a local copy: `BASE_URL=https://katierose1029.github.io/workout-tracker npm test`.

## How it works

- `scripts/fetch-app.mjs` clones the app into `app/` (ignored by git).
- `scripts/serve.mjs` serves `app/` at http://127.0.0.1:4173. Playwright starts it for you (`webServer` in `playwright.config.ts`).
- `tests/fixtures.ts` runs before every test and:
  - **freezes the clock** at Tuesday, 10 March 2026, so "today" never changes;
  - **blocks Firebase**, so the app runs in "on this device" mode and saves to `localStorage`. Tests never sign in or touch real data;
  - blocks Google Fonts so tests don't need the internet.
- Each test gets a brand-new browser context (empty `localStorage`), so tests can't affect each other.

## The lessons

| File | Covers |
| --- | --- |
| `tests/01-smoke.spec.ts` | `goto`, `getByRole`, auto-retrying `expect`, catching page errors |
| `tests/02-navigation.spec.ts` | `click`, `beforeEach`, `describe`, asserting `aria-pressed` / `aria-current` |
| `tests/03-logging.spec.ts` | `fill`, `check`, scoping locators with `filter({ has })`, `reload` to prove data persists |
| `tests/04-settings.spec.ts` | downloads, file uploads with `setInputFiles`, confirm dialogs, `page.evaluate` |

### Ideas for your next tests
1. **Progress tab** – log a few sets on different days and check the chart / stats.
2. **Substitute an exercise** – click "⇄ Substitute", pick a replacement, check the heading changes.
3. **Cycle tracking** – turn it on/off in Settings and check the Today page.
4. **Start a new month** – the "Start a new month" dialog in Settings.
5. **CSV export** – download it and check the header row.
6. **Visual check** – `await expect(page).toHaveScreenshot()` saves a reference image and fails if the page later looks different.

Tips:
- Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors. Use `codegen` or the UI mode's locator picker to find them.
- Don't use `page.waitForTimeout()`. `expect(...)` already waits.
- If a test is flaky, run it with `--repeat-each=20` to reproduce, then open the trace (`npx playwright show-trace`).

## CI

`.github/workflows/playwright.yml` runs the tests on every push, once a day (to catch app changes), and on demand from the Actions tab, where you can choose which app branch to test. The HTML report is uploaded as a build artifact.
