# Arabic matching for skill-suggest.sh. Run it with LC_ALL=C:
#
#   awk -v rules=skill-triggers-ar.txt -f arabic-hints.awk
#
# stdin:  prompt lines as "P<TAB>text", then the project's own skills as "S<TAB>name<TAB>description".
# stdout: "K<TAB>skill" for each kit skill with a rule that fits, "N<TAB>name<TAB>count" for the Arabic
#         description words of a project skill that are in the prompt.
#
# It works on bytes and on characters alike (BSD awk, mawk, busybox, gawk): Arabic is only ever handled as
# literal strings and their length(), never as a character range or a quantifier.

function trim(s) {
  sub(/^[ \t]+/, "", s)
  sub(/[ \t]+$/, "", s)
  return s
}

# One spelling for the ways people type the same word.
function normalise(s,    i) {
  for (i = 1; i <= MARKS; i++) if (index(s, MARK[i])) gsub(MARK[i], "", s)
  gsub(/أ|إ|آ|ٱ/, "ا", s)
  gsub(/ؤ/, "و", s)
  gsub(/ئ|ى|ی|ے/, "ي", s)
  gsub(/ء/, "", s)
  gsub(/ة|ھ|ہ|ە/, "ه", s)
  gsub(/ک|گ/, "ك", s)
  gsub(/چ/, "ج", s)
  gsub(/پ/, "ب", s)
  gsub(/ڤ/, "ف", s)
  gsub(/ژ/, "ز", s)
  gsub(/٠/, "0", s); gsub(/١/, "1", s); gsub(/٢/, "2", s); gsub(/٣/, "3", s); gsub(/٤/, "4", s)
  gsub(/٥/, "5", s); gsub(/٦/, "6", s); gsub(/٧/, "7", s); gsub(/٨/, "8", s); gsub(/٩/, "9", s)
  return s
}

# Words separated by one space; Arabic glued to English ("الـpush") comes apart.
function words_of(s) {
  gsub(/،|؛|؟|«|»|“|”|‘|’|—|–|…|•|٪/, " ", s)
  gsub(NBSP, " ", s)
  gsub(/[[:punct:][:space:]]/, " ", s)
  gsub(/[a-z0-9]+/, " & ", s)
  gsub(/  */, " ", s)
  return trim(s)
}

function has_arabic(s) {
  return s ~ /ا|ب|ت|ث|ج|ح|خ|د|ذ|ر|ز|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ك|ل|م|ن|ه|و|ي/
}

function keep(form) {
  if (form in SEEN) return
  SEEN[form] = 1
  FORM[++FORMS] = form
}

# A word without its attached prefixes: و ف, then the article, a preposition or both.
function prefixes(word,    n, i, p, len, rest) {
  keep(word)
  for (i = 1; i <= LEADS; i++) {
    len = length(LEAD[i])
    if (substr(word, 1, len) == LEAD[i] && length(word) - len >= 3 * UNIT) keep(substr(word, len + 1))
  }
  n = FORMS
  for (p = 1; p <= n; p++) {
    for (i = 1; i <= ARTICLES; i++) {
      len = length(ARTICLE[i])
      if (substr(FORM[p], 1, len) != ARTICLE[i]) continue
      rest = substr(FORM[p], len + 1)
      # A short word is real after the article (الزر), rarely after a lone letter.
      if (length(rest) >= (len > UNIT ? 2 : 3) * UNIT) keep(rest)
    }
  }
}

# Each of those without a pronoun, plural or verb ending. A ت left at the end is also a ة (صفحتها).
function suffixes(    n, i, p, len, at, stem) {
  n = FORMS
  for (p = 1; p <= n; p++) {
    for (i = 1; i <= TAILS; i++) {
      len = length(TAIL[i])
      at = length(FORM[p]) - len
      if (at < 3 * UNIT || substr(FORM[p], at + 1) != TAIL[i]) continue
      stem = substr(FORM[p], 1, at)
      keep(stem)
      if (TAIL[i] == "ات") keep(stem "ه")
      if (substr(stem, length(stem) - UNIT + 1) == "ت") keep(substr(stem, 1, length(stem) - UNIT) "ه")
    }
  }
}

# All forms of one word into FORM. "~form" is the same without a verb's person prefix (يسوي, تسوي).
function forms_of(word,    i, n, len, p) {
  split("", SEEN)
  FORMS = 0
  if (!has_arabic(word)) {
    keep(word)
    return
  }
  prefixes(word)
  suffixes()
  n = FORMS
  for (p = 1; p <= n; p++) {
    keep("~" FORM[p])
    for (i = 1; i <= PERSONS; i++) {
      len = length(PERSON[i])
      if (substr(FORM[p], 1, len) == PERSON[i] && length(FORM[p]) - len >= 2 * UNIT) keep("~" substr(FORM[p], len + 1))
    }
  }
}

# One word or phrase of the rules, at any place in the clause.
function phrase_found(id,    starts, n, i, j, at, size) {
  size = PART_COUNT[id]
  if (!((CLAUSE, PART[id, 1]) in WHERE)) return 0
  if (size == 1) return 1
  n = split(WHERE[CLAUSE, PART[id, 1]], starts, " ")
  for (i = 1; i <= n; i++) {
    at = starts[i] + 0
    for (j = 2; j <= size; j++) if (!((CLAUSE, at + j - 1, PART[id, j]) in AT)) break
    if (j > size) return 1
  }
  return 0
}

# A term: @group, or a word or phrase.
function term_found(term,    list, n, i, found, key) {
  key = CLAUSE SUBSEP term
  if (key in KNOWN) return KNOWN[key]
  KNOWN[key] = 0 # also ends a group that names itself
  found = 0
  if (term in GROUP) {
    n = split(GROUP[term], list, " ")
    for (i = 1; i <= n && !found; i++) found = term_found(list[i])
  } else if (term in PART_COUNT) {
    found = phrase_found(term)
  }
  KNOWN[key] = found
  return found
}

function define(term,    list, n, i, part, verb) {
  if (term ~ /^@/ || (term in PART_COUNT)) return
  n = split(term, list, "_")
  for (i = 1; i <= n; i++) {
    part = list[i]
    verb = sub(/~$/, "", part)
    part = normalise(tolower(part))
    PART[term, i] = verb ? "~" part : part
  }
  PART_COUNT[term] = n
}

function load_rules(    line, tab, name, body, list, terms, n, m, i, j, term) {
  if (rules == "") return
  while ((getline line < rules) > 0) {
    if (line ~ /^[ \t]*(#|$)/) continue
    if (line ~ /^[ \t]/) {
      # A continued line belongs to the name above it.
      body = trim(line)
    } else {
      tab = index(line, "\t")
      if (!tab) continue
      name = substr(line, 1, tab - 1)
      body = trim(substr(line, tab + 1))
    }
    if (name ~ /^@/) {
      GROUP[name] = (name in GROUP ? GROUP[name] " " : "") body
      n = split(body, list, " ")
      for (i = 1; i <= n; i++) define(list[i])
      continue
    }
    n = split(body, list, /[ \t]*\|[ \t]*/)
    for (i = 1; i <= n; i++) {
      if (list[i] == "") continue
      RULE_SKILL[++RULES] = name
      RULE[RULES] = list[i]
      m = split(list[i], terms, " ")
      for (j = 1; j <= m; j++) {
        term = terms[j]
        sub(/^!/, "", term)
        define(term)
      }
    }
  }
  close(rules)
}

# The prompt's sentences, from both ends inwards: in a long paste the request is first or last.
function read_prompt(    low, high, text, fromEnd) {
  low = 1
  high = RAWS
  while (low <= high && CLAUSE < MAX_CLAUSES && WORDS < MAX_WORDS) {
    if (fromEnd) text = RAW[high--]
    else text = RAW[low++]
    fromEnd = !fromEnd
    add_clause(text)
  }
}

function add_clause(text,    list, forms, n, i, j, word) {
  text = words_of(text)
  if (!has_arabic(text) || (text in HAVE)) return
  HAVE[text] = 1
  CLAUSE++
  n = split(text, list, " ")
  for (i = 1; i <= n; i++) {
    # A very long sentence: its start and its end.
    if (i > MAX_SENTENCE / 2 && i <= n - MAX_SENTENCE / 2) continue
    WORDS++
    word = list[i]
    if (length(word) > MAX_WORD) continue
    if (!(word in CACHE)) {
      forms_of(word)
      CACHE[word] = FORMS
      for (j = 1; j <= FORMS; j++) CACHE_FORM[word, j] = FORM[j]
    }
    forms = CACHE[word]
    for (j = 1; j <= forms; j++) {
      WHERE[CLAUSE, CACHE_FORM[word, j]] = WHERE[CLAUSE, CACHE_FORM[word, j]] " " i
      AT[CLAUSE, i, CACHE_FORM[word, j]] = 1
      IN_PROMPT[CACHE_FORM[word, j]] = 1
    }
  }
}

# Whether every word of a term is somewhere in the prompt: most rules end here, before any sentence is read.
function term_possible(term,    list, n, i, found) {
  if (term in POSSIBLE) return POSSIBLE[term]
  POSSIBLE[term] = 0
  found = 0
  if (term in GROUP) {
    n = split(GROUP[term], list, " ")
    for (i = 1; i <= n && !found; i++) found = term_possible(list[i])
  } else if (term in PART_COUNT) {
    found = 1
    for (i = 1; i <= PART_COUNT[term] && found; i++) found = (PART[term, i] in IN_PROMPT)
  }
  POSSIBLE[term] = found
  return found
}

# A sentence about life, not the app (the groups are described in the rules file).
function off_topic() {
  if (term_found("@personal")) return 1
  if (!term_found("@everyday") || term_found("@software")) return 0
  return !(term_found("@building") && term_found("@artefact"))
}

function match_rules(    last, r, list, n, i, kept, fits, term) {
  last = CLAUSE
  kept = 0
  for (r = 1; r <= RULES; r++) {
    n = split(RULE[r], list, " ")
    fits = 1
    for (i = 1; i <= n && fits; i++) if (list[i] !~ /^!/) fits = term_possible(list[i])
    if (fits) CANDIDATE[++kept] = r
  }
  if (!kept) return
  for (CLAUSE = 1; CLAUSE <= last; CLAUSE++) {
    if (off_topic()) continue
    for (r = 1; r <= kept; r++) {
      if (RULE_SKILL[CANDIDATE[r]] in PRINTED) continue
      n = split(RULE[CANDIDATE[r]], list, " ")
      fits = 1
      for (i = 1; i <= n && fits; i++) {
        term = list[i]
        if (sub(/^!/, "", term)) fits = !term_found(term)
        else fits = term_found(term)
      }
      if (fits) {
        PRINTED[RULE_SKILL[CANDIDATE[r]]] = 1
        print "K\t" RULE_SKILL[CANDIDATE[r]]
      }
    }
  }
}

# How many different words of a project skill's Arabic description the prompt has.
function description_hits(text,    list, counted, n, i, j, hits, best) {
  n = split(words_of(normalise(tolower(text))), list, " ")
  split("", counted)
  hits = 0
  for (i = 1; i <= n; i++) {
    if (!has_arabic(list[i]) || (list[i] in COMMON)) continue
    forms_of(list[i])
    best = ""
    for (j = 1; j <= FORMS; j++) {
      if (FORM[j] ~ /^~/ || length(FORM[j]) < 3 * UNIT || (FORM[j] in COMMON)) continue
      # The shortest form the two share, so the same word twice counts once.
      if ((FORM[j] in IN_PROMPT) && (best == "" || length(FORM[j]) < length(best))) best = FORM[j]
    }
    if (best != "" && !(best in counted)) {
      counted[best] = 1
      hits++
    }
  }
  return hits
}

BEGIN {
  UNIT = length("ب")
  NBSP = "\302\240"
  MAX_WORDS = 2000
  MAX_SENTENCE = 400
  MAX_CLAUSES = 200
  MAX_WORD = 80
  # Short and long vowels' marks, shadda, hamza marks, tatweel and the invisible joiners and direction marks.
  MARKS = split("ً ٌ ٍ َ ُ ِ ّ ْ ٓ ٔ ٕ ٰ ـ", MARK, " ")
  MARK[++MARKS] = "\342\200\213"; MARK[++MARKS] = "\342\200\214"; MARK[++MARKS] = "\342\200\215"
  MARK[++MARKS] = "\342\200\216"; MARK[++MARKS] = "\342\200\217"; MARK[++MARKS] = "\330\234"
  MARK[++MARKS] = "\342\201\246"; MARK[++MARKS] = "\342\201\247"; MARK[++MARKS] = "\342\201\250"
  MARK[++MARKS] = "\342\201\251"; MARK[++MARKS] = "\357\273\277"
  LEADS = split("و ف", LEAD, " ")
  ARTICLES = split("بهال عهال لهال هال بال كال عال فال مال لل ال ب ل ك ع", ARTICLE, " ")
  TAILS = split("هالي هالنا ياها ياه يلي تها لها لهم لنا لي لك له هما هم ها هن كم نا ني وها وه وا ات ين ون ان ه ي ك ت و ا ز س", TAIL, " ")
  PERSONS = split("ا ي ت ن سا سي ست سن دا دي دت", PERSON, " ")
  n = split("هذا هذه هاي ذلك التي الذي الي على الى علي الا عند عندما حين مع من في عن بين بعد قبل كل جميع غير بدون ثم لكن اذا حتى مثل ايضا يتم استخدم استخدمها تستخدم يستخدم طلب يطلب المستخدم مستخدم مهاره اريد يريد لما اما او ان جديد جديده", common, " ")
  for (i = 1; i <= n; i++) COMMON[common[i]] = 1
  load_rules()
}

/^P\t/ {
  text = normalise(tolower(substr($0, 3)))
  # A rule must fit inside one sentence. A dot inside a name (ar.json) ends nothing.
  gsub(/؟|؛|[!?]|\.[ \t]|\.$/, "\n", text)
  n = split(text, clauses, "\n")
  for (i = 1; i <= n; i++) if (has_arabic(clauses[i])) RAW[++RAWS] = clauses[i]
  next
}

/^S\t/ {
  DESCRIPTION[++SKILLS] = substr($0, 3)
  next
}

END {
  read_prompt()
  match_rules()
  for (s = 1; s <= SKILLS; s++) {
    tab = index(DESCRIPTION[s], "\t")
    hits = description_hits(substr(DESCRIPTION[s], tab + 1))
    if (hits) print "N\t" substr(DESCRIPTION[s], 1, tab - 1) "\t" hits
  }
}
