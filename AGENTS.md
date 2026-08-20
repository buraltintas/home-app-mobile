# Boşa Gezme! mobile contribution rules

Read the exact Expo SDK documentation for the version in `package.json` before using or changing Expo APIs. Before changing screens, tokens, navigation, content, localization, or accessibility, use the shared `$impeccable` foundation and then the `$home-app-design` authority from `../home-app-api/.agents/skills/`. The Boşa Gezme!-specific skill wins if they conflict.

## Product invariants

- Treat Boşa Gezme! as a consumer social product for discovering physical home/living stores.
- Keep photography, real visits, store identity, and authored reviews more prominent than UI chrome.
- Never invent backend DTO fields or unsupported store capability.
- Keep Boşa Gezme! community metrics and Google-derived data visibly separate.
- Browsing remains anonymous; protected actions open contextual auth and preserve intent.

## Mobile implementation invariants

- Write READMEs, contributor documentation, developer-facing explanations, and code comments in English only. Localized product UI and locale fixtures are exempt.
- Use platform-native behavior, safe areas, keyboard handling, sharing, permissions, and accessibility semantics.
- Keep all UI strings in the `tr`, `en`, `de`, and `ru` dictionaries.
- Keep user-authored content untranslated.
- Use one Lucide outline icon family; do not use Unicode glyphs as icons.
- Primary navigation stays label-free visually but must retain screen-reader labels and 44 pt targets.
- Restrict real blur/glass to the floating navigation rail.
- Do not add drawn gloss lines across the rail or Create orb.
- Keep the Create orb borderless and visually singular.
- Keep tab scene transitions within 180–220 ms, 18 px travel, and 1–2% scale.
- Respect iOS/Android Reduce Motion settings.
- Ask for location and photo permissions only in the action context.
- Keep fixture imagery in the presentation adapter, never in API DTOs.
- A local optimistic state change is not backend success. Commit mutations after a successful response or roll them back on failure.
- Treat any bundled mobile client secret as extractable abuse friction, never user authentication.
- Mobile is the explicit exception to the web BFF rule and may call the real backend directly.
- Keep every direct backend request inside the isolated typed transport under `src/api`; screens and components must not create ad hoc network clients.

## Required checks

Run before committing:

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```
