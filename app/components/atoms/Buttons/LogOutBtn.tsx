import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";

export const LogOutBtn = () => {
  return (
    <button className="w-full flex items-center" onClick={() => signOut()}>
      <LuLogOut className="mr-2 h-4 w-4" />
      Sair
    </button>
  );
};
