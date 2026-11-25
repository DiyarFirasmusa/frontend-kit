/**
 * Self-hosted fonts (no external CDN, works offline and under a strict CSP).
 * Only the Arabic and Latin faces the type ramp uses are imported; the browser
 * downloads a file only when text on the page needs it (unicode-range).
 *
 *  - Cairo (variable): headings and numbers, Arabic + Latin
 *  - IBM Plex Sans: Latin body text, 400/500/600
 *  - IBM Plex Sans Arabic: Arabic body text, 400/500/600 so weights are real
 *    instead of synthesised bold
 *  - IBM Plex Mono: identifiers and codes
 * If a file fails to load, the stacks in theme.css fall back to system fonts.
 */
import '@fontsource-variable/cairo/wght.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
