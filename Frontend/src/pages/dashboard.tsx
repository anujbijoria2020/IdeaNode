import { useContent } from "../hooks/useContent";
import { BackendUrl } from "../config";
import axios from "axios";
import { FrontEndUrl } from "../App";
import { useEffect, useState } from "react";
import { Sidebar } from "../Components/ui/Sidebar";
import { Button } from "../Components/ui/Button";
import { PlusIcon, Share2Icon, Sparkles, Library } from "lucide-react";
import { CreateContent, type ContentType } from "../Components/ui/CreateComponent";
import { Card } from "../Components/ui/Card";
import { QnASection } from "../Components/ui/QnaSection";
import { toast } from "sonner";

interface ShareLinkResponse {
  hash: string;
}

export function DashBoard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"content" | "qna">("content");
  const { contents, refresh } = useContent();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view === "content") {
      setLoading(true);
      refresh();
      setTimeout(() => setLoading(false), 600);
    }
  }, [modalOpen, view]);

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
toast.success("link copied successfully")    } catch (err) {
      console.log(err);
toast.error("link copied failed , try agin!")
    } 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Sidebar */}
      <Sidebar
        onfilterChange={(type) => {
          setView("content");
          setSelectedType(type);
        }}
        onQnAClick={() => setView("qna")}
      />

      {/* Desktop Topbar */}
      <div className="hidden md:flex fixed top-0 left-76 right-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3">
          {view === "qna" ? (
            <Sparkles className="w-6 h-6 " />
          ) : (
            <Library className="w-6 h-6" />
          )}
          <h1 className="text-xl font-bold ">
            {view === "qna" ? "Ask Questions" : selectedType === "all" ? "All Content" : selectedType}
          </h1>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-gray-700 rounded-full">
            {view === "qna" ? "AI Powered" : `${filteredContents.length} items`}
          </span>
        </div>
        {view === "content" && (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              text="Share Brain"
              startIcon={<Share2Icon className="w-4 h-4" />}
              onClick={CreateShareLink}
              className="hover:bg-purple-50 border border-purple-200"
            />
            <Button
              variant="dark"
              size="md"
              text="Add Content"
              startIcon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setModalOpen(true)}
              className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
            />
          </div>
        )}
      </div>

      {/* Mobile Topbar */}
      {view === "content" && (
        <div className="md:hidden px-4 pt-2 sticky top-[56px] bg-white/90 backdrop-blur-lg z-30 border-b border-gray-200/50 shadow-sm">
          <div className="grid grid-cols-2 gap-3 pb-2">
            <Button
              variant="ghost"
              text="Share"
              startIcon={<Share2Icon className="w-4 h-4" />}
              fullWidth
              onClick={CreateShareLink}
              className="border border-purple-200"
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
      )}

      {/* Main Content */}
      <main className="px-4 md:px-8 md:pl-80 pt-20 pb-8 transition-all duration-200">
        {view === "qna" ? (
          <div className="animate-fadeIn">
            <QnASection />
          </div>
        ) : (
          <>
            <CreateContent open={modalOpen} onClose={() => setModalOpen(false)} />
            
            <div className="mt-6">
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
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-6">
                    <Library className="w-16 h-16 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Content Yet!</h3>
                  <p className="text-gray-600 mb-8 text-center max-w-md">
                    Start building your second brain by adding YouTube videos, notes, articles, and more.
                  </p>
                  <Button
                    variant="dark"
                    size="lg"
                    text="Add Your First Content"
                    startIcon={<PlusIcon className="w-5 h-5" />}
                    onClick={() => setModalOpen(true)}
                    className="shadow-lg shadow-purple-500/30 hover:shadow-xl"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                  {filteredContents.map((content: any) => (
                    <Card
                      key={content._id as string}
                      type={content.type as ContentType}
                      text={content.text as ContentType}
                      link={content.link as string}
                      title={content.title as string}
                      id={content._id as string}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
   
    </div>
  );
}