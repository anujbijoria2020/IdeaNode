import { useRef } from "react";
import { Input } from "../Components/ui/ui/InputComponent";
import { Button } from "../Components/ui/ui/Button";
import { Outlet, useNavigate } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const linkref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (token) return <Outlet />;

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
      <div className="w-full max-w-lg bg-purple-50 rounded-lg shadow p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 mb-4 text-center">
          Access Restricted
        </h2>
        <p className="text-purple-600 mb-4 text-center">
          Enter a share link to explore, or sign in to add content.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Enter Link here..." ref={linkref} type="text" />
          <Button variant="light" text="Explore" size="md" onClick={handleExplore} />
        </div>
        <div className="flex justify-center mt-4 gap-1">
          <span>Want to add content?</span>
          <a className="text-blue-800 cursor-pointer font-medium" href="/signin">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};
