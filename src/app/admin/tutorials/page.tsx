"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { Tutorial } from "@/lib/types";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import { Tv, Plus, Edit2, Trash2, X, CheckCircle2 } from "lucide-react";

export default function AdminTutorialsPage() {
  const { tutorials, tools, saveTutorials } = useNexusStore();
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    toolName: string;
    toolSlug: string;
    videoUrl: string;
    duration: string;
    description: string;
    stepsText: string;
  }>({
    title: "",
    toolName: tools[0]?.name || "OTP Testing Utility",
    toolSlug: tools[0]?.slug || "otp-testing-utility",
    videoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    duration: "5 mins",
    description: "",
    stepsText: "Step 1\nStep 2\nStep 3"
  });

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData({
      title: "New Setup Tutorial Video",
      toolName: tools[0]?.name || "OTP Testing Utility",
      toolSlug: tools[0]?.slug || "otp-testing-utility",
      videoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
      duration: "Full Guide",
      description: "Complete setup & activation walkthrough.",
      stepsText: "Download the tool package\nExtract and run as Administrator\nCopy HWID and activate on Toolsbd.com"
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (tut: Tutorial) => {
    setIsCreating(false);
    setEditing(tut);
    setFormData({
      title: tut.title,
      toolName: tut.toolName,
      toolSlug: tut.toolSlug,
      videoUrl: tut.videoUrl,
      duration: tut.duration,
      description: tut.description,
      stepsText: tut.steps.join("\n")
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = normalizeYouTubeEmbedUrl(formData.videoUrl);
    const stepsArray = formData.stepsText
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    if (isCreating) {
      const newTut: Tutorial = {
        id: `tut-${Date.now()}`,
        title: formData.title,
        toolName: formData.toolName,
        toolSlug: formData.toolSlug,
        videoUrl: cleanUrl,
        duration: formData.duration,
        description: formData.description,
        steps: stepsArray
      };
      saveTutorials([newTut, ...tutorials]);
      setIsCreating(false);
    } else if (editing) {
      saveTutorials(
        tutorials.map(t =>
          t.id === editing.id
            ? {
                ...t,
                title: formData.title,
                toolName: formData.toolName,
                toolSlug: formData.toolSlug,
                videoUrl: cleanUrl,
                duration: formData.duration,
                description: formData.description,
                steps: stepsArray
              }
            : t
        )
      );
      setEditing(null);
    }

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this tutorial video?")) {
      saveTutorials(tutorials.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Setup Videos &amp; Tutorials Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Paste any YouTube URL or full &lt;iframe&gt; embed code — changes appear immediately on Homepage, Tutorials &amp; Tool Details!
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Setup Video</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-yellow-400 text-black text-xs font-black flex items-center gap-2 shadow-neon-yellow">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Setup video updated! Live site now plays your new YouTube embed.</span>
        </div>
      )}

      {/* Tutorial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tutorials.map(tut => (
          <div
            key={tut.id}
            className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                <iframe
                  width="560"
                  height="315"
                  src={normalizeYouTubeEmbedUrl(tut.videoUrl)}
                  title={tut.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-yellow-400">{tut.toolName}</span>
                  <span className="text-slate-400">{tut.duration}</span>
                </div>
                <h3 className="text-lg font-black text-white">{tut.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{tut.description}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-2 break-all">
                  Embed URL: {tut.videoUrl}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(tut)}
                className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 shadow-neon-yellow"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Video / Embed</span>
              </button>
              <button
                onClick={() => handleDelete(tut.id)}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                title="Delete Tutorial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-5 border border-yellow-400/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-yellow-400" />
                <span>{isCreating ? "Add Setup Video" : "Edit Setup Video"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditing(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tool Name</label>
                  <input
                    type="text"
                    value={formData.toolName}
                    onChange={e => setFormData({ ...formData, toolName: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Duration Label</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-yellow-400 block mb-1">
                  YouTube Link OR Full &lt;iframe&gt; Embed Code
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder='Paste full <iframe src="https://www.youtube.com/embed/..."></iframe> or YouTube link'
                  className="w-full p-2.5 rounded-xl glass-input text-yellow-300 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-converted preview URL: <span className="font-mono text-white">{normalizeYouTubeEmbedUrl(formData.videoUrl)}</span>
                </p>
              </div>

              {/* Live Video Preview inside Admin Modal */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                <iframe
                  width="560"
                  height="315"
                  src={normalizeYouTubeEmbedUrl(formData.videoUrl)}
                  title="Live Video Preview"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Setup Steps (One step per line)</label>
                <textarea
                  rows={4}
                  value={formData.stepsText}
                  onChange={e => setFormData({ ...formData, stepsText: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black shadow-neon-yellow"
                >
                  Save Video &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
