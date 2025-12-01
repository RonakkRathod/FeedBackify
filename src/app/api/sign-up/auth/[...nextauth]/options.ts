import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import dbConnect  from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any>{
                await dbConnect()
                try {
                    const user = await UserModel.findOne({ // check user in db
                        $or: [
                            { email: credentials.identifier },
                            { username : credentials.identifier },
                        ]
                    })

                    if (!user) { // if user not found
                        throw new Error("No user found with the given email or username")
                    }

                    if(!user.isVerified){ // if user not verified
                        throw new Error("Verify your account first before log in")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)

                    if (isPasswordCorrect) {
                        return user
                    }else{
                        throw new Error("Incorrect password")
                    }
                } catch (err: any) {
                    throw new Error(err)
                }
            }
        })
    ],
    callbacks: {    //optimizr we dont need to each time query db for user
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username 
            }
            return session
        },
        async jwt({ token, user }) { // this user is from auth
            if(user){
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }

            return token
        }
    },
    pages: {
        signIn: '/sign-in',
    },
    session:{
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
}