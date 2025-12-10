'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as  z  from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInSchema } from "@/Schemas/signInSchema"
import { signIn } from "next-auth/react"

const logInPage = () => {

    const router = useRouter()

    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const result  = await signIn('credentials', { // fetch from next-auth
         redirect: false,
         identifier: data.identifier,
         password: data.password
       })

       if (result?.error) {
          toast.error('Incorrect username or password')
        }

       if (result?.url) {
          router.replace('/dashboard')
        }
    }

  return ( // basic sign up form    
    <div className="flex justify-center items-center min-h-screen bg-gray-300">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Join FeedBackify
                </h1>
                <p className="mb-4">Sign In to start your anonymous feedback journey</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    name="identifier"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email/Username</FormLabel>
                        <FormControl>
                            <Input placeholder="Email/Username" 
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Password" 
                            {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit">
                   sign In
                </Button>
                </form>
            </Form>
        </div>
    </div>
  )
}

export default logInPage