import { SignIn, Signup } from "./pages/Auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashBoard } from "./pages/dashboard";
import { SharedContent } from "./pages/SharedContent";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./pages/Protected";

export const FrontEndUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<ProtectedRoute/>}>
        <Route path="/dashboard" element={<DashBoard />} />
        </Route>
        <Route path="/share/:hash" element={<SharedContent/>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
