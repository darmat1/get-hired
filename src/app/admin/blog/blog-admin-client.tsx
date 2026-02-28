"use client";

import { useState } from "react";
import {
  Loader,
  Image as ImageIcon,
  X,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { createPost, deletePost, updatePost } from "@/lib/actions/blog";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function BlogAdminClient({
  initialPosts,
}: {
  initialPosts: any[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "uk">("en");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: "",
    title_en: "",
    excerpt_en: "",
    body_en: "",
    title_ru: "",
    excerpt_ru: "",
    body_ru: "",
    title_uk: "",
    excerpt_uk: "",
    body_uk: "",
    topic: "",
    requirements: "",
    provider: "openrouter-trinity",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setCurrentImageUrl(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const clearForm = () => {
    setFormData({
      slug: "",
      title_en: "",
      excerpt_en: "",
      body_en: "",
      title_ru: "",
      excerpt_ru: "",
      body_ru: "",
      title_uk: "",
      excerpt_uk: "",
      body_uk: "",
      topic: "",
      requirements: "",
      provider: "openrouter-trinity",
    });
    clearImage();
    setEditingPostId(null);
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    const content = post.content || {};
    setFormData({
      slug: post.slug,
      title_en: content.en?.title || "",
      excerpt_en: content.en?.excerpt || "",
      body_en: content.en?.body || "",
      title_ru: content.ru?.title || "",
      excerpt_ru: content.ru?.excerpt || "",
      body_ru: content.ru?.body || "",
      title_uk: content.uk?.title || "",
      excerpt_uk: content.uk?.excerpt || "",
      body_uk: content.uk?.body || "",
      topic: "",
      requirements: "",
      provider: "openrouter-trinity",
    });
    setCurrentImageUrl(post.imageUrl || null);
    setImagePreview(post.imageUrl || null);
    setImageFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    let uploadedImageUrl: string | null = currentImageUrl;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blog")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("blog")
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const content = {
        en: {
          title: formData.title_en,
          body: formData.body_en,
          excerpt: formData.excerpt_en,
        },
        ru: {
          title: formData.title_ru,
          body: formData.body_ru,
          excerpt: formData.excerpt_ru,
        },
        uk: {
          title: formData.title_uk,
          body: formData.body_uk,
          excerpt: formData.excerpt_uk,
        },
      };

      if (editingPostId) {
        const updatedPost = await updatePost(editingPostId, {
          slug: formData.slug,
          content,
          imageUrl: uploadedImageUrl || undefined,
          published: true,
        });
        setPosts(posts.map((p) => (p.id === editingPostId ? updatedPost : p)));
      } else {
        const newPost = await createPost({
          slug: formData.slug,
          content,
          imageUrl: uploadedImageUrl || undefined,
          published: true,
        });
        setPosts([newPost, ...posts]);
      }

      clearForm();
    } catch (err) {
      console.error(err);
      alert("Error saving post or uploading image");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateFromAI = async () => {
    if (!formData.topic || !formData.requirements) {
      alert(
        "Please provide topic and requirements before generating AI content",
      );
      return;
    }
    setIsGenerating(true);
    try {
      console.log("[Blog] Starting generation with provider:", formData.provider);
      const res = await fetch("/api/account/generate-blog-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          topic: formData.topic,
          requirements: formData.requirements,
          provider: formData.provider,
        }),
      });
      const data = await res.json();
      console.log("[Blog] Response:", data);
      
      if (!res.ok) {
        alert(`Error: ${data.error || "Unknown error"}`);
        return;
      }
      
      if (data?.content) {
        const en = data.content.en || {
          title: formData.title_en,
          body: formData.body_en,
          excerpt: formData.excerpt_en,
        };
        const ru = data.content.ru || {
          title: formData.title_ru,
          body: formData.body_ru,
          excerpt: formData.excerpt_ru,
        };
        const uk = data.content.uk || {
          title: formData.title_uk,
          body: formData.body_uk,
          excerpt: formData.excerpt_uk,
        };

        setFormData({
          ...formData,
          title_en: en.title ?? formData.title_en,
          body_en: en.body ?? formData.body_en,
          excerpt_en: en.excerpt ?? formData.excerpt_en,
          title_ru: ru.title ?? formData.title_ru,
          body_ru: ru.body ?? formData.body_ru,
          excerpt_ru: ru.excerpt ?? formData.excerpt_ru,
          title_uk: uk.title ?? formData.title_uk,
          body_uk: uk.body ?? formData.body_uk,
          excerpt_uk: uk.excerpt ?? formData.excerpt_uk,
        });
      } else {
        alert("AI content generation failed: no content returned");
      }
    } catch (err) {
      console.error("[Blog] Generation error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error generating content from AI: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      await deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      if (editingPostId === id) {
        clearForm();
      }
    } catch (err) {
      alert("Error deleting post");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Main Content Area: Editor */}
      <div className="flex-1 w-full max-w-7xl bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingPostId ? "Edit Post" : "Create New Post"}
          </h2>
          {editingPostId && (
            <button
              onClick={clearForm}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Cover Image
            </label>
            {imagePreview ? (
              <div className="relative w-full max-w-2xl h-64 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-500 p-2 rounded-full text-white transition shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-2xl h-40 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition">
                  <ImageIcon className="w-10 h-10 mb-3" />
                  <p className="text-sm font-medium">Click to upload image</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Slug (URL path)
            </label>
            <input
              type="text"
              required
              className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="e.g. why-nextjs-is-awesome"
            />
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              AI Content Generation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Topic"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
              <textarea
                placeholder="Requirements (AI prompts)"
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
              >
                <option value="groq">Groq</option>
                <option value="openrouter-trinity">OpenRouter (Trinity)</option>
                <option value="openrouter-stepfun">OpenRouter (StepFun)</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateFromAI}
                disabled={isGenerating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : null}
                Generate from AI
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 mb-6">
              {[
                { id: "en", label: "English 🇬🇧" },
                { id: "ru", label: "Russian 🇷🇺" },
                { id: "uk", label: "Ukrainian 🇺🇦" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Language Content Area */}
            <div className="space-y-6">
              <input
                type="text"
                placeholder={`Title (${activeTab.toUpperCase()})`}
                required={activeTab === "en"}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                value={(formData as any)[`title_${activeTab}`]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [`title_${activeTab}`]: e.target.value,
                  })
                }
              />
              <textarea
                placeholder={`Excerpt (${activeTab.toUpperCase()})`}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                value={(formData as any)[`excerpt_${activeTab}`]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [`excerpt_${activeTab}`]: e.target.value,
                  })
                }
              />
              <textarea
                placeholder={`Body (${activeTab.toUpperCase()}) - HTML supported`}
                required={activeTab === "en"}
                rows={15}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white font-mono text-sm"
                value={(formData as any)[`body_${activeTab}`]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [`body_${activeTab}`]: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 shadow-md"
            >
              {isCreating ? <Loader className="h-5 w-5 animate-spin" /> : null}
              {editingPostId ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar: Posts List */}
      <div className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Posts ({posts.length})
          </h2>
          <button
            onClick={clearForm}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 rounded-lg transition"
            title="New Post"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleEdit(post)}
              className={`group flex items-center gap-4 p-3 rounded-lg border transition cursor-pointer
                ${
                  editingPostId === post.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-500"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }
              `}
            >
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-12 h-12 object-cover rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {post.slug}
                </div>
                <div
                  className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                  suppressHydrationWarning
                >
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(post.id, e)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition ml-auto"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
