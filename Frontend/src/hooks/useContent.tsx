import { useEffect, useState } from "react";
import { BackendUrl } from "../config";
import axios from "axios";
import type { Content } from "../pages/SharedContent";

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);

  function refresh() {
    axios
      .get<{contents:Content[]}>(`${BackendUrl}/api/v1/content`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      .then((response: any) => {
        console.log(response);
        console.log(response.data.Contents);
        setContents(response?.data?.Contents);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  useEffect(() => {
    refresh();
    let interval = setInterval(() => {
      refresh();
    }, 10000);

    return clearInterval(interval);
  }, []);
  console.log(contents);
  return {contents,refresh};
}
