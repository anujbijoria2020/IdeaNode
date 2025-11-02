import { useRef, useState } from "react";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/InputComponent";
import { BackendUrl } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Lock, 
  User, 
  Sparkles,
  Zap,
  BookOpen,
  ChevronRight
} from "lucide-react";

interface SignInResponse {
  token: string;
}

// ✅ Enhanced Auth Layout with Gradient Background
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-20 animate-float">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>
      <div className="absolute bottom-20 left-20 animate-float animation-delay-2000">
        <Zap className="w-5 h-5 text-blue-400" />
      </div>
      <div className="absolute top-1/3 right-10 animate-float animation-delay-4000">
        <BookOpen className="w-5 h-5 text-pink-400" />
      </div>
    </div>
  );
}

// ✅ Feature Cards Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
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
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden md:block space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                IdeaNode
              </h1>
              <p className="text-sm text-gray-600">Your Second Brain</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 leading-tight">
            Save Everything.<br />
            Remember Anything.<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Ask Questions.
            </span>
          </h2>

          <div className="space-y-3">
            <FeatureCard
              icon={<Brain className="w-4 h-4" />}
              title="AI-Powered Search"
              description="Ask questions and get instant answers from your saved content"
            />
            <FeatureCard
              icon={<Sparkles className="w-4 h-4" />}
              title="Smart Organization"
              description="Automatically organize notes, videos, and articles"
            />
            <FeatureCard
              icon={<Zap className="w-4 h-4" />}
              title="Lightning Fast"
              description="Find any information in seconds with semantic search"
            />
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 animate-slideInRight">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-sm">
              Join thousands of users building their second brain
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Username Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                ref={usernameRef}
                type="text"
                placeholder="Choose a username"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                ref={passwordRef}
                type="password"
                placeholder="Create a strong password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button
              variant="dark"
              size="lg"
              fullWidth
              Loading={loading}
              onClick={handleSignup}
              disabled={loading}
              endIcon={!loading && <ChevronRight className="w-5 h-5" />}
              className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-all"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
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
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                IdeaNode
              </h1>
              <p className="text-sm text-gray-600">Your Second Brain</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 leading-tight">
            Welcome Back!<br />
            Your Knowledge<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Awaits You.
            </span>
          </h2>

          <div className="space-y-3">
            <FeatureCard
              icon={<Brain className="w-4 h-4" />}
              title="Instant Recall"
              description="Access all your saved content in one place"
            />
            <FeatureCard
              icon={<Sparkles className="w-4 h-4" />}
              title="Smart Insights"
              description="Get AI-powered answers from your knowledge base"
            />
            <FeatureCard
              icon={<Zap className="w-4 h-4" />}
              title="Always Synced"
              description="Your content is safe and accessible anywhere"
            />
          </div>
        </div>

        {/* Right Side - SignIn Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 animate-slideInRight">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your second brain
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Username Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                ref={usernameRef}
                type="text"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                ref={passwordRef}
                type="password"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="dark"
              size="lg"
              fullWidth
              Loading={loading}
              onClick={handleSignIn}
              disabled={loading}
              endIcon={!loading && <ChevronRight className="w-5 h-5" />}
              className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-all"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export function signOut() {
  localStorage.removeItem("token");
  window.location.href = "/signin";
}