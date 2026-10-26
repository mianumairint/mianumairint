/**
 * SEO SCORING
 * ===========
 * Pure scoring rules, with no database or request access, so the audit route is
 * only the plumbing around them and the thresholds are all visible in one place.
 *
 * An entry starts at 100 and loses points per problem. Problems are split into
 * `issues` (something is missing or out of range) and `suggestions` (something
 * could be better), which is the split the dashboard renders.
 */

export interface SeoAuditInput {
  title?: string | null;
  metaDesc?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  slug: string;
  customSchema?: string | null;
}

export interface SeoAuditResult {
  score: number;
  issues: string[];
  suggestions: string[];
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function includesKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export function analyzeSeoEntry(entry: SeoAuditInput): SeoAuditResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const penalise = (points: number, issue: string) => {
    issues.push(issue);
    score -= points;
  };
  const suggest = (points: number, suggestion: string) => {
    suggestions.push(suggestion);
    score -= points;
  };

  /* Title */
  if (!entry.title) {
    penalise(25, "Missing page title");
  } else {
    if (entry.title.length < TITLE_MIN) {
      penalise(10, `Title too short (under ${TITLE_MIN} chars)`);
    }
    if (entry.title.length > TITLE_MAX) {
      penalise(5, `Title too long (over ${TITLE_MAX} chars)`);
    }
    if (entry.focusKeyword && !includesKeyword(entry.title, entry.focusKeyword)) {
      suggest(5, "Include focus keyword in title");
    }
  }

  /* Meta description */
  if (!entry.metaDesc) {
    penalise(20, "Missing meta description");
  } else {
    if (entry.metaDesc.length < DESC_MIN) {
      penalise(10, `Meta description too short (under ${DESC_MIN} chars)`);
    }
    if (entry.metaDesc.length > DESC_MAX) {
      penalise(5, `Meta description too long (over ${DESC_MAX} chars)`);
    }
    if (entry.focusKeyword && !includesKeyword(entry.metaDesc, entry.focusKeyword)) {
      suggest(5, "Include focus keyword in meta description");
    }
  }

  /* Focus keyword */
  if (!entry.focusKeyword) {
    penalise(10, "No focus keyword set");
  }

  /* Open Graph -- only flagged when there is no title/description to fall back on. */
  if (!entry.ogTitle && !entry.title) suggest(5, "Add Open Graph title");
  if (!entry.ogDescription && !entry.metaDesc) suggest(3, "Add Open Graph description");
  if (!entry.ogImage) suggest(5, "Add Open Graph image for social sharing");

  /* Slug */
  if (entry.slug.includes("_")) {
    suggest(3, "Use hyphens instead of underscores in slug");
  }

  /* Structured data */
  if (!entry.customSchema) {
    suggest(5, "Add structured data (JSON-LD schema)");
  }

  return { score: Math.max(0, score), issues, suggestions };
}
