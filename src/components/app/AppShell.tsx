import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { signOut, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useCreateChat } from "@/lib/useCreateChat";

type NavLink = { to: string; label: string; icon: typeof LayoutDashboard };

const NAV: NavLink[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chats", label: "Chats", icon: MessagesSquare },
  { to: "/knowledge", label: "Knowledge Bases", icon: BookOpen },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 rounded-md px-1 py-1">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden />
      </span>
      {!collapsed && (
        <span className="truncate font-display text-[15px] font-semibold text-foreground">
          Verity
        </span>
      )}
    </Link>
  );
}

function NavItem({
  link,
  collapsed,
  active,
  onNavigate,
}: {
  link: NavLink;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = link.icon;
  return (
    <Link
      to={link.to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? link.label : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-cream-200/60 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{link.label}</span>}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const createChat = useCreateChat();

  const displayName =
    (user?.user_metadata?.["display_name"] as string | undefined) ??
    user?.email?.split("@")[0] ??
    "You";

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-4">
      <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
        <Brand collapsed={collapsed} />
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-cream-200/70 hover:text-foreground lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <Button
        onClick={() => {
          onNavigate?.();
          createChat.mutate({ kbId: null });
        }}
        disabled={createChat.isPending}
        className={cn("min-h-11 rounded-full", collapsed && "px-0")}
        title="New chat"
      >
        <Plus className="size-4" aria-hidden />
        {!collapsed && "New chat"}
      </Button>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {NAV.map((link) => (
          <NavItem
            key={link.to}
            link={link}
            collapsed={collapsed}
            active={pathname === link.to || pathname.startsWith(`${link.to}/`)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-border pt-3">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent-hover">
            {initials(displayName, user?.email)}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              aria-label="Log out"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/auth" });
              }}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-cream-200/70 hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar lg:block"
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-primary/20 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border bg-sidebar lg:hidden"
              role="dialog"
              aria-label="Navigation"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="absolute right-2 top-3 flex size-9 items-center justify-center rounded-md text-muted-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-cream-100"
          >
            <PanelLeftOpen className="size-5" aria-hidden />
          </button>
          <Brand collapsed={false} />
          <Link
            to="/chats"
            className="ml-auto flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-cream-100"
            aria-label="Chats"
          >
            <MessageSquare className="size-5" aria-hidden />
          </Link>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
