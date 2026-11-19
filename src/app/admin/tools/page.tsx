"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useNexusStore } from "@/lib/store";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import { Tool } from "@/lib/types";
import { Plus, Edit2, Trash2, Eye, ExternalLink, Check, X, Sparkles } from "lucide-react";

export default function AdminToolsPage() {
  const { tools, saveTools } = useNexusStore();
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: "",
    slug: "",
    category: "Security & Testing",
    tagline: "",
    description: "",
    version: "v1.0.0",
    bannerUrl: "/images/fast-otp-tool.jpg",
    status: "active",
    setupVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    downloadFilePath: "/releases/Setup.zip",
    downloadFileName: "Setup.zip",
    fileSize: "25 MB",
    checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    features: ["Feature 1", "Feature 2"],
    systemRequirements: {
      os: "Windows 10 / 11",
      ram: "4 GB",
      processor: "Core i3",
      netFramework: ".NET 8.0"
    }
  });

  const handleOpenEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData(tool);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingTool(null);
    setFormData({
      id: `tool-${Date.now()}`,
      name: "",
      slug: "",
      category: "Security & Testing",
      tagline: "",
      description: "",
      version: "v1.0.0",
      bannerUrl: "/images/fast-otp-tool.jpg",
      status: "active",
      setupVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      downloadFilePath: "/releases/Setup.zip",
      downloadFileName: "Setup.zip",
      fileSize: "25 MB",
      checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      features: ["Single HWID Lock", "High-speed multi-threading", "Direct updates"],
      systemRequirements: {
        os: "Windows 10 / 11",
        ram: "4 GB",
        processor: "Core i3 or higher",
        netFramework: ".NET 8.0"
      },
      screenshots: [
        "/images/fast-otp-tool.jpg"
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVideoUrl = normalizeYouTubeEmbedUrl(formData.setupVideoUrl);
    if (isCreating) {
      const newTool = {
        ...formData,
        setupVideoUrl: cleanVideoUrl,
        id: `tool-${Date.now()}`,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, "-") || `tool-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Tool;
      saveTools([newTool, ...tools]);
      setIsCreating(false);
    } else if (editingTool) {
      const updated = tools.map(t => {
        if (t.id === editingTool.id) {
          return {
            ...t,
            ...formData,
            setupVideoUrl: cleanVideoUrl,
            updatedAt: new Date().toISOString()
          } as Tool;
        }
        return t;
      });
      saveTools(updated);
      setEditingTool(null);
    }
  };

  const handleDelete = (toolId: string) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      saveTools(tools.filter(t => t.id !== toolId));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Tools Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add unlimited software tools, edit banner images, versions, download links, and setup videos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-neon-purple transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tool</span>
        </button>
      </div>

      {/* Tools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-white/10">
                <Image
                  src={tool.bannerUrl}
                  alt={tool.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-cyan-300 backdrop-blur-md">
                  {tool.version}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  {tool.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tool.status === "active" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-yellow-950 text-yellow-400"
                }`}>
                  {tool.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-1">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                {tool.tagline}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <a
                href={`/tools/${tool.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Live Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(tool)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Edit Tool"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                  title="Delete Tool"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Tool Modal */}
      {(isCreating || editingTool) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/30 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {isCreating ? "Add New Software Tool" : `Edit: ${editingTool?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTool(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tool Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                    placeholder="e.g. OTP Testing Utility"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                    placeholder="e.g. otp-testing-utility"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  >
                    <option value="active" className="bg-[#0b0f29]">Active</option>
                    <option value="maintenance" className="bg-[#0b0f29]">Maintenance</option>
                    <option value="beta" className="bg-[#0b0f29]">Beta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                  placeholder="Short one-line pitch"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Setup Video URL or &lt;iframe&gt; Embed Code</label>
                  <input
                    type="text"
                    value={formData.setupVideoUrl}
                    onChange={(e) => setFormData({ ...formData, setupVideoUrl: e.target.value })}
                    placeholder="Paste YouTube link or full <iframe> embed code"
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Download Package File Path</label>
                  <input
                    type="text"
                    value={formData.downloadFilePath}
                    onChange={(e) => setFormData({ ...formData, downloadFilePath: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Package Size</label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTool(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-neon-purple"
                >
                  Save Tool
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
