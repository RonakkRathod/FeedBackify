"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import messages from '@/messages.json'
import Autoplay from "embla-carousel-autoplay"


const Home = () => {
  return (
    <>
    <main className='grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-
    '>
      <section className='text-center mb-8 md:mb-12'>
        <h1 className='text-3xl md:text-5xl font-bold'>Welcome to Feedbackify</h1>
        <p className='mt-3 md:mt-4 text-base md:text-lg'>Your go-to platform for anonymous feedback</p>
      </section>
       <Carousel plugins={[Autoplay({delay: 3000})]} className="w-full max-w-xs">
        <CarouselContent>
          {
            messages.map((message, index) => (
               <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardHeader>
                    {
                      message.title
                    }
                  </CardHeader>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold">{message.content}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
            ))
          }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
    </main>
    <footer className="text-center p-4 md:p-6 ">
       © 2025 Feedbackify. All rights reserved.
    </footer>
    </>
  )
}

export default Home



