#!/usr/bin/env python3
"""Canonical data.json builder — regenerates the app's data.json from the
desktop canon masters (~/Desktop/PSALMS-PROVERBS-2026/*.md).

Canon: 'the Source' RETIRED; YHWH and Elohim → 'God'; yirah → awe.
The masters on disk are the single source of truth; this script only
packages them into the shape app.js reads. No text is edited here.

Format of a master file:
  # PSALM 23 — Title
  *Context line*
  ---
  Body...
  ---
  *Note on translation: ...*

Usage: python3 build_data.py [--masters DIR] [--out data.json]
"""
import argparse
import json
import re
import sys
from pathlib import Path

MASTERS_DEFAULT = Path.home() / "Desktop" / "PSALMS-PROVERBS-2026"


def parse_master(text: str, label: str):
    """Parse one master .md into {title, subtitle, body, notes, num}."""
    lines = text.splitlines()

    # Title: '# PSALM 23 — The Shepherd'  |  '# PROVERB 31 — ...'
    m = re.match(r"#\s*(PSALM|PROVERB)\s+(\d+)\s*[—–-]\s*(.+)", lines[0].strip())
    if not m:
        sys.exit(f"{label}: cannot parse title line: {lines[0]!r}")
    kind, num, title = m.group(1), int(m.group(2)), m.group(3).strip()

    # Subtitle / context line: first '*...*' line after the title
    subtitle = ""
    for l in lines[1:6]:
        s = l.strip()
        if s.startswith("*") and s.endswith("*") and "Motivational script" in s:
            subtitle = s.strip("*").strip()
            break

    # Body: between first '---' and the trailing '---' + note
    # Find horizontal rules
    hr_idx = [i for i, l in enumerate(lines) if l.strip() == "---"]
    if not hr_idx:
        sys.exit(f"{label}: no '---' separators found")
    first_hr = hr_idx[0]

    # The note is the last '*Note on translation:...' paragraph (possibly multi-line)
    note_match = re.search(
        r"\*Note on translation:[\s\S]*$",
        text,
    )
    notes = ""
    body_start = first_hr + 1

    if note_match:
        # Body ends where the note paragraph begins
        body_end_char = note_match.start()
        body = "\n".join(lines[body_start:]).strip()
        # Re-derive body by char offsets for precision
        prefix = "\n".join(lines[:body_start])
        body_start_char = len(prefix) + 1  # skip the newline after prefix
        # Walk from the first HR to the note start
        raw_after = text[body_start_char:]
        # Body is everything up to the LAST '---' before the note
        # (or up to the note itself if no trailing HR)
        before_note = raw_after[: len(raw_after) - len(note_match.group(0))]
        # Strip a trailing '---' separator if present
        before_note = re.sub(r"\n-{3,}\s*$", "", before_note.rstrip())
        body = before_note.strip()
        notes = note_match.group(0).strip()
        # Normalize note: ensure it stays a single paragraph
        notes = re.sub(r"\n{2,}", " ", notes)
    else:
        raw_after = "\n".join(lines[body_start:])
        body = raw_after.rstrip()
        body = re.sub(r"\n-{3,}\s*$", "", body.rstrip()).strip()
        notes = ""

    return {
        "title": f"{kind} {num} — {title}",
        "subtitle": subtitle,
        "body": body,
        "notes": notes,
        "num": str(num),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--masters", type=Path, default=MASTERS_DEFAULT)
    ap.add_argument("--out", type=Path, default=Path(__file__).parent / "data.json")
    args = ap.parse_args()

    psalms, proverbs = [], []
    psalm_files = sorted(args.masters.glob("PSALM-*.md"))
    proverb_files = sorted(args.masters.glob("PROVERB-*.md"))

    if len(psalm_files) != 150:
        sys.exit(f"expected 150 psalm masters, found {len(psalm_files)} in {args.masters}")
    if len(proverb_files) != 31:
        sys.exit(f"expected 31 proverb masters, found {len(proverb_files)} in {args.masters}")

    for f in psalm_files:
        entry = parse_master(f.read_text(encoding="utf-8"), f.name)
        if entry["num"] != f.stem.split("-")[1].lstrip("0"):
            sys.exit(f"{f.name}: num mismatch {entry['num']}")
        psalms.append(entry)

    for f in proverb_files:
        entry = parse_master(f.read_text(encoding="utf-8"), f.name)
        if entry["num"] != f.stem.split("-")[1].lstrip("0"):
            sys.exit(f"{f.name}: num mismatch {entry['num']}")
        proverbs.append(entry)

    data = {"psalms": psalms, "proverbs": proverbs}
    args.out.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    total_chars = sum(len(e["body"]) + len(e["notes"]) for e in psalms + proverbs)
    print(
        f"OK: {len(psalms)} psalms + {len(proverbs)} proverbs "
        f"→ {args.out} ({args.out.stat().st_size:,} bytes, "
        f"{total_chars:,} chars of canon text)"
    )


if __name__ == "__main__":
    main()