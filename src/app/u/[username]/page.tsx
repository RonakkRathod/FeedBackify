'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'


const page = () => {

  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)

  const params = useParams<{username: string}>()

  const generateSuggestions = async () => {
    try {
      setIsSuggesting(true)
      setSuggestions([])
      
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          
          // Parse and update suggestions as they stream
          const parsed = fullText
            .split('||')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 3)
          
          if (parsed.length > 0) {
            setSuggestions(parsed)
          }
        }
      }

      console.log('Final AI response:', fullText)
      
      // Final parse
      const finalParsed = fullText
        .split('||')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)
      
      setSuggestions(finalParsed)
      
    } catch (error) {
      console.error('Error generating suggestions', error)
      toast.error('Unable to fetch AI suggestions right now')
    } finally {
      setIsSuggesting(false)
    }
  }

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
    const trimmedContent = messageContent.trim()

    if (trimmedContent.length === 0) {
      toast.error("Message cannot be empty")
      return
    }

    if (trimmedContent.length > 300) {
      toast.error("Message must be 300 characters or fewer")
      return
    }

    try {
      setLoading(true)

      const response = await axios.post('/api/send-message',{
        username: params.username,
        content: trimmedContent
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

  const handleSuggestionClick = (text: string) => {
    setContent(text.slice(0, 300))
  }

  if (checkingStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className='text-3xl md:text-5xl font-bold mb-2 text-gray-900'>Send Anonymous Message</h1>
          <p className='text-gray-600 text-lg'>to <span className="font-semibold text-gray-800">@{params.username}</span></p>
        </div>
      
        {!isAcceptingMessages ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-800 font-medium">This user is not accepting messages at the moment. Please try again later.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Message Input Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Message</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Type your anonymous message here...'
                className='w-full min-h-32 bg-gray-50 text-gray-900 rounded-lg p-4 border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none resize-none transition-all'
                maxLength={300}
                disabled={!isAcceptingMessages}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-500">{content.length}/300 characters</p>
                <Button 
                  onClick={() => onSubmit(content)} 
                  disabled={loading || !isAcceptingMessages || content.trim().length === 0}
                  className="px-8"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message"}
                </Button>
              </div>
            </div>

            {/* AI Suggestions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 shadow-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Need inspiration?</h2>
                    <p className="text-sm text-gray-500">Let AI suggest some message ideas for you</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={generateSuggestions}
                  disabled={isSuggesting}
                  className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                >
                  {isSuggesting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Generate Ideas
                    </span>
                  )}
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 min-h-48">
                {isSuggesting && suggestions.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 animate-bounce rounded-full bg-gray-400"  />
                      <span className="h-3 w-3 animate-bounce rounded-full bg-gray-500"  />
                      <span className="h-3 w-3 animate-bounce rounded-full bg-gray-600"  />
                    </div>
                    <p className="text-sm font-medium text-gray-600">AI is thinking...</p>
                  </div>
                )}

                {!isSuggesting && suggestions.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">No suggestions yet</p>
                      <p className="text-sm text-gray-500">Click &quot;Generate Ideas&quot; to get started</p>
                    </div>
                  </div>
                )}

                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="group relative flex flex-col h-full min-h-32 rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-gray-900 hover:bg-white hover:shadow-lg"
                  >
                    <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-sm font-medium leading-relaxed text-gray-700 group-hover:text-gray-900">
                      {suggestion}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-600">
                      <span>Click to use</span>
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Your message will be sent anonymously. The recipient won&apos;t know who sent it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page