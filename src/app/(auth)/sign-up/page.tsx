'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as  z  from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback  } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/Schemas/signUpSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


const page = () => {
    const [username, setUsername] = useState("")
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const debounced = useDebounceCallback (setUsername, 500)
    const router = useRouter()

    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })


    useEffect( () => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                   const response = await axios.get(`/api/check-username-unique?username=${username}`)
                   console.log("response",response) // remove 
                   setUsernameMessage(response.data.message)

                } catch (error) {
                   const axiosError = error as AxiosError<ApiResponse>
                   setUsernameMessage(
                    axiosError.response?.data.message ?? "Error checking username"
                   ) 
                } finally{
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    },[username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
            console.log(response)
            toast.success('Account created successfully!',{duration: 2000}) // show success message
            router.replace(`/verify/${username}`) // redirect to verify page
            setIsSubmitting(false)
        } catch (error) {
            console.error("Error in signup user",error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast.error('Error creating account',{duration:2000})
        }
    }

  return ( // basic sign up form    
    <div className="flex justify-center items-center min-h-screen bg-gray-300">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Join FeedBackify
                </h1>
                <p className="mb-4">Sign Up to start your anonymous feedback journey</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input placeholder="username" 
                            {...field} 
                            onChange={(e) => { 
                                field.onChange(e)
                                debounced(e.target.value)
                            }}
                            />
                        </FormControl>
                        { isCheckingUsername && <Loader2 className="animate-spin"/>}
                        <p className={`text-sm ${ usernameMessage === "Username is unique" ? 'text-green-600' : 'text-red-500'}`}>
                            test {usernameMessage}
                        </p>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="email" 
                            {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="password" 
                            {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                   {
                    isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 animate-spin"/> plese Wait..
                        </>
                    ) : ('Sign Up')
                   }
                </Button>
                </form>
            </Form>
            <div className="text-center mt-4">
                <p>
                    Already have an Account?{' '}
                    <Link href='/sign-in' className="text-blue-700 hover:text-blue-900">
                     Sign In
                    </Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default page