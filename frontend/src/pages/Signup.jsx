import React from 'react'
import { SignupForm } from '@/components/SignupForm'

const Signup = () => {
    return (
        <div className="bg-gradient-to-r from-pink-100 via-white to-orange-100 flex min-h-screen flex-col items-center justify-center">
            <SignupForm />
        </div>
    )
}

export default Signup;