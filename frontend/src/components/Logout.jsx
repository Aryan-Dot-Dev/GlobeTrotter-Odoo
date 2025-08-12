import React from 'react'
import { Button } from './ui/button'
import { logout } from '@/api'

const Logout = () => {

    const handleLogout = async () => {
        try {
            const success = await logout()
            if (success) {
                window.location.href = '/login'
            }
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-medium">
            Logout
        </Button>
    )
}

export default Logout