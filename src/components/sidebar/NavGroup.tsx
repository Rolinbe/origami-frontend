import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface NavGroupProps {
  item: NavItem;
}

export const NavGroup = ({ item }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { pathname } = useLocation();

  const isSubItemActive = item.submenu?.some(
    (sub) => sub.path && pathname.startsWith(sub.path)
  );

  if (item.submenu) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isSubItemActive && "text-primary"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon size={19} strokeWidth={2.2} />
            <span>{item.title}</span>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
            {item.submenu.map((subItem, index) => (
              <NavLink
                key={index}
                to={subItem.path || "#"}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeClassName="bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
              >
                <subItem.icon size={17} strokeWidth={2} />
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
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      activeClassName="bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
    >
      <item.icon size={19} strokeWidth={2.2} />
      <span>{item.title}</span>
    </NavLink>
  );
};