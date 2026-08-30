# BRAND STAGE DEFINITION OF DONE

Stage 2 is complete when all of the following are true:

- [x] identity direction is derived from the original product logo, not the old admin template.
- [x] canonical vector logo mark exists.
- [x] primary/horizontal/inverse/monochrome logo variants exist.
- [x] favicon exists.
- [x] PWA 192 and 512 assets exist.
- [x] maskable icon exists.
- [x] primary/fallback Arabic typography is defined.
- [x] core/semantic/surface tokens are versioned.
- [x] dark-mode token baseline exists.
- [x] focus/reduced-motion/touch-size accessibility baseline exists.
- [x] iconography and imagery rules are documented.
- [x] Admin and Student identity usage difference is documented.
- [x] TailAdmin product-brand dependency is rejected.
- [x] `python3 scripts/verify-brand.py` passes in CI.
- [x] canonical SVG files parse successfully.
- [x] PWA PNG dimensions are verified as 192x192 and 512x512.
- [x] identity JSON/palette/typography contracts match CSS tokens.

## Verification note

The first CLI run found a real token drift: `identity.json` declared Mint `#E6F7F6` while CSS did not expose the same canonical token. `--brand-mint` was added and the gate was rerun successfully.

**Result: CLI PASS — Stage 2 identity baseline is executable-verified at source/asset level. Real browser/font/PWA-device rendering remains a later runtime/accessibility gate.**
