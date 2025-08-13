import { useEffect, useState } from "react";
import { Sidebar } from "../Components/ui/ui/Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BackendUrl } from "../config";
import { Card } from "../Components/ui/ui/Card";
import type { ContentType } from "../Components/ui/ui/CreateContent";

export const SharedContent = () => {
  const { hash } = useParams<{ hash: string }>();
  const [contents, setContents] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");

  async function refresh() {
    try {
      const response = await axios.get(`${BackendUrl}/api/v1/content/share/${hash}`);
      setContents(response?.data?.Data || []);
      setUsername(response?.data?.username || "");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (hash) {
      refresh();
    }
  }, [hash]);

  const filteredContents =
    selectedType === "all"
      ? contents
      : contents.filter(
          (card: any) =>
            card.type?.trim().toLowerCase() === selectedType.trim().toLowerCase()
        );

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50">
      {/* Sidebar on desktop / top filter on mobile */}
      <div className="w-full sm:w-64 bg-white border-b sm:border-b-0 sm:border-r shadow-sm">
        <Sidebar onfilterChange={setSelectedType} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow h-16 flex items-center justify-center sm:justify-start px-4">
          <span className="text-purple-600 font-semibold text-lg sm:text-xl">
            {username}'s
          </span>
          <span className="ml-2 text-gray-700">Content</span>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 flex justify-center">
          {filteredContents.length === 0 ? (
            <div className="text-purple-500 text-center mt-20">
              <div className="text-lg sm:text-2xl">Content Not Available!!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {filteredContents.map((content) => (
                <Card
                  key={content.link as string}
                  type={content.type as ContentType}
                  link={content.link as string}
                  title={content.title as string}
                  id={content.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
