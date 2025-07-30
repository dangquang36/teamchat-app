export interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
}

export interface UserServiceResponse {
    success: boolean;
    error?: string;
    data?: any;
}

export class UserService {
    private static MOCKAPI_BASE_URL = 'https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake';

    /**
     * Lấy tất cả users từ MockAPI
     */
    static async getAllUsers(): Promise<UserServiceResponse> {
        try {
            console.log('Fetching all users from MockAPI...');

            const response = await fetch(`${this.MOCKAPI_BASE_URL}/login`);

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
            }

            const users = await response.json();
            console.log('All users from MockAPI:', users);

            return {
                success: true,
                data: users
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Tìm kiếm users theo tên
     */
    static async searchUsers(query: string, excludeUserId?: string): Promise<UserServiceResponse> {
        try {
            console.log('Searching users with query:', query, 'excluding user:', excludeUserId);

            const allUsersResponse = await this.getAllUsers();

            if (!allUsersResponse.success) {
                return allUsersResponse;
            }

            const allUsers = allUsersResponse.data as User[];

            // Filter users by name and exclude current user
            const filteredUsers = allUsers.filter(user => {
                const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase());
                const notExcluded = !excludeUserId || user.id !== excludeUserId;
                return matchesQuery && notExcluded;
            });

            console.log('Filtered users:', filteredUsers);

            return {
                success: true,
                data: filteredUsers
            };
        } catch (error) {
            console.error('Error searching users:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Lấy thông tin user theo ID
     */
    static async getUserById(userId: string): Promise<UserServiceResponse> {
        try {
            console.log('Fetching user by ID:', userId);

            const allUsersResponse = await this.getAllUsers();

            if (!allUsersResponse.success) {
                return allUsersResponse;
            }

            const allUsers = allUsersResponse.data as User[];
            const user = allUsers.find(u => u.id === userId);

            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Test kết nối MockAPI
     */
    static async testConnection(): Promise<UserServiceResponse> {
        try {
            console.log('Testing MockAPI connection...');

            const response = await fetch(`${this.MOCKAPI_BASE_URL}/login`);

            console.log('MockAPI test response status:', response.status);

            if (!response.ok) {
                throw new Error(`MockAPI test failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('MockAPI test data:', data);

            return {
                success: true,
                data: {
                    status: response.status,
                    data: data
                }
            };
        } catch (error) {
            console.error('MockAPI connection test failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
} 