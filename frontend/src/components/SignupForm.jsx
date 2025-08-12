import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup } from "@/api"
import { useNavigate } from "react-router-dom"
import { Upload, X } from "lucide-react"

export function SignupForm({ className, ...props }) {
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [location, setLocation] = useState("")
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            setAvatarFile(file);
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }
    };

    const handleSignup = useCallback(async (e) => {
        e.preventDefault()
        if (submitting) return
        setSubmitting(true)
        try {
            const response = await signup(name, email, password, location, avatarFile, username)
            if (response?.alreadyLoggedIn || response?.message) {
                navigate("/dashboard")
            }
        } catch (err) {
            console.log("signup error: ", err)
        } finally {
            setSubmitting(false)
        }
    }, [name, email, password, location, avatarFile, username, submitting, navigate])

    return (
        <div
            className={cn(
                // Full-viewport canvas
                "min-h-screen w-full bg-transparent",
                // Center content with padding
                "flex items-stretch justify-center",
                className
            )}
            {...props}
        >
            {/* Max container width for readability on huge screens */}
            <div className="flex-1">
                <Card
                    // Full height card that behaves like a split-screen on md+
                    // Remove border/shadow on large screens for a full-bleed feel
                    className={cn(
                        "h-full min-h-[calc(100svh-3rem)] overflow-hidden border-0 shadow-none",
                        "md:min-h-[calc(100svh-5rem)]",
                        "rounded-none md:rounded-xl",
                        "p-0"
                    )}
                >
                    <CardContent className="grid h-full p-0 md:grid-cols-2 bg-gradient-to-r from-pink-100 via-slate-100 to-orange-100 ">
                        {/* Left panel: Form (stacked on mobile) */}
                        <div className="flex items-center justify-center p-6 md:p-8 min-h-screen ">
                            <form
                                onSubmit={handleSignup}
                                className={cn(
                                    // Constrain form width for readability
                                    "mx-auto flex w-full max-w-md flex-col gap-6 bg-transparent"
                                )}
                                noValidate
                            >
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Create your account</h1>
                                    <p className="text-muted-foreground text-balance">
                                        Sign up for your GlobeTrotter account
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your name..."
                                        required
                                        autoComplete="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={"focus-visible:ring-1 placeholder:text-gray-500"}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your unique username..."
                                        required
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={"focus-visible:ring-1 placeholder:text-gray-500"}
                                    />
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
                                        className={"focus-visible:ring-1 placeholder:text-gray-500"}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password..."
                                        required
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={"focus-visible:ring-1 placeholder:text-gray-500"}

                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="City, Country"
                                        required
                                        autoComplete="address-level2"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className={"focus-visible:ring-1 placeholder:text-gray-500"}

                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? "Signing up..." : "Sign up"}
                                </Button>

                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <a href="/login" className="underline underline-offset-4">
                                        Log in
                                    </a>
                                </div>

                                <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                                    By clicking continue, you agree to our{" "}
                                    <a href="#">Terms of Service</a> and{" "}
                                    <a href="#">Privacy Policy</a>.
                                </div>
                            </form>
                        </div>

                        {/* Right panel: Avatar upload area */}
                        <div className="bg-gradient-to-r from-zinc-600 to-gray-700 relative hidden md:flex flex-col justify-between p-10 m-4 rounded-4xl">
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <h3 className="text-white text-lg font-semibold mb-4">Profile Picture</h3>
                                    
                                    {avatarPreview ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeAvatar}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-white/60" />
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
                                        <Label htmlFor="avatar" className="text-white cursor-pointer mx-20">
                                            <div className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg border border-white/20">
                                                {avatarFile ? 'Change Photo' : 'Upload Photo'}
                                            </div>
                                        </Label>
                                        <Input
                                            id="avatar"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <p className="text-white/70 text-sm">
                                            Upload a profile picture (optional).<br />
                                            Max size: 5MB. Formats: JPG, PNG, WebP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
