
import { useRef ,useState} from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./InputComponent";
import { BackendUrl } from "../../config";
import axios from "axios";

export enum ContentType{
    Youtube = "youtube",
    Twitter = "twitter"
}

export const CreateContent = ({ open, onClose }: any) => {
 const titleRef = useRef<HTMLInputElement>(null);
 const linkRef = useRef<HTMLInputElement>(null);
 const [type,settype] = useState(ContentType.Youtube);
//  const [error,setError] = useState<string|null>(null);

async function AddnewContent(){
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;

try{
        const response = await axios.post(`${BackendUrl}/api/v1/content`,{
        type,
        title,
        link
    },{
        headers:{
            "token":localStorage.getItem("token")
        }
    })
    console.log(response);
    onClose();
}
catch(error:any){
console.log(error);
alert("something went wrong")
}
}

  return (
    <div>
      {open && (
  <div>
  
        <div className="w-screen h-screen bg-slate-200  left-0 top-0 opacity-60  flex justify-center absolute " onClick={onClose}>

        </div>


          <div className="flex absolute top-30 left-100">

            <span className=" bg-white p-4 rounded m-2 font-medium min-w-108" onClick={(e)=>e.stopPropagation()}>

              <div className="flex justify-end ">
                <span className="" onClick={onClose}>
                    <CrossIcon/>
                </span>
              </div>

              <div>
                <span className=" ml-4 text-lg font-medium ">Type</span>
                <div className="flex justify-between p-2">
                    <Button variant={type===ContentType.Youtube?"light":"dark"}
                     text="Youtube"
                    size="md" 
                    onClick={()=>{
                        settype(ContentType.Youtube);
                    }}
                    fullWidth={true}
                    />
                    <Button variant={type===ContentType.Twitter?"light":"dark"} 
                    text="Twitter"
                        fullWidth={true}
                    size="md" onClick={()=>{
                        settype(ContentType.Twitter);
                    }}/>
                </div>
              <Input placeholder={"Title"} ref={titleRef} type="text"/>
              <Input placeholder={"Link"} ref={linkRef} type="text"/>
              </div>
             <div className="flex justify-center m-2">
                 <Button variant={"light"} size={"sm"}  text={"Submit"} onClick={AddnewContent}/>
             </div>
            </span>
          </div> 
       
  </div>
      )}
    </div>
  );
};


