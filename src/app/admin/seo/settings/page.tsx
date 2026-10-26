"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Settings {
  id: string;
  siteName: string;
  siteTagline: string | null;
  separatorChar: string;
  defaultMetaDesc: string | null;
  defaultOgImage: string | null;
  homeTitle: string | null;
  homeMetaDesc: string | null;
  homeOgImage: string | null;
  homeKeywords: string | null;
  googleVerification: string | null;
  bingVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  orgName: string;
  orgUrl: string;
  orgLogo: string | null;
  orgPhone: string | null;
  orgEmail: string | null;
  orgAddress: string | null;
  orgFoundingYear: string;
  orgSocialProfiles: string[];
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
  breadcrumbsEnabled: boolean;
  breadcrumbSeparator: string;
  breadcrumbHomeLabel: string;
}

const TABS = ["General", "Social & Organization", "Webmaster Tools", "Advanced"];

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [message, setMessage] = useState("");
  const [newProfile, setNewProfile] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/seo/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seo/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
      }
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof Settings, value: any) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  function addSocialProfile() {
    if (!settings || !newProfile.trim()) return;
    setSettings({
      ...settings,
      orgSocialProfiles: [...settings.orgSocialProfiles, newProfile.trim()],
    });
    setNewProfile("");
  }

  function removeSocialProfile(index: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      orgSocialProfiles: settings.orgSocialProfiles.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-on-surface-variant">Failed to load settings</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/seo" className="text-on-surface-variant hover:text-on-surface transition">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Global SEO Settings</h1>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            Configure site-wide SEO defaults and organization data
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mineral-glow px-5 py-2.5 rounded-xl font-label text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 font-body text-sm ${
            message.includes("success") ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-lowest rounded-xl p-1 tonal-shadow w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-label text-sm transition ${
              activeTab === tab
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 tonal-shadow space-y-5">
        {activeTab === "General" && (
          <>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Site Tagline</label>
              <input
                type="text"
                value={settings.siteTagline || ""}
                onChange={(e) => updateField("siteTagline", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Separator Character</label>
              <input
                type="text"
                value={settings.separatorChar}
                onChange={(e) => updateField("separatorChar", e.target.value)}
                className={inputClass}
                placeholder="|"
              />
              <p className="font-label text-xs text-on-surface-variant mt-1">
                Used between page title and site name (e.g., Page Title | Site Name)
              </p>
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Default Meta Description</label>
              <textarea
                value={settings.defaultMetaDesc || ""}
                onChange={(e) => updateField("defaultMetaDesc", e.target.value)}
                className={inputClass + " min-h-[80px] resize-y"}
                maxLength={160}
              />
              <p className="font-label text-xs text-on-surface-variant mt-1">
                {(settings.defaultMetaDesc || "").length}/160 characters
              </p>
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Default OG Image URL</label>
              <input
                type="url"
                value={settings.defaultOgImage || ""}
                onChange={(e) => updateField("defaultOgImage", e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Home Page Title</label>
              <input
                type="text"
                value={settings.homeTitle || ""}
                onChange={(e) => updateField("homeTitle", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Home Page Meta Description</label>
              <textarea
                value={settings.homeMetaDesc || ""}
                onChange={(e) => updateField("homeMetaDesc", e.target.value)}
                className={inputClass + " min-h-[80px] resize-y"}
                maxLength={160}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Home Page Keywords</label>
              <input
                type="text"
                value={settings.homeKeywords || ""}
                onChange={(e) => updateField("homeKeywords", e.target.value)}
                className={inputClass}
                placeholder="himalayan salt, pink salt, salt lamps..."
              />
            </div>
          </>
        )}

        {activeTab === "Social & Organization" && (
          <>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Organization Name</label>
              <input
                type="text"
                value={settings.orgName}
                onChange={(e) => updateField("orgName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Organization URL</label>
              <input
                type="url"
                value={settings.orgUrl}
                onChange={(e) => updateField("orgUrl", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Organization Logo URL</label>
              <input
                type="url"
                value={settings.orgLogo || ""}
                onChange={(e) => updateField("orgLogo", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={settings.orgPhone || ""}
                  onChange={(e) => updateField("orgPhone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Email</label>
                <input
                  type="email"
                  value={settings.orgEmail || ""}
                  onChange={(e) => updateField("orgEmail", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Address</label>
              <textarea
                value={settings.orgAddress || ""}
                onChange={(e) => updateField("orgAddress", e.target.value)}
                className={inputClass + " min-h-[60px] resize-y"}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Founding Year</label>
              <input
                type="text"
                value={settings.orgFoundingYear}
                onChange={(e) => updateField("orgFoundingYear", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Social Profiles</label>
              <div className="space-y-2">
                {settings.orgSocialProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={profile}
                      readOnly
                      className={inputClass + " flex-1"}
                    />
                    <button
                      onClick={() => removeSocialProfile(index)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newProfile}
                    onChange={(e) => setNewProfile(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className={inputClass + " flex-1"}
                    onKeyDown={(e) => e.key === "Enter" && addSocialProfile()}
                  />
                  <button
                    onClick={addSocialProfile}
                    className="mineral-glow px-3 py-2.5 rounded-xl font-label text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Webmaster Tools" && (
          <>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Google Verification Code</label>
              <input
                type="text"
                value={settings.googleVerification || ""}
                onChange={(e) => updateField("googleVerification", e.target.value)}
                className={inputClass}
                placeholder="google-site-verification=..."
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Bing Verification Code</label>
              <input
                type="text"
                value={settings.bingVerification || ""}
                onChange={(e) => updateField("bingVerification", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ""}
                onChange={(e) => updateField("googleAnalyticsId", e.target.value)}
                className={inputClass}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Google Tag Manager ID</label>
              <input
                type="text"
                value={settings.googleTagManagerId || ""}
                onChange={(e) => updateField("googleTagManagerId", e.target.value)}
                className={inputClass}
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </>
        )}

        {activeTab === "Advanced" && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-outline-variant/10">
                <div>
                  <p className="font-label text-sm font-medium text-on-surface">Default Robots Index</p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Allow search engines to index pages by default
                  </p>
                </div>
                <button
                  onClick={() => updateField("defaultRobotsIndex", !settings.defaultRobotsIndex)}
                  className={`relative w-12 h-7 rounded-full transition ${
                    settings.defaultRobotsIndex ? "bg-primary" : "bg-outline-variant/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.defaultRobotsIndex ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-outline-variant/10">
                <div>
                  <p className="font-label text-sm font-medium text-on-surface">Default Robots Follow</p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Allow search engines to follow links by default
                  </p>
                </div>
                <button
                  onClick={() => updateField("defaultRobotsFollow", !settings.defaultRobotsFollow)}
                  className={`relative w-12 h-7 rounded-full transition ${
                    settings.defaultRobotsFollow ? "bg-primary" : "bg-outline-variant/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.defaultRobotsFollow ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-outline-variant/10">
                <div>
                  <p className="font-label text-sm font-medium text-on-surface">Breadcrumbs Enabled</p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Show breadcrumb navigation with structured data
                  </p>
                </div>
                <button
                  onClick={() => updateField("breadcrumbsEnabled", !settings.breadcrumbsEnabled)}
                  className={`relative w-12 h-7 rounded-full transition ${
                    settings.breadcrumbsEnabled ? "bg-primary" : "bg-outline-variant/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.breadcrumbsEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Breadcrumb Separator</label>
              <input
                type="text"
                value={settings.breadcrumbSeparator}
                onChange={(e) => updateField("breadcrumbSeparator", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-sm font-medium text-on-surface block mb-1.5">Breadcrumb Home Label</label>
              <input
                type="text"
                value={settings.breadcrumbHomeLabel}
                onChange={(e) => updateField("breadcrumbHomeLabel", e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
