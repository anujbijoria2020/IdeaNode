import type { ReactElement } from "react";

export const SidebarItem = ({
  text,
  icon,
  onClick,
  compact = false,
  active = false,
}: {
  text: string;
  icon: ReactElement;
  onClick?: () => void;
  compact?: boolean;
  active?: boolean;
}) => {
  return (
    <button
      className={[
        "flex items-center gap-2 rounded-xl cursor-pointer transition w-full", // full width now
        compact
          ? "px-3 py-2 text-sm"
          : "p-3 text-base",
        active
          ? "bg-slate-200 text-purple-700"
          : "text-gray-700 duration-300 ease-in-out",
      ].join(" ")}
      onClick={onClick}
    >
      {icon}
      <span className="flex-1 text-left">{text}</span>
    </button>
  );
};