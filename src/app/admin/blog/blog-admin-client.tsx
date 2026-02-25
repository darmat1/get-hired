"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { createPost, deletePost } from "@/lib/actions/blog";

export default function BlogAdminClient({
  initialPosts,
}: {
  initialPosts: any[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title_en: "",
    body_en: "",
    title_ru: "",
    body_ru: "",
    title_uk: "",
    body_uk: "",
    topic: "",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const content = {
      en: { title: formData.title_en, body: formData.body_en },
      ru: { title: formData.title_ru, body: formData.body_ru },
      uk: { title: formData.title_uk, body: formData.body_uk },
    };

    try {
      const newPost = await createPost({
        slug: formData.slug,
        content,
        published: true,
      });
      setPosts([newPost, ...posts]);
      setFormData({
        slug: "",
        title_en: "",
        body_en: "",
        title_ru: "",
        body_ru: "",
        title_uk: "",
        body_uk: "",
        topic: "",
        requirements: "",
      });
    } catch (err) {
      alert("Error creating post");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateFromAI = async () => {
    // Generate English/Russian/Ukrainian content from Topic + Requirements
    if (!formData.topic || !formData.requirements) {
      alert("Please provide topic and requirements before generating AI content");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/account/generate-blog-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: formData.slug, topic: formData.topic, requirements: formData.requirements }),
      });
      const data = await res.json();
      if (data?.content) {
        const en = data.content.en || { title: formData.title_en, body: formData.body_en };
        const ru = data.content.ru || { title: formData.title_ru, body: formData.body_ru };
        const uk = data.content.uk || { title: formData.title_uk, body: formData.body_uk };
        setFormData({
          ...formData,
          title_en: en.title ?? formData.title_en,
          body_en: en.body ?? formData.body_en,
          title_ru: ru.title ?? formData.title_ru,
          body_ru: ru.body ?? formData.body_ru,
          title_uk: uk.title ?? formData.title_uk,
          body_uk: uk.body ?? formData.body_uk,
        });
      } else {
        alert("AI content generation failed: no content returned");
      }
    } catch (err) {
      alert("Error generating content from AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error deleting post");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
        <h2 className="text-xl font-bold mb-6">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Slug (e.g. my-post-123)
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold">AI Content Parameters</h3>
            <input
              type="text"
              placeholder="Topic"
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
            />
            <textarea
              placeholder="Requirements (AI prompts)"
              rows={3}
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
            />
            <button
              type="button"
              onClick={handleGenerateFromAI}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : null}
              Generate from AI
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold">English Content</h3>
            <input
              type="text"
              placeholder="Title (EN)"
              required
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.title_en}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
            />
            <textarea
              placeholder="Body (EN) - HTML supported"
              required
              rows={4}
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.body_en}
              onChange={(e) =>
                setFormData({ ...formData, body_en: e.target.value })
              }
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold">Russian Content</h3>
            <input
              type="text"
              placeholder="Title (RU)"
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.title_ru}
              onChange={(e) =>
                setFormData({ ...formData, title_ru: e.target.value })
              }
            />
            <textarea
              placeholder="Body (RU)"
              rows={2}
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.body_ru}
              onChange={(e) =>
                setFormData({ ...formData, body_ru: e.target.value })
              }
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="font-bold">Ukrainian Content</h3>
            <input
              type="text"
              placeholder="Title (UK)"
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.title_uk}
              onChange={(e) =>
                setFormData({ ...formData, title_uk: e.target.value })
              }
            />
            <textarea
              placeholder="Body (UK)"
              rows={2}
              className="w-full bg-slate-800 border-slate-700 rounded p-2"
              value={formData.body_uk}
              onChange={(e) =>
                setFormData({ ...formData, body_uk: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
          >
            {isCreating ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Existing Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center"
            >
              <div>
                <div className="font-bold">{post.slug}</div>
                <div className="text-sm text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
