"use client"
import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Message } from "@/Model/User.model"
import { acceptingMessageSchema } from "@/Schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { User } from 'next-auth'


const dashboard = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)


  const handleDeleteMessage = (messageId: string) => {
      setMessages(messages.filter((message) => message._id.toString() !== messageId)) // remove message by id
  }

  const {data: session} = useSession()

  const form = useForm({
    resolver: zodResolver(acceptingMessageSchema),
    defaultValues: { acceptMessages: false }
  })

  const {register, watch, setValue} = form; 

  const acceptMessages = watch("acceptMessages") // hook for acceptMessages switch

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const reponse = await axios.get('/api/accept-messages')
      setValue('acceptMessages',reponse.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'failed to fetch message settings' , {duration: 3000})
    }finally {
      setIsSwitchLoading(false)
    }
  },[setValue])

  // useCallback to not every time render recreate the function
  const fetchMessages = useCallback( async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      console.log("response for get messages",response)
      setMessages(response?.data.messages || [])

      if (refresh) {
        toast.success('showing latest messages',{duration: 3000})
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'failed to fetch message settings' , {duration: 3000})
    } finally {
      setIsSwitchLoading(false)
      setIsLoading(false)
    }
  },[setIsLoading, setMessages]) // recreate only if these change

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessage()
  },[session, setValue, fetchAcceptMessage, fetchMessages])

  const handleSwitchChange = async() => {
   try {
    await axios.post<ApiResponse>('/api/accept-messages',{
      acceptMessages: !acceptMessages
    })
    setValue('acceptMessages', !acceptMessages)
    toast.success('message settings updated', {duration: 3000})
   } catch (error) {
       const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'failed to fetch message settings' , {duration: 3000})
   }
  }
  
  // construct profile URL and copy to clipboard
  const username = (session?.user as User)?.username ?? ''
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Profile URL copied to clipboard!', { duration: 3000 })
  }

  if (!session || !session.user) {
    return <div>Please Log In</div>
  }

  return (
     <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-5xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <Input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          checked={!!acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default dashboard