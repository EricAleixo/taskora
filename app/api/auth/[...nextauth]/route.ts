import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import type { Account, Profile, User } from "next-auth";
import { db } from "@/src/server/db";
import { userTable } from "@/src/server/db/schemas";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({
      user,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      try {
        if (!user.email) return false;

        // Verifica se o usuário já existe no banco
        const existingUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, user.email))
          .limit(1);

        if (existingUser.length === 0) {
          // Cria novo usuário se não existir
          await db.insert(userTable).values({
            email: user.email,
          });
        } else {
          await db
            .update(userTable)
            .set({
              email: user.email,
            })
            .where(eq(userTable.email, user.email));
        }

        return true;
      } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        return false;
      }
    },

    async jwt({ token, user }: { token: any; user?: User }) {
      if (user && user.email) {
        // Busca o usuário no banco
        let dbUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, user.email))
          .limit(1);

        // Se não existir, cria agora mesmo
        if (dbUser.length === 0) {
          const inserted = await db
            .insert(userTable)
            .values({ email: user.email })
            .returning();

          dbUser = inserted;
        }

        if (dbUser.length > 0) {
          token.id = dbUser[0].id;
          token.email = dbUser[0].email;
          token.role = dbUser[0].role;
        }

        console.log("TOKEN APÓS JWT:", token);
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
