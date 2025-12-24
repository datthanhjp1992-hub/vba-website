//[file name]: constants.js
//[Version] 2.0: Thêm chức năng cho việc account update
/**
 * File chứa tất cả các constant dùng trong ứng dụng
 * Cập nhật tại đây sẽ áp dụng cho toàn bộ ứng dụng
 */

// ==================== SERVER CONFIGURATION ====================
export const SERVER_CONFIG = {
    BASE_URL: 'https://my-python-app-pm7j.onrender.com/',
    API_VERSION: 'v1',
    TIMEOUT: 30000, // 30 seconds
};

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
    // Account endpoints
    ACCOUNT: {
        LOGIN: '/account/login',
        REGISTER: '/account/register',
        LIST: '/account/list',
        DETAIL: '/account', // /account/{id}
        CHECK: '/account/check',
        VALIDATE_EMAIL: '/account/validate-email',
        DELETE: '/account/delete',
        TEST_EMAIL: '/account/test-email',
        EMAIL_CHECK: '/account/email/check'
    },
    
    // Database endpoints
    DATABASE: {
        CREATE_ACCOUNT_TABLE: '/db/createAccountTable',
    },

    // Other endpoints có thể thêm sau
    USER: {
        PROFILE: '/user/profile',
        SETTINGS: '/user/settings',
    },

    LIKESERVICE:{
        CHECK_LIKE:'likemaster/checklike',         // <int:user_id>/<int:function_id>
        TOOGLE_LIKE_STATUS:'likemaster/change'    // <int:user_id>/<int:function_id>
    }
};

// ==================== APPLICATION CONFIGURATION ====================
export const APP_CONFIG = {
    NAME: 'My Application',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
};

// ==================== STORAGE KEYS ====================
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    LAST_LOGIN: 'last_login',
    THEME: 'app_theme',
    LANGUAGE: 'app_language',
    REMEMBER_ME: 'remember_me'
};

// ==================== AUTHORITY & ROLES ====================
export const AUTHORITY_LEVELS = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 9,
};

export const AUTHORITY_NAMES = {
    0: 'User',
    1: 'Moderator',
    2: 'Admin',
    9: 'Super Admin',
};

export const AUTHORITY_COLORS = {
    0: '#3498db', // User - Blue
    1: '#f39c12', // Moderator - Orange
    2: '#e74c3c', // Admin - Red
    9: '#9b59b6', // Super Admin - Purple
};

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
    NOT_FOUND: 'Không tìm thấy dữ liệu.',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
    UPDATE_ERROR: 'Cập nhật thông tin thất bại.',
    DELETE_ERROR: 'Xóa tài khoản thất bại.',
    EMAIL_EXISTS: 'Email đã được sử dụng. Vui lòng chọn email khác.',
    ACCOUNT_EXISTS: 'Tài khoản đã tồn tại. Vui lòng chọn tên khác.',
    SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
    
    // Field-specific errors
    EMAIL_REQUIRED: 'Email không được để trống',
    EMAIL_INVALID: 'Email không đúng định dạng',
    PASSWORD_REQUIRED: 'Mật khẩu không được để trống',
    ACCOUNT_REQUIRED: 'Tài khoản không được để trống',
    USERNAME_REQUIRED: 'Tên hiển thị không được để trống',
    PASSWORD_MISMATCH: 'Mật khẩu không khớp',
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Đăng nhập thành công!',
    LOGOUT_SUCCESS: 'Đã đăng xuất thành công.',
    REGISTER_SUCCESS: 'Đăng ký thành công!',
    UPDATE_SUCCESS: 'Cập nhật thành công.',
    DELETE_SUCCESS: 'Xóa thành công.',
    EMAIL_SENT: 'Email đã được gửi thành công!',
};

// ==================== VALIDATION RULES ====================
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
    EMAIL: {
        PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    PHONE: {
        MAX_LENGTH: 15,
        PATTERN: /^[0-9+\-\s()]*$/,
    }
};

// ==================== DATE/TIME FORMATS ====================
export const DATE_FORMATS = {
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
    DISPLAY_TIME: 'HH:mm',
    API_DATE: 'YYYY-MM-DD',
    API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// ==================== PAGINATION ====================
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [5, 10, 20, 50],
};

// ==================== UI CONSTANTS ====================
export const UI_CONSTANTS = {
    DEBOUNCE_DELAY: 300, // ms
    TOAST_DURATION: 3000, // ms
    MODAL_ANIMATION_DURATION: 300, // ms
    SIDEBAR_WIDTH: 250, // px
    HEADER_HEIGHT: 60, // px
};

// ==================== CONNECTION TEST ====================
export const CONNECTION_TEST = {
    INTERVAL: 60000, // 60 giây - Thời gian kiểm tra kết nối
    TIMEOUT: 10000,   // 10 giây timeout cho mỗi lần kiểm tra
    HEALTH_ENDPOINT: '/health',
    TEST_ENDPOINT: '/test'
};

export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CHECKING: 'checking',
    ERROR: 'error'
};

export const CONNECTION_STATUS_COLORS = {
    connected: '#4CAF50',    // Green
    disconnected: '#f44336', // Red
    checking: '#FF9800',     // Orange
    error: '#9C27B0'         // Purple
};

export const CONNECTION_STATUS_MESSAGES = {
    connected: 'Kết nối ổn định',
    disconnected: 'Mất kết nối',
    checking: 'Đang kiểm tra...',
    error: 'Lỗi kết nối'
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy full API URL từ endpoint
 * @param {string} endpoint - Endpoint cần gọi
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Lấy tên authority từ code
 * @param {number} authorityCode - Mã authority
 * @returns {string} Tên authority
 */
export const getAuthorityName = (authorityCode) => {
    return AUTHORITY_NAMES[authorityCode] || 'Unknown';
};

/**
 * Lấy màu authority từ code
 * @param {number} authorityCode - Mã authority
 * @returns {string} Mã màu hex
 */
export const getAuthorityColor = (authorityCode) => {
    return AUTHORITY_COLORS[authorityCode] || AUTHORITY_COLORS[0];
};

/**
 * Kiểm tra xem user có phải admin không
 * @param {number} authorityCode - Mã authority
 * @returns {boolean}
 */
export const isAdmin = (authorityCode) => {
    return authorityCode === AUTHORITY_LEVELS.ADMIN || 
           authorityCode === AUTHORITY_LEVELS.SUPER_ADMIN;
};

/**
 * Kiểm tra xem user có phải moderator không
 * @param {number} authorityCode - Mã authority
 * @returns {boolean}
 */
export const isModerator = (authorityCode) => {
    return authorityCode === AUTHORITY_LEVELS.MODERATOR || 
           authorityCode === AUTHORITY_LEVELS.ADMIN || 
           authorityCode === AUTHORITY_LEVELS.SUPER_ADMIN;
};

/**
 * Kiểm tra xem user có phải user thường không
 * @param {number} authorityCode - Mã authority
 * @returns {boolean}
 */
export const isUser = (authorityCode) => {
    return authorityCode >= AUTHORITY_LEVELS.USER;
};

/**
 * Lấy thông báo lỗi dựa trên status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Thông báo lỗi
 */
export const getErrorMessage = (statusCode) => {
    const errors = {
        400: ERROR_MESSAGES.VALIDATION_ERROR,
        401: ERROR_MESSAGES.UNAUTHORIZED,
        403: ERROR_MESSAGES.PERMISSION_DENIED,
        404: ERROR_MESSAGES.NOT_FOUND,
        409: 'Xung đột dữ liệu',
        422: ERROR_MESSAGES.VALIDATION_ERROR,
        500: ERROR_MESSAGES.SERVER_ERROR,
        503: 'Dịch vụ không khả dụng'
    };
    
    return errors[statusCode] || ERROR_MESSAGES.NETWORK_ERROR;
};

/**
 * Validate account format
 * @param {string} account - Tên tài khoản
 * @returns {Object} Kết quả validation
 */
export const validateAccount = (account) => {
    if (!account || account.trim() === '') {
        return { valid: false, message: ERROR_MESSAGES.ACCOUNT_REQUIRED };
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
            message: 'Account chỉ được chứa chữ cái, số và dấu gạch dưới (a-z, A-Z, 0-9, _)' 
        };
    }
    
    return { valid: true, message: 'Account hợp lệ' };
};

/**
 * Validate password format
 * @param {string} password - Mật khẩu
 * @returns {Object} Kết quả validation
 */
export const validatePassword = (password) => {
    if (!password || password.trim() === '') {
        return { valid: false, message: ERROR_MESSAGES.PASSWORD_REQUIRED };
    }
    
    // Comment out strict validation for now
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
    
    return { valid: true, message: 'Mật khẩu hợp lệ' };
};

/**
 * Validate email format
 * @param {string} email - Email
 * @returns {Object} Kết quả validation
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return { valid: false, message: ERROR_MESSAGES.EMAIL_REQUIRED };
    }
    
    if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
        return { 
            valid: false, 
            message: ERROR_MESSAGES.EMAIL_INVALID
        };
    }
    
    return { valid: true, message: 'Email hợp lệ' };
};

/**
 * Validate username format
 * @param {string} username - Tên hiển thị
 * @returns {Object} Kết quả validation
 */
export const validateUsername = (username) => {
    if (!username || username.trim() === '') {
        return { valid: false, message: ERROR_MESSAGES.USERNAME_REQUIRED };
    }
    
    if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
        return { 
            valid: false, 
            message: `Tên hiển thị phải có ít nhất ${VALIDATION_RULES.USERNAME.MIN_LENGTH} ký tự` 
        };
    }
    
    if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
        return { 
            valid: false, 
            message: `Tên hiển thị không được vượt quá ${VALIDATION_RULES.USERNAME.MAX_LENGTH} ký tự` 
        };
    }
    
    return { valid: true, message: 'Tên hiển thị hợp lệ' };
};

/**
 * Validate phone number format
 * @param {string} phone - Số điện thoại
 * @returns {Object} Kết quả validation
 */
export const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
        return { valid: true, message: '' }; // Phone là optional
    }
    
    if (phone.length > VALIDATION_RULES.PHONE.MAX_LENGTH) {
        return { 
            valid: false, 
            message: `Số điện thoại không được vượt quá ${VALIDATION_RULES.PHONE.MAX_LENGTH} ký tự` 
        };
    }
    
    if (!VALIDATION_RULES.PHONE.PATTERN.test(phone)) {
        return { 
            valid: false, 
            message: 'Số điện thoại không hợp lệ' 
        };
    }
    
    return { valid: true, message: 'Số điện thoại hợp lệ' };
};

/**
 * Validate birthday (must be in past and reasonable)
 * @param {string} birthday - Ngày sinh (YYYY-MM-DD)
 * @returns {Object} Kết quả validation
 */
export const validateBirthday = (birthday) => {
    if (!birthday || birthday.trim() === '') {
        return { valid: true, message: '' }; // Birthday là optional
    }
    
    const birthDate = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (birthDate > today) {
        return { 
            valid: false, 
            message: 'Ngày sinh không được ở tương lai' 
        };
    }
    
    // Kiểm tra tuổi hợp lý (không quá 120 năm)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (birthDate < minDate) {
        return { 
            valid: false, 
            message: 'Ngày sinh không hợp lệ' 
        };
    }
    
    return { valid: true, message: 'Ngày sinh hợp lệ' };
};

// ==================== EXPORT DEFAULT OBJECT ====================
export default {
    SERVER_CONFIG,
    API_ENDPOINTS,
    APP_CONFIG,
    STORAGE_KEYS,
    AUTHORITY_LEVELS,
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
    isUser,
    getErrorMessage,
    validateAccount,
    validatePassword,
    validateEmail,
    validateUsername,
    validatePhone,
    validateBirthday
};