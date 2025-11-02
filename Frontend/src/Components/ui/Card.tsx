import { ShareIcon } from "../icons/Icons";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BackendUrl } from "../../config";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "instagram" | "note" | "pdf";
  id: string;
  text?: string; // 👈 add this to support note text
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

export const Card = ({ title, link, type, id, text }: CardProps) => {
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
      toast.success("deleted successfully");
      window.location.reload();
    } catch (error) {
      console.log(error);
toast.error("something went wrong")    } 
  }


  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-start">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base pr-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {link && (
            <a 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-50"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShareIcon/>
            </a>
          )}
          {!isSharedContent && (
            <button
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-50"
              onClick={() => handleDeleteContent(id)}
              aria-label="Delete"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {type === "youtube" && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-50">
            <iframe
              className="w-full h-full"
              src={getYouTubeEmbedUrl(link)}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}

        {type === "twitter" && (
          <div className="rounded-lg overflow-hidden bg-gray-50">
            {tweetLoading && (
              <div className="flex justify-center items-center h-24 text-gray-400 text-sm">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
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
          </div>
        )}

        {type === "instagram" && (
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50">
            <iframe
              className="w-full h-full"
              src={getInstagramEmbedUrl(link)}
              title="Instagram embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {type === "note" && (
          <div className="mt-2 rounded-lg bg-gray-50 p-4">
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
              {text || "No note content available"}
            </p>
          </div>
        )}

        {type === "pdf" && (
          <div className="mt-2 rounded-lg bg-gray-50 p-4 flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">PDF Document</p>
              <a
                href={`${BackendUrl}/${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                View PDF →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




