
import { signOut } from "../../pages/Auth"
import { LogoIcon } from "../icons/Logo"
import { TwitterIcon } from "../icons/Twitter"
import { YouTubeIcon } from "../icons/Youtube"
import { Button } from "./Button"
import { SidebarItem } from "./SidebarItem"

const isSharedContent = location.pathname.includes("/share/");
export const Sidebar=({onfilterChange}:{onfilterChange:(type:string)=>void})=>{

    return(
        <div className="h-screen bg-white  w-76 fixed left-0 flex flex-col justify-between top-0 pl-2">
<div>
                <div className="flex text-xl font-semibold pl-3 pt-4 items-center cursor-pointer">
                <div className="pr-2 text-purple-600">
                    <LogoIcon/>
                </div>
                IdeaNode
            </div>
         <div className="pt-4 ">
 <SidebarItem text={"Twitter"} icon={<TwitterIcon/>} onClick={()=>onfilterChange("Twitter")}/>
 <SidebarItem text={"Youtube"} icon={<YouTubeIcon/>} onClick={()=>onfilterChange("Youtube")}/>
         </div>
</div>
    { !isSharedContent &&    
    <div className="p-4 mb-3">
            <Button variant="light" size="md" text="Sign Out"fullWidth={true} onClick={signOut}/>
         </div>}
        </div>
    )
}

