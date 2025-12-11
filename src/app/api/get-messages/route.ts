import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { log } from "console";

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

    const userId = new mongoose.Types.ObjectId(user._id) // convert to ObjectId
    
    try {
        const user = await UserModel.aggregate([ // fetch messages using aggregation
            { $match: {_id: userId} }, // match user by id
            { $unwind: '$messages' }, // deconstruct messages array
            { $sort: { 'messages.createdAt': -1} }, // sort by createdAt descending
            { $group: {_id: '$_id', messages: { $push: '$messages'}}} // group back to array
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "user not found"
            },{status: 401})
        }

        return Response.json({
            success: true,
            messages: user[0].messages // return messages array
        },{status: 200})

    } catch (error) {
        console.log("error in get-messages route",error)
        return Response.json({
            success: false,
            message: "Internal server error occurred"
        },{status: 500})
    }

}   