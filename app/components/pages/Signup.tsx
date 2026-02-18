import { Logo } from "../atoms/Logo";
import { FormSignUp } from "../organisms/Forms/FormSignUp";
 

export const SignupPage = () => {
  return (
    <div className="flex items-center justify-center h-full w-full flex-col">
      <Logo></Logo>
      <FormSignUp />
    </div>
  );
};
