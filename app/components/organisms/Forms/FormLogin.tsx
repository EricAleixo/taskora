import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaApple } from "react-icons/fa";
import { LoginBtn } from "../../atoms/Buttons/LoginBtn";

export const FormLogin = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Entrar na conta</CardTitle>
        <CardDescription>
          Entre na sua conta colocando seu email e senha.
        </CardDescription>
        <CardAction>
          <Link href="/register"><Button variant="link">Sign Up</Button></Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Esqueceu sua senha?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Entrar
        </Button>
        <LoginBtn></LoginBtn>
        <Button variant="outline" className="w-full">
          <FaApple className="size-6" />
          Login com a Apple
        </Button>
      </CardFooter>
    </Card>
  );
};
