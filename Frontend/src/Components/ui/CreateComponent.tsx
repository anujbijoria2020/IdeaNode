import { useRef, useState } from "react";
import axios from "axios";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./InputComponent";
import { BackendUrl } from "../../config";

export enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Note = "note",
  PDF = "pdf"
}

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

      alert("Content added successfully ✅");
      console.log("Response:", response.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  const renderInputs = () => {
    switch (type) {
      case ContentType.Note:
        return (
          <textarea
            ref={noteRef}
            placeholder="Write your note here..."
            className="w-full p-2 mt-2 border rounded-lg"
            rows={6}
          />
        );

      case ContentType.PDF:
        return (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 w-full"
          />
        );

      default:
        return (
          <Input placeholder={"Paste the link"} ref={linkRef} type="text" />
        );
    }
  };

  return (
    <div>
      {open && (
        <div>
          {/* Overlay */}
          <div
            className="w-screen h-screen bg-black/40 fixed top-0 left-0 flex justify-center items-center"
            onClick={onClose}
          />

          {/* Popup Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-5 rounded-xl w-[400px]">
            <div className="flex justify-end">
              <span onClick={onClose} className="cursor-pointer">
                <CrossIcon />
              </span>
            </div>

            <h2 className="text-lg font-semibold mb-3">Add New Content</h2>

            {/* Type Selector */}
            <div className="flex justify-between gap-2 mb-3">
              {Object.values(ContentType).map((t) => (
                <Button
                  key={t}
                  variant={type === t ? "light" : "dark"}
                  text={t.charAt(0).toUpperCase() + t.slice(1)}
                  size="md"
                  onClick={() => setType(t)}
                  fullWidth
                />
              ))}
            </div>

            {/* Title */}
            <Input placeholder="Title" ref={titleRef} type="text" />

            {/* Dynamic input (link, note, or pdf) */}
            <div className="mt-3">{renderInputs()}</div>

            <div className="flex justify-center mt-4">
              <Button
                variant="light"
                size="sm"
                text={loading ? "Adding..." : "Submit"}
                onClick={handleSubmit}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
