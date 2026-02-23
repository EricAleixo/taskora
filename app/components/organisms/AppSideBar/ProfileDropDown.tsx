"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LuChevronUp } from "react-icons/lu";
import { LogOutBtn } from "../../atoms/Buttons/LogOutBtn";
import { AppSideBarI } from "@/app/types/App";
import { User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export const profileDropdown = (props: AppSideBarI) => {
  const { setOpenMobile } = useSidebar();

  const closeMobile = () => setOpenMobile(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-3 h-auto p-2"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={props.profile.avatarUrl} />
              <AvatarFallback>
                {props.profile.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0 text-left">
              <p className="font-semibold text-sm truncate">
                {props.profile.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {props.user.email}
              </p>
            </div>
          </div>
          <LuChevronUp className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <LogOutBtn />
        </DropdownMenuItem>
        <Link className="cursor-pointer" href="/profile">
          <DropdownMenuItem className="cursor-pointer" onClick={closeMobile}>
            <User></User>Profile
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
