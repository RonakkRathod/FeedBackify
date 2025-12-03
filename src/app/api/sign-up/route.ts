import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/Helpers/sendVerificationEmail";


export async function POST(request: Request){
    await dbConnect()

    try {
        const {username,email,password} = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success:false,
                message: "Username is already taken"
            },{status:400})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success:false,
                    message: "User with this email already exists"
                }, {status:400})
            } else {
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000) // miliseconds in 1 hour
                await existingUserByEmail.save()
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1) // Set expiry time to 1 hour from now

            const newUser =  new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            })

            await newUser.save()
        }
        //send verifiacation email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode,
        )

        if (!emailResponse.success) {
            return Response.json({
                success:false,
                message: emailResponse.message 
            },{status:500})
        }

        return Response.json({
            success:true,
            message: "User Registered Successfully. Verify Your Email"
        },{status:201})

    } catch (error) {
        console.error("Error Registering User",error);
        return Response.json({
            success:false,
            message: "Error registering user"
        },{
            status:500
        })
    }
}