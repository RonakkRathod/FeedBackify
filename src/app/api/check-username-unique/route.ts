import {z} from 'zod'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/Model/User.model'
import { usernameValidation } from '@/Schemas/signUpSchema'


const checkUsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(req: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(req.url)

        const queryParams = {
            username: searchParams.get('username')
        }

        // validate with zod
        const result = checkUsernameQuerySchema.safeParse(queryParams)

        if(!result.success){
            const usernameError = result.error.format().username?._errors || []
            return Response.json({
                success:false,
                message: "Invalid Username"
            },{status:400})
        }

        const { username } = result.data

        const existingUser = await UserModel.findOne({username, isVerified:true})

        if (existingUser) {
            return Response.json({
                success:false,
                message: "Username is already taken"
            },{status:400})
        }

            return Response.json({
                success:true,
                message: "Username is unique"
            },{status:200})
        
    } catch (error) {
        console.error("Error checking username uniqueness",error)
        return Response.json({
            success: false,
            message: "error checking username "
        },{status:500})
    }
}