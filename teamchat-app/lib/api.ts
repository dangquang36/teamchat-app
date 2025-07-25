// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
import { Socket } from 'socket.io-client';

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  async getUserById(userId: string) {
    try {
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login/${userId}`);
      if (!res.ok) {
        // Nếu không tìm thấy user, trả về null thay vì báo lỗi
        if (res.status === 404) return { success: true, data: null };
        throw new Error("Không thể lấy thông tin người dùng.");
      }
      const user = await res.json();
      return { success: true, data: user };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      };
    }
  }

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
  async getContacts(currentUserId: string) {
    try {
      // Lấy tất cả các lời mời đã được chấp nhận liên quan đến người dùng hiện tại
      const resRequests = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/friend_requests?status=accepted`);
      if (!resRequests.ok) throw new Error('Không thể lấy danh sách bạn bè.');

      const allAcceptedRequests: any[] = await resRequests.json();

      // Lọc ra những request mà mình là người gửi hoặc người nhận
      const myFriendships = allAcceptedRequests.filter(
        req => req.requesterId === currentUserId || req.recipientId === currentUserId
      );

      // Lấy ID của tất cả bạn bè
      const friendIds = myFriendships.map(req =>
        req.requesterId === currentUserId ? req.recipientId : req.requesterId
      );

      if (friendIds.length === 0) {
        return { success: true, data: [] };
      }

      // Lấy thông tin chi tiết của tất cả bạn bè trong một lần gọi API
      const resUsers = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login`);
      if (!resUsers.ok) throw new Error('Không thể lấy thông tin chi tiết bạn bè.');
      const allUsers: any[] = await resUsers.json();

      const friendsDetails = allUsers.filter(user => friendIds.includes(user.id));

      // Thêm trường message mặc định để khớp với kiểu DirectMessage
      const contacts = friendsDetails.map(friend => ({
        ...friend,
        message: "Các bạn đã là bạn bè", // hoặc tin nhắn cuối cùng nếu có
      }));

      return { success: true, data: contacts };

    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" };
    }
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

  async searchUsers(query: string, currentUserId: string) {
    try {
      // API của MockAPI cho phép tìm kiếm qua query param `search`
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Không thể tìm kiếm người dùng.");

      let users = await res.json();
      // Lọc ra người dùng hiện tại, không cho tự tìm mình
      users = users.filter((user: { id: string }) => user.id !== currentUserId);

      return { success: true, data: users };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      };
    }
  }


  async sendFriendRequest(
    socket: Socket | null,
    requesterId: string,
    recipientId: string,
    requesterInfo: { requesterName: string; requesterAvatar: string }
  ) {
    if (!socket) return { success: false, error: "Socket chưa kết nối." };

    try {
      // Bước 1: Gửi request lên MockAPI để lưu trữ lời mời (giữ nguyên)
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/friend_requests`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId,
          recipientId,
          status: "pending",
          requesterName: requesterInfo.requesterName,
          requesterAvatar: requesterInfo.requesterAvatar,
        }),
      });

      if (!res.ok) throw new Error('Gửi lời mời thất bại');

      const newRequestData = await res.json();

      // BƯỚC 2: THÊM DÒNG EMIT CÒN THIẾU
      // Gửi thông báo real-time cho người nhận (User B)
      socket.emit('sendFriendRequest', {
        recipientId: recipientId, // Gửi đến người nhận
        payload: { // Gửi thông tin của người gửi
          id: newRequestData.id,
          requesterId: requesterId,
          requesterName: requesterInfo.requesterName,
          requesterAvatar: requesterInfo.requesterAvatar,
          status: 'pending',
        }
      });

      return { success: true, data: newRequestData };

    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" };
    }
  }

  // 3. Hàm lấy danh sách lời mời đã nhận
  async getFriendRequests(userId: string) {
    try {
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/friend_requests?recipientId=${userId}&status=pending`);
      if (!res.ok) throw new Error('Không thể lấy danh sách lời mời');
      return { success: true, data: await res.json() };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" };
    }
  }

  async getSentFriendRequests(userId: string) {
    try {
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/friend_requests?requesterId=${userId}`);
      if (!res.ok) throw new Error('Không thể lấy danh sách lời mời đã gửi');
      return { success: true, data: await res.json() };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" };
    }
  }

  // 4. Hàm chấp nhận hoặc từ chối lời mời
  async updateFriendRequestStatus(requestId: string, status: 'accepted' | 'declined') {
    try {
      const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/friend_requests/${requestId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
      return { success: true, data: await res.json() };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Lỗi không xác định" };
    }
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