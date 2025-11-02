import { useRef, useState } from "react";
import axios from "axios";
import { X, FileText, Link as LinkIcon, Edit3, Upload, Sparkles, NotebookIcon, FileIcon, Info } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./InputComponent";
import { BackendUrl } from "../../config";
import { YouTubeIcon } from "../icons/Youtube";
import { TwitterIcon } from "../icons/Twitter";
import { toast } from "sonner";

export enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Note = "note",
  PDF = "pdf"
}

const contentTypeConfig = {
  [ContentType.Youtube]: { icon: <YouTubeIcon/>, label: "YouTube", color: "from-red-500 to-red-600" },
  [ContentType.Twitter]: { icon:<TwitterIcon/>, label: "Twitter", color: "from-blue-400 to-blue-600" },
  [ContentType.Note]: { icon: <NotebookIcon/>, label: "Note", color: "from-green-500 to-green-600" },
  [ContentType.PDF]: { icon: <FileIcon/>, label: "PDF", color: "from-purple-500 to-purple-600" },
};

export const CreateContent = ({ open, onClose }: any) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ContentType>(ContentType.Youtube);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const note = noteRef.current?.value;

    if (!title || (type !== ContentType.Note && !link && !file)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      if (link) formData.append("link", link);
      if (note) formData.append("note", note);
      if (file) formData.append("file", file);

      const response = await axios.post(`${BackendUrl}/api/v1/content`, formData, {
        headers: {
          "token": localStorage.getItem("token") || "",
          "Content-Type": "multipart/form-data"
        },
      });

toast.success("content added successfully");
      console.log("Response:", response.data);
      onClose();
    } catch (error: any) {
      console.error(error);
toast.error("something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const renderInputs = () => {
    switch (type) {
      case ContentType.Note:
        return (
          <div className="relative">
            <Edit3 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              ref={noteRef}
              placeholder="Write your note here... You can ask questions about this later!"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all resize-none"
              rows={6}
            />
          </div>
        );

      case ContentType.PDF:
        return (
          <div className="relative">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 cursor-pointer bg-gray-50 hover:bg-purple-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 font-medium">
                  {file ? file.name : "Click to upload PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max size: 10MB</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        );

      default:
        return (
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <div className="pl-10">
              <Input placeholder="Paste the link here..." ref={linkRef} type="text" />
            </div>
          </div>
        );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 ">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New Content</h2>
              <p className="text-sm text-gray-500">Build your second brain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(ContentType).map((t) => {
                const config = contentTypeConfig[t];
                const isActive = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-200
                      ${isActive 
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-105" 
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{config.icon}</div>
                    <div className={`text-sm font-medium ${isActive ? "text-purple-700" : "text-gray-700"}`}>
                      {config.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <div className="pl-10">
                <Input 
                  placeholder="Give it a descriptive title..." 
                  ref={titleRef} 
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === ContentType.Note 
                ? "Your Note" 
                : type === ContentType.PDF 
                ? "Upload File" 
                : "Content Link"}
            </label>
            {renderInputs()}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
<Info color="blue"/>
              <div>
                <p className="text-sm font-medium text-blue-900">AI-Powered Search</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your content will be indexed and searchable. Ask questions about it anytime!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button
            variant="ghost"
            size="md"
            text="Cancel"
            onClick={onClose}
            className="border border-gray-200 hover:bg-white"
          />
          <Button
            variant="dark"
            size="md"
            text={loading ? "Adding..." : "Add Content"}
            onClick={handleSubmit}
            disabled={loading}
            Loading={loading}
            className="shadow-lg shadow-purple-500/30 hover:shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};