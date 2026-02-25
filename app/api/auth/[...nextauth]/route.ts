import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import type { Account, Profile, User } from "next-auth";
import { db } from "@/src/server/db";
import { userTable, profileTable } from "@/src/server/db/schemas";

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
    async signIn({ user }: { user: User; account: Account | null; profile?: Profile }) {
      try {
        if (!user.email) return false;

        const existingUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, user.email))
          .limit(1);

        if (existingUser.length === 0) {
          await db.insert(userTable).values({ email: user.email });
        } else {
          await db
            .update(userTable)
            .set({ email: user.email })
            .where(eq(userTable.email, user.email));
        }

        return true;
      } catch(error: any) {
        console.error("SIGNIN ERROR:", error);
        return false;
      }
    },

    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: any;
      user?: User;
      trigger?: string;
      session?: any;
    }) {
      // Atualiza só o theme no token quando o cliente chama updateSession({ theme })
      if (trigger === "update" && session?.theme) {
        token.theme = session.theme;
        return token;
      }

      // Primeiro login: popula o token com dados do banco
      if (user && user.email) {
        let dbUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, user.email))
          .limit(1);

        if (dbUser.length === 0) {
          const inserted = await db
            .insert(userTable)
            .values({ email: user.email })
            .returning();
          dbUser = inserted;
        }

        if (dbUser.length > 0) {
          token.id    = dbUser[0].id;
          token.email = dbUser[0].email;
          token.role  = dbUser[0].role;

          // Busca o theme no profile (1:1 com user)
          const profile = await db
            .select({ theme: profileTable.theme })
            .from(profileTable)
            .where(eq(profileTable.userId, dbUser[0].id))
            .limit(1);

          token.theme = profile[0]?.theme ?? "system";
        }
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id    = token.id as string;
        session.user.role  = token.role as string;
        session.user.theme = (token.theme as string) ?? "system";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };