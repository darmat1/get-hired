"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { WorkExperience, Education, Skill } from "@/types/resume";

interface ProfileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
  type: "experience" | "education" | "skills";
  skillsCategory?: "technical" | "soft" | "language";
}

export function ProfileImportModal({
  isOpen,
  onClose,
  onImport,
  type,
  skillsCategory,
}: ProfileImportModalProps) {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setSelectedIds([]);
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/experience");
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItems = () => {
    if (!profileData) return [];
    switch (type) {
      case "experience":
        return Array.isArray(profileData.workExperience) ? profileData.workExperience : [];
      case "education":
        return Array.isArray(profileData.education) ? profileData.education : [];
      case "skills":
        if (!Array.isArray(profileData.skills)) return [];
        if (!skillsCategory) return profileData.skills;
        return profileData.skills.filter(
          (s: Skill) => s.category === skillsCategory,
        );
      default:
        return [];
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleImport = () => {
    const items = getItems();
    const selectedItems = items.filter((item: any) =>
      selectedIds.includes(item.id),
    );
    onImport(selectedItems);
    onClose();
  };

  const items = getItems();

  const getTitle = () => {
    switch (type) {
      case "experience":
        return t("profile.import_experience");
      case "education":
        return t("profile.import_education");
      case "skills":
        if (skillsCategory === "technical") {
          return t("skills.technical");
        }
        if (skillsCategory === "soft") {
          return t("skills.soft");
        }
        if (skillsCategory === "language") {
          return t("skills.languages");
        }
        return t("profile.import_skills");
      default:
        return "";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.length === 0}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            {t("profile.import_selected")} ({selectedIds.length})
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">
            {t("profile.loading_profile")}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("profile.no_items_found")}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {items.map((item: any) => (
            <div
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-4 ${
                selectedIds.includes(item.id)
                  ? "border-slate-500 bg-slate-50 dark:bg-slate-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="mt-1">
                {selectedIds.includes(item.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-slate-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1 text-left">
                {type === "experience" && (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.company} • {item.startDate} -{" "}
                      {item.current ? "Present" : item.endDate}
                    </p>
                  </>
                )}
                {type === "education" && (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.degree} {item.field && `in ${item.field}`}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.institution} • {item.startDate} -{" "}
                      {item.current ? "Present" : item.endDate}
                    </p>
                  </>
                )}
                {type === "skills" && (
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
