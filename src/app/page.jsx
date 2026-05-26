import React from "react";
import HeroSection from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return(
    <div className="mt-40">
      <HeroSection/>

      {/* Stats Section */}
      <section className="py-20 bg-linear-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2 transition-all duration-300 group-hover:text-purple-600">
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-widest font-semibold text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Features Section */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-gray-100 hover:border-blue-200"
              >
                <CardContent className="space-y-4 pt-4">
                  <div className="text-blue-600 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#eff6ff_0%,transparent_50%)]" />

        <div className="container mx-auto px-4 relative">
          <h2 className="text-4xl font-bold text-center mb-20">Master Your Money in 3 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full border-t-2 border-dashed border-blue-200" />
                )}
                <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-200 -rotate-3 hover:rotate-0 transition-transform duration-300">

                  <div className="text-white">
                    {React.cloneElement(step.icon, { className: "h-10 w-10", text: "white" })}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="container mx-auto px-4">
                <div className="bg-linear-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden group">

                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
                  
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Ready to <span className="opacity-80">Take Control?</span>
                    </h2>
                    <p className="text-blue-100 mb-10 max-w-xl mx-auto text-lg">
                      Join thousands who have optimized their spending and saved an average of 
                      <span className="text-white font-semibold"> $350/month</span>.
                    </p>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-12 py-7 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
                        Get Started Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

    </div>
  ) 
}
