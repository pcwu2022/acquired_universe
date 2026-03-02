# "Engage in the Community" Section — High-Level Design

## Overview

This section lives below the map and serves two modes:
- **First-time visitor**: Encourages participation via CTAs + shows the survey form
- **Returning visitor**: Shows community statistics, personalized with their own answers highlighted

---

## Architecture

### Data Flow

```
User fills survey
      │
      ▼
IndexedDB (local)  ──────────────────────────────────► Highlight user's answers in charts
      │
      │  POST /api/community-stats
      ▼
Supabase / DB (anonymous, aggregated)
      │
      │  GET /api/community-stats (aggregated only, no PII)
      ▼
Charts & statistics displayed to all users
```

### State Modes

```
┌─────────────────────────────────────────────────────┐
│  hasSubmittedSurvey?  (check IndexedDB on load)      │
│                                                      │
│  NO  → Show CTAs + Survey Form                       │
│  YES → Show CTAs (minus "Count Me In") + Statistics  │
└─────────────────────────────────────────────────────┘
```

---

## Section Layout

```
┌──────────────────────────────────────────────────────────┐
│  🌍  Engage in the Community                             │
│  "X,XXX listeners have shared their story"              │
│                                                          │
│  [ Join the Slack ]  [ Get Email Updates ]  [ Count Me In* ] │
│  * only shown if not on map yet                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [NOT SUBMITTED]          [SUBMITTED]                    │
│  Survey Form              Statistics Dashboard           │
│                           (with user answers highlighted)│
└──────────────────────────────────────────────────────────┘
```

---

## Survey Questions

| # | Question | Type |
|---|----------|------|
| 0 | Nickname | text |
| 1 | How old are you? | Multiple choice (ranges: <18, 18–24, 25–34, 35–44, 45–54, 55-64, 65+) |
| 2 | What is your gender? | Multiple choice |
| 3 | What is your occupation/industry? | Multiple choice (Tech, Finance, Healthcare, Student etc.) |
| 4 | How do you listen to Acquired? | Multiple answer (Spotify, Apple Podcasts, YouTube, etc.) |
| 5 | How often do you listen? | Multiple choice (Every episode, Most episodes, Occasionally) |
| 6 | How did you discover Acquired? | Multiple choice (Friend, Social Media, Newsletter, etc.) |
| 7 | What's your favorite episode? | Text (Search & autocomplete from episode list) |
| 8 | A short message to other listeners | Text |

---

## Statistics Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ GLOBAL FILTER BAR                                       │
│ [ All Users ▼ ]  [ Power Listeners ]  [ New Listeners ] │
│ Age ▼  Industry ▼  Platform ▼  Discovery ▼              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ EXECUTIVE SUMMARY                                       │
│ Total Responses | % Power Listeners | Top Platform      │
│ Top Discovery Source | Most Loved Episode               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AUDIENCE PROFILE                                        │
│ Age Distribution        │ Industry Breakdown            │
│ [vertical bar]          │ [horizontal bar]              │
│                         │                               │
│ Gender Distribution     │                               │
│ [donut or bar]          │                               │
├─────────────────────────┴───────────────────────────────┤
│ Hover: Show % of power listeners in each segment       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LISTENING BEHAVIOR                                      │
│ Listening Frequency     │ Listening Platforms           │
│ [stacked bar by age]    │ [multi-select bar chart]     │
├─────────────────────────┬───────────────────────────────┤
│ DISCOVERY → LOYALTY FUNNEL (Growth Insight)            │
│ [Sankey or stacked bars showing conversion rate]       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CONTENT AFFINITY                                        │
│ Top Episodes Ranked List                                │
│ [#1 NVIDIA | #2 LVMH | #3 Costco ...]                  │
│                                                         │
│ Toggle: View by Age / Industry / Platform              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ COMMUNITY VOICE                                         │
│ Top Requested Topics (auto-tagged themes)              │
│ [AI Infrastructure | Asian Conglomerates | PE Deals]   │
│                                                         │
│ Filterable Quote Cards                                  │
│ [scrollable anonymized messages]                       │
└─────────────────────────────────────────────────────────┘
```

---

## Component Structure

```
CommunitySection/
├── index.tsx                  # Orchestrator, reads IndexedDB
├── CTAButtons.tsx             # Slack / Email / Count Me In
├── survey/
│   ├── SurveyForm.tsx         # Multi-step survey
│   ├── QuestionRenderer.tsx   # Renders each question type
│   └── questions.ts           # Question definitions (typed)
├── stats/
│   ├── StatsDashboard.tsx     # Grid of charts
│   ├── AgeChart.tsx
│   ├── IndustryChart.tsx
│   ├── PlatformChart.tsx
│   └── TextQuoteCards.tsx
└── hooks/
    ├── useSurveyState.ts      # Read/write IndexedDB
    └── useCommunityStats.ts   # Fetch aggregated stats from API
```

---

## IndexedDB Schema

```typescript
// store: "community_survey"
interface SurveyRecord {
  id: "singleton";           // always one record per browser
  submittedAt: string;       // ISO date
  answers: {
    age_group: string;
    gender: string;
    industry: string;
    platforms: string[];     // multiple answer
    frequency: string;
    discovery: string;
    favorite_episode?: string;
    occupation?: string;
    want_covered?: string;
  };
}
```

---

## Key Design Decisions

### Privacy
- No user ID or fingerprint — purely client-side self-identification via IndexedDB
- API only accepts and returns **aggregated counts**, never raw rows

### Survey UX
- **Multi-step** with a progress bar (avoids overwhelming wall of questions)
- Skippable optional fields
- After submission: smooth transition to statistics view with a "Your answers are highlighted" tooltip

### Highlighting mechanic
```typescript
// Example: in AgeChart, highlight the user's bar
const userAgeGroup = surveyAnswers?.age_group; // from IndexedDB
// Pass to chart as `highlightValue={userAgeGroup}`
```

### Chart library
Use **Recharts** (already likely in the stack) or **Chart.js via react-chartjs-2** — both are lightweight and support custom cell coloring.

---

## API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/community-stats` | GET | Returns aggregated counts per question |
| `/api/community-stats` | POST | Accepts one anonymous survey submission |

---
