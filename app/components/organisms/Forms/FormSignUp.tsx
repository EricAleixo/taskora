"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaApple } from "react-icons/fa";
import { LoginBtn } from "../../atoms/Buttons/LoginBtn";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const Item = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

export const FormSignUp = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-sm"
    >
      <Card className="w-full">
        <CardHeader>
          <Item>
            <CardTitle>Criar Conta</CardTitle>
          </Item>
          <Item>
            <CardDescription>
              Para criar uma conta use seu email, ou alguma das seguintes
              plataformas.
            </CardDescription>
          </Item>
          <Item>
            <CardAction>
              <Link href="/login">
                <Button variant="link">Login</Button>
              </Link>
            </CardAction>
          </Item>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <Item>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </motion.div>
                </div>
              </Item>

              <Item>
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
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Input id="password" type="password" required />
                  </motion.div>
                </div>
              </Item>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Item className="w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full"
            >
              <Button type="submit" className="w-full">
                Criar conta
              </Button>
            </motion.div>
          </Item>

          <Item className="w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full"
            >
              <LoginBtn />
            </motion.div>
          </Item>

          <Item className="w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                <FaApple className="size-6" />
                Login com a Apple
              </Button>
            </motion.div>
          </Item>
        </CardFooter>
      </Card>
    </motion.div>
  );
};