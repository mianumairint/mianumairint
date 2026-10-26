"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/admin/LoadingState";

const tabs = ["General", "Shipping", "Payment"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  // Settings as key-value map
  const [settings, setSettings] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaveMsg("Settings saved successfully");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err: any) {
      setSaveMsg(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl text-on-surface">Settings</h1>
        <div className="flex items-center justify-center py-24">
          <LoadingState label="Loading settings..." className="text-center" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl text-on-surface">Settings</h1>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchSettings} className="ml-3 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-on-surface">Settings</h1>

      {/* Success/Error Message */}
      {saveMsg && (
        <div className={`px-4 py-3 rounded-lg font-body text-sm ${
          saveMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-outline-variant/30">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-label text-sm transition ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* General */}
      {activeTab === "General" && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-6 max-w-2xl">
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Company Name</label>
            <input
              type="text"
              value={settings.company_name || ""}
              onChange={(e) => updateSetting("company_name", e.target.value)}
              placeholder="Mian Umair International"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => updateSetting("tagline", e.target.value)}
              placeholder="Premium Himalayan Salt Products"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => updateSetting("contact_email", e.target.value)}
              placeholder="info@mianumair.com"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Pakistan Phone</label>
              <input
                type="text"
                value={settings.phone_pakistan || ""}
                onChange={(e) => updateSetting("phone_pakistan", e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Canada Phone</label>
              <input
                type="text"
                value={settings.phone_canada || ""}
                onChange={(e) => updateSetting("phone_canada", e.target.value)}
                placeholder="+1 (416) 555-0199"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">WhatsApp</label>
            <input
              type="text"
              value={settings.whatsapp || ""}
              onChange={(e) => updateSetting("whatsapp", e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Address (Pakistan)</label>
            <textarea
              rows={2}
              value={settings.address_pakistan || ""}
              onChange={(e) => updateSetting("address_pakistan", e.target.value)}
              placeholder="Khewra Salt Mines, Jhelum, Punjab, Pakistan"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Address (Canada)</label>
            <textarea
              rows={2}
              value={settings.address_canada || ""}
              onChange={(e) => updateSetting("address_canada", e.target.value)}
              placeholder="Toronto, Ontario, Canada"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Shipping */}
      {activeTab === "Shipping" && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-6">
            <h3 className="font-label text-sm font-medium text-on-surface">Shipping Settings</h3>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Free Shipping Threshold ($)</label>
              <input
                type="text"
                value={settings.free_shipping_threshold || ""}
                onChange={(e) => updateSetting("free_shipping_threshold", e.target.value)}
                placeholder="150.00"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Default Shipping Rate ($)</label>
              <input
                type="text"
                value={settings.default_shipping_rate || ""}
                onChange={(e) => updateSetting("default_shipping_rate", e.target.value)}
                placeholder="12.00"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Estimated Delivery Days</label>
              <input
                type="text"
                value={settings.estimated_delivery_days || ""}
                onChange={(e) => updateSetting("estimated_delivery_days", e.target.value)}
                placeholder="5-10"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Payment */}
      {activeTab === "Payment" && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-6 max-w-2xl">
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Stripe Secret Key</label>
            <input
              type="password"
              value={settings.stripe_secret_key || ""}
              onChange={(e) => updateSetting("stripe_secret_key", e.target.value)}
              placeholder="sk_live_..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Stripe Publishable Key</label>
            <input
              type="text"
              value={settings.stripe_publishable_key || ""}
              onChange={(e) => updateSetting("stripe_publishable_key", e.target.value)}
              placeholder="pk_live_..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-label text-sm text-on-surface">Cash on Delivery (COD)</span>
            <button
              onClick={() => updateSetting("cod_enabled", settings.cod_enabled === "true" ? "false" : "true")}
              className={`relative w-11 h-6 rounded-full transition ${settings.cod_enabled === "true" ? "bg-primary" : "bg-outline-variant"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.cod_enabled === "true" ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Bank Transfer Details</label>
            <textarea
              rows={4}
              value={settings.bank_transfer_details || ""}
              onChange={(e) => updateSetting("bank_transfer_details", e.target.value)}
              placeholder="Bank: Allied Bank Ltd&#10;Account: 0123456789&#10;IBAN: PK36ABPA..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Currency</label>
            <input
              type="text"
              value={settings.currency || ""}
              onChange={(e) => updateSetting("currency", e.target.value)}
              placeholder="USD"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
