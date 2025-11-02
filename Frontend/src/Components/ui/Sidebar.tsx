// 📁 src/Components/ui/Sidebar.tsx

import { HomeIcon, NotebookIcon, MessageSquare, FileText, Brain, LogOut } from "lucide-react";
import { useState } from "react";
import { TwitterIcon } from "../icons/Twitter";
import { YouTubeIcon } from "../icons/Youtube";
import { SidebarItem } from "./SidebarItem";
import { Button } from "./Button";
import { signOut } from "../../pages/Auth";

const isSharedContent =
  typeof window !== "undefined" && location.pathname.includes("/share/");

export function Sidebar({
  onfilterChange,
  onQnAClick,
}: {
  onfilterChange: (type: string) => void;
  onQnAClick?: () => void;
}) {
  const [active, setActive] = useState<string>("all");

  const menuItems = [
    { text: "All", icon: <HomeIcon />, type: "all" },
    { text: "Twitter", icon: <TwitterIcon />, type: "twitter" },
    { text: "Youtube", icon: <YouTubeIcon />, type: "youtube" },
    { text: "Note", icon: <NotebookIcon />, type: "note" },
    { text: "PDF", icon: <FileText />, type: "pdf" },
  ];

  const handleItemClick = (type: string) => {
    setActive(type);
    onfilterChange(type);
  };

  const handleQnAClick = () => {
    setActive("qna");
    if (onQnAClick) {
      onQnAClick();
    }
  };

  return (
    <>
      {/* Desktop left rail */}
      <aside className="hidden md:flex h-screen bg-white/80 backdrop-blur-xl w-76 fixed left-0 top-0 flex-col justify-between border-r border-gray-200/50 shadow-sm">
        <div className="p-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 cursor-pointer group">
            <div className="p-2.5 hover:scale-105 transition-all">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray bg-clip-text">
                IdeaNode
              </h1>
              <p className="text-xs text-gray-500">Your Second Brain</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Content
            </p>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.type}
                text={item.text}
                icon={item.icon}
                active={active === item.type}
                onClick={() => handleItemClick(item.type)}
              />
            ))}

            {/* QnA Section */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                AI Assistant
              </p>
              <SidebarItem
                text="Ask Questions"
                icon={<MessageSquare />}
                active={active === "qna"}
                onClick={handleQnAClick}
              />
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        {!isSharedContent && (
          <div className="p-4 border-t border-gray-200/50">
            <Button
              variant="ghost"
              size="md"
              text="Sign Out"
              startIcon={<LogOut className="w-4 h-4" />}
              fullWidth
              onClick={signOut}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all"
            />
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="p-1.5  rounded-lg">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-black bg-clip-text ">
              IdeaNode
            </span>
          </div>
          {!isSharedContent && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              startIcon={<LogOut className="w-4 h-4" />}
              className="text-gray-700 hover:text-red-600"
            >
              Sign Out
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 px-2 pb-2 overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.type}
              compact
              text={item.text}
              icon={item.icon}
              active={active === item.type}
              onClick={() => handleItemClick(item.type)}
            />
          ))}
          <SidebarItem
            compact
            text="Q&A"
            icon={<MessageSquare />}
            active={active === "qna"}
            onClick={handleQnAClick}
          />
        </div>
      </div>
    </>
  );
}