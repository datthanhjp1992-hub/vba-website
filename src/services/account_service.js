//[file name]: account_service.js

/**
 * Service để xử lý các API liên quan đến tài khoản
 */

const API_BASE_URL = 'http://localhost:5000'; // Thay đổi theo URL server của bạn

class AccountService {
    /**
     * Đăng nhập tài khoản
     * @param {string} account - Tên đăng nhập
     * @param {string} password - Mật khẩu
     * @returns {Promise} Promise với kết quả đăng nhập
     */
    static async login(account, password) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/account/login?account=${encodeURIComponent(account)}&password=${encodeURIComponent(password)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Đăng nhập thất bại');
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Đăng ký tài khoản mới
     * @param {Object} userData - Dữ liệu đăng ký
     * @returns {Promise} Promise với kết quả đăng ký
     */
    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/account/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Đăng ký thất bại');
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin tài khoản
     * @param {number} index - ID tài khoản
     * @returns {Promise} Promise với thông tin tài khoản
     */
    static async getAccountDetail(index) {
        try {
            const response = await fetch(`${API_BASE_URL}/account/${index}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể lấy thông tin tài khoản');
            }

            return {
                success: data.success,
                data: data.data
            };
        } catch (error) {
            console.error('Get account detail error:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách tất cả tài khoản
     * @returns {Promise} Promise với danh sách tài khoản
     */
    static async getAllAccounts() {
        try {
            const response = await fetch(`${API_BASE_URL}/account/list`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể lấy danh sách tài khoản');
            }

            return {
                success: data.success,
                data: data.data,
                count: data.count
            };
        } catch (error) {
            console.error('Get all accounts error:', error);
            throw error;
        }
    }

    /**
     * Tạo bảng tài khoản (admin)
     * @returns {Promise} Promise với kết quả tạo bảng
     */
    static async createAccountTable() {
        try {
            const response = await fetch(`${API_BASE_URL}/db/createAccountTable`, {
                method: 'GET'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Không thể tạo bảng tài khoản');
            }

            return data;
        } catch (error) {
            console.error('Create table error:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra token/trạng thái đăng nhập
     * @returns {Promise} Promise với trạng thái đăng nhập
     */
    static async checkAuthStatus() {
        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user_data');
            
            if (!token || !userData) {
                return {
                    isAuthenticated: false,
                    user: null
                };
            }

            // Kiểm tra token bằng cách lấy thông tin user
            const user = JSON.parse(userData);
            const result = await this.getAccountDetail(user.index);
            
            if (result.success) {
                return {
                    isAuthenticated: true,
                    user: result.data
                };
            } else {
                // Xóa thông tin đăng nhập nếu không hợp lệ
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                return {
                    isAuthenticated: false,
                    user: null
                };
            }
        } catch (error) {
            console.error('Check auth status error:', error);
            return {
                isAuthenticated: false,
                user: null
            };
        }
    }

    /**
     * Lưu thông tin đăng nhập vào localStorage
     * @param {Object} userData - Thông tin user
     */
    static saveLoginData(userData) {
        try {
            // Tạo token giả (có thể thay bằng JWT thực từ server)
            const token = btoa(JSON.stringify(userData) + Date.now());
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            localStorage.setItem('last_login', new Date().toISOString());
        } catch (error) {
            console.error('Save login data error:', error);
        }
    }

    /**
     * Xóa thông tin đăng nhập
     */
    static clearLoginData() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('last_login');
    }

    /**
     * Lấy thông tin user từ localStorage
     * @returns {Object|null} Thông tin user hoặc null
     */
    static getCurrentUser() {
        try {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }
}

export default AccountService;