import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            _id?: string;
            role?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            cpf?: string | null;
            verified?: boolean;
            birthday?: string | null | undefined;
        };
    }

    interface JWT {
        birthday?: string;
    }
}