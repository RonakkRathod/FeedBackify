import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";


export async function POST(req: Request){
    await dbConnect()

    try {
        const {username, code} = await req.json()

        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({username : decodedUsername})

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            },{status:400})
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()  // check if db stored date is greater than current date

        // check if code is valid and not expired
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json({
                success: true,
                message: "Account verified successfully"
            },{status:200})

        } else if(!isCodeNotExpired){

            return Response.json({
                success: false,
                message: "verification code expired please sign-up agian to get new code"
            },{status:400})

        } else{

             return Response.json({
                success: false,
                message: "Incorrect verification code"
            },{status:400})

        }
        
    } catch (error) {
        console.error("Error verifying code",error)
        return Response.json({
            success: false,
            message: "error verifying code"
        },{status:500})
    }
}