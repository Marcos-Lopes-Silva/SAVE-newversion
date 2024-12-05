import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import { connectToMongoDB } from "@/lib/db";
import User, { IUserDocument } from "../../../../models/userModel";

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/user.birthday.read",
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,

        }),
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            await connectToMongoDB();

            if (!user.email) return false;

            const existingUser = await User.findOne({ email: user.email });

            if (!existingUser) {
                await User.create({
                    email: user.email,
                    name: user.name!!,
                    image: user.image!!,
                    emailVerified: null,
                    role: user.email === 'egressas4@gmail.com' ? 'admin' : 'user',
                    approved: false,
                    cpf: null,
                    birthday: credentials ? credentials.birthday as string : null,
                });
            }

            return true;
        },
        async session({ session, token, user }) {
            await connectToMongoDB();

            const persistedUser: IUserDocument | null = await User.findOne({ email: token.email }).lean();

            if (token.email === 'egressas4@gmail.com') {
                session.user.email = token.email;
                session.user.role = 'admin';
                session.user.verified = true;
                return session;
            }

            session.user._id = persistedUser?._id?.toString();
            session.user.email = persistedUser?.email;
            session.user.role = persistedUser?.role || 'user';
            session.user.verified = persistedUser?.approved ?? false;
            session.user.birthday = token.birthday as string;
            session.user.cpf = persistedUser?.cpf || null;

            return session;
        },
        async jwt({ token, account }) {

            if (account?.provider === "google") {
                const profileResponse = await fetch(
                    `https://people.googleapis.com/v1/people/me?personFields=birthdays`,
                    {
                        headers: {
                            Authorization: `Bearer ${token.access_token}`,
                        },
                    }
                );
                const profileData = await profileResponse.json();
                console.log(profileData);
                const birthday = profileData.birthdays?.[0]?.date;
                if (birthday) {
                    token.birthday = `${birthday.year}-${birthday.month}-${birthday.day}`;
                }
            }

            return token;
        }
    }
})