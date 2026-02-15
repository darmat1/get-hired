"use client";

import { PersonalInfo } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
  onNext?: () => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const { t } = useTranslation();

  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-4">{t("form.personal_info")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.first_name")}
          </label>
          <input
            type="text"
            value={data.firstName || ""}
            onChange={(e) => updateField("firstName", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.first_name")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.last_name")}
          </label>
          <input
            type="text"
            value={data.lastName || ""}
            onChange={(e) => updateField("lastName", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.last_name")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.email")}
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.email")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.phone")}
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.phone")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.location")}
          </label>
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.location")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            {t("form.website")}
          </label>
          <input
            type="url"
            value={data.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder={t("placeholder.website")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            LinkedIn
          </label>
          <input
            type="url"
            value={data.linkedin || ""}
            onChange={(e) => updateField("linkedin", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Telegram
          </label>
          <input
            type="text"
            value={data.telegram || ""}
            onChange={(e) => updateField("telegram", e.target.value)}
            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="@username"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {t("form.summary")}
        </label>
        <textarea
          value={data.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder={t("placeholder.summary")}
          className="
    w-full px-4 py-3 
    rounded-md 
    text-sm 
    transition-all
    
    bg-white border border-gray-300 text-gray-900
    placeholder:text-gray-400

    dark:bg-[var(--color-input)] 
    dark:border-[var(--color-border)] 
    dark:text-[var(--color-foreground)]
    dark:placeholder:text-[var(--color-muted-foreground)]
    
    focus:outline-none 
    focus:ring-2 
    focus:ring-[var(--color-ring)] 
    focus:border-transparent

    [field-sizing:content] 
    min-h-[110px] 
    resize-none
  "
        />
      </div>
    </div>
  );
}
