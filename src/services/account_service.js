//[file name]: account_service.js

/**
 * Service để xử lý các API liên quan đến tài khoản
 */

import { 
    SERVER_CONFIG,
    API_ENDPOINTS,
    STORAGE_KEYS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    getApiUrl,
    getErrorMessage,
    validateAccount,
    validatePassword,
    validateEmail,
    isAdmin,
    isModerator
} from './constants';

class AccountService {
    /**
     * Đăng nhập tài khoản
     * @param {string} account - Tên đăng nhập
     * @param {string} password - Mật khẩu
     * @returns {Promise} Promise với kết quả đăng nhập
     */
    static async login(account, password) {
        try {
            // Validate input
            const accountValidation = validateAccount(account);
            if (!accountValidation.valid) {
                throw new Error(accountValidation.message);
            }

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message);
            }

            const url = getApiUrl(
                API_ENDPOINTS.ACCOUNT.LOGIN
            ) + `?account=${encodeURIComponent(account)}&password=${encodeURIComponent(password)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.LOGIN_FAILED);
            }

            // Lưu thông tin đăng nhập
            if (data.success && data.data) {
                this.saveLoginData(data.data);
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || SUCCESS_MESSAGES.LOGIN_SUCCESS
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
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
            // Validate required data
            const requiredFields = ['account', 'password', 'username', 'email'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    throw new Error(`Thiếu trường bắt buộc: ${field}`);
                }
            }

            // Validate account và password
            const accountValidation = validateAccount(userData.account);
            if (!accountValidation.valid) {
                throw new Error(accountValidation.message);
            }

            const passwordValidation = validatePassword(userData.password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message);
            }

            const emailValidation = validateEmail(userData.email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.message);
            }

            const url = getApiUrl(API_ENDPOINTS.ACCOUNT.REGISTER);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.VALIDATION_ERROR);
            }

            return {
                success: data.success,
                data: data.data,
                message: data.message || SUCCESS_MESSAGES.REGISTER_SUCCESS,
                emailSent: data.email_sent || false,
                emailMessage: data.email_message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết tài khoản
     * @param {number} index - ID tài khoản
     * @returns {Promise} Promise với thông tin tài khoản
     */
    static async getAccountDetail(index) {
        try {
            const url = getApiUrl(`${API_ENDPOINTS.ACCOUNT.DETAIL}/${index}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || getErrorMessage(response.status));
            }

            return {
                success: data.success,
                data: data.data || data
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Get account detail error:', error);
            throw error;
        }
    }

    /**
     * Cập nhật thông tin tài khoản
     * @param {number} index - ID tài khoản
     * @param {Object} userData - Dữ liệu cần cập nhật
     * @returns {Promise} Promise với kết quả cập nhật
     */
    static async updateAccount(index, userData) {
        try {
            const url = getApiUrl(`${API_ENDPOINTS.ACCOUNT.DETAIL}/${index}`);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.UPDATE_ERROR);
            }

            // Cập nhật localStorage nếu là user hiện tại
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.index === index) {
                const updatedUser = { ...currentUser, ...userData };
                this.saveLoginData(updatedUser);
            }

            return {
                success: data.success,
                data: data.data || data,
                message: data.message || SUCCESS_MESSAGES.UPDATE_SUCCESS
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Update account error:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách tất cả tài khoản
     * @returns {Promise} Promise với danh sách tài khoản
     */
    static async getAllAccounts() {
        try {
            const url = getApiUrl(API_ENDPOINTS.ACCOUNT.LIST);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || getErrorMessage(response.status));
            }

            return {
                success: data.success,
                data: data.data,
                count: data.count
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
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
            const url = getApiUrl(API_ENDPOINTS.DATABASE.CREATE_ACCOUNT_TABLE);

            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Không thể tạo bảng tài khoản');
            }

            return data;
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
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
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            
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
                // Cập nhật thông tin user mới nhất
                this.saveLoginData(result.data);
                return {
                    isAuthenticated: true,
                    user: result.data
                };
            } else {
                // Xóa thông tin đăng nhập nếu không hợp lệ
                this.clearLoginData();
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
            
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
        } catch (error) {
            console.error('Save login data error:', error);
        }
    }

    /**
     * Xóa thông tin đăng nhập
     */
    static clearLoginData() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    }

    /**
     * Lấy thông tin user từ localStorage
     * @returns {Object|null} Thông tin user hoặc null
     */
    static getCurrentUser() {
        try {
            const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Cập nhật thông tin user trong localStorage
     * @param {Object} updatedData - Dữ liệu cập nhật
     */
    static updateCurrentUser(updatedData) {
        try {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...updatedData };
                this.saveLoginData(updatedUser);
                return updatedUser;
            }
            return null;
        } catch (error) {
            console.error('Update current user error:', error);
            return null;
        }
    }

    /**
     * Kiểm tra quyền của user hiện tại
     * @param {number} requiredAuthority - Authority tối thiểu cần có
     * @returns {boolean}
     */
    static checkPermission(requiredAuthority) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return user.authorities >= requiredAuthority;
    }

    /**
     * Kiểm tra xem user có phải admin không
     * @returns {boolean}
     */
    static isAdmin() {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return isAdmin(user.authorities);
    }

    /**
     * Kiểm tra xem user có phải moderator không
     * @returns {boolean}
     */
    static isModerator() {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return isModerator(user.authorities);
    }

    /**
     * Kiểm tra account đã tồn tại chưa
     * @param {string} account - Tên đăng nhập cần kiểm tra
     * @returns {Promise} Promise với kết quả kiểm tra
     */
    static async checkAccount(account) {
        try {
            // Validate input
            const accountValidation = validateAccount(account);
            if (!accountValidation.valid) {
                return {
                    success: false,
                    exists: true,
                    message: accountValidation.message
                };
            }

            const url = getApiUrl(
                API_ENDPOINTS.ACCOUNT.CHECK
            ) + `?account=${encodeURIComponent(account)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi kiểm tra account');
            }

            return {
                success: data.success,
                exists: data.exists || false,
                message: data.message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Check account error:', error);
            throw error;
        }
    }

    /**
     * Kiểm tra email đã tồn tại chưa (cho update)
     * @param {string} email - Email cần kiểm tra
     * @param {number} excludeAccountId - ID tài khoản cần loại trừ (nếu đang update)
     * @returns {Promise} Promise với kết quả kiểm tra
     */
    static async validateEmail(email, excludeAccountId = null) {
        try {
            // Validate email format
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return {
                    success: false,
                    valid: false,
                    exists: false,
                    message: emailValidation.message
                };
            }

            let url = getApiUrl(
                API_ENDPOINTS.ACCOUNT.VALIDATE_EMAIL
            ) + `?email=${encodeURIComponent(email)}`;
            
            if (excludeAccountId) {
                url += `&exclude_account_id=${excludeAccountId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi kiểm tra email');
            }

            return {
                success: data.success,
                valid: data.valid || false,
                exists: data.exists || false,
                message: data.message || ''
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Validate email error:', error);
            throw error;
        }
    }

    /**
     * Xóa tài khoản
     * @param {number} index - ID tài khoản cần xóa
     * @returns {Promise} Promise với kết quả xóa
     */
    static async deleteAccount(index) {
        try {
            const url = getApiUrl(`${API_ENDPOINTS.ACCOUNT.DELETE}/${index}`);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể xóa tài khoản');
            }

            // Xóa thông tin đăng nhập nếu xóa chính mình
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.index === index) {
                this.clearLoginData();
            }

            return {
                success: data.success,
                message: data.message || 'Đã xóa tài khoản thành công'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Delete account error:', error);
            throw error;
        }
    }

    /**
     * Test gửi email (debug)
     * @param {Object} emailData - Dữ liệu email test
     * @returns {Promise} Promise với kết quả gửi email
     */
    static async testEmail(emailData) {
        try {
            const url = getApiUrl(API_ENDPOINTS.ACCOUNT.TEST_EMAIL);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailData),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể gửi email test');
            }

            return {
                success: data.success,
                message: data.message || 'Email test đã được gửi'
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                throw new Error('Request timeout. Vui lòng thử lại sau.');
            }
            console.error('Test email error:', error);
            throw error;
        }
    }

    /**
     * Đăng xuất
     */
    static logout() {
        this.clearLoginData();
    }

    /**
     * Kiểm tra xem có đang đăng nhập không
     * @returns {boolean}
     */
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /**
     * Lấy token từ localStorage
     * @returns {string|null}
     */
    static getToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Lấy thông tin user hiện tại (alias của getCurrentUser)
     * @returns {Object|null}
     */
    static getUser() {
        return this.getCurrentUser();
    }

    /**
     * Lấy userId hiện tại
     * @returns {number|null}
     */
    static getUserId() {
        const user = this.getCurrentUser();
        return user ? user.index : null;
    }
}

export default AccountService;