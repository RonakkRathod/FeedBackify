import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";
import { User } from "next-auth";

// API route to accept or decline messages
export async function POST(request: Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) { // if user is not found
        return Response.json({
            success: false,
            message: "not authenticated"
        },{status: 401})
    }

    const userId = user._id
    const {acceptMessages} = await request.json()

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages},
            {new : true} // return the updated document
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update user status to accept messages"
            },{status: 401})
        }

        return Response.json({
                success: true,
                message: "Message acceptence status updated successfully",updatedUser
        },{status: 200})

    } catch (error) {

        console.log(error)
        return Response.json({
            success: false,
            message: "failed to update message settings"
        },{status: 500})
    }
}

// API route to get current message acceptance status
export async function GET(request: Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) { // if user is not found
        return Response.json({
            success: false,
            message: "not authenticated"
        },{status: 401})
    }

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
    
        if (!foundUser) {
             return Response.json({
                success: false,
                message: "User not found"
            },{status: 404})
        }
    
        return Response.json({
                success: true,
                message: "User found successfully",
                isAcceptingMessages: foundUser.isAcceptingMessages
        },{status: 200})
    } catch (error) {
        
        console.log(error)
        return Response.json({
            success: false,
            message: "Error in getting message acceptence status"
        },{status: 500})
    }

}