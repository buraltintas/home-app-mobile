// Daylight — the shared visual world. The web implementation and its rationale are in
// `ui/DESIGN.md`; the product-wide authority is the home-app-design skill. One conceptual
// system, implemented here with native primitives.
//
// This replaced City Print, which expressed confidence through weight -- rules everywhere,
// zero radius, hard shadows. It read well on a feed and turned harsh everywhere a person
// had work to do, which on a phone is most of the app.
export const colors = {
  canvas: '#FAF8F4',
  surface: '#FFFFFF',
  muted: '#F1EEE7',
  ink: '#16140F',
  inkMuted: '#6B6559',
  line: '#E4E0D7',
  lineStrong: '#CDC7B9',
  // Honey is an area colour: a wash behind a zone, never text on a light ground and never a
  // lone border. Clay carries the few values that must be read first.
  accent: '#EDA92B',
  accentWash: '#FDF1D7',
  accentInk: '#8A5D05',
  clay: '#C2452D',
  success: '#2E6A4F',
  warning: '#8A5D05',
  error: '#B3372B',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 } as const;

// Nothing is square and nothing is a bubble. `pill` is for avatars and true pills only.
export const radius = { control: 12, media: 20, feature: 20, small: 8, pill: 999 } as const;

// One family. Onest carries Latin, Latin Extended and Cyrillic, which the four shipped
// locales require. Hierarchy comes from size, weight and space, not from a second face.
export const fonts = {
  body: 'Onest_400Regular',
  medium: 'Onest_500Medium',
  semibold: 'Onest_600SemiBold',
  bold: 'Onest_700Bold',
} as const;

// Body is 18: this is read on a phone while standing in a street.
export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 34, letterSpacing: -0.9 },
  section: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 28, letterSpacing: -0.6 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 27 },
  secondary: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  meta: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, letterSpacing: 1 },
} as const;

// Flat by default. One soft shadow, for things that genuinely float.
export const lift = {
  shadowColor: '#16140F',
  shadowOpacity: 0.08,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

// The line completes the name rather than repeating it: under the mark it reads
// "Boşa Gezme! / Bize Sor.". Turkish in every locale -- it is wordplay on the product's own
// name, and a translation is a different, worse line.
export const tagline = 'Bize Sor.';
export const slogan = 'Boşa Gezme, Bize Sor.';
