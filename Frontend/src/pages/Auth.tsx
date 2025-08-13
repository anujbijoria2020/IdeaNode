import { useRef, useState } from "react";
import { Button } from "../Components/ui/ui/Button";
import { Input } from "../Components/ui/ui/InputComponent";
import { BackendUrl } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignInResponse {
  token: string;
}

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function SignUpButton() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || username.length < 3)
      return setError("Username must be at least 3 characters!");
    if (!password || password.length < 8)
      return setError("Password must be at least 8 characters!");

    setError(null);
    setLoading(true);

    try {
      await axios.post(`${BackendUrl}/api/v1/signup`, { username, password });
      navigate("/signin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed! Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white rounded border border-purple-200 w-full max-w-md sm:min-w-96 min-h-76 flex flex-col justify-around p-4">
        <div className="p-2">
          {error && (
            <span className="text-red-500 font-medium p-3 text-sm">
              {error}
            </span>
          )}
          <Input
            ref={usernameRef}
            placeholder="Username..."
            type="text"
            className="mb-3"
          />
          <Input
            ref={passwordRef}
            placeholder="Password..."
            type={showPassword ? "text" : "password"}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="p-4">
          <Button
            variant="dark"
            size="md"
            text="Sign Up"
            fullWidth
            Loading={loading}
            onClick={SignUpButton}
          />
        </div>
        <div className="text-sm flex justify-center items-center gap-1 pb-2">
          <span>Already have an account?</span>
          <button
            className="text-blue-800 font-semibold cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function SignInButton() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || username.length < 3)
      return setError("Username must be at least 3 characters!");
    if (!password || password.length < 8)
      return setError("Password must be at least 8 characters!");

    setError(null);
    setLoading(true);

    try {
      const response = await axios.post<SignInResponse>(
        `${BackendUrl}/api/v1/signin`,
        { username, password }
      );
      const token = response?.data?.token;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err: any) {
      setError("SignIn failed! Try again.");
      console.log(err.response?.data?.message )
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white rounded border border-purple-200 w-full max-w-md sm:min-w-96 min-h-76 flex flex-col justify-around p-4">
        <div className="p-2">
          {error && (
            <span className="text-red-500 font-medium p-3 text-sm">
              {error}
            </span>
          )}
          <Input
            ref={usernameRef}
            placeholder="Username..."
            type="text"
            className="mb-3"
          />
          <Input
            ref={passwordRef}
            placeholder="Password..."
            type={showPassword ? "text" : "password"}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="p-4">
          <Button
            variant="dark"
            size="md"
            text="Sign In"
            fullWidth
            Loading={loading}
            onClick={SignInButton}
          />
        </div>
        <div className="text-sm flex justify-center items-center gap-1 pb-2">
          <span>Don't have an account?</span>
          <button
            className="text-blue-800 font-semibold cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export function signOut() {
  localStorage.removeItem("token");
  window.location.href = "/dashboard";
}
