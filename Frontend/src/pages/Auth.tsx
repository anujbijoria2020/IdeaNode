import { useRef, useState } from "react";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/InputComponent";
import { BackendUrl } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Type fix
interface SignInResponse {
  token: string;
}

// ✅ Common Auth Form Wrapper
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-md border border-purple-300 w-[380px] p-6 flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function handleSignup() {
    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value?.trim();

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
    <AuthLayout>
      <h2 className="text-center text-2xl font-semibold text-purple-700 mb-2">
        Create Account
      </h2>

      {error && (
        <div className="text-red-500 bg-red-50 border border-red-300 text-sm rounded-md p-2 text-center">
          {error}
        </div>
      )}

      <Input ref={usernameRef} placeholder="Username..." type="text" />

      <Input
        ref={passwordRef}
        placeholder="Password..."
        type={showPassword ? "text" : "password"}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      <Button
        variant="light"
        size="md"
        text={loading ? "Signing Up..." : "Sign Up"}
        fullWidth
        Loading={loading}
        onClick={handleSignup}
      />

      <div className="text-sm text-center">
        <span>Already have an account? </span>
        <span
          className="text-blue-700 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate("/signin")}
        >
          Sign in
        </span>
      </div>
    </AuthLayout>
  );
}

export function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function handleSignIn() {
    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value?.trim();

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
      setError(err.response?.data?.message || "Sign-in failed! Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-center text-2xl font-semibold text-purple-700 mb-2">
        Welcome Back
      </h2>

      {error && (
        <div className="text-red-500 bg-red-50 border border-red-300 text-sm rounded-md p-2 text-center">
          {error}
        </div>
      )}

      <Input ref={usernameRef} placeholder="Username..." type="text" />

      <Input
        ref={passwordRef}
        placeholder="Password..."
        type={showPassword ? "text" : "password"}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      <Button
        variant="light"
        size="md"
        text={loading ? "Signing In..." : "Sign In"}
        fullWidth
        Loading={loading}
        onClick={handleSignIn}
      />

      <div className="text-sm text-center">
        <span>Don’t have an account? </span>
        <span
          className="text-blue-700 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </span>
      </div>
    </AuthLayout>
  );
}

// ✅ Proper sign-out utility
export function signOut() {
  localStorage.removeItem("token");
  window.location.href = "/signin";
}
