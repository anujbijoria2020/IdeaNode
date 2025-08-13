import { useRef, useState } from "react";
import { Button } from "./Button";
import { Input } from "./InputComponent";
import axios from "axios";
import { BackendUrl } from "../../../config";

export type ContentType = "twitter" | "youtube";

export function CreateContent({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {

  const [type, setType] = useState<ContentType>("youtube");
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);

  async function onCreate() {
    const title = titleRef.current?.value?.trim();
    const link = linkRef.current?.value?.trim();
    const tags = tagsRef.current?.value?.trim().split(",");
    console.log(tags);

    if (!title || !link) return;

    try {
      setBusy(true);
      await axios.post(
        `${BackendUrl}/api/v1/content`,
        { title, link, type ,tags},
        { headers: { token: localStorage.getItem("token") || "" } }
      );
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 w-full max-w-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-purple-700">Add Content</h3>

        <div className="grid gap-3">
          <Input ref={titleRef} placeholder="Title..." type="text" />
          <Input ref={linkRef} placeholder="Paste link..." type="text" />
          <Input ref={tagsRef} placeholder="tags here separated by comma (optional)" type="text" />

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-2 rounded border ${
                type === "youtube"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-purple-700 border-purple-600"
              }`}
              onClick={() => setType("youtube")}
            >
              YouTube
            </button>
            
            <button
              className={`px-3 py-2 rounded border ${
                type === "twitter"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-purple-700 border-purple-600"
              }`}
              onClick={() => setType("twitter")}
            >
              Twitter
            </button>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="dark" onClick={onCreate} Loading={busy}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
