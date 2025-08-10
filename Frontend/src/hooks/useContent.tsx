import { useEffect, useState } from "react";
import { BackendUrl } from "../config";
import axios from "axios";

export function useContent() {
  const [contents, setContents] = useState([]);

  function refresh() {
    axios
      .get(`${BackendUrl}/api/v1/content`, {
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
