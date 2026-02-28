"use client";

import { useState } from "react";
import {
  Loader,
  Image as ImageIcon,
  X,
  Trash2,
  Plus,
  Link2,
} from "lucide-react";
import { createPost, deletePost, updatePost } from "@/lib/actions/blog";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function BlogAdminClient({
  initialPosts,
  hasGeminiKey = false,
  hasOpenRouterKey = false,
  hasGroqKey = false,
}: {
  initialPosts: any[];
  hasGeminiKey?: boolean;
  hasOpenRouterKey?: boolean;
  hasGroqKey?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "uk">("en");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [relatedPostIds, setRelatedPostIds] = useState<string[]>([]);

  const defaultProvider = hasGeminiKey
    ? "gemini"
    : hasGroqKey
      ? "groq"
      : hasOpenRouterKey
        ? "openrouter-trinity"
        : "default";

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
    provider: defaultProvider,
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
      provider: defaultProvider,
    });
    clearImage();
    setRelatedPostIds([]);
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
      provider: defaultProvider,
    });
    setCurrentImageUrl(post.imageUrl || null);
    setImagePreview(post.imageUrl || null);
    setImageFile(null);
    setRelatedPostIds(post.relatedPostIds || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRelatedPost = (postId: string) => {
    setRelatedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : prev.length < 6
          ? [...prev, postId]
          : prev,
    );
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
          relatedPostIds,
        });
        setPosts(posts.map((p) => (p.id === editingPostId ? updatedPost : p)));
      } else {
        const newPost = await createPost({
          slug: formData.slug,
          content,
          imageUrl: uploadedImageUrl || undefined,
          published: true,
          relatedPostIds,
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

      if (!res.ok) {
        alert(`Error: ${data.error || "Unknown error"}`);
        return;
      }

      if (data?.content) {
        const en = data.content.en || {};
        const ru = data.content.ru || {};
        const uk = data.content.uk || {};

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
      if (editingPostId === id) clearForm();
    } catch (err) {
      alert("Error deleting post");
    }
  };

  const noKeysAvailable = !hasGeminiKey && !hasOpenRouterKey && !hasGroqKey;
  const availableForRelated = posts.filter((p) => p.id !== editingPostId);

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
          {/* Cover Image */}
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

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Slug (URL path)
            </label>
            <input
              type="text"
              required
              className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="e.g. why-nextjs-is-awesome"
            />
          </div>

          {/* AI Generation */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              AI Content Generation
            </h3>

            {noKeysAvailable && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                No AI API keys found. Add a Gemini or OpenRouter key in your
                profile settings to enable generation.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Topic"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
              <textarea
                placeholder="Requirements (AI prompts)"
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
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
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
              >
                {hasGeminiKey && (
                  <option value="gemini">
                    ✨ Gemini 2.5 Flash (recommended)
                  </option>
                )}
                {hasGroqKey && (
                  <option value="groq">Groq (Llama 3.3 70B)</option>
                )}
                {hasOpenRouterKey && (
                  <>
                    <option value="openrouter-trinity">
                      OpenRouter (Trinity)
                    </option>
                    <option value="openrouter-stepfun">
                      OpenRouter (StepFun)
                    </option>
                  </>
                )}
                {noKeysAvailable && (
                  <option value="default" disabled>
                    No API keys available
                  </option>
                )}
              </select>

              <button
                type="button"
                onClick={handleGenerateFromAI}
                disabled={isGenerating || noKeysAvailable}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : null}
                {isGenerating ? "Generating..." : "Generate from AI"}
              </button>
            </div>
          </div>

          {/* Related Posts */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Related Posts
                </h3>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {relatedPostIds.length}/6 selected
              </span>
            </div>

            {availableForRelated.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                No other posts available yet
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {availableForRelated.map((post) => {
                  const isSelected = relatedPostIds.includes(post.id);
                  const title =
                    post.content?.en?.title ||
                    post.content?.ru?.title ||
                    post.content?.uk?.title ||
                    post.slug;
                  const isDisabled = !isSelected && relatedPostIds.length >= 6;

                  return (
                    <button
                      key={post.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleRelatedPost(post.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-1 ring-blue-400"
                          : isDisabled
                            ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                      }`}
                    >
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate text-slate-800 dark:text-slate-200">
                          {title}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          /{post.slug}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 10 8"
                          >
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {relatedPostIds.length > 0 && (
              <button
                type="button"
                onClick={() => setRelatedPostIds([])}
                className="text-xs text-slate-400 hover:text-red-500 transition"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Language Tabs */}
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

            <div className="space-y-6">
              <input
                type="text"
                placeholder={`Title (${activeTab.toUpperCase()})`}
                required={activeTab === "en"}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white font-mono text-sm"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 shadow-md disabled:opacity-50"
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
          <h2 className="text-xl font-bold">Posts ({posts.length})</h2>
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
              className={`group flex items-center gap-4 p-3 rounded-lg border transition cursor-pointer ${
                editingPostId === post.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-500"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
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
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="text-xs text-slate-500 dark:text-slate-400"
                    suppressHydrationWarning
                  >
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  {post.relatedPostIds?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Link2 className="w-3 h-3" />
                      {post.relatedPostIds.length}
                    </div>
                  )}
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
