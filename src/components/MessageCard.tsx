'use client'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { Message } from "@/Model/User.model"
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"

type MessageCardProps = {
    message: Message;
    onMessageDelete : (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete}: MessageCardProps) => {

    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)

        toast.success(response.data.message)
        onMessageDelete(message._id.toString())
    }
    
  return (
     <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Message</CardTitle>
                            <CardDescription>
                                {new Date(message.createdAt).toLocaleString()}
                            </CardDescription>
                        </div>
                        <AlertDialog>
                                <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" aria-label="Delete message">
                                            <X className="w-5 h-5" />
                                        </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                                This action cannot be undone.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                </AlertDialogContent>
                        </AlertDialog>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-bold leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </CardContent>
        </Card>
  )
}

export default MessageCard