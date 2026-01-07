//[FileName]: dialogAccountChange.jsx
//[Version]: 1.0
//[Content]: Đây là component sử dụng để thay đổi thông tin về tài khoản cho người dùng

import React, { useState, useEffect } from 'react';
import '../css/dialogAccountChange.css';
import AccountService from '../services/account_service';
import { useAuth } from '../context/AuthContext';
import { 
    validatePassword, 
    validateEmail,
    validateUsername,
    validateBirthday,
    validatePhone,
    ERROR_MESSAGES, 
    SUCCESS_MESSAGES,
    getApiUrl 
} from '../services/constants';

const DialogAccountChange = ({ userId, onBack, onUpdateSuccess }) => {
    const {currentUser, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        email: '',
        tel: '',
    });
    
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(null);
    const [lastCheckedEmail, setLastCheckedEmail] = useState('');
    const [checkEmailMessage, setCheckEmailMessage] = useState('');
    
    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, [userId]);
    
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            // Sửa: Thay getUserDetails bằng getAccountDetail
            const result = await AccountService.getAccountDetail(userId || currentUser?.index);
            if (result.success && result.data) {
                const userData = result.data;
                setFormData({
                    username: userData.username || '',
                    password: '',
                    confirmPassword: '',
                    birthday: userData.birthday ? userData.birthday.split('T')[0] : '',
                    email: userData.email || '',
                    tel: userData.tel || '',
                });
                setOriginalData({
                    username: userData.username || '',
                    email: userData.email || '',
                    tel: userData.tel || '',
                    birthday: userData.birthday || '',
                });
            } else {
                throw new Error('Không thể tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage({
                type: 'error',
                text: 'Không thể tải thông tin người dùng'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Clear email availability status if email is changed
        if (name === 'email' && value !== originalData.email) {
            setIsEmailAvailable(null);
            setCheckEmailMessage('');
        }
        
        // Clear message
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };
    
    const checkEmailAvailability = async () => {
        if (!formData.email) {
            setErrors(prev => ({
                ...prev,
                email: ERROR_MESSAGES.EMAIL_REQUIRED
            }));
            return;
        }
        
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            setErrors(prev => ({
                ...prev,
                email: emailValidation.message
            }));
            return;
        }
        
        // Nếu email không thay đổi so với ban đầu
        if (formData.email === originalData.email) {
            setIsEmailAvailable(true);
            setCheckEmailMessage('✅ Email hiện tại của bạn');
            return;
        }
        
        setIsCheckingEmail(true);
        setCheckEmailMessage('');
        setMessage({ type: '', text: '' });
        
        try {
            // Sửa: Sử dụng AccountService.validateEmail thay vì fetch trực tiếp
            const result = await AccountService.validateEmail(
                formData.email, 
                userId || currentUser?.index
            );
            
            if (result.success) {
                setIsEmailAvailable(result.valid && !result.exists);
                setLastCheckedEmail(formData.email);
                
                if (result.exists) {
                    setCheckEmailMessage(`❌ ${result.message}`);
                    setMessage({ 
                        type: 'error', 
                        text: `Email "${formData.email}" đã được sử dụng. Vui lòng chọn email khác.` 
                    });
                } else if (!result.valid) {
                    setCheckEmailMessage(`❌ ${result.message}`);
                } else {
                    setCheckEmailMessage(`✅ ${result.message}`);
                }
            } else {
                setCheckEmailMessage(`⚠️ ${result.error || 'Lỗi khi kiểm tra email'}`);
                setIsEmailAvailable(null);
            }
        } catch (error) {
            console.error('Error checking email:', error);
            setCheckEmailMessage('⚠️ Lỗi kết nối server. Vui lòng thử lại.');
            setIsEmailAvailable(null);
        } finally {
            setIsCheckingEmail(false);
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = ERROR_MESSAGES.USERNAME_REQUIRED;
        } else {
            const usernameValidation = validateUsername(formData.username);
            if (!usernameValidation.valid) {
                newErrors.username = usernameValidation.message;
            }
        }
        
        // Validate password (optional, chỉ validate nếu có nhập)
        if (formData.password) {
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.message;
            }
            
            // Validate confirm password
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
            }
        }
        
        // Validate birthday (optional)
        if (formData.birthday) {
            const birthdayValidation = validateBirthday(formData.birthday);
            if (!birthdayValidation.valid) {
                newErrors.birthday = birthdayValidation.message;
            }
        }
        
        // Validate email (bắt buộc nếu đang đổi email)
        if (formData.email && formData.email !== originalData.email) {
            const emailValidation = validateEmail(formData.email);
            if (!emailValidation.valid) {
                newErrors.email = emailValidation.message;
            }
            
            // Check email availability
            if (isEmailAvailable === false) {
                newErrors.email = ERROR_MESSAGES.EMAIL_EXISTS;
            } else if (isEmailAvailable === null) {
                newErrors.email = 'Vui lòng kiểm tra tính khả dụng của email';
            }
        }
        
        // Validate phone number (optional)
        if (formData.tel) {
            const phoneValidation = validatePhone(formData.tel);
            if (!phoneValidation.valid) {
                newErrors.tel = phoneValidation.message;
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const hasChanges = () => {
        const originalBirthday = originalData.birthday ? 
            originalData.birthday.split('T')[0] : '';
            
        return (
            formData.username !== originalData.username ||
            formData.password !== '' ||
            formData.birthday !== originalBirthday ||
            formData.email !== originalData.email ||
            formData.tel !== originalData.tel
        );
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (!validateForm()) {
            return;
        }
        
        if (!hasChanges()) {
            setMessage({
                type: 'info',
                text: 'Không có thay đổi nào để cập nhật'
            });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const updateData = {
                username: formData.username,
                birthday: formData.birthday || null,
                email: formData.email,
                tel: formData.tel || null,
            };
            
            // Chỉ thêm password nếu có thay đổi
            if (formData.password) {
                updateData.password = formData.password;
            }
            
            // Sửa: Thay updateUser bằng updateAccount
            const result = await AccountService.updateAccount(
                userId || currentUser?.index, 
                updateData
            );
            
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || SUCCESS_MESSAGES.UPDATE_SUCCESS
                });
                
                // Cập nhật context nếu là user hiện tại
                if (!userId && currentUser) {
                    updateUser(result.data);
                }
                
                // Cập nhật original data
                const updatedBirthday = result.data?.birthday || formData.birthday;
                setOriginalData({
                    username: formData.username,
                    email: formData.email,
                    tel: formData.tel,
                    birthday: updatedBirthday,
                });
                
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
                
                // Gọi callback nếu có
                if (onUpdateSuccess) {
                    setTimeout(() => onUpdateSuccess(result.data), 1500);
                }
                
                // Reset email check status
                if (formData.email === originalData.email) {
                    setIsEmailAvailable(null);
                    setCheckEmailMessage('');
                }
                
                // ⭐ Thêm delay trước khi refresh
                setTimeout(() => {
                    // Refresh toàn bộ trang
                    window.location.reload();
                }, 2000); // 2 giây sau khi thành công

            } else {
                setMessage({
                    type: 'error',
                    text: result.message || ERROR_MESSAGES.UPDATE_ERROR
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            
            let errorMsg = error.message || ERROR_MESSAGES.SERVER_ERROR;
            
            // Xử lý lỗi cụ thể
            if (errorMsg.includes('Email đã được sử dụng')) {
                errorMsg = ERROR_MESSAGES.EMAIL_EXISTS;
                setIsEmailAvailable(false);
                setCheckEmailMessage(`❌ ${ERROR_MESSAGES.EMAIL_EXISTS}`);
            }
            
            setMessage({
                type: 'error',
                text: errorMsg
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };
    
    const getEmailStatusClass = () => {
        if (isEmailAvailable === true) return 'available';
        if (isEmailAvailable === false) return 'unavailable';
        return '';
    };
    
    if (isLoading) {
        return (
            <div className="dialog-account-change loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin...</p>
            </div>
        );
    }
    
    return (
        <div className="dialog-account-change">
            <div className="dialog-account-change-header">
                <h2>👤 Thay đổi thông tin tài khoản</h2>
                <p className="account-id">ID: {userId || currentUser?.index}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="dialog-account-change-form">
                {message.text && (
                    <div className={`form-message ${message.type}`}>
                        {message.type === 'success' ? '✅' : message.type === 'error' ? '⚠️' : 'ℹ️'} {message.text}
                    </div>
                )}
                
                {/* Username field */}
                <div className="form-group">
                    <label htmlFor="username">Tên hiển thị *</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nhập tên hiển thị"
                        disabled={isSubmitting}
                        className={errors.username ? 'error' : ''}
                        autoComplete="name"
                    />
                    {errors.username && <span className="error-text">{errors.username}</span>}
                    <small className="hint">
                        Tên hiển thị sẽ được người khác nhìn thấy
                    </small>
                </div>
                
                {/* Password field (optional) */}
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu mới</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Chỉ nhập nếu muốn đổi mật khẩu"
                        disabled={isSubmitting}
                        className={errors.password ? 'error' : ''}
                        autoComplete="new-password"
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                    <small className="hint">
                        Để trống nếu không muốn thay đổi mật khẩu
                    </small>
                </div>
                
                {/* Confirm Password field */}
                {formData.password && (
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Nhập lại mật khẩu mới"
                            disabled={isSubmitting}
                            className={errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <span className="success-text">✓ Mật khẩu khớp</span>
                        )}
                    </div>
                )}
                
                {/* Birthday field */}
                <div className="form-group">
                    <label htmlFor="birthday">Ngày sinh</label>
                    <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        max={new Date().toISOString().split('T')[0]}
                        className={errors.birthday ? 'error' : ''}
                    />
                    {errors.birthday && <span className="error-text">{errors.birthday}</span>}
                    <small className="hint">
                        Không bắt buộc
                    </small>
                </div>
                
                {/* Email field */}
                <div className="form-group">
                    <label htmlFor="email">
                        Email *
                        <span className={`email-status ${getEmailStatusClass()}`}>
                            {isEmailAvailable === true && '✓ Có thể sử dụng'}
                            {isEmailAvailable === false && '✗ Đã tồn tại'}
                        </span>
                    </label>
                    
                    <div className="email-check-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@domain.com"
                            disabled={isSubmitting}
                            className={errors.email ? 'error' : isEmailAvailable === true ? 'success' : isEmailAvailable === false ? 'error' : ''}
                            autoComplete="email"
                        />
                        <button
                            type="button"
                            onClick={checkEmailAvailability}
                            className="check-btn"
                            disabled={isSubmitting || isCheckingEmail || !formData.email || formData.email === originalData.email}
                        >
                            {isCheckingEmail ? 'Đang kiểm tra...' : 'Kiểm tra'}
                        </button>
                    </div>
                    
                    {checkEmailMessage && (
                        <div className={`check-message ${isEmailAvailable === true ? 'success' : isEmailAvailable === false ? 'error' : ''}`}>
                            {checkEmailMessage}
                        </div>
                    )}
                    
                    {errors.email && <span className="error-text">{errors.email}</span>}
                    <small className="hint">
                        Email có thể sử dụng trong trường hợp lấy lại mật khẩu
                    </small>
                </div>
                
                {/* Phone Number field */}
                <div className="form-group">
                    <label htmlFor="tel">Số điện thoại</label>
                    <input
                        type="tel"
                        id="tel"
                        name="tel"
                        value={formData.tel}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        disabled={isSubmitting}
                        className={errors.tel ? 'error' : ''}
                        autoComplete="tel"
                    />
                    {errors.tel && <span className="error-text">{errors.tel}</span>}
                    <small className="hint">
                        Không bắt buộc, tối đa 15 ký tự
                    </small>
                </div>
                
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="secondary-btn"
                        disabled={isSubmitting}
                    >
                        Quay lại
                    </button>
                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={isSubmitting || !hasChanges()}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Đang cập nhật...
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </button>
                </div>
                
                <div className="change-hint">
                    <p><small>Các trường có dấu * là bắt buộc</small></p>
                    {!hasChanges() && (
                        <p className="no-changes-hint">ℹ️ Không có thay đổi nào để lưu</p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DialogAccountChange;