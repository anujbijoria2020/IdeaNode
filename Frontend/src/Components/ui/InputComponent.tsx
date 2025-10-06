import { EyeOpen } from "../icons/Eyeys";
import { EyeClosed } from "../icons/Eyeys";

interface InputDesign {
  placeholder: string;
  ref?: React.Ref<HTMLInputElement>;
  type: "text" | "password";
  onTogglePassword?: () => void;
}

export function Input(props: InputDesign) {
  return (
    <div className="relative">
      <input
        type={props.type}
         className="w-full px-4 pr-10 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 m-2"
 
        ref={props.ref}
        placeholder={props.placeholder}
      />
      {props.onTogglePassword && (
        <button
          type="button"
          onClick={props.onTogglePassword}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
>
          {props.type === "password" ? <EyeClosed /> : <EyeOpen />}
        </button>
      )}
    </div>
  );
}
