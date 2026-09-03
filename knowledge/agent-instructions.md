# Agent Instructions — Social Media Content System

## System Overview

This folder manages Scando's social media and blog content pipeline.  
All data lives in CSV files under `data/`. The board (`index.html`) is read-only — it presents the data, never writes to it.

```
01.01 Social Media/
  index.html          ← presentation board (read-only)
  data/
    ideas.csv         ← content ideas (one row per idea)
    objectives.csv    ← strategic objectives (lookup table)
    topics.csv        ← content topics / themes (lookup table)
  knowledge/
    agent-instructions.md   ← this file
    tone-of-voice.md        ← brand voice and platform guidelines
```

---

## CSV Field Reference

### ideas.csv

| Field          | Type         | Description                                          | Example                        |
|---------------|--------------|------------------------------------------------------|--------------------------------|
| `id`           | ID           | Sequential. Format: `IDEA-NNN`                       | `IDEA-009`                     |
| `title`        | Short text   | 5–10 words, clear and specific                       | `How Odoo Saved a Cairo SME`   |
| `description`  | Long text    | 1–3 sentences describing the content concept         | Wrap in `"..."` if it has commas |
| `platform`     | Enum         | `Facebook` / `Instagram` / `LinkedIn` / `Blog` / `All` | `LinkedIn`                  |
| `status`       | Enum         | See workflow below                                   | `Idea`                         |
| `objective_id` | Foreign key  | Must match an `id` in `objectives.csv`               | `OBJ-002`                      |
| `added_date`   | Date         | `YYYY-MM-DD` — date the idea was logged              | `2026-05-24`                   |
| `publish_date` | Date         | `YYYY-MM-DD` — target publish date (can be empty)    | `2026-06-15`                   |
| `topic_ids`    | Multi-value  | Comma-separated IDs from `topics.csv`, wrapped in `"..."` | `"TOPIC-001,TOPIC-004"`  |

### objectives.csv

| Field         | Description                                      |
|--------------|--------------------------------------------------|
| `id`          | Format: `OBJ-NNN`                                |
| `title`       | Short label (3–6 words)                          |
| `description` | One sentence explaining the strategic goal       |

### topics.csv

| Field         | Description                                      |
|--------------|--------------------------------------------------|
| `id`          | Format: `TOPIC-NNN`                              |
| `title`       | Short label (2–5 words)                          |
| `description` | One sentence explaining what content falls here  |

---

## Status Workflow

```
Idea → Researching → Writing → Scheduled → Published
```

| Status        | Meaning                                                    |
|--------------|------------------------------------------------------------|
| `Idea`        | Captured concept — not yet acted on                        |
| `Researching` | Gathering data, competitor examples, or source material    |
| `Writing`     | Draft in progress                                          |
| `Scheduled`   | Final copy ready, date confirmed, queued for publishing    |
| `Published`   | Live on the platform                                       |

---

## How to Add a New Idea

1. Open `data/ideas.csv` in Excel or Google Sheets.
2. Add a new row at the bottom.
3. Assign the next sequential `IDEA-NNN` ID.
4. Set `status` to `Idea`.
5. Set `added_date` to today's date (`YYYY-MM-DD`).
6. Choose one `objective_id` from `objectives.csv`.
7. Choose one or more `topic_ids` from `topics.csv`, comma-separated and quoted if multiple.
8. Leave `publish_date` empty until a date is confirmed.
9. Save the file. Refresh `index.html` in the browser to see the new card.

## How to Add a New Objective

1. Open `data/objectives.csv`.
2. Add a row with the next `OBJ-NNN` ID, a short title, and a one-sentence description.
3. The new objective will appear in the Objective filter dropdown on the board automatically.

## How to Add a New Topic

1. Open `data/topics.csv`.
2. Add a row with the next `TOPIC-NNN` ID, a short title, and a one-sentence description.
3. The new topic will appear in the Topic filter dropdown on the board automatically.

---

## ID Naming Conventions

- Ideas: `IDEA-001`, `IDEA-002`, … `IDEA-010`, `IDEA-011` (always 3 digits)
- Objectives: `OBJ-001`, `OBJ-002`, …
- Topics: `TOPIC-001`, `TOPIC-002`, …
- Never reuse an ID, even after a row is deleted.

---

## Platform Guidance (quick reference)

| Platform    | Format                        | Length         | Tone               |
|------------|-------------------------------|----------------|--------------------|
| LinkedIn    | Article or thought-leadership | 150–300 words  | Professional       |
| Facebook    | Story or community post       | 80–150 words   | Conversational     |
| Instagram   | Visual caption                | 50–100 words   | Human, visual      |
| Blog        | Long-form article             | 600–1500 words | Authoritative      |
| All         | Adaptable core concept        | —              | Platform-dependent |

---

## Notes for AI Agents

- Always read `knowledge/tone-of-voice.md` before drafting any content.
- When suggesting a new idea, check `objectives.csv` and `topics.csv` first to use existing IDs before proposing new ones.
- Do not modify `index.html` unless asked — it is the view layer only.
- When the user says "add an idea", produce a ready-to-paste CSV row, not prose.
- Prefer existing topics over creating new ones; only propose a new topic if none of the existing 9 fit.
