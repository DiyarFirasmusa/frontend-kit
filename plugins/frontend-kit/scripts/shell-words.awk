# shell-words.awk: reads a shell command the way bash reads it, for guard-bash.sh. It runs nothing.
#
#   awk -f shell-words.awk <command               the command
#   awk -v mode=old-bash -f shell-words.awk <…    as bash 3.2 (macOS /bin/bash) reads it: a $(…) ends at the paren
#                                                 that balances, whatever comments, case or heredocs are inside
#   awk -v mode=body -f shell-words.awk <text     a heredoc body: only its $(…) and `…` are commands
#
# One record per line, newlines inside a value written as \036:
#   W<word>     a word, quotes and escapes resolved; a substitution keeps its text as $(inner words)
#   R<target>   the target of a redirection
#   S<text>     a here-string
#   H<body>     a heredoc body with a quoted delimiter
#   X<body>     a heredoc body the shell expands
#   E<sep>      the end of one simple command and what follows it: ; & && || | or )
#   ( )         a subshell starts, ends
#   [ ]         a command substitution starts, ends (its commands come before the command that uses it)
#
# POSIX awk only (macOS awk, mawk, busybox awk, gawk). Lines are read through a small window, so a very
# long line stays linear. Exit 3: too deeply nested, or too many heredocs, to read
# in time (the guard then refuses the command).

BEGIN {
  NL = "\n"
  ENC = "\036"
  SQ = "\047"
  DIGITS = "0123456789"
  HEX = "0123456789abcdef"
  WINDOW = 256
}

{
  gsub(/\036/, " ")
  lines[NR] = $0
}

END {
  if (failed || NR == 0) exit (failed ? 3 : 0)
  total = NR
  load(1)
  if (mode == "body") expand_body()
  else scan("", 0)
  for (i = 1; i <= nout; i++) print_record(out[i])
}

# --- reading ----------------------------------------------------------------------------------

function load(number) {
  ln = number
  if (ln <= total) {
    line = lines[ln]
    line_len = length(line)
  } else {
    line = ""
    line_len = 0
  }
  pos = 1
  win_start = 1
  win = substr(line, 1, WINDOW)
}

function char_at(p) {
  if (p < win_start || p >= win_start + WINDOW) {
    win_start = p
    win = substr(line, p, WINDOW)
  }
  return substr(win, p - win_start + 1, 1)
}

# The next character exactly as written; "" at the end.
function raw_peek() {
  if (ln > total) return ""
  if (pos <= line_len) return char_at(pos)
  return ln < total ? NL : ""
}

function raw_next(    c) {
  c = raw_peek()
  if (c == NL) load(ln + 1)
  else if (c != "") pos++
  return c
}

# The next character as the shell sees it: a backslash before a newline joins the lines.
function peek(    c) {
  while (1) {
    c = raw_peek()
    if (c == "\\" && pos == line_len && ln < total) {
      load(ln + 1)
      continue
    }
    return c
  }
}

function take() {
  peek()
  return raw_next()
}

# --- output -----------------------------------------------------------------------------------

function emit(record) {
  out[++nout] = record
}

function encode(value,    copy) {
  copy = value
  if (index(copy, NL)) gsub(/\n/, ENC, copy)
  return copy
}

function print_record(record,    id) {
  if (substr(record, 1, 1) == "h") {
    id = substr(record, 2)
    if (id in body) print (doc_quoted[id] ? "H" : "X") encode(body[id])
    return
  }
  print encode(record)
}

# --- quoting ----------------------------------------------------------------------------------

function single_quoted(    c, text) {
  text = ""
  while ((c = raw_next()) != "") {
    if (c == SQ) break
    text = text c
  }
  return text
}

function double_quoted(    c, text) {
  text = ""
  while ((c = take()) != "") {
    if (c == "\"") break
    if (c == "\\") {
      c = raw_next()
      if (c == NL) continue
      if (index("$`\"\\", c) == 0 || c == "") text = text "\\"
      text = text c
    } else if (c == "$") text = text dollar(1)
    else if (c == "`") text = text backquote(1)
    else text = text c
  }
  return text
}

# $'…': escapes are decoded, so $'\x2d\x2dforce' is --force.
function ansi_quoted(    c, text, value, n, cut) {
  text = ""
  cut = 0
  while ((c = raw_next()) != "") {
    if (c == SQ) break
    if (c == "\\") {
      c = raw_next()
      if (c == "n") c = NL
      else if (c == "t") c = "\t"
      else if (c == "r") c = "\r"
      else if (c == "x" || c == "u" || c == "U") {
        n = (c == "x") ? 2 : ((c == "u") ? 4 : 8)
        value = 0
        while (n > 0 && raw_peek() != "" && index(HEX, tolower(raw_peek()))) {
          value = value * 16 + index(HEX, tolower(raw_next())) - 1
          n--
        }
        if (value == 0) cut = 1
        c = (value > 0 && value < 256) ? sprintf("%c", value) : "?"
      } else if (c != "" && index("01234567", c)) {
        value = c + 0
        n = 2
        while (n > 0 && raw_peek() != "" && index("01234567", raw_peek())) {
          value = value * 8 + raw_next()
          n--
        }
        if (value == 0) cut = 1
        c = (value > 0 && value < 256) ? sprintf("%c", value) : "?"
      }
    }
    if (!cut) text = text c
  }
  return text
}

# --- expansions -------------------------------------------------------------------------------

function substitution(closer, opened,    inner) {
  if (mode == "old-bash") return "$(" balanced(1 + opened) ")"
  emit("[")
  inner = scan(closer, opened)
  emit("]")
  return "$(" inner ")"
}

# bash 3.2 looks for the end of $(…) by counting parens and quotes only.
function balanced(level,    c, text) {
  text = ""
  while ((c = raw_next()) != "") {
    if (c == ")") {
      if (--level == 0) break
    } else if (c == "(") level++
    else if (c == "\\") {
      c = raw_next()
    } else if (c == SQ) c = single_quoted()
    else if (c == "\"") c = double_quoted()
    else if (c == "`") c = backquote(0)
    text = text c
  }
  return text
}

# `…` ends at the first unescaped backquote, quotes or not. What is inside is a command line of its own.
function backquote(quoted,    c, text, special) {
  text = ""
  special = quoted ? "$`\"\\" : "$`\\"
  while ((c = raw_next()) != "") {
    if (c == "`") break
    if (c == "\\") {
      c = raw_next()
      if (c == NL) continue
      if (c == "" || index(special, c) == 0) text = text "\\"
    }
    text = text c
  }
  if (text != "") {
    emit("[")
    emit("Weval")
    emit("W" text)
    emit("E;")
    emit("]")
  }
  return "$(" text ")"
}

# Called after a $.
function dollar(quoted,    c) {
  c = peek()
  if (c == "(") {
    take()
    if (peek() == "(") {
      take()
      if (arithmetic("(", ")", 2)) return "$((…))"
      return substitution(")", 1)
    }
    return substitution(")", 0)
  }
  if (c == "{") {
    take()
    return "${" parameter(quoted) "}"
  }
  if (c == "[") {
    take()
    arithmetic("[", "]", 1)
    return "$[…]"
  }
  if (!quoted && c == SQ) {
    take()
    return ansi_quoted()
  }
  if (!quoted && c == "\"") {
    take()
    return double_quoted()
  }
  return "$"
}

function parameter(quoted,    c, text) {
  text = ""
  while ((c = take()) != "") {
    if (c == "}") break
    if (c == "\\") text = text raw_next()
    else if (c == SQ && !quoted) text = text single_quoted()
    else if (c == "\"") text = text double_quoted()
    else if (c == "$") text = text dollar(quoted)
    else if (c == "`") text = text backquote(0)
    else text = text c
  }
  return text
}

# Arithmetic: << is a shift and # is no comment. "((" can also be two subshells: that is so when the closing ))
# are apart or missing, and is assumed when it spans lines. Then everything is put back and 0 is returned, and
# the caller reads it again as commands.
function arithmetic(opener, closer, left,    c, start_left, from_ln, from_pos, from_out, commands, in_word, gap) {
  from_ln = ln
  from_pos = pos
  from_out = nout
  start_left = left
  commands = 0
  in_word = 0
  gap = 0
  while (1) {
    c = take()
    if (c == "") {
      commands = 1
      break
    }
    if (start_left == 2) {
      # A newline, a quote, a semicolon, or two names side by side is no arithmetic. zsh then runs it as commands.
      if (c == NL || c == SQ || c == ";" || (gap && index("abcdefghijklmnopqrstuvwxyz_", tolower(c)))) {
        commands = 1
        break
      }
      if (c == " " || c == "\t") gap = (gap || in_word)
      else gap = 0
      in_word = index("abcdefghijklmnopqrstuvwxyz_0123456789", tolower(c)) > 0
    }
    if (c == closer) {
      left--
      if (left == 0) break
      if (start_left == 2 && left == 1 && peek() != closer) {
        commands = 1
        break
      }
    } else if (c == opener) left++
    else if (c == "\\") raw_next()
    else if (c == SQ) single_quoted()
    else if (c == "\"") double_quoted()
    else if (c == "$") dollar(0)
    else if (c == "`") backquote(0)
  }
  if (!commands) return 1
  if (++rereads > 64) {
    failed = 1
    exit 3
  }
  load(from_ln)
  pos = from_pos
  nout = from_out
  return 0
}

function expand_body(    c) {
  while ((c = take()) != "") {
    if (c == "\\") raw_next()
    else if (c == "$") dollar(1)
    else if (c == "`") backquote(0)
  }
}

# --- heredocs ---------------------------------------------------------------------------------

# Called right after an unquoted newline. A heredoc whose terminator is nowhere is not trusted as data:
# its lines are read as commands.
function read_bodies(closer,    k, id, j, text, chunk, found, start, resume) {
  for (k = 1; k <= npending; k++) {
    id = pending[k]
    found = 0
    resume = 0
    start = ln
    for (j = start; j <= total; j++) {
      text = lines[j]
      if (doc_tabs[id]) sub(/^\t+/, "", text)
      if (text == doc_delim[id]) {
        found = j
        break
      }
      if (closer != "" && index(text, doc_delim[id] closer) == 1) {
        found = j
        resume = length(lines[j]) - length(text) + length(doc_delim[id]) + 1
        break
      }
    }
    if (!found) continue
    body[id] = ""
    chunk = ""
    for (j = start; j < found; j++) {
      chunk = chunk lines[j] NL
      if (length(chunk) > 4000) {
        body[id] = body[id] chunk
        chunk = ""
      }
    }
    body[id] = body[id] chunk
    if (resume) {
      load(found)
      pos = resume
    } else if (found < total) load(found + 1)
    else {
      load(found)
      pos = line_len + 1
    }
  }
  npending = 0
}

# --- commands ---------------------------------------------------------------------------------

function add_token(frame, token) {
  token_of[frame, ++count[frame]] = token
}

function end_word(frame,    w) {
  if (!has[frame]) return
  w = word[frame]
  if (redirect[frame] == "<<") {
    ndoc++
    doc_delim[ndoc] = w
    doc_quoted[ndoc] = quoted_word[frame]
    doc_tabs[ndoc] = tabs[frame]
    if (ndoc > 100) {
      failed = 1
      exit 3
    }
    pending[++npending] = ndoc
    add_token(frame, "h" ndoc)
  } else if (redirect[frame] == "<<<") add_token(frame, "S" w)
  else if (redirect[frame] != "") add_token(frame, "R" w)
  else {
    if (command_position[frame] && !quoted_word[frame]) {
      if (w == "case") cases[frame]++
      else if (w == "esac" && cases[frame] > 0) cases[frame]--
    }
    command_position[frame] = (command_position[frame] && !quoted_word[frame] && index(" if then elif else do while until ! { ", " " w " ") > 0)
    add_token(frame, "W" w)
    if (length(said[frame]) < 500) said[frame] = said[frame] (said[frame] == "" ? "" : " ") w
  }
  reset_word(frame)
  redirect[frame] = ""
}

function reset_word(frame) {
  word[frame] = ""
  has[frame] = 0
  quoted_word[frame] = 0
  digits[frame] = 1
}

function end_command(frame, separator,    k) {
  end_word(frame)
  redirect[frame] = ""
  command_position[frame] = 1
  if (count[frame] == 0) return
  for (k = 1; k <= count[frame]; k++) emit(token_of[frame, k])
  emit("E" separator)
  count[frame] = 0
}

function append(frame, text, plain) {
  word[frame] = word[frame] text
  has[frame] = 1
  if (!plain) {
    quoted_word[frame] = 1
    digits[frame] = 0
  }
}

# Reads commands up to the closer (")", or "" for the end) and returns their words.
function scan(closer, opened,    frame, c, n, parens) {
  if (++depth > 64) {
    failed = 1
    exit 3
  }
  frame = ++nframes
  reset_word(frame)
  count[frame] = 0
  cases[frame] = 0
  said[frame] = ""
  redirect[frame] = ""
  command_position[frame] = 1
  parens = opened + 0
  if (opened) {
    case_base[frame, 1] = 0
    emit("(")
  }

  while ((c = take()) != "") {
    if (c == ")") {
      # A `case` pattern ends in ), and so do a subshell and $(…): an open case decides, and `esac)` closes it first.
      if (has[frame] && word[frame] == "esac" && command_position[frame]) end_word(frame)
      if (cases[frame] > (parens > 0 ? case_base[frame, parens] : 0)) {
        end_command(frame, ";")
        continue
      }
      if (closer == ")" && parens == 0) break
    }
    if (c == " " || c == "\t") end_word(frame)
    else if (c == NL) {
      end_command(frame, ";")
      read_bodies(closer)
    } else if (c == "\\") {
      n = raw_next()
      if (n != NL && n != "") append(frame, n, 0)
    } else if (c == SQ) append(frame, single_quoted(), 0)
    else if (c == "\"") append(frame, double_quoted(), 0)
    else if (c == "`") {
      n = backquote(0)
      append(frame, n, 0)
    } else if (c == "$") {
      n = dollar(0)
      append(frame, n, 1)
      digits[frame] = 0
    } else if (c == "#" && !has[frame]) {
      while ((n = raw_peek()) != "" && n != NL) raw_next()
    } else if (c == ";") {
      while (peek() == ";" || peek() == "&") take()
      end_command(frame, ";")
    } else if (c == "&") {
      n = peek()
      if (n == "&") {
        take()
        end_command(frame, "&&")
      } else if (n == ">") {
        take()
        if (peek() == ">") take()
        end_word(frame)
        redirect[frame] = ">"
      } else {
        if (n == "|" || n == "!") take()
        end_command(frame, "&")
      }
    } else if (c == "|") {
      if (peek() == "|") {
        take()
        end_command(frame, "||")
      } else {
        if (peek() == "&") take()
        end_command(frame, "|")
      }
    } else if (c == "(") {
      if (!has[frame] && count[frame] == 0 && peek() == "(") {
        take()
        if (!arithmetic("(", ")", 2)) {
          end_command(frame, ";")
          case_base[frame, ++parens] = cases[frame]
          case_base[frame, ++parens] = cases[frame]
          emit("(")
          emit("(")
        }
      } else {
        end_command(frame, ";")
        case_base[frame, ++parens] = cases[frame]
        emit("(")
      }
    } else if (c == ")") {
      end_command(frame, parens > 0 ? ")" : ";")
      if (parens > 0) {
        parens--
        emit(")")
      }
    } else if (c == "<" || c == ">") {
      n = peek()
      if (n == "(") {
        take()
        n = substitution(")", 0)
        append(frame, n, 1)
        digits[frame] = 0
        continue
      }
      if (has[frame] && digits[frame]) reset_word(frame)
      else end_word(frame)
      if (c == "<" && n == "<") {
        take()
        n = peek()
        tabs[frame] = 0
        if (n == "<") {
          take()
          redirect[frame] = "<<<"
        } else {
          if (n == "-") {
            take()
            tabs[frame] = 1
          }
          redirect[frame] = "<<"
        }
      } else {
        if (n == ">" || n == "&" || (c == ">" && n == "|")) take()
        redirect[frame] = c
      }
    } else {
      if (index(DIGITS, c) == 0) digits[frame] = 0
      append(frame, c, 1)
    }
  }
  end_command(frame, closer == "" ? ";" : ")")
  depth--
  return said[frame]
}
