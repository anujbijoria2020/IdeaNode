import { useEffect, useState } from "react";
import { PlusIcon, ShareIcon } from "../Components/ui/icons/Icons";
import { Button } from "../Components/ui/ui/Button";
import { Card } from "../Components/ui/ui/Card";
import { CreateContent } from "../Components/ui/ui/CreateContent";
import type { ContentType } from "../Components/ui/ui/CreateContent";
import { Sidebar } from "../Components/ui/ui/Sidebar";
import { useContent } from "../hooks/useContent";
import { BackendUrl } from "../config";
import axios from "axios";
import { FrontEndUrl } from "../App";

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
    // Small timeout to avoid flicker if loading is very fast
    setTimeout(() => setLoading(false), 500);
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
      setToast({ message: "Link Copied Successfully!!", success: true });
    } catch (err) {
      console.log(err);
      setToast({ message: "Link Copy Failed, Try Again!", success: false });
    } finally {
      setTimeout(() => setToast(() => null), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar onfilterChange={setSelectedType} />

      {/* Desktop Topbar */}
      <div className="hidden md:flex fixed top-0 left-76 right-0 z-30 h-16 bg-white border-b border-gray-200 items-center justify-end px-4">
        <div className="flex gap-3">
          <Button
            variant="light"
            size="md"
            text="Share Brain"
            startIcon={<ShareIcon size="md" />}
            onClick={CreateShareLink}
          />
          <Button
            variant="dark"
            size="md"
            text="Add Content"
            startIcon={<PlusIcon size="md" />}
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden px-4 pt-2 sticky top-[56px] bg-white z-30 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3 pb-2">
          <Button
            variant="light"
            text="Share"
            startIcon={<ShareIcon size="sm" />}
            fullWidth
            onClick={CreateShareLink}
          />
          <Button
            variant="dark"
            text="Add"
            startIcon={<PlusIcon size="sm" />}
            fullWidth
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Main */}
      <main className="px-4 md:pl-80 pt-20">
        <CreateContent open={modalOpen} onClose={() => setModalOpen(false)} />

        <div className="mt-4">
          {loading ? (
            // Skeleton Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-60 bg-gray-200 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-purple-500 py-16">
              <div className="text-2xl mb-4">Content Not Available!!</div>
              <Button
                variant="light"
                size="md"
                text="Add Content"
                startIcon={<PlusIcon size="md" />}
                onClick={() => setModalOpen(true)}
              />
            </div>
          ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 grid-flow-row-dense">
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

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 opacity-90 rounded-lg shadow-lg text-white z-50
          ${toast.success ? "bg-purple-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
