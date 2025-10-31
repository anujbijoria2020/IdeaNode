import { useContent } from "../hooks/useContent";
import { BackendUrl } from "../config";
import axios from "axios";
import { FrontEndUrl } from "../App";
import { useEffect, useState } from "react";
import { Sidebar } from "../Components/ui/Sidebar";
import { Button } from "../Components/ui/Button";
import { PlusIcon, Share2Icon } from "lucide-react";
import { CreateContent, type ContentType } from "../Components/ui/CreateComponent";
import { Card } from "../Components/ui/Card";

interface ShareLinkResponse {
  hash: string;
}

export function DashBoard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    refresh();
    setTimeout(() => setLoading(false), 600);
  }, [modalOpen]);

  const filteredContents =
    selectedType === "all"
      ? contents
      : contents.filter(
          (card: any) =>
            card.type?.trim().toLowerCase() === selectedType.trim().toLowerCase()
        );

  async function CreateShareLink() {
    try {
      const response = await axios.post<ShareLinkResponse>(
        `${BackendUrl}/api/v1/content/share`,
        { share: true },
        { headers: { token: localStorage.getItem("token") || "" } }
      );

      const hash = response?.data?.hash;
      const shareLink = `${FrontEndUrl}/share/${hash}`;
      await navigator.clipboard.writeText(shareLink);
      setToast({ message: "Link Copied Successfully!", success: true });
    } catch (err) {
      console.log(err);
      setToast({ message: "Link Copy Failed, Try Again!", success: false });
    } finally {
      setTimeout(() => setToast(() => null), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Sidebar */}
      <Sidebar onfilterChange={setSelectedType} />

      {/* Desktop Topbar */}
      <div className="hidden md:flex fixed top-0 left-76 right-0 z-30 h-16 bg-white border-b border-gray-200 items-center justify-end px-6 shadow-sm">
        <div className="flex gap-3">
          <Button
            variant="light"
            size="md"
            text="Share Brain"
            startIcon={<Share2Icon className="w-4 h-4" />}
            onClick={CreateShareLink}
          />
          <Button
            variant="dark"
            size="md"
            text="Add Content"
            startIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden px-4 pt-2 sticky top-[56px] bg-white z-30 border-b border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 gap-3 pb-2">
          <Button
            variant="light"
            text="Share"
            startIcon={<Share2Icon className="w-4 h-4" />}
            fullWidth
            onClick={CreateShareLink}
          />
          <Button
            variant="dark"
            text="Add"
            startIcon={<PlusIcon className="w-4 h-4" />}
            fullWidth
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Main */}
      <main className="px-4 md:pl-80 pt-20 transition-all duration-200">
        <CreateContent open={modalOpen} onClose={() => setModalOpen(false)} />

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-60 bg-gray-200 animate-pulse rounded-lg shadow-sm"
                ></div>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-purple-500 py-16">
              <div className="text-2xl font-medium mb-3">No Content Yet!</div>
              <p className="text-gray-500 mb-5 text-sm">Start by adding a YouTube, Twitter, Note, or PDF.</p>
              <Button
                variant="dark"
                size="md"
                text="Add Content"
                startIcon={<PlusIcon className="w-4 h-4" />}
                onClick={() => setModalOpen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredContents.map((content: any) => (
                <Card
                  key={content._id as string}
                  type={content.type as ContentType}
                  link={content.link as string}
                  title={content.title as string}
                  id={content._id as string}
                  setToast={setToast}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white z-50 transition-all duration-300
          ${toast.success ? "bg-purple-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
