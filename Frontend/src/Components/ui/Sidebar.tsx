// 📁 src/Components/ui/Sidebar.tsx

import { HomeIcon, InstagramIcon, NotebookIcon, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";
import { TwitterIcon } from "../icons/Twitter";
import { YouTubeIcon } from "../icons/Youtube";
import { LogoIcon } from "../icons/Logo";
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
    { text: "Twitter", icon: <TwitterIcon/>, type: "twitter" },
    { text: "Youtube", icon: <YouTubeIcon/>, type: "youtube" },
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
      <aside className="hidden md:flex h-screen bg-white w-76 fixed left-0 top-0 flex-col justify-between pl-2 border-r border-gray-200">
        <div>
          <div className="flex text-xl font-semibold pl-3 pt-4 items-center cursor-pointer">
            <div className="pr-2 text-purple-600">
              <LogoIcon/>
            </div>
            IdeaNode
          </div>
          <div className="pt-4 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.type}
                text={item.text}
                icon={item.icon}
                active={active === item.type}
                onClick={() => handleItemClick(item.type)}
              />
            ))}

            {/* QnA Section Separator */}
            <div className="my-3 border-t border-gray-200"></div>

            {/* QnA Item */}
            <SidebarItem
              text="Ask Questions"
              icon={<MessageSquare />}
              active={active === "qna"}
              onClick={handleQnAClick}
            />
          </div>
        </div>
        {!isSharedContent && (
          <div className="p-4 mb-3">
            <Button
              variant="dark"
              size="md"
              text="Sign Out"
              fullWidth
              onClick={signOut}
            />
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-purple-600">
              <LogoIcon />
            </span>
            IdeaNode
          </div>
          {!isSharedContent && (
            <Button variant="light" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 px-2 pb-2 overflow-x-auto">
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