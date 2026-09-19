"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Shield } from "lucide-react";
import { Avatar } from "@/components/site/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";

export function UserMenu({ name, role, avatarUrl }: { name: string; role: "student" | "admin"; avatarUrl?: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full pl-1.5">
          <Avatar name={name} src={avatarUrl} size={24} className="text-[10px]" />
          <span className="max-w-[8rem] truncate">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOut} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
