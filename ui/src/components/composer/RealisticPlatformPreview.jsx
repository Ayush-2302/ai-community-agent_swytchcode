import React from "react";
import {
  MessageSquare,
  Repeat2,
  Heart,
  Share2,
  Bookmark,
  BarChart2,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Globe,
  CheckCircle,
} from "lucide-react";
import { PlatformIcon } from "../common/PlatformIcon";

export function RealisticPlatformPreview({
  platform = "X",
  content = "",
  mediaUrl = "",
  account = "",
}) {
  const norm = (platform || "x").toLowerCase();

  // 1. X (Twitter) Preview
  if (norm === "x" || norm === "twitter") {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 font-sans shadow-none">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-semibold text-slate-900 truncate">
                {account.includes("@") ? "Acme Engineering" : account || "Acme Official"}
              </span>
              <span className="inline-block w-3.5 h-3.5 text-blue-500 shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
              <span className="text-slate-500 font-normal truncate">
                {account || "@acme_eng"}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400">now</span>
            </div>

            <div className="mt-2 text-slate-900 whitespace-pre-wrap leading-relaxed text-xs">
              {content ? (
                content
              ) : (
                <span className="text-slate-400 italic">
                  Post preview text will render here...
                </span>
              )}
            </div>

            {mediaUrl && (
              <div className="mt-2.5 rounded-lg border border-slate-200 overflow-hidden max-h-56 bg-slate-100 flex items-center justify-center">
                <img
                  src={mediaUrl}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* X Action Toolbar */}
            <div className="flex items-center justify-between mt-3 pt-2 text-slate-400 border-t border-slate-100 px-1">
              <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-default">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[11px]">0</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-emerald-500 cursor-default">
                <Repeat2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">0</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-rose-500 cursor-default">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[11px]">0</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-default">
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">0</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-600 cursor-default">
                <Bookmark className="w-3.5 h-3.5" />
                <Share2 className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. LinkedIn Preview
  if (norm === "linkedin") {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-900 font-sans shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs shrink-0">
              in
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-xs">
                {account || "Acme Cloud Technologies"}
              </div>
              <div className="text-[11px] text-slate-500">14,290 followers</div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </div>

        {/* Content */}
        <div className="text-slate-900 whitespace-pre-wrap leading-relaxed text-xs mb-3">
          {content ? (
            content
          ) : (
            <span className="text-slate-400 italic">
              LinkedIn post draft will display here...
            </span>
          )}
        </div>

        {/* Media */}
        {mediaUrl && (
          <div className="rounded border border-slate-200 overflow-hidden max-h-56 bg-slate-100 mb-3">
            <img
              src={mediaUrl}
              alt="LinkedIn media"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* LinkedIn Interaction bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600 text-xs">
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-50">
            <ThumbsUp className="w-3.5 h-3.5" /> Like
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-50">
            <MessageSquare className="w-3.5 h-3.5" /> Comment
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-50">
            <Repeat2 className="w-3.5 h-3.5" /> Repost
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-50">
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>
    );
  }

  // 3. Instagram Preview
  if (norm === "instagram") {
    return (
      <div className="bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-sans shadow-none overflow-hidden max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 p-[1.5px]">
              <div className="w-full h-full bg-white rounded-full p-[1px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
              </div>
            </div>
            <span className="font-semibold text-xs text-slate-900">
              {account || "acmelabs"}
            </span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </div>

        {/* Media container */}
        <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Instagram photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
              <PlatformIcon platform="instagram" className="w-8 h-8 text-slate-300" />
              <span>Media preview required</span>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2 text-slate-800">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 hover:text-rose-500 cursor-default" />
              <MessageSquare className="w-4 h-4 hover:text-slate-600 cursor-default" />
              <Send className="w-4 h-4 hover:text-slate-600 cursor-default" />
            </div>
            <Bookmark className="w-4 h-4 hover:text-slate-600 cursor-default" />
          </div>

          <div className="text-slate-900 leading-normal text-xs">
            <span className="font-semibold mr-1.5">{account || "acmelabs"}</span>
            <span className="text-slate-800">
              {content || "Instagram caption preview text..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Facebook / General Preview
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 font-sans shadow-none">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
          f
        </div>
        <div>
          <div className="font-semibold text-xs text-slate-900">
            {account || "Acme Official Page"}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Just now</span> · <Globe className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      <div className="text-slate-800 whitespace-pre-wrap text-xs mb-3">
        {content || "Post text will appear here..."}
      </div>

      {mediaUrl && (
        <div className="rounded border border-slate-200 overflow-hidden max-h-56 bg-slate-100 mb-3">
          <img
            src={mediaUrl}
            alt="Facebook attachment"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-slate-600 text-xs">
        <button className="flex items-center gap-1.5 py-1">
          <ThumbsUp className="w-3.5 h-3.5" /> Like
        </button>
        <button className="flex items-center gap-1.5 py-1">
          <MessageSquare className="w-3.5 h-3.5" /> Comment
        </button>
        <button className="flex items-center gap-1.5 py-1">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
