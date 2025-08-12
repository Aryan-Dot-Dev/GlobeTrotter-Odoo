import axios from "../lib/axios"

const login = async (email, password) => {
    try {
        const response = await axios.post("/api/auth/login", {
            email,
            password
        })
        if (response.data.message) {
            console.log("Login successful:", response.data.user)
            return response.data
        }
    } catch (error) {
        console.error("Error logging in:", error)
        throw error
    }
}

export { login }