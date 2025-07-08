// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("userToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await fetch(
        `https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login?username=${username}&password=${password}`
      );
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "Sai tên đăng nhập hoặc mật khẩu",
        };
      }

      return {
        success: true,
        data: data[0], // Lấy user đầu tiên khớp
      };
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      };
    }
  }


  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async register(userData: {
    name: string
    username: string
    password: string
    phone: string
    email: string
  }) {
    try {
      const res = await fetch("https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          token: Math.random().toString(36).substring(2),
          avatar: `https://i.pravatar.cc/150?u=${userData.username}`,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || "Đăng ký thất bại" }
      }

      return { success: true, data }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      }
    }
  }


  // User APIs
  async getProfile() {
    return this.request<any>("/user/profile")
  }

  async updateProfile(profileData: any) {
    return this.request<any>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append("avatar", file)

    return this.request<{ avatarUrl: string }>("/user/avatar", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    })
  }

  // Messages APIs
  async getMessages(chatId: string, page = 1, limit = 50) {
    return this.request<{
      messages: any[]
      hasMore: boolean
      total: number
    }>(`/messages/${chatId}?page=${page}&limit=${limit}`)
  }

  async sendMessage(
    chatId: string,
    messageData: {
      content: string
      type: "text" | "image" | "file" | "audio" | "video"
      fileUrl?: string
      fileName?: string
      fileSize?: number
    },
  ) {
    return this.request<any>("/messages", {
      method: "POST",
      body: JSON.stringify({ chatId, ...messageData }),
    })
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/${messageId}`, {
      method: "DELETE",
    })
  }

  async markAsRead(chatId: string) {
    return this.request(`/messages/${chatId}/read`, {
      method: "PUT",
    })
  }

  // Contacts APIs
  async getContacts() {
    return this.request<any[]>("/contacts")
  }

  async addContact(email: string) {
    return this.request<any>("/contacts", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async removeContact(contactId: string) {
    return this.request(`/contacts/${contactId}`, {
      method: "DELETE",
    })
  }

  async searchUsers(query: string) {
    return this.request<any[]>(`/users/search?q=${encodeURIComponent(query)}`)
  }

  // Chats APIs
  async getChats() {
    return this.request<any[]>("/chats")
  }

  async createChat(participantIds: string[], type: "direct" | "group" = "direct") {
    return this.request<any>("/chats", {
      method: "POST",
      body: JSON.stringify({ participantIds, type }),
    })
  }

  async getChatInfo(chatId: string) {
    return this.request<any>(`/chats/${chatId}`)
  }

  // File upload APIs
  async uploadFile(file: File, type: "image" | "document" | "audio" | "video") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    return this.request<{
      fileUrl: string
      fileName: string
      fileSize: number
      fileType: string
    }>("/upload", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    })
  }

  // Bookmarks APIs
  async getBookmarks() {
    return this.request<any[]>("/bookmarks")
  }

  async addBookmark(messageId: string) {
    return this.request<any>("/bookmarks", {
      method: "POST",
      body: JSON.stringify({ messageId }),
    })
  }

  async removeBookmark(bookmarkId: string) {
    return this.request(`/bookmarks/${bookmarkId}`, {
      method: "DELETE",
    })
  }

  // Video call APIs
  async initiateCall(chatId: string, type: "audio" | "video") {
    return this.request<{
      callId: string
      roomId: string
      token: string
    }>("/calls/initiate", {
      method: "POST",
      body: JSON.stringify({ chatId, type }),
    })
  }

  async joinCall(callId: string) {
    return this.request<{
      roomId: string
      token: string
    }>(`/calls/${callId}/join`, {
      method: "POST",
    })
  }

  async endCall(callId: string) {
    return this.request(`/calls/${callId}/end`, {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
