//[file name]: constants.js
//[file content begin]
/**
 * File chứa tất cả các constant dùng trong ứng dụng
 * Cập nhật tại đây sẽ áp dụng cho toàn bộ ứng dụng
 */

// Server configuration
export const SERVER_CONFIG = {
    BASE_URL: 'https://my-python-app-pm7j.onrender.com/',
    API_VERSION: 'v1',
    TIMEOUT: 30000, // 30 seconds
};

// API endpoints
export const API_ENDPOINTS = {
    // Account endpoints
    ACCOUNT: {
        LOGIN: '/account/login',
        REGISTER: '/account/register',
        CHECK: '/account/check',  // Thêm dòng này
        LIST: '/account/list',
        DETAIL: '/account',
        UPDATE: '/account',
        DELETE: '/account',
    },
    
    // Database endpoints
    DATABASE: {
        CREATE_ACCOUNT_TABLE: '/db/createAccountTable',
    },

    // Other endpoints có thể thêm sau
    USER: {
        PROFILE: '/user/profile',
        SETTINGS: '/user/settings',
    }
};

// Application settings
export const APP_CONFIG = {
    NAME: 'My Application',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
};

// Storage keys (dùng cho localStorage, sessionStorage)
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    LAST_LOGIN: 'last_login',
    THEME: 'app_theme',
    LANGUAGE: 'app_language',
};

// User roles/authorities
export const AUTHORITIES = {
    USER: 0,
    ADMIN: 1,
    MODERATOR: 2,
    SUPER_ADMIN: 9,
};

// Authority names for display
export const AUTHORITY_NAMES = {
    0: 'User',
    1: 'Admin',
    2: 'Moderator',
    9: 'Super Admin',
};

// Authority colors for UI
export const AUTHORITY_COLORS = {
    0: '#3498db', // User - Blue
    1: '#e74c3c', // Admin - Red
    2: '#f39c12', // Moderator - Orange
    9: '#9b59b6', // Super Admin - Purple
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
    NOT_FOUND: 'Không tìm thấy dữ liệu.',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    EMAIL_REQUIRED: 'Email không được để trống',
    EMAIL_INVALID: 'Email không đúng định dạng',
};

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Đăng nhập thành công!',
    LOGOUT_SUCCESS: 'Đã đăng xuất thành công.',
    REGISTER_SUCCESS: 'Đăng ký thành công!',
    UPDATE_SUCCESS: 'Cập nhật thành công.',
    DELETE_SUCCESS: 'Xóa thành công.',
};

// Validation rules
export const VALIDATION_RULES = {
    ACCOUNT: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[a-zA-Z0-9_]+$/, // Chỉ cho phép chữ, số và gạch dưới
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 40,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // Ít nhất 1 chữ thường, 1 chữ hoa, 1 số
    },
    USERNAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 40,
    },
};

// Date/time formats
export const DATE_FORMATS = {
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
    DISPLAY_TIME: 'HH:mm',
    API_DATE: 'YYYY-MM-DD',
    API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [5, 10, 20, 50],
};

// UI constants
export const UI_CONSTANTS = {
    DEBOUNCE_DELAY: 300, // ms
    TOAST_DURATION: 3000, // ms
    MODAL_ANIMATION_DURATION: 300, // ms
    SIDEBAR_WIDTH: 250, // px
    HEADER_HEIGHT: 60, // px
};

// constants.js - Thêm vào sau UI_CONSTANTS hoặc trước export default

// Connection test configuration
export const CONNECTION_TEST = {
    INTERVAL: 10000, // 10 giây - Thời gian kiểm tra kết nối
    TIMEOUT: 5000,   // 5 giây timeout cho mỗi lần kiểm tra
    HEALTH_ENDPOINT: '/health',
    TEST_ENDPOINT: '/test'
};

// Connection status
export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CHECKING: 'checking',
    ERROR: 'error'
};

// Connection status colors
export const CONNECTION_STATUS_COLORS = {
    connected: '#4CAF50',    // Green
    disconnected: '#f44336', // Red
    checking: '#FF9800',     // Orange
    error: '#9C27B0'         // Purple
};

// Connection status messages
export const CONNECTION_STATUS_MESSAGES = {
    connected: 'Kết nối ổn định',
    disconnected: 'Mất kết nối',
    checking: 'Đang kiểm tra...',
    error: 'Lỗi kết nối'
};

/**
 * Helper functions để lấy các giá trị phức tạp
 */

// Lấy full API URL từ endpoint
export const getApiUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}${endpoint}`;
};

// Lấy tên authority từ code
export const getAuthorityName = (authorityCode) => {
    return AUTHORITY_NAMES[authorityCode] || 'Unknown';
};

// Lấy màu authority từ code
export const getAuthorityColor = (authorityCode) => {
    return AUTHORITY_COLORS[authorityCode] || AUTHORITY_COLORS[0];
};

// Kiểm tra xem user có phải admin không
export const isAdmin = (authorityCode) => {
    return authorityCode === AUTHORITIES.ADMIN || 
           authorityCode === AUTHORITIES.SUPER_ADMIN;
};

// Kiểm tra xem user có phải moderator không
export const isModerator = (authorityCode) => {
    return authorityCode === AUTHORITIES.MODERATOR || 
           authorityCode === AUTHORITIES.ADMIN || 
           authorityCode === AUTHORITIES.SUPER_ADMIN;
};

// Lấy thông báo lỗi dựa trên status code
export const getErrorMessage = (statusCode) => {
    switch (statusCode) {
        case 400:
            return ERROR_MESSAGES.VALIDATION_ERROR;
        case 401:
            return ERROR_MESSAGES.UNAUTHORIZED;
        case 404:
            return ERROR_MESSAGES.NOT_FOUND;
        case 500:
            return ERROR_MESSAGES.SERVER_ERROR;
        default:
            return ERROR_MESSAGES.NETWORK_ERROR;
    }
};

// Validate account format
export const validateAccount = (account) => {
    if (!account) {
        return { valid: false, message: 'Account không được để trống' };
    }
    
    if (account.length < VALIDATION_RULES.ACCOUNT.MIN_LENGTH) {
        return { 
            valid: false, 
            message: `Account phải có ít nhất ${VALIDATION_RULES.ACCOUNT.MIN_LENGTH} ký tự` 
        };
    }
    
    if (account.length > VALIDATION_RULES.ACCOUNT.MAX_LENGTH) {
        return { 
            valid: false, 
            message: `Account không được vượt quá ${VALIDATION_RULES.ACCOUNT.MAX_LENGTH} ký tự` 
        };
    }
    
    if (!VALIDATION_RULES.ACCOUNT.PATTERN.test(account)) {
        return { 
            valid: false, 
            message: 'Account chỉ được chứa chữ cái, số và dấu gạch dưới' 
        };
    }
    
    return { valid: true, message: '' };
};

// Validate password format
export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Mật khẩu không được để trống' };
    }
    
    /*
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        return { 
            valid: false, 
            message: `Mật khẩu phải có ít nhất ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} ký tự` 
        };
    }
    
    if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
        return { 
            valid: false, 
            message: `Mật khẩu không được vượt quá ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} ký tự` 
        };
    }
    
    if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
        return { 
            valid: false, 
            message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số' 
        };
    }
    */
    return { valid: true, message: '' };
};

//  Kiểm tra email hợp lệ
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return {
        valid: false,
        message: 'Email không được để trống'
      };
    }
    
    // Regex kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: 'Email không đúng định dạng (ví dụ: example@domain.com)'
      };
    }
    
    return {
      valid: true,
      message: 'Email hợp lệ'
    };
  };

// Export tất cả dưới dạng object để import dễ dàng
export default {
    SERVER_CONFIG,
    API_ENDPOINTS,
    APP_CONFIG,
    STORAGE_KEYS,
    AUTHORITIES,
    AUTHORITY_NAMES,
    AUTHORITY_COLORS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    DATE_FORMATS,
    PAGINATION,
    UI_CONSTANTS,
    CONNECTION_TEST,
    CONNECTION_STATUS,
    CONNECTION_STATUS_COLORS,
    CONNECTION_STATUS_MESSAGES,
    getApiUrl,
    getAuthorityName,
    getAuthorityColor,
    isAdmin,
    isModerator,
    getErrorMessage,
    validateAccount,
    validatePassword
};
//[file content end]