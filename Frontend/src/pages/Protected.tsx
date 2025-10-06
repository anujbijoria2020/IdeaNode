import { useRef } from "react";
import { Input } from "../Components/ui/InputComponent";
import { Button } from "../Components/ui/Button";
import { Outlet, useNavigate } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const linkref = useRef<HTMLInputElement>(null);
const navigate = useNavigate();

  if (token) {
   return <Outlet/>
  }
 
function handleExplore() {
  const link = linkref?.current?.value?.trim();
  if (!link) return;

  let pathToNavigate = "";

  try {
    const url = new URL(link);
    pathToNavigate = `${url.pathname}${url.search}${url.hash}`;
  } catch {
    pathToNavigate = link;
  }
  navigate(pathToNavigate);
}


  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md bg-purple-50 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-purple-700 mb-6 text-center">
          Access Restricted
        </h2>
        <p className="text-purple-600 mb-4 text-center">
          Please enter your link to explore or login to access the dashboard.
        </p>
        <div className="flex gap-4">
          <Input
            placeholder="Enter Link here..."
            ref={linkref}
            type="text"
        
          />
  <div className=" text-white px-6 py-2"
         >
            <Button
            variant="light"
            text="Explore"
            size="md"
            onClick={handleExplore}
          />
  </div>
        </div>
  <div className="flex justify-center">
    <span>Want to add content?</span>
    <span className="text-blue-800 cursor-pointer">Sign In</span>
  </div>
      </div>
    </div>
  );
};
