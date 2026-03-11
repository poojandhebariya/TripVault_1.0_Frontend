import { useState } from "react";
import { cn } from "../../lib/cn-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faCheck,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faXTwitter,
  faWhatsapp,
  faTelegram,
  faReddit,
  faPinterest,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import Modal from "./modal";
import useIsMobile from "../../hooks/isMobile";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  description?: string;
}

interface Platform {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  buildUrl: (url: string, title: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: faWhatsapp,
    color: "text-white",
    bg: "bg-[#25D366]",
    buildUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: faFacebook,
    color: "text-white",
    bg: "bg-[#1877F2]",
    buildUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    icon: faXTwitter,
    color: "text-white",
    bg: "bg-black",
    buildUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: faTelegram,
    color: "text-white",
    bg: "bg-[#26A5E4]",
    buildUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: faReddit,
    color: "text-white",
    bg: "bg-[#FF4500]",
    buildUrl: (url, title) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: faPinterest,
    color: "text-white",
    bg: "bg-[#E60023]",
    buildUrl: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: faLinkedin,
    color: "text-white",
    bg: "bg-[#0A66C2]",
    buildUrl: (url, title) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

const ShareModal = ({
  open,
  onClose,
  url,
  title = "Check out this vault on TripVault!",
  description,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / WebViews
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description ?? title, url });
        onClose();
      } catch {
        // User dismissed — do nothing
      }
    }
  };

  const openPlatform = (platform: Platform) => {
    window.open(
      platform.buildUrl(url, title),
      "_blank",
      "noopener,noreferrer,width=600,height=500",
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this vault"
      description={title}
      icon={faShareNodes}
      variant={isMobile ? "bottom" : "center"}
      size="md"
      className={isMobile ? "h-auto" : undefined}
      bodyClassName="space-y-5"
    >
      {/* Social platform grid */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Share via
        </p>
        <div className="grid grid-cols-4 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => openPlatform(p)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              aria-label={`Share on ${p.label}`}
            >
              <span
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-md",
                  p.bg,
                )}
              >
                <FontAwesomeIcon
                  icon={p.icon}
                  className={cn("text-xl", p.color)}
                />
              </span>
              <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors leading-tight text-center">
                {p.label}
              </span>
            </button>
          ))}

          {/* Native share — only on devices that support the Web Share API (e.g. Capacitor APK) */}
          {typeof navigator !== "undefined" && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              aria-label="More sharing options"
            >
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-linear-to-br from-gray-700 to-gray-900 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-md">
                <FontAwesomeIcon
                  icon={faShareNodes}
                  className="text-xl text-white"
                />
              </span>
              <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors leading-tight text-center">
                More
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          or copy link
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Copy link row */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 transition-all duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
        <FontAwesomeIcon
          icon={faLink}
          className="text-gray-400 text-sm shrink-0"
        />
        <span className="flex-1 text-sm text-gray-600 truncate font-mono select-all">
          {url}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
            copied
              ? "bg-emerald-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white",
          )}
        >
          <FontAwesomeIcon
            icon={copied ? faCheck : faLink}
            className="text-[10px]"
          />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </Modal>
  );
};

export default ShareModal;
