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
}

export function ProfileImportModal({
  isOpen,
  onClose,
  onImport,
  type,
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
        return profileData.workExperience || [];
      case "education":
        return profileData.education || [];
      case "skills":
        return profileData.skills || [];
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="mt-1">
                {selectedIds.includes(item.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1 text-left">
                {type === "experience" && (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.company} • {item.startDate} -{" "}
                      {item.current ? "Present" : item.endDate}
                    </p>
                  </>
                )}
                {type === "education" && (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.degree} {item.field && `in ${item.field}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.institution} • {item.startDate} -{" "}
                      {item.current ? "Present" : item.endDate}
                    </p>
                  </>
                )}
                {type === "skills" && (
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
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
