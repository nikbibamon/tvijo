"use client";

import { useState, useCallback } from "react";
import { Share2, Link2, Twitter, Linkedin, Copy, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  onShare?: (platform: string) => void;
  className?: string;
}

export function ShareButton({ url, title, description, onShare, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const shareText = `${title}${description ? ` - ${description}` : ""}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.("copy");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.("copy");
    }
  }, [fullUrl, onShare]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    onShare?.("twitter");
  }, [shareText, fullUrl, onShare]);

  const handleLinkedInShare = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
    onShare?.("linkedin");
  }, [fullUrl, onShare]);

  const handleTelegramShare = useCallback(() => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, "_blank", "width=600,height=400");
    onShare?.("telegram");
  }, [fullUrl, shareText, onShare]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Share this article</p>
            </div>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Link2 className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-white">{copied ? "Copied!" : "Copy Link"}</p>
                <p className="text-xs text-gray-500">Share anywhere</p>
              </div>
            </button>

            {/* Social platforms */}
            <div className="grid grid-cols-3 gap-1 p-2 border-t border-white/5">
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-[10px] text-gray-400">Twitter</span>
              </button>

              <button
                onClick={handleLinkedInShare}
                className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[10px] text-gray-400">LinkedIn</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  TG
                </div>
                <span className="text-[10px] text-gray-400">Telegram</span>
              </button>
            </div>

            {/* XP hint */}
            <div className="p-2 bg-emerald-400/10 border-t border-white/5">
              <p className="text-xs text-center text-emerald-400">
                🎉 Earn +10 XP for sharing!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
