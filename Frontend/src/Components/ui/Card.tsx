import { ShareIcon } from "../icons/Icons";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BackendUrl } from "../../config";
import type React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "instagram" | "note" | "pdf";
  id: string;
  text?: string; // 👈 add this to support note text
  setToast?: React.Dispatch<
    React.SetStateAction<{ message: string; success: boolean } | null>
  >;
}

const isSharedContent = location.pathname.includes("/share/");

function getYouTubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.searchParams.has("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    if (u.pathname.startsWith("/embed/")) return url;
    return url;
  } catch {
    return url;
  }
}

function getInstagramEmbedUrl(url: string) {
  try {
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?]+)/);
    if (match) {
      const type = match[1];
      const shortcode = match[2];
      return `https://www.instagram.com/${type}/${shortcode}/embed`;
    }
    return url;
  } catch {
    return url;
  }
}

export const Card = ({ title, link, type, id, text, setToast }: CardProps) => {
  const [tweetLoading, setTweetLoading] = useState(type === "twitter");

  useEffect(() => {
    if (type === "twitter" && (window as any).twttr?.widgets) {
      (window as any).twttr.widgets.load();
      (window as any).twttr.events.bind("rendered", () => {
        setTweetLoading(false);
      });
    }
  }, [type, link]);

  async function handleDeleteContent(contentId: string) {
    try {
      const response = await axios.delete(`${BackendUrl}/api/v1/content`, {
        headers: { token: localStorage.getItem("token") || "" },
        //@ts-ignore
        data: { contentId },
      });

      setToast?.({
        //@ts-ignore
        message: response?.data?.message ?? "Deleted!",
        success: true,
      });

      window.location.reload();
    } catch (error) {
      console.log(error);
      setToast?.({ message: "Can't Delete!", success: false });
    } finally {
      setTimeout(() => setToast?.(() => null), 3000);
    }
  }

  return (
    <div className="bg-white rounded-md p-4 border border-gray-200 shadow-md w-full">
      {/* Header */}
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="font-medium line-clamp-2">{title}</span>
        </div>
        <div className="flex items-center">
          {/* Share Button */}
          {link && (
            <a className="text-gray-500" href={link} target="_blank" rel="noopener noreferrer">
              <ShareIcon />
            </a>
          )}
          {/* Delete Button */}
          {!isSharedContent && (
            <button
              className="text-gray-500 pl-2 cursor-pointer"
              onClick={() => handleDeleteContent(id)}
              aria-label="Delete"
              title="Delete"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-4">
        {type === "youtube" && (
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full rounded"
              src={getYouTubeEmbedUrl(link)}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}

        {type === "twitter" && (
          <>
            {tweetLoading && (
              <div className="flex justify-center py-4 text-gray-500 text-sm">
                Loading tweet...
              </div>
            )}
            <blockquote
              className="twitter-tweet m-0"
              data-width="100%"
              style={{ margin: 0, display: tweetLoading ? "none" : "block" }}
            >
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </>
        )}

        {type === "instagram" && (
          <div className="w-full aspect-square">
            <iframe
              className="w-full h-full rounded"
              src={getInstagramEmbedUrl(link)}
              title="Instagram embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* ✅ NOTE Card */}
        {type === "note" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <p className="text-gray-800 whitespace-pre-wrap break-words">
              {text || "No note content available"}
            </p>
          </div>
        )}

        {/* ✅ PDF Card */}
        {type === "pdf" && (
          <div className="mt-2 p-3 border border-gray-200 rounded bg-gray-50">
            <p className="text-gray-700 mb-2">📄 PDF Uploaded:</p>
            <a
              href={`${BackendUrl}/${link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
