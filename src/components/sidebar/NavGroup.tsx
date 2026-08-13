import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface NavGroupProps {
  item: NavItem;
}

const linkBase = "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.06]";
const activeLink =
  "bg-gradient-to-r from-primary/25 via-primary/10 to-transparent text-white shadow-inner";
const activeBar =
  "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-chart-1 before:to-chart-4 before:shadow-[0_0_10px_hsl(var(--chart-1)/0.8)]";

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
            "group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-slate-300 hover:bg-white/[0.06] hover:text-white",
            isSubItemActive && "bg-white/[0.06] text-white",
            isSubItemActive && activeBar
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon
              size={19}
              strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:scale-110 group-hover:text-chart-1"
            />
            <span>{item.title}</span>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              "text-slate-400 transition-transform duration-300",
              isOpen && "rotate-180",
              isSubItemActive && "text-chart-1"
            )}
          />
        </button>
        <div
          className={cn(
            "ml-4 overflow-hidden border-l border-white/10 pl-3 transition-all duration-300 ease-out",
            isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1 pt-1">
            {item.submenu.map((subItem, index) => (
              <NavLink
                key={index}
                to={subItem.path || "#"}
                className={cn(
                  linkBase,
                  "py-2 text-[0.85rem]",
                  "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:-ml-4 before:h-4 before:w-0.5 before:scale-y-0 before:bg-chart-1 before:transition-transform before:duration-300"
                )}
                activeClassName={cn(activeLink, "before:scale-y-100")}
              >
                <subItem.icon
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                />
                <span>{subItem.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path || "#"}
      className={linkBase}
      activeClassName={cn(activeLink, activeBar)}
    >
      <item.icon
        size={19}
        strokeWidth={2.2}
        className="transition-all duration-300 group-hover:scale-110 group-hover:text-chart-1"
      />
      <span>{item.title}</span>
      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-chart-1 group-hover:to-chart-4" />
    </NavLink>
  );
};