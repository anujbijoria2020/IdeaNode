import { ShareIcon } from "../icons/Icons";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BackendUrl } from "../../../config";
import type React from "react";
import axios from "axios";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube";
  id: string;
  setToast?: React.Dispatch<
    React.SetStateAction<{ message: string; success: boolean } | null>
  >;
}

const isSharedContent =location.pathname.includes("/share/");

function getYouTubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;

    // watch?v=<id>
    if (u.searchParams.has("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;

    // shorts/<id>
    if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;

    // already embed
    if (u.pathname.startsWith("/embed/")) return url;

    return url;
  } catch {
    return url;
  }
}

export const Card = ({ title, link, type, id, setToast }: CardProps) => {

  async function handleDeleteContent(contentId: string) {

    try {

      const response = await axios.delete(`${BackendUrl}/api/v1/content`, {

        headers: { 
          token: localStorage.getItem("token") || "" },
        data: { contentId },
      });

      setToast?.({ message: response?.data?.message ?? "Deleted!", success: true });
      window.location.reload();

    } catch (error) {

      console.log(error);
      setToast?.({ message: "Can't Delete!", success: false });

    } 
    finally {
      
      setTimeout(() => setToast?.(() => null), 3000);
    }
  }

  return (
    <div className="bg-white rounded-md p-4 w-full sm:w-72 lg:w-80 border border-gray-200 m-2 shadow-md">
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="text-gray-500">
            <ShareIcon />
          </span>
          <span className="font-medium line-clamp-2">{title}</span>
        </div>
        <div className="flex items-center">
          <a className="text-gray-500" href={link} target="_blank">
            <ShareIcon />
          </a>
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
          <blockquote className="twitter-tweet">
            <a href={link.replace("x.com", "twitter.com")}></a>
          </blockquote>
        )}
      </div>
    </div>
  );
};
