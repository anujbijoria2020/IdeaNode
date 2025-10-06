import { useRef, useState } from "react";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/InputComponent";
import { BackendUrl } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignInResponse{
    token:"string"
}

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
 const [showPassword,setShowPassword] = useState<boolean>(true);
const navigate = useNavigate();

  async function SignUpButton() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || username.length < 3) {
      return setError("Username must be at least 3 characters!");
    }
    if (!password || password.length < 8) {
      return setError("Password must be at least 8 characters!");
    }

    setError(null);

    try {
      const response = await axios.post(`${BackendUrl}/api/v1/signup`, {
        username,
        password,
      });
      console.log(response.data);
      navigate("/signin");

    }catch (err:any) {
      setError(err.response?.data?.message || "SignIn failed! Try again.");
}
  }

  function handleShowPassword(){
    return setShowPassword(!showPassword);
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white rounded border-purple-600 border-1 min-w-96 min-h-76 flex flex-col justify-around">
        <div className="p-4">
          {error && <span className="text-red-500 font-medium p-3 text-sm">{error}</span>}
          <Input ref={usernameRef} placeholder={"Username..."} type ={"text"} />

          <Input ref={passwordRef} placeholder={"Password..."} type={showPassword?"text":"password"} onTogglePassword={handleShowPassword}/>
        </div>
        <div className="flex justify-center p-4">
          <Button
            variant="light"
            size="md"
            text="Sign Up"
            fullWidth={true}
            Loading={false}
            onClick={SignUpButton}
          />
        </div>
      <div className="text-sm  flex justify-center items-center">
        <span className="">Already have an account?</span>
        <span className="text-blue-800 font-semibold cursor-pointer" onClick={()=>{
          navigate("/signin")
        }}>Sign in</span>
        </div> </div>
    </div>
  );
}

export function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
 const [showPassword,setShowPassword] = useState<boolean>(true);
const navigate = useNavigate();


  async function SignInButton() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || username.length < 3) {
      return setError("Username must be at least 3 characters!");
    }
    if (!password || password.length < 8) {
      return setError("Password must be at least 8 characters!");
    }

    setError(null);

    try {
      const response = await axios.post<SignInResponse>(`${BackendUrl}/api/v1/signin`, {
        username,
        password,
      });
      console.log(response.data);
      const token = response?.data?.token;      console.log(token);
      localStorage.setItem("token",token);
      navigate("/dashboard");

    } catch (err:any) {
      setError(err.response?.data?.message || "SignIn failed! Try again.");
    }
  }

  function handleShowPassword(){
    return setShowPassword(!showPassword);
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white rounded border-purple-600 border-1 min-w-96 min-h-76 flex flex-col justify-around">
        <div className="p-4">
          {error && <span className="text-red-500 font-medium p-3 text-sm">{error}</span>}
          <Input ref={usernameRef} placeholder={"Username..."} type ={"text"} />

          <Input ref={passwordRef} placeholder={"Password..."} type={showPassword?"text":"password"} onTogglePassword={handleShowPassword}/>
        </div>
        <div className="flex justify-center p-4">
          <Button
            variant="light"
            size="md"
            text="Sign In"
            fullWidth={true}
            Loading={false}
            onClick={SignInButton}
          />
        </div>
             <div className="text-sm  flex justify-center items-center">
        <span className="">Don't have an account?</span>
        <span className="text-blue-800 font-semibold cursor-pointer" onClick={()=>{
          navigate("/signup")
        }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export function signOut() {

  localStorage.removeItem("token");
 window.location.href = "/signin"
}
