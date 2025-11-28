import { Message } from "../Model/User.model";
export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean; // optional
    messages?: Array<Message>;
}