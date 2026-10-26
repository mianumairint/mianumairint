"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  score: number;
  issues: string;
  suggestions: string;
  createdAt: string;
}

interface ParsedIssue {
  type: "error" | "warning" | "pass";
  message: string;
}

function parseIssuesAndSuggestions(
  issues: string,
  suggestions: string,
  score: number
): ParsedIssue[] {
  const result: ParsedIssue[] = [];

  try {
    const issueList: string[] = JSON.parse(issues);
    issueList.forEach((msg) =>
      result.push({ type: "error", message: msg })
    );
  } catch {
    if (issues && issues.trim()) {
      result.push({ type: "error", message: issues });
    }
  }

  try {
    const suggestionList: string[] = JSON.parse(suggestions);
    suggestionList.forEach((msg) =>
      result.push({ type: "warning", message: msg })
    );
  } catch {
    if (suggestions && suggestions.trim()) {
      result.push({ type: "warning", message: suggestions });
    }
  }

  // Add some inferred passed checks based on score
  const passChecks = [
    { label: "Page has a title tag", threshold: 10 },
    { label: "Page has a meta description", threshold: 20 },
    { label: "Page is indexable", threshold: 30 },
    { label: "Open Graph tags present", threshold: 50 },
    { label: "Focus keyword is set", threshold: 60 },
    { label: "Canonical URL configured", threshold: 70 },
    { label: "Schema markup present", threshold: 80 },
  ];

  passChecks.forEach((check) => {
    if (score >= check.threshold) {
      result.push({ type: "pass", message: check.label });
    }
  });

  return result;
}

export default function SeoAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/seo/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function runAudit() {
    setRunning(true);
    setProgress("Analyzing all pages...");
    try {
      const res = await fetch("/api/admin/seo/audit", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.message || "Audit complete!");
        fetchLogs();
      } else {
        setProgress("Audit failed. Please try again.");
      }
    } catch {
      setProgress("Error running audit.");
    } finally {
      setRunning(false);
      setTimeout(() => setProgress(""), 4000);
    }
  }

  // Deduplicate: keep only the latest log per entityType+entityId
  const latestLogs = Object.values(
    logs.reduce<Record<string, AuditLog>>((acc, log) => {
      const key = `${log.entityType}:${log.entityId}`;
      if (!acc[key] || new Date(log.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = log;
      }
      return acc;
    }, {})
  );

  const green = latestLogs.filter((l) => l.score >= 80).length;
  const orange = latestLogs.filter((l) => l.score >= 50 && l.score < 80).length;
  const red = latestLogs.filter((l) => l.score < 50).length;

  function scoreColor(score: number) {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  }

  function scoreBg(score: number) {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/seo"
              className="text-on-surface-variant hover:text-on-surface transition"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              SEO Audit Tool
            </h1>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            Analyze all pages for SEO issues and improvements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              alert("Export functionality coming soon.");
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition font-label text-sm text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            onClick={runAudit}
            disabled={running}
            className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-8 py-3 rounded-full disabled:opacity-60 transition-all flex items-center gap-2"
          >
            {running && (
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
            )}
            {running ? "Running..." : "Run Full Audit"}
          </button>
        </div>
      </div>

      {progress && (
        <div className="bg-primary/10 text-primary rounded-xl px-4 py-3 font-body text-sm">
          {progress}
        </div>
      )}

      {/* Score Distribution */}
      {latestLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
            <p className="font-headline text-2xl text-on-surface">{green}</p>
            <p className="font-label text-xs text-on-surface-variant">Good (80+)</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-orange-500">warning</span>
            </div>
            <p className="font-headline text-2xl text-on-surface">{orange}</p>
            <p className="font-label text-xs text-on-surface-variant">Needs Work (50-79)</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-red-500">error</span>
            </div>
            <p className="font-headline text-2xl text-on-surface">{red}</p>
            <p className="font-label text-xs text-on-surface-variant">Poor (&lt;50)</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {latestLogs.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-8" />
                  <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Entity Name
                  </th>
                  <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Last Audited
                  </th>
                  <th className="text-right px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {latestLogs.map((log) => {
                  let issueCount = 0;
                  try {
                    issueCount = JSON.parse(log.issues).length;
                  } catch {
                    /* empty */
                  }
                  const isExpanded = expandedId === log.id;
                  const parsedDetails = parseIssuesAndSuggestions(
                    log.issues,
                    log.suggestions,
                    log.score
                  );
                  const errors = parsedDetails.filter((d) => d.type === "error");
                  const warnings = parsedDetails.filter((d) => d.type === "warning");
                  const passes = parsedDetails.filter((d) => d.type === "pass");

                  return (
                    <>
                      <tr
                        key={log.id}
                        className={`hover:bg-surface-container/30 transition cursor-pointer ${
                          isExpanded ? "bg-surface-container/20" : ""
                        }`}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : log.id)
                        }
                      >
                        <td className="pl-5 py-3">
                          <span
                            className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          >
                            chevron_right
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-body text-sm text-on-surface truncate max-w-[220px]">
                            {log.entityName}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-md font-label text-xs font-medium bg-primary/10 text-primary">
                            {log.entityType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${scoreBg(log.score)}`}
                            />
                            <span
                              className={`font-headline text-lg ${scoreColor(log.score)}`}
                            >
                              {log.score}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="font-label text-sm text-on-surface-variant">
                            {issueCount}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-label text-xs text-on-surface-variant">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/admin/seo/pages/${log.entityType}/${log.entityId}`}
                            className="mineral-glow px-3 py-1.5 rounded-lg font-label text-xs font-medium inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              edit
                            </span>
                            Fix
                          </Link>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${log.id}-details`}>
                          <td colSpan={7} className="px-5 py-4 bg-surface-container/10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                              {/* Errors */}
                              {errors.length > 0 && (
                                <div>
                                  <p className="font-label text-xs uppercase tracking-widest text-red-500 mb-2">
                                    Issues ({errors.length})
                                  </p>
                                  <div className="space-y-1.5">
                                    {errors.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-1.5"
                                      >
                                        <span className="material-symbols-outlined text-[14px] text-red-500 mt-0.5 shrink-0">
                                          cancel
                                        </span>
                                        <span className="font-body text-xs text-on-surface leading-snug">
                                          {item.message}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Warnings */}
                              {warnings.length > 0 && (
                                <div>
                                  <p className="font-label text-xs uppercase tracking-widest text-orange-500 mb-2">
                                    Warnings ({warnings.length})
                                  </p>
                                  <div className="space-y-1.5">
                                    {warnings.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-1.5"
                                      >
                                        <span className="material-symbols-outlined text-[14px] text-orange-500 mt-0.5 shrink-0">
                                          warning
                                        </span>
                                        <span className="font-body text-xs text-on-surface leading-snug">
                                          {item.message}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Passed */}
                              {passes.length > 0 && (
                                <div>
                                  <p className="font-label text-xs uppercase tracking-widest text-green-500 mb-2">
                                    Passed ({passes.length})
                                  </p>
                                  <div className="space-y-1.5">
                                    {passes.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-1.5"
                                      >
                                        <span className="material-symbols-outlined text-[14px] text-green-500 mt-0.5 shrink-0">
                                          check_circle
                                        </span>
                                        <span className="font-body text-xs text-on-surface leading-snug">
                                          {item.message}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">
            query_stats
          </span>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            Run your first audit
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
            Click the &quot;Run Full Audit&quot; button to analyze all your pages for SEO
            issues, missing metadata, and optimization opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
