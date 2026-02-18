import { Logo } from "../atoms/Logo";
import { FormLogin } from "../organisms/Forms/FormLogin";

export const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-full w-full flex-col">
      <Logo></Logo>
      <FormLogin />
    </div>
  );
};
