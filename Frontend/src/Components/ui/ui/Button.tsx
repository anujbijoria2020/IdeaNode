import type { ReactElement } from "react";
import { useEffect } from "react";

type Variants = "light" | "dark";
type Sizes =  "sm" | "md" | "lg";

interface ButtonProps {
  variant: Variants;
  size:Sizes;
  Loading?: boolean;
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  fullWidth?:Boolean;
}

const variantStyles: Record<Variants, string> = {
  "light": "bg-purple-600 text-white",
  "dark": "bg-white text-purple-600",
};
const sizeStyles:Record<Sizes,string> = {
  "sm": "py-1 px-2 text-sm max-h-8",
  "md": "py-2 px-4 text-md max-h-10",
  "lg": "py-4 px-6 text-lg max-h-12",
};


const defaultStyles = "rounded-md";

export const Button = (props: ButtonProps) => {

useEffect(() => {
  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      props.onClick?.();
    }
  };
  window.addEventListener("keydown", handleEnter);
  return () => window.removeEventListener("keydown", handleEnter);
}, [props.onClick]);


  return (
    <button
      className={
       `flex justify-center items-center   ${variantStyles[props.variant]}  ${defaultStyles}  ${sizeStyles[props.size]} ${props.fullWidth?"w-[90%]":""} ${props.Loading?"opacity-40":""} cursor-pointer`
      }
      onClick={props.onClick}
      disabled={props.Loading}
      onKeyUp={(e)=>{
        if(e.key ==="Enter"){
           props.onClick?.();
           console.log(props.onClick);
        }
      }}
    >
      {props.startIcon?<div className="pr-2">{props.startIcon}</div>:null}
      {props.text}   
      {props.endIcon?<div className="pr-2">{props.endIcon}</div>:null}
    
    </button>
  );
};
