'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'


const page = () => {

  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const params = useParams<{username: string}>()

  // Check if user is accepting messages
  useEffect(() => {
    const checkUserStatus = async () => {

      try {
        setCheckingStatus(true)
        const response = await axios.get(`/api/check-user-status/${params.username}`)
        console.log(response)
        setIsAcceptingMessages(response.data.isAcceptingMessages)
      } catch (error: any) {
        console.log("Error checking user status", error)
        toast.error(error.response?.data?.message || "Unable to verify user")
      } finally {
        setCheckingStatus(false)
      }

    }
    
    if (params.username) {
      checkUserStatus()
    }
  }, [params.username])


  const onSubmit = async (messageContent: string) => {
    try {
      setLoading(true)

      if (messageContent.length === 0) {
        toast.error("Message cannot be empty")
      }

      const response = await axios.post('/api/send-message',{
        username: params.username,
        content: messageContent
      })

      if (response.data.success) {
        toast.success("Message sent successfully!")
        setContent("")
      }
    } catch (error: any) {
      console.log("Error sending message", error)
      const errorMessage = error.response?.data?.message || "Failed to send message"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className='text-3xl md:text-5xl font-bold mb-4'>Send Anonymous Message</h1>
      <p className='text-gray-600 mb-6'>to @{params.username}</p>
      
      {!isAcceptingMessages ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">This user is not accepting messages at the moment. Please try again later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Type your message here (10-300 characters)...'
            className='w-full h-20 bg-gray-100 text-black rounded-lg p-3'
            disabled={!isAcceptingMessages}
          />
          <p className="text-sm text-gray-500">{content.length}/300 characters</p>
          <Button 
            onClick={() => onSubmit(content)} 
            disabled={loading || !isAcceptingMessages}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default page