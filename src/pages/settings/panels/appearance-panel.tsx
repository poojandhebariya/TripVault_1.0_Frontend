import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import {
  RowItem,
  SettingsCard,
} from "../settings-primitives";
import MobileStickyHeader from "../../../components/mobile-sticky-header";

type Theme = "light" | "dark" | "system";
type Language = "en" | "hi" | "es" | "fr";

const THEME_OPTIONS: { val: Theme; icon: typeof faSun; label: string }[] = [
  { val: "light", icon: faSun, label: "Light" },
  { val: "dark", icon: faMoon, label: "Dark" },
  { val: "system", icon: faGlobe, label: "Auto" },
];

const LANGUAGES: { val: Language; flag: string; label: string }[] = [
  { val: "en", flag: "🇬🇧", label: "English" },
  { val: "hi", flag: "🇮🇳", label: "Hindi" },
  { val: "es", flag: "🇪🇸", label: "Spanish" },
  { val: "fr", flag: "🇫🇷", label: "French" },
];

const AppearancePanel = () => {
  // Demo states (not persisted to backend for this UI demo)
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Appearance" />
      <div className="p-5 md:p-0">
        <div className="space-y-6">
          <SettingsCard>
            <RowItem
              label="Theme"
              description="Choose your preferred colour scheme"
              right={
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setTheme(opt.val)}
                      className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                        theme === opt.val
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      <FontAwesomeIcon icon={opt.icon} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              }
            />
          </SettingsCard>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Language
          </p>
          <SettingsCard>
            <div className="py-3 divide-y divide-gray-100">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.val}
                  type="button"
                  onClick={() => setLanguage(lang.val)}
                  className="w-full flex items-center justify-between py-3 first:pt-1 last:pb-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-xl">{lang.flag}</span>
                    {lang.label}
                  </div>
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border-2 transition-all",
                      language === lang.val
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 group-hover:border-gray-400",
                    )}
                  />
                </button>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

export default AppearancePanel;
