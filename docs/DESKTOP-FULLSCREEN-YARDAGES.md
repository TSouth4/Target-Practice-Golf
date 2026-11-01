# Desktop fullscreen yardages — 17.18.2

Desktop fullscreen views (at least 1024 px wide and over 500 px tall) now place Front / Flag / Back in a centered strip at the top, between the hole heading and view controls. Wind/ground stays alongside the yardages. The strip has a responsive width, up to 760 px.

Dogleg corner and fairway-edge distances occupy their own row beneath it. Previously the dogleg panel could consume most of the narrow flex row, squeezing green yardages so severely that labels and numbers wrapped. The grid layout reserves a separate row for those extra facts.

Normal views, phone portrait and short landscape layouts retain Work's existing spacing. Distance calculations, scoring, controls, saved rounds and model versions are unchanged. This is a CSS-only application change plus a newly prepared matching asset entry.

## Verification

- Syntax checks passed; four focused native regression files passed: dogleg distances, conditions UI, course setup and assessment report UI.
- Chromium checked the same fixed dogleg at 1920×1080, 1440×900, 1280×720 and 1024×768: strip centered at the top, no header/control collision, no wrapped distance numbers, dogleg facts on a separate row, identical distance text before/after fullscreen.
- Phone/short-landscape samples at 390×844, 320×740 and 844×390 retained visible distances and dogleg facts, with no horizontal page overflow or page errors.
- Learning, assessment and Par-3 progress remained visible and clear of the green-distance strip at 1440 and 1024 px.
- Desktop screenshot inspected. Physical-device/Safari verification remains useful; the full model suite was not repeated for this presentation-only change.
- Asset preparation reproduced a complete matching 44-file release, `8c7257669b27ffb0`; root sources and every generated copy were compared byte for byte. Existing older releases were retained locally.

Browser checks are retained as `scripts/browser-review/desktop-yardage-strip.cjs` and `desktop-yardage-modes.cjs`, using the existing Playwright/base-URL environment settings.

## Delivery

Based on reconciled hosted 17.18.1. Run `npm run prepare:assets` before preview/publishing, publish the complete matched dist and retain existing release folders as described in DEPLOYMENT.md. The review branch has not been deployed; hosting identity and access remain unchanged.
