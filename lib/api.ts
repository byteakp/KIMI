interface ApiResponse {
  token?: string
  username?: string
  message?: string
  error?: string
  [key: string]: any
}

const API_BASE_URL = "https://kimi-r36z.onrender.com"

// Centralized unauthorized handling
const handleUnauthorized = () => {
  localStorage.removeItem("jwt_token")
  localStorage.removeItem("username")
  // Using a simple alert for immediate user feedback as per suggestion
  alert("Your session has expired. Please log in again.")
  window.location.href = "/" // Redirect to home/login page
}

export const api = {
  async post<T = ApiResponse>(path: string, data: any, token?: string): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      handleUnauthorized()
      throw new Error("Unauthorized: Session expired.") // Stop further execution
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  },

  async get<T = ApiResponse>(path: string, token?: string): Promise<T> {
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers,
    })

    if (response.status === 401) {
      handleUnauthorized()
      throw new Error("Unauthorized: Session expired.")
    }

    if (!response.ok) {
      let errorData: ApiResponse = {}
      try {
        errorData = await response.json()
      } catch (e) {
        // If response is not JSON, or parsing fails, provide a more descriptive error
        throw new Error(
          `API Error: ${response.status} ${response.statusText || "Unknown Status"}. Response was not valid JSON or empty.`,
        )
      }
      throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  },

  async delete<T = ApiResponse>(path: string, token?: string): Promise<T> {
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers,
    })

    if (response.status === 401) {
      handleUnauthorized()
      throw new Error("Unauthorized: Session expired.")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  },
}
