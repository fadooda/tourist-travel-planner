// components/site-header.tsx
import Link from "next/link";
import { Globe, ChevronDown, User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <Logo />
        {/* <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-full border" />
          <span>Discover Egypt</span>
        </Link> */}

        <nav className="hidden items-center gap-7 md:flex">
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" href="/discover">
            Discover
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" href="/trips">
            Trips
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" href="/about">
            About us
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">
              More <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                  <Link href="/auth/login"><span>Log in / Sign up</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Blogs</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Wishlists</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Help</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 md:flex">
            <Globe className="h-4 w-4" />
            <span>USD</span>
          </button>

          <UserMenu/>
        </div>
      </div>
    </header>
  );
}
