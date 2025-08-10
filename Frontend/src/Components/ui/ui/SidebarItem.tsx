import type { ReactElement } from "react"

export const SidebarItem = ({text,icon,onClick}:{
    text:string,
    icon:ReactElement;
    onClick?:()=>void;
})=>{
    return(
        <div className="flex  gap-2 p-3 text-gray-700 hover:bg-slate-200 hover:px-7 transition-all ease-in-out duration-700
        rounded-xl
        cursor-pointer" onClick={onClick}>
            {icon}
            {text}
        </div>
    )
}