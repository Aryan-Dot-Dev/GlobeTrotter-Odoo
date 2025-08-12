import axios from '../lib/axios'

const logout = async () => {
    try {
        const response = await axios.post("/api/auth/logout")
        if (response.status === 204) {
            console.log("Logout successful")
            return true
        }
    } catch (error) {
        console.error("Error logging out:", error)
        throw error
    }
}

export { logout }