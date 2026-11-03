"use client";

import { useEffect } from "react";

/**
 * LANGUAGE SWITCHER
 * =================
 * The globe in the bottom-left corner that fans a ring of flags out when you
 * click it, matching the one the company already runs on mianumairint.com.
 *
 * That site uses GTranslate's WordPress plugin; this is the same widget from
 * GTranslate's own CDN, configured with the same twenty-three languages, so a
 * buyer who knows the old site finds the control where they expect it and gets
 * the same list.
 *
 * `url_structure: "none"` keeps the translation client-side: no /fr/ or /de/
 * routes appear, nothing is server-rendered per language, and our own URLs and
 * canonical tags are untouched. The trade is that the translated text is not
 * crawlable -- search engines index the English. For a machine translation
 * that is the right way round anyway: a generated /fr/ copy of every page
 * competes with the original for the same searches.
 *
 * Loaded after the page is interactive. It is a third-party script on a
 * corner button; it must never hold up the salt photographs.
 */

/** The languages the company's own site offers, in the same order. */
const LANGUAGES = [
  "af", "ar", "hy", "bn", "zh-TW", "cs", "nl", "en", "fr", "de", "el", "id",
  "it", "ja", "ms", "pt", "ru", "es", "sv", "th", "tr", "uz", "vi",
];

const SETTINGS = {
  default_language: "en",
  languages: LANGUAGES,
  url_structure: "none",
  detect_browser_language: 1,
  wrapper_selector: ".gtranslate_wrapper",
  flag_size: 24,
  globe_size: 60,
  // Bottom-left: the WhatsApp button already holds the bottom-right corner.
  horizontal_position: "left",
  vertical_position: "bottom",
  globe_color: "#8C4A3F",
  // flags_location is left unset: the widget then serves its own flag SVGs
  // from cdn.gtranslate.net, which is where the script came from anyway.
};

const WIDGET_SRC = "https://cdn.gtranslate.net/widgets/latest/globe.js";

export default function LanguageSwitcher() {
  // Loaded by hand rather than through next/script, because the widget reads
  // window.gtranslateSettings the moment it runs. Two <Script> tags would have
  // to be relied on to execute in the order they were written; assigning the
  // global and then appending the tag leaves nothing to rely on.
  useEffect(() => {
    // Icon-font ligatures are code, not copy. Protect both the initial page and
    // icons inserted after navigation before the translator sees their text.
    const protectIcons = (node: Element) => {
      const protect = (icon: Element) => {
        icon.setAttribute("translate", "no");
        icon.classList.add("notranslate");
      };
      if (node.matches(".material-symbols-outlined")) protect(node);
      node.querySelectorAll(".material-symbols-outlined").forEach(protect);
    };
    protectIcons(document.body);
    const icons = new MutationObserver((changes) => {
      changes.forEach((change) => change.addedNodes.forEach((node) => {
        if (node instanceof Element) protectIcons(node);
      }));
    });
    icons.observe(document.body, { childList: true, subtree: true });

    const setLanguage = (language: string) => {
      if (!LANGUAGES.includes(language)) return;
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      window.dispatchEvent(new Event("site:languagechange"));
    };
    try {
      const saved = JSON.parse(localStorage.getItem("__GT_TRANSLATE_LANGS") || "null");
      if (saved?.tgtLang) setLanguage(saved.tgtLang);
    } catch { /* Storage may be unavailable in private browsing. */ }
    const onLanguageClick = (event: MouseEvent) => {
      const language = event.target instanceof Element
        ? event.target.closest("[data-gt-lang]")?.getAttribute("data-gt-lang") : null;
      if (language) setLanguage(language);
    };
    document.addEventListener("click", onLanguageClick, true);

    if (!document.querySelector(`script[src="${WIDGET_SRC}"]`)) {
      (window as unknown as Record<string, unknown>).gtranslateSettings = SETTINGS;

      const script = document.createElement("script");
      script.src = WIDGET_SRC;
      script.defer = true;
      document.body.appendChild(script);
    }
    return () => {
      icons.disconnect();
      document.removeEventListener("click", onLanguageClick, true);
    };
  }, []);

  // The widget looks for this element and builds itself inside it. It is left
  // in place on unmount: the shop layout persists across navigation, so this
  // runs once, and tearing the widget down would lose the reader's language.
  return <div className="gtranslate_wrapper notranslate" translate="no" dir="ltr" />;
}
