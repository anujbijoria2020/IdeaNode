import { useEffect, useState } from "react";
import { Sidebar } from "../Components/ui/Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BackendUrl } from "../config";
import { Card } from "../Components/ui/Crad";
import type { ContentType } from "../Components/ui/CreateComponent";


interface SharedContentResponse {
  username: string;
  Data: Content[];
}

export interface Content {
  _id: string;
  link: string;
  title: string;
  type: string;
}

export const SharedContent = () => {
  const { hash } = useParams<{ hash: string }>();
  const [contents, setContents] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");
  const [selectedType,setSelectedType] = useState<string>("all");

  async function refresh() {
    try {
      const response = await axios.get<SharedContentResponse>(
        `${BackendUrl}/api/v1/content/share/${hash}`
      );
      setContents(response?.data?.Data);
      console.log(response.data.username);
      setUsername(response?.data?.username);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    if (hash) {
      refresh();
    }
  }, [hash]);



  const filteredContents =
  selectedType === "all"
      ? contents
      : contents.filter(
        (card: any) =>
          card.type?.trim().toLowerCase() === selectedType.trim().toLowerCase()
      );
      
  return (
    <div className="">
      {/* Sidebar */}
      <Sidebar onfilterChange={setSelectedType}/>
      {/* greeting */}
      <div className="ml-76 flex justify-center items-center fixed top-0 left-2 right-0 z-50 h-20 bg-white shadow text-xl">
        <span className="text-purple-600 font-semibold m-3"> {username}'s</span>{" "}
        Content
      </div>
      {/* cards */}
      <div className="mt-23 ml-76">
    {filteredContents.length===0?  
         <div className="  h-full flex justify-center mt-60 text-purple-500">
         <div>
            <div className="text-2xl"> Content Not Available!! </div>
         </div>
         </div>
    :
    <div className="flex gap-8 flex-wrap ">
          {contents.map((content) => {
            return (
              <Card
                key={content.link as string}
                type={content.type as ContentType}
                link={content.link as string}
                title={content.title as string}
                id={content.id}
              />
            );
          })}
        </div>}
      </div>
    </div>
  );
};
