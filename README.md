# Boşa Gezme! Mobile

The iOS and Android application for Boşa Gezme!. It is an anonymous-first Expo and React Native experience focused on discovering physical home and living stores through real visit photography, ratings, and community stories.

Canonical production domain: [https://bosagezme.com](https://bosagezme.com). The app uses the supplied logo without redrawing or recoloring and registers `bosagezme://` plus verified `https://bosagezme.com` deep-link targets.

This repository currently contains the working mobile frontend prototype, typed API transport, and Boşa Gezme!’s native design system.

## Current experience

- A photography- and real-visit-first home feed
- Natural-language queries, recent searches, categories, and nearby discovery
- Backend-authored guidance for unrelated or unclear searches and store-name intent
- Explicit current/manual location choice with debounced geographic suggestions
- Results that keep Boşa Gezme! community data separate from Google data
- Store detail, gallery, community experiences, and primary actions
- A guided visit-review creation flow
- Foundations for favorites, profile, and language selection
- Google and passwordless email OTP authentication sheets
- Confirmed account deletion with secure token cleanup and anonymous-state reset
- Turkish, English, German, and Russian interface dictionaries
- Custom bottom navigation that respects iOS and Android safe areas
- Contextual location and photo permission requests

## Mobile design and motion

The bottom navigation is not a stock tab bar. It is purpose-built for Boşa Gezme!:

- Label-free Home, Search, Create, Favorites, and Profile destinations with screen-reader labels
- A consistent Lucide outline icon family with restrained destination colors
- A raised, borderless terracotta Create button
- Real platform material through `expo-blur`
- A warm translucent tint, soft shadow, and moving glass selection lens
- A floating layer above content with sufficient bottom content clearance
- A 220 ms direction-aware cross-fade with up to 18 px of horizontal travel and subtle scaling
- Scene and navigation animation disabled when Reduce Motion is enabled

Glass material is restricted to navigation. The design avoids decorative gloss stripes and content-wide glassmorphism.

## Technology

- Expo SDK 57
- React Native 0.86
- React 19
- React Navigation 7
- TypeScript
- Expo Blur, SecureStore, Location, and Image Picker
- Lucide React Native and React Native SVG

## Setup

Requirements:

- Node.js 20 or a current LTS release
- Xcode Simulator or Android Emulator
- A running Boşa Gezme! API instance

```bash
cp .env.example .env
npm install
npm start
```

Platform shortcuts:

```bash
npm run ios
npm run android
```

On a physical device, `localhost` refers to the device itself. Set `EXPO_PUBLIC_API_ORIGIN` to an address reachable from the local network.

### Environment variables

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_API_ORIGIN` | The Boşa Gezme! API origin |
| `EXPO_PUBLIC_MOBILE_BFF_SECRET` | The development client credential required by the current backend |

Any value compiled into a mobile bundle can be extracted. `EXPO_PUBLIC_MOBILE_BFF_SECRET` is not user authentication and must not be treated as a production security boundary.

## API and authentication

The typed transport is isolated under `src/api`. Access and rotating refresh tokens are stored with Expo SecureStore. Anonymous visitor identity remains separate from authenticated state.

The transport models location-aware feed pagination, private device/manual discovery-location persistence, and single-use visit-verification proofs. `store_distance_meters` describes viewer-to-store feed ordering; `distance_meters` remains visit-verification distance. Proof IDs are stored securely and a review sends either fresh device coordinates or one unconsumed proof, never both.

### Native transport exception

Mobile is the intentional exception to the web BFF rule:

```text
Native app → Boşa Gezme! API
```

The native app calls the backend directly through `src/api/client.ts` because it cannot depend on the web BFF deployment. Keep all direct networking inside this typed transport; screens and presentation components must not issue ad hoc backend requests.

Email authentication uses passwordless OTP. Google authentication expects a Google ID token issued for the backend audience. Production platform credentials and redirects must be configured before release.

The App Store review identity uses the same email request and verification screens as every other user; never add a reviewer-only button, prefill, label, or client-side code. `ACCOUNT_UNAVAILABLE` clears SecureStore session data. Account deletion permanently purges private/profile/content data and returns the app to anonymous mode; a later verified login may reactivate the same account ID only as a blank profile.

## Fixtures and prototype behavior

Canonical fixture shapes come from `home-app-api/docs/frontend-fixtures`. Bundled development imagery stays in a presentation adapter and does not change production DTOs.

Some screens still use prototype behavior. A local like or favorite state does not represent successful backend persistence. Production integration must wait for mutation success or roll back failed optimistic updates.

## Permission behavior

- Location permission is not requested at launch.
- It is requested only after explaining its value in nearby discovery or visit-verification contexts.
- Nearby discovery always offers current location, a single-field manual place search, and a non-blocking “Not now” path.
- Manual discovery candidates are never accepted as visit evidence; review verification always uses a fresh foreground OS fix and horizontal accuracy.
- Photo permission is requested only when the user adds media to a review.

## Project structure

```text
App.tsx            Navigation, authentication sheets, and scene transitions
src/
  api/             Typed transport, tokens, and locale handling
  components/      Glass tab bar, icons, feed, and primitives
  data/            Canonical fixtures and presentation imagery
  i18n/            Turkish, English, German, and Russian dictionaries
  screens/         Feed, search, store, create, favorites, and profile
  theme/           Shared semantic tokens
```

## Validation

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

## Related repositories

- API: [buraltintas/home-app-api](https://github.com/buraltintas/home-app-api)
- Web UI: [buraltintas/home-app-ui](https://github.com/buraltintas/home-app-ui)
