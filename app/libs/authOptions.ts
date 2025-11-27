/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongodb";
import User from "../models/User";
import bcrypt from "bcryptjs";
import Teacher from "../models/Teacher";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      schoolId?: string;
      userRole: string;
      isVerified?: boolean;
      schoolUniqueId?: string;
      assignedClasses?: string[]; // ✅ instead of classLevel
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userRole: string;
    schoolId?: string;
    isVerified?: boolean;
    email?: string;
    schoolUniqueId?: string;
    assignedClasses?: string[]; // ✅ instead of classLevel
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },

  cookies: {
    sessionToken: {
      name: `auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? ".classikaedu.com" // ✅ custom domain for prod
            : undefined,
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Reg No", type: "text" },
        password: { label: "Password or School ID", type: "password" },
      },

      async authorize(credentials) {
        await connectToDatabase();

        // 🔹 Try login with email
        let user = await (User as any).findOne({ email: credentials?.email });

        // 🔹 Or by RegNo for students
        if (!user) {
          user = await (User as any).findOne({ regNo: credentials?.email });
        }

        if (!user) {
          throw new Error(
            "No user found with this email or registration number"
          );
        }

        // 🔹 School admins & teachers use bcrypt passwords
        if (user.userRole === "school_admin" || user.userRole === "teacher") {
          const isValid = await bcrypt.compare(
            credentials?.password || "",
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }
        }

        // 🔹 Students use their School ID as password
        if (user.userRole === "student") {
          if (credentials?.password !== user.schoolId) {
            throw new Error("Invalid School ID for this student");
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          userRole: user.userRole,
          schoolId: user.schoolId,
          isVerified: user.isVerified,
          assignedClasses: user.assignedClasses || [], // ✅ Use assignedClasses
        };
      },
    }),
    CredentialsProvider({
      id: "teacher-login",
      name: "Teacher Login",
      credentials: {
        email: { label: "Email", type: "text" },
        schoolId: { label: "School ID", type: "text" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await Teacher.findOne({
          email: credentials?.email,
          // userRole: "teacher",
        });
        if (!user) throw new Error("No teacher found with this email");
        if (credentials?.schoolId !== user.schoolUniqueId?.toString()) {
          throw new Error("Invalid School ID");
        }

        // ✅ If this is the teacher's first successful login, mark as verified
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          userRole: user.userRole,
          schoolId: user.schoolId,
          isVerified: user.isVerified,
          assignedClasses: user.assignedClasses || [], // ✅ Use assignedClasses
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userRole = (user as any).userRole;
        token.schoolId = (user as any).schoolId;
        token.isVerified = (user as any).isVerified;
        token.email = (user as any).email;
        token.schoolId = (user as any).schoolId;
        token.assignedClasses = (user as any).assignedClasses || [];
      } else {
        // refresh user info from DB
        await connectToDatabase();
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          token.userRole = dbUser.userRole;
          token.schoolId = dbUser.schoolId;
          token.isVerified = dbUser.isVerified;
          token.email = dbUser.email;
          token.schoolId = dbUser.schoolId;
          token.assignedClasses = dbUser.assignedClasses || [];
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.userRole = token.userRole;
        session.user.schoolId = token.schoolId;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.schoolId = token.schoolId;
        session.user.assignedClasses = token.assignedClasses || [];
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/dashboard",
  },
};
