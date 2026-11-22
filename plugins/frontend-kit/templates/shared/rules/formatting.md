---
paths:
  - "**/src/**/*{format,formatter,formatters,money,currency,date,dates,number,numbers,search,digits}*.{ts,tsx}"
  - "**/src/**/utils/**/*.{ts,tsx}"
---

# Numbers, money, dates and search in Arabic and English

Format through the project's formatter module (`project.md` names it). Never format inline in a component.

## Locale

- Use the UI language only: `ar` or `en`. Never `navigator.language`, never `toLocaleString()` without a locale.
- Set the digits as an option: `new Intl.NumberFormat(locale, { numberingSystem: 'latn' })`. The option beats a `-u-nu-` tag.
- Country tags change more than digits. `ar-EG`, `ar-IQ`, `ar-SA`, `ar-LB`, `ar-JO`, `ar-SY` and `ar-KW` give Arabic-Indic
  digits; `ar-MA`, `ar-DZ` and `ar-TN` keep Latin digits with `1.234,5`; month names differ too (`ar-IQ` gives تشرين الثاني,
  plain `ar` gives نوفمبر). Use the plain `ar` tag and set the options explicitly.
- Calendar: every `ar-*` tag defaults to Gregorian (CLDR 48, `ar-SA` included). Do not expect Hijri output by default.
- First day of the week differs: Saturday in `ar-IQ` and `ar-EG`, Sunday in `ar-SA`, Monday in `ar-AE`. Read it from
  `Intl.Locale#getWeekInfo()` where it exists; Firefox and Safari support is not checked here, so do not build logic on it alone.

## Money

- Currency decides the decimals: IQD 0, KWD and BHD 3, JPY 0, most others 2. Let `Intl.NumberFormat` with
  `style: 'currency'` do it. Never `toFixed` for display.
- Store money as integer minor units or as a decimal string; `format()` takes that exact value.
- A Latin currency code next to Arabic text sits in `dir="ltr"` (`rtl.md`, mixed content).

## Dates and time

- Pass `timeZone` explicitly (the business zone, from `project.md`). A server and a visitor's machine disagree otherwise.
- `new Date('YYYY-MM-DD')` is UTC midnight and shows the previous day in New York. Parse a date-only value as a local date,
  or keep it as a string until display.
- DST: Cairo and Beirut observe it; Baghdad, Amman, Damascus, Riyadh and Kuwait are fixed UTC+3.
- `Temporal` is not in Node 24. Check the target browsers before using it, or use a polyfill.
- Relative times use `Intl.RelativeTimeFormat`; lists use `Intl.ListFormat`. Do not join list items with commas by hand.

## Digits in inputs

- Arabic-Indic (٠–٩) and Persian (۰–۹) digits make `Number()`, `parseInt` and `parseFloat` return NaN. Map them to ASCII
  first, in one helper, then parse.
- Numeric inputs use `inputMode="decimal"` and the same helper.

## Search

- Arabic letter variants: fold أ إ آ to ا, ى to ي, and decide the team's rule for ة and ه. Remove tashkeel (U+064B–U+065F)
  and tatweel (U+0640). `Intl.Collator` with `sensitivity: 'base'` folds some of these but not ة/ه, and plain `includes`
  folds none, so write `normalizeSearch()` and apply it to both sides.

## Length and tests

- `'كُتُب'.length` is 5 code units but 3 characters. Count with `Intl.Segmenter` for counters and limits.
- Intl output carries invisible marks (U+200E, U+200F, U+061C). `parseFloat` on formatted output is NaN; tests strip the marks.
- Each formatter gets one `ar` and one `en` assertion, and an input with Western digits and one with Arabic-Indic digits.
