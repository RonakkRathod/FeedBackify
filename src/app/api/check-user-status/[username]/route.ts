import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {

    const { username } = await context.params
    await dbConnect()

    try {
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            isAcceptingMessages: user.isAcceptingMessages,
            username: user.username
        }, { status: 200 })

    } catch (error) {
        console.log("Error checking user status", error)
        return Response.json({
            success: false,
            message: "Error checking user status"
        }, { status: 500 })
    }
}
