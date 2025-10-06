import { useEffect, useState } from "react";
import { PlusIcon, ShareIcon } from "../Components/icons/Icons";
import { Button } from "../Components/ui/Button";
import { Card } from "../Components/ui/Crad";
import { ContentType, CreateContent } from "../Components/ui/CreateComponent";
import { Sidebar } from "../Components/ui/Sidebar";
import { useContent } from "../hooks/useContent";
import { BackendUrl } from "../config";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FrontEndUrl } from "../App";


interface ShareLinkResponse {
  hash: string;
} 
export function DashBoard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();
  //toast notification for link
  const [toast, setToast] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  // const navigate = useNavigate();
  const [selectedType,setSelectedType] = useState<string>("all");

  useEffect(() => {
    refresh();
  }, [modalOpen,contents]);
  
  const filteredContents =
  selectedType === "all"
      ? contents
      : contents.filter(
        (card: any) =>
          card.type?.trim().toLowerCase() === selectedType.trim().toLowerCase()
      );
      
      console.log("filteredContents = ", filteredContents);

  async function CreateShareLink() {
    try {
      const response = await axios.post<ShareLinkResponse>(
        `${BackendUrl}/api/v1/content/share`,
        {
          share: true,
        },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      const hash = response?.data?.hash;
      const shareLink = `${FrontEndUrl}/share/${hash}`;

      await navigator.clipboard.writeText(shareLink);
      setToast({ message: "Link Copied SucccessFully!!", success: true });
    } catch (err) {
      console.log(err);
      setToast({ message: "Link Copied Failed,Try Again!", success: false });
    }

    setTimeout(() => {
      setToast(() => null);
    }, 3000);
  }



  return (
    <div className="">
      {/* Sidebar */}
      <Sidebar onfilterChange={setSelectedType}/>
      <div className="p-4 relative ml-76 min-h-screen overflow-hidden ">
        <CreateContent
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
        {/* buttons */}
        <div className="ml-76 flex justify-end items-center fixed top-0 left-0 right-0 z-50 h-20 bg-white shadow">
          <div className=" p-2 flex gap-4">
            <Button
              variant={"dark"}
              Loading={false}
              size={"md"}
              text={"Share Brain"}
              startIcon={<ShareIcon size="md" />}
              onClick={CreateShareLink}
            />
            <Button
              variant={"light"}
              Loading={false}
              size={"md"}
              text={"Add Content"}
              startIcon={<PlusIcon size="md" />}
              onClick={() => {
                setModalOpen(true);
                console.log(modalOpen);
              }}
            />
          </div>
        </div>
        {/* cards */}
        <div className="mt-23">
        {filteredContents.length===0?
        <div className="  h-full flex justify-center mt-6 text-purple-500">
        <div>
           <div className="text-2xl"> Content Not Available!! </div>
           <div className="p-4 m-2 flex justify-center items-center">
              <Button
              variant={"light"}
              Loading={false}
              size={"md"}
              text={"Add Content"}
              startIcon={<PlusIcon size="md" />}
              onClick={() => {
                setModalOpen(true);
                console.log(modalOpen);
              }}
            />
           </div>
        </div>
        </div>
          :<div className="flex gap-8 flex-wrap ">
            {filteredContents.map((content: any) => {
              console.log(content.type + content.link + content.title);
              return (

                <Card
                  key={content.link as string}
                  type={content.type as ContentType}
                  link={content.link as string}
                  title={content.title as string}
                  id = {content._id as string}
                  setToast = {setToast}
                />
              );
            })}
          </div>}
        </div>
        {toast && (
          <div
            className={`fixed bottom-[8%] right-[37%] px-5 py-3  opacity-80 rounded-lg shadow-2xl shadow-gray-600 text-white z-50 
      ${toast.success ? "bg-purple-600" : "bg-red-600"} transition-transform ease-in-out duration-1000`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
