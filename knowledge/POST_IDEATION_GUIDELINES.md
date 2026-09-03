# Scando Social Media Operating Procedure: Lightweight Post Ideation Guidelines

**Document ID**: `SOP-POST-IDEATE-001`  
**Version**: `1.0`  
**Applies To**: Marketing Lead, Strategist, Founder, Content Creators  
**Scope**: Rapid, low-friction formulation and logging of content ideas into the **Backlog** (`status: "backlog"`).

---

## 1. Operating Principle: Zero-Friction Ideation (No Writing Required)

The purpose of the **Ideation Phase** is to capture content angles, market observations, and strategic hooks **without the heavy effort of drafting full post copy**.

```
[ Field Observation / Client Dilemma / Market Bad Habit ]
                           │
                           ▼
           Lightweight Metadata Mapping
    (Title • Topics • Objectives • Personas • Accounts)
                           │
                           ▼
          Created as a Backlog Post JSON
            (content: "", status: "backlog")
```

> [!IMPORTANT]
> **Do NOT write full post copy during Ideation.**  
> Writing copy during ideation creates heavy cognitive friction and slows down idea generation. During Ideation, your only job is to capture the strategic angle, map the metadata, and drop it into the Backlog.

---

## 2. The 4 Ideation Triggers (Where Ideas Come From)

High-craft ideas for Scando come from real-world operational friction, never from generic ChatGPT brainstorming prompts:

1. **The Client Field Encounter**:
   * A question an Egyptian business owner asked this week (*"Why do I need barcode scanners if my warehouse workers already know where everything is?"*).
   * A discrepancy found during a physical count (*"38 phantom SKUs discovered during audit"*).
2. **The "Governance by Trust" Dilemma (Family Businesses - `TOPIC-009`)**:
   * The patriarch who refuses to let the system approve purchase orders above 50,000 EGP without his personal handwritten signature.
   * The 2nd-generation engineer who wants modern dashboards while the senior accountant still runs shadow ledger notebooks.
3. **The Anti-Slop Industry Contrarian Stance**:
   * Calling out an absurd industry myth (e.g. *"Why Agile sprints in ERP are a commercial trap"* or *"Why training employees 2 weeks before Go-Live is an ambush"*).
4. **The GCC High-Throughput Challenge**:
   * A Saudi logistics director struggling with standard web screens failing under 10,000 daily order scans.

---

## 3. The Lightweight Post Schema (Ideation Record)

When logging an idea, create a new JSON file under `data/posts/` and register it in `data/posts/index.json`.

```json
{
  "id": "POST-026",
  "account_ids": ["ACC-008", "ACC-009"],
  "title": "فخ الإدارة بالثقة: ليه شركات عائلية عمرها 30 سنة بتنهار لما تحاول تركب ERP؟",
  "format": "Thought Leadership Post",
  "status": "backlog",
  "scheduled_date": "",
  "published_date": "",
  "topic_ids": ["TOPIC-009", "TOPIC-001"],
  "objective_ids": ["OBJ-001", "OBJ-003"],
  "persona_ids": ["PERS-001", "PERS-002"],
  "content": "",
  "notes": "فكرة المنشور: تفكيك سيكولوجية 'أنا واثق في فلان فمش محتاج سيستم'. التركيز على إن التحول الثقافي لازم يسبق تركيب الشاشات، وإزاي نريح المؤسس إن السيستم مش بيلغي سلطته لكن بيحمي تعب 30 سنة للجيل اللي بعده."
}
```

### Mandatory Fields During Ideation:
1. `id`: Next sequential ID (`POST-NNN`).
2. `title`: Sharp, specific working headline (in Arabic or English depending on channel).
3. `format`: Target format (`Thought Leadership Post`, `Carousel`, `Case Story`, `Technical Breakdown`).
4. `status`: Always `"backlog"`.
5. `topic_ids`: 1–2 linked topic pillars (especially checking `TOPIC-009` for family business).
6. `objective_ids`: 1 linked revenue objective.
7. `persona_ids`: 1–2 target decision-maker personas.
8. `account_ids`: Target publishing channels.
9. `content`: **Leave EMPTY (`""`)** or 1 rough bullet.
10. `notes`: 2–3 sentences capturing the core argument, angle, or hook so the writer can pick it up effortlessly later.

---

## 4. Measuring Backlog Health & Balance

Before concluding an ideation session, audit the Backlog to ensure diverse strategic inventory:
* [ ] Do we have ideas for Egyptian Family Businesses (`TOPIC-009`)?
* [ ] Do we have ideas for Warehouse & Operational Control (`TOPIC-003`)?
* [ ] Do we have ideas for High-Throughput GCC mobile layers (`TOPIC-006`)?
* [ ] Do we have ideas across both Founder personal channels (`ACC-008`/`ACC-009`) and Scando Corporate (`ACC-001`/`ACC-003`)?

Once logged into `backlog`, ideas sit safely in the bank until pulled into **This Month Calendar** via [`POST_SELECTION_GUIDELINES.md`](file:///g:/My%20Drive/01%20Scando%20Integrated%20Solutions/01.01%20Marketing/01.01%20Social%20Media/knowledge/POST_SELECTION_GUIDELINES.md).
