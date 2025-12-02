import {resend } from "../lib/reSend"
import VerificationEmail from "../../Emails/verificationEmail"
import { ApiResponse} from "../types/ApiResponse"

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'FeedBackify || Verification Code',
            react:VerificationEmail({username, otp: verifyCode}),
        });
        
        return {success:true, message: "Verification Email Send Successfully"}
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {success:false, message: "Failed to Send Verification Email"}
    }
}