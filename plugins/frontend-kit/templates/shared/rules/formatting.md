---
paths:
  - "**/{format,formatters,formatting}/**"
  - "**/{format,formatter,formatters,money,currency,date,dates,datetime,number,numbers,digits}.{js,jsx,ts,tsx}"
  - "**/{format,money,currency,date,number,digits}-*.{js,jsx,ts,tsx}"
  - "**/*-{format,formatter,formatters,money,currency,digits}.{js,jsx,ts,tsx}"
  - "**/format{Date,Time,Number,Money,Currency}*.{js,jsx,ts,tsx}"
  - "**/{normalize-search,normalizeSearch}.{js,jsx,ts,tsx}"
---

# Numbers, money, dates and search

Format through the project's formatter module (`project.md` names it), never inline in a component. Build each `Intl`
object once per locale and options.

## Locale

- Use the project's UI language, never `navigator.language` and never `toLocaleString()` without a locale: the server and
  the browser would disagree.
- Set the digits as an option: `new Intl.NumberFormat(locale, { numberingSystem: 'latn' })`. The option beats a `-u-nu-` tag.
- Arabic, when the project has it: use the plain `ar` tag unless `project.md` chose a country. `ar-EG`, `ar-IQ`, `ar-SA`,
  `ar-LB`, `ar-JO`, `ar-SY` and `ar-KW` give Arabic-Indic digits; `ar-MA`, `ar-DZ` and `ar-TN` write `1.234,5`; month names
  differ (`ar-IQ` تشرين الثاني, `ar` نوفمبر).
- Every `ar-*` tag defaults to Gregorian (CLDR 48, `ar-SA` included). Do not expect Hijri output by default.
- First day of the week differs: Saturday in `ar-IQ` and `ar-EG`, Sunday in `ar-SA`, Monday in `ar-AE`. It is a product
  decision; feature-detect `Intl.Locale#getWeekInfo()` if you read it from there.

## Money

- `Intl.NumberFormat` with `style: 'currency'` picks the display decimals (IQD 0, KWD 3, most 2). Never `toFixed` for display.
- `format()` takes **major** units: 1050 cents passed as they are print $1,050.00. A decimal string goes in as it is (type
  it `` `${number}` ``). Integer minor units are divided by the API's documented scale in the formatter only (cents:
  `format(minor / 100)`), not by the display decimals: the two differ for some currencies. Never sum or compare in floats.
- Deltas use `signDisplay: 'exceptZero'`. Two currencies with one symbol: `currencyDisplay: 'code'`.

## Dates and time

- An instant (with `Z` or an offset): pass `timeZone` explicitly (the business zone, from `project.md`), or a server and a
  visitor's machine disagree.
- A date-only value (`YYYY-MM-DD`) has no zone: keep the string, or format `new Date(value)` with `timeZone: 'UTC'`. Never
  parse it as local time and never show it in the business zone: either moves it to another day.
- DST: Cairo and Beirut observe it; Baghdad, Amman, Damascus, Riyadh and Kuwait are fixed UTC+3. Never add hours by hand.
- `Temporal` is not in Node 24: use a polyfill, or don't use it.
- Relative times use `Intl.RelativeTimeFormat`; lists use `Intl.ListFormat`, not a joined comma.

## Digits in inputs

- `Number()` and `parseFloat` fail on Arabic-Indic (٠–٩) and Persian (۰–۹) input. One helper maps the digits to ASCII and
  `٫` (U+066B) to a point, and removes `٬` (U+066C) and the locale's grouping separator. Then parse.
- Numeric inputs use `inputMode="decimal"` and the same helper.

## Search and sort

- Sort with `Intl.Collator(locale, { numeric: true })`, never a bare `.sort()`.
- Search runs one `normalizeSearch()` on both sides (`includes` folds nothing). Arabic: fold أ إ آ to ا and ى to ي, remove
  tashkeel (U+064B–U+065F, U+0670) and tatweel (U+0640), and record the team's choice for ة/ه, ئ/ي and ؤ/و.

## Length and tests

- `'كُتُب'.length` is 5 but 3 characters. Count with `Intl.Segmenter` for counters and limits.
- Intl output carries invisible marks (U+200E, U+200F, U+061C): never parse it back, and normalise them in test assertions.
- Each formatter has a test per language, and digit helpers one with each digit set.
