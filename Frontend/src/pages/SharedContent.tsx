import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BackendUrl } from "../config";
import { Sidebar } from "../Components/ui/Sidebar";
import { Card } from "../Components/ui/Card";
import { Library } from "lucide-react";
import type { ContentType } from "../Components/ui/CreateComponent";

interface SharedContentResponse {
  username: string;
  Data: Content[];
}

interface Content {
  _id: string;
  link: string;
  title: string;
  type: string;
  text?: string;
}

export function SharedContent() {
  const { hash } = useParams<{ hash: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Fetch shared content by hash
  async function fetchSharedData() {
    try {
      setLoading(true);
      const response = await axios.get<SharedContentResponse>(
        `${BackendUrl}/api/v1/content/share/${hash}`
      );
      setContents(response?.data?.Data || []);
      setUsername(response?.data?.username || "");
    } catch (error) {
      console.error("❌ Error fetching shared content:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hash) fetchSharedData();
  }, [hash]);

  const filteredContents =
    selectedType === "all"
      ? contents
      : contents.filter(
          (card) =>
            card.type?.trim().toLowerCase() ===
            selectedType.trim().toLowerCase()
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Sidebar */}
      <Sidebar onfilterChange={setSelectedType} />

      {/* Header */}
      <div className="hidden md:flex fixed top-0 left-76 right-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-800">
            {username ? `${username}'s Shared Content` : "Shared Content"}
          </h1>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            {`${filteredContents.length} items`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <main className="px-4 md:px-8 md:pl-80 pt-20 pb-8 transition-all duration-200">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl shadow-sm"
              ></div>
            ))}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-6">
              <Library className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Content Found
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {username
                ? `${username} hasn’t shared any content yet.`
                : "No shared content is available for this link."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
            {filteredContents.map((content) => (
              <Card
                key={content._id}
                type={content.type as ContentType}
                link={content.link}
                title={content.title}
                id={content._id}
                text={content.text}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
