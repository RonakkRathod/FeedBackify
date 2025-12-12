import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ messageid: string }> }
){
    const { messageid } = await context.params
    const messageId = messageid
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "unAuthorized "
        },
        { status:401 })
    }

    try {
        const messageObjectId = new mongoose.Types.ObjectId(messageId)
        const userObjectId = new mongoose.Types.ObjectId(user._id)
        const updatedResult = await UserModel.updateOne(
            {_id: userObjectId},
            {$pull: {messages: {_id: messageObjectId}}}
        )

        if (updatedResult.matchedCount === 0) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        if (updatedResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "Message not found or already deleted"
            },
            { status:404 })
        }

        return Response.json({
            success: true,
            message: "Message deleted"
        },
        { status:200 })

    } catch (error) {
        console.log("Error in deleting message route",error)

        return Response.json({
            success: false,
            message: "Error in Deleting Message"
        },
        { status:500 })
    }
}   