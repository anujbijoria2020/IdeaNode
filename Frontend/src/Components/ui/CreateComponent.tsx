import { useRef, useState } from "react";
import { Input } from "./InputComponent";
import axios from "axios";
import { BackendUrl } from "../../config";
import { Button } from "./Button";

export type ContentType = "youtube" | "twitter" | "instagram" | "note";

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
  const textRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);

  async function onCreate() {
    const title = titleRef.current?.value?.trim();
    const tags = tagsRef.current?.value?.trim().split(",") || [];
    let content = linkRef.current?.value?.trim();

    // For notes, use the textarea value instead of link
    if (type === "note") {
      content = textRef.current?.value?.trim();
    }

    if (!title || !content) return;

    try {
      setBusy(true);
      await axios.post(
        `${BackendUrl}/api/v1/content`,
        { title, link: content, type, tags },
        { headers: { token: localStorage.getItem("token") || "" } }
      );
      onClose();
    } catch (e) {
      console.error(e);
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

          {/* Show link input for URLs */}
          {type !== "note" && <Input ref={linkRef} placeholder="Paste link..." type="text" />}

          {/* Show textarea for notes */}
          {type === "note" && (
            <textarea
              ref={textRef}
              placeholder="Write your note here..."
              className="border rounded p-2 w-full h-32"
            />
          )}

          <Input ref={tagsRef} placeholder="Tags (comma separated)" type="text" />

          {/* Type selection buttons */}
          <div className="flex flex-wrap gap-2">
            {(["youtube", "twitter", "instagram", "note"] as ContentType[]).map((t) => (
              <button
                key={t}
                className={`px-3 py-2 rounded border ${
                  type === t
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-purple-700 border-purple-600"
                }`}
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="dark" onClick={onClose}>
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