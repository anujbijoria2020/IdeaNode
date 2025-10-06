import { ShareIcon } from "../icons/Icons";
import {DeleteIcon} from "../icons/DeleteIcon"
import { BackendUrl } from "../../config";
import type React from "react";
import axios from "axios";


interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube";
  id:string;
  setToast?:React.Dispatch<React.SetStateAction<{message:string,success:boolean}|null>>;
}

const isSharedContent = location.pathname.includes("/share/");

export const Card = ({ title, link, type,id,setToast }: CardProps) => {

  async function handleDeleteContent(id:string) {
    try{
      const response = await axios.delete(`${BackendUrl}/api/v1/content`,{

        headers:{
          "token":localStorage.getItem("token")
        },
        data:{contentId:id}
      });
      console.log(response.data);

      setToast?.({message:response?.data?.message,success:true});
      console.log(response);
    }
    catch(error){

    console.log(error);
    setToast?.({message:"Can't Delete!",success:false})
    }
    
       setTimeout(() => {
      setToast?.(()=>null)
    }, 3000);
  }

  return (
    <div>
      <div className="bg-white rounded-md p-5 min-w-72 border-gray-200 max-w-84 border  m-2 min-h-84  shadow-md ">
        <div className="flex justify-between ">
          <div className="flex justify-center items-center">
            <div className="text-gray-500 ">
              <ShareIcon />
            </div>
            <span className="p-1 text-slate-800">{title}</span>
          </div>
          <div className="flex justify-center items-center ">
            <div className="text-gray-500">
              <a href={link} target="_blank">
                <ShareIcon />
              </a>
            </div>
           {
            !isSharedContent && 
             <div className="text-gray-500 pl-2 cursor-pointer" onClick={()=>handleDeleteContent(id)}>
              <DeleteIcon/>
            </div>
           }
          </div>
        </div>
        <div className="pt-6">
          {type === "youtube" && (
            <iframe
              className="w-full"
              src={link.replace("watch","embed").replace("?v=","/")}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen 
            ></iframe>
          )}

          {type === "twitter" && (
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};
