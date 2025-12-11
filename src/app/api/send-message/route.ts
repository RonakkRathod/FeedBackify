import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";
import { Message } from "@/Model/User.model";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()

    try {
        const user = await UserModel.findOne(username)

        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            },{status: 404})
        }

        // is user accepting messages?
        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "user is not accepting messages, try again later"
            },{status: 403})
        }

        const newMessage = {content, createdAt: new Date()}

        user.messages.push(newMessage as Message) // add new message
        await user.save()
        
        return Response.json({
            success: true,
            message: "message sent successfully"
        },{status: 200})

    } catch (error) {
        
        console.log("error in send-message route",error)
        return Response.json({
            success: false,
            message: "Internal server error occurred "
        },{status: 500})
    }
}
