"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales, type Locale } from "@/i18n";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const localeLabels: Record<Locale, { flag: string; name: string }> = {
  en: { flag: "\u{1F1FA}\u{1F1F8}", name: "English" },
  es: { flag: "\u{1F1EA}\u{1F1F8}", name: "Espa\u00F1ol" },
  fr: { flag: "\u{1F1EB}\u{1F1F7}", name: "Fran\u00E7ais" },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="relative group">
      <Button variant="ghost" size="icon" className="relative">
        <Globe className="h-4 w-4" />
        <span className="sr-only">Change language</span>
      </Button>
      <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
        <div className="rounded-md border bg-popover p-1 shadow-md min-w-[150px]">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => handleChange(l)}
              className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                l === locale ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <span>{localeLabels[l].flag}</span>
              <span>{localeLabels[l].name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
