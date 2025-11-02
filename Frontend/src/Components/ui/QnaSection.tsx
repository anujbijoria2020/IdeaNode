// 📁 src/Components/ui/QnASection.tsx

import { useRef, useState } from "react";
import axios from "axios";
import { MessageSquare, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { BackendUrl } from "../../config";

export enum QnAContentType {
  Note = "note",
  PDF = "pdf",
  Youtube = "youtube",
  Twitter = "twitter",
  All = "all",
}

interface QnAResponse {
  answer: string;
  relatedContent: Array<{
    id: string;
    title: string;
    type: string;
    similarity: number;
  }>;
}

export const QnASection = () => {
  const questionRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<QnAContentType>(QnAContentType.Note);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QnAResponse | null>(null);
  const [error, setError] = useState<string>("");

  async function handleAskQuestion() {
    const question = questionRef.current?.value;

    if (!question || question.trim() === "") {
      setError("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const result = await axios.post(
        `${BackendUrl}/api/v1/qna`,
        {
          question,
          type,
        },
        {
          headers: {
            token: localStorage.getItem("token") || "",
          },
        }
      );
//@ts-ignore
      setResponse(result.data);
      if (questionRef.current) {
        questionRef.current.value = "";
      }
    } catch (error: any) {
      console.error(error);
      setError(
        error.response?.data?.message || "Failed to get answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleAskQuestion();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "youtube":
        return "bg-red-100 text-red-700";
      case "twitter":
        return "bg-blue-100 text-blue-700";
      case "note":
        return "bg-green-100 text-green-700";
      case "pdf":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ask Your Brain</h2>
            <p className="text-sm text-gray-500">Get AI-powered answers from your saved content</p>
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Search in:
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.values(QnAContentType).map((t) => (
              <Button
                key={t}
                variant={type === t ? "dark" : "light"}
                text={t.charAt(0).toUpperCase() + t.slice(1)}
                onClick={() => setType(t)}
              />
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div className="relative mb-6">
          <input
            ref={questionRef}
            type="text"
            placeholder="Ask anything about your saved content..."
            className="w-full p-4 pr-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            onClick={handleAskQuestion}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="space-y-6 animate-fadeIn">
            {/* Answer */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Answer</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>

            {/* Related Content */}
            {response.relatedContent && response.relatedContent.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-gray-200 rounded-md">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </span>
                  Sources ({response.relatedContent.length})
                </h3>
                <div className="space-y-3">
                  {response.relatedContent.map((content) => (
                    <div
                      key={content.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-1">
                            {content.title}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              content.type
                            )}`}
                          >
                            {content.type}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-purple-600 mb-1">
                            {(content.similarity * 100).toFixed(0)}% match
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${content.similarity * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!response && !error && !loading && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              Ask a question to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};