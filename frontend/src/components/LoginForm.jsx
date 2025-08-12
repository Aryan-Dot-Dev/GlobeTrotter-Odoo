import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { login } from "@/api"
import { Star, Quote } from "lucide-react"

export function LoginForm({ className, ...props }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleLogin = useCallback(async (e) => {
        e.preventDefault()
        if (submitting) return
        setSubmitting(true)
        try {
            const response = await login(email, password)
            if (response?.success || response?.message) {
                navigate("/dashboard")
            }
        } catch (err) {
            console.log("login error: ", err)
        } finally {
            setSubmitting(false)
        }
    }, [email, password, submitting, navigate])

    return (
        <div
            className={cn(
                "min-h-screen w-full bg-transparent flex items-stretch justify-center",
                className
            )}
            {...props}
        >
            <div className="flex-1">
                <Card
                    className={cn(
                        "h-full min-h-[calc(100svh-3rem)] overflow-hidden border-0 shadow-none",
                        "md:min-h-[calc(100svh-5rem)]",
                        "rounded-none md:rounded-xl",
                        "p-0"
                    )}
                >
                    <CardContent className="grid h-full p-0 md:grid-cols-2 bg-gradient-to-r from-pink-100 via-slate-100 to-orange-100">
                        {/* Right panel: Testimonial */}
                        <div className="bg-[#414A4C] relative hidden md:flex flex-col justify-center p-10 m-8 rounded-4xl overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
                                <div className="absolute bottom-20 right-10 w-24 h-24 border border-white/20 rounded-full"></div>
                                <div className="absolute top-1/2 right-20 w-16 h-16 border border-white/20 rounded-full"></div>
                            </div>
                            
                            {/* Quote Icon */}
                            <div className="mb-6">
                                <Quote className="w-12 h-12 text-orange-400" />
                            </div>
                            
                            {/* Testimonial Content */}
                            <div className="relative z-10">
                                <p className="text-white text-xl font-medium leading-relaxed mb-8">
                                    "GlobeTrotter made planning my dream trip to Kerala so effortless! The AI suggestions were spot-on, and I discovered hidden gems I never would have found on my own."
                                </p>
                                
                                {/* Rating Stars */}
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                
                                {/* User Info */}
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg mr-4">
                                        P
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Priya Sharma</p>
                                        <p className="text-gray-300 text-sm">Travel Enthusiast, Mumbai</p>
                                    </div>
                                </div>
                                
                                {/* Trip Stats */}
                                <div className="mt-8 pt-6 border-t border-white/20">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-orange-400">15</p>
                                            <p className="text-gray-300 text-xs">Cities Explored</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-pink-400">8</p>
                                            <p className="text-gray-300 text-xs">Trips Planned</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-yellow-400">₹45K</p>
                                            <p className="text-gray-300 text-xs">Money Saved</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Left panel: Login form */}
                        <div className="flex items-center justify-center p-6 md:p-8 min-h-screen">
                            <form
                                onSubmit={handleLogin}
                                className="mx-auto flex w-full max-w-md flex-col gap-6 bg-transparent"
                                noValidate
                            >
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Welcome back</h1>
                                    <p className="text-muted-foreground text-balance">
                                        Log in to your GlobeTrotter account
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="focus-visible:ring-1 focus-visible:ring-pink-300 placeholder:text-gray-500"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password..."
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="focus-visible:ring-1 focus-visible:ring-pink-300 placeholder:text-gray-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? "Logging in..." : "Log in"}
                                </Button>

                                <div className="text-center text-sm">
                                    Don't have an account?{" "}
                                    <a href="/signup" className="underline underline-offset-4">
                                        Sign up
                                    </a>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
