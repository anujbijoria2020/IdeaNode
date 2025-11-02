import { useEffect, useState } from "react";
import { BackendUrl } from "../config";
import axios from "axios";
import type { Content } from "../pages/SharedContent";

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);

  async function refresh() {
    try {
      const response = await axios.get(`${BackendUrl}/api/v1/content`, {
        headers: { token: localStorage.getItem("token") },
      });

      console.log("API response:", response.data);

      // handle both 'Contents' and 'contents' just in case
      const data =
      //@ts-ignore
        response.data?.Contents ||
        //@ts-ignore
        response.data?.contents ||
        [];

      setContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching contents:", error);
      setContents([]);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);

  return { contents, refresh };
}
