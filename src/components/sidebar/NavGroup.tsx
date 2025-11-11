import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface NavGroupProps {
  item: NavItem;
}

export const NavGroup = ({ item }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.submenu) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgb(101,193,255)] hover:bg-opacity-20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <item.icon size={20} />
            <span>{item.title}</span>
          </div>
          <ChevronDown
            size={16}
            className={cn("transition-transform", isOpen && "rotate-180")}
          />
        </button>
        {isOpen && (
          <div className="pl-4 space-y-1">
            {item.submenu.map((subItem, index) => (
              <NavLink
                key={index}
                to={subItem.path || "#"}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[rgb(101,193,255)] hover:bg-opacity-20 transition-colors"
                activeClassName="bg-[rgb(101,193,255)] bg-opacity-30"
              >
                <subItem.icon size={18} />
                <span>{subItem.title}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path || "#"}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgb(101,193,255)] hover:bg-opacity-20 transition-colors"
      activeClassName="bg-[rgb(101,193,255)] bg-opacity-30"
    >
      <item.icon size={20} />
      <span>{item.title}</span>
    </NavLink>
  );
};