"use client";

import { Certificate } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Award } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface Props {
  data: Certificate[];
  onChange: (certs: Certificate[]) => void;
}

export function CertificatesEditor({ data, onChange }: Props) {
  const { t } = useTranslation();

  const add = () => {
    onChange([
      ...data,
      { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" },
    ]);
  };

  const update = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const remove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pt-6 mt-6 border-t border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-semibold">{t("cert.title")}</h2>
        </div>
        <Button onClick={add} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("cert.add")}
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">{t("cert.empty")}</div>
      ) : (
        <div className="space-y-3">
          {data.map((cert, index) => (
            <div
              key={cert.id}
              className="flex flex-col sm:flex-row gap-3 p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => update(index, "name", e.target.value)}
                    placeholder={t("cert.name_placeholder")}
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => update(index, "issuer", e.target.value)}
                    placeholder={t("cert.issuer_placeholder")}
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => update(index, "date", e.target.value)}
                    placeholder={t("cert.year_placeholder")}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
