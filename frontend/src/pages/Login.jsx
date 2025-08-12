import React from 'react'
import {LoginForm} from '@/components/LoginForm'

const Login = () => {
    return (
        <div className="bg-gradient-to-r from-pink-100 via-white to-orange-100 flex min-h-screen flex-col items-center justify-center">
            <LoginForm />
        </div>
    )
}

export default Login;