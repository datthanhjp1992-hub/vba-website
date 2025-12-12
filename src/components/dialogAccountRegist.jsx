import React, { useState } from 'react';
import '../css/dialogAccountRegist.css';
import AccountService from '../services/account_service';
import { 
    validateAccount, 
    validatePassword, 
    ERROR_MESSAGES, 
    SUCCESS_MESSAGES,
    getApiUrl 
} from '../services/constants';

const DialogAccountRegist = ({ onBack }) => {
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthday: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [isAccountAvailable, setIsAccountAvailable] = useState(null);
  const [lastCheckedAccount, setLastCheckedAccount] = useState('');
  const [checkMessage, setCheckMessage] = useState('');

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

    // Clear account availability status if account is changed
    if (name === 'account') {
      if (value !== lastCheckedAccount) {
        setIsAccountAvailable(null);
        setCheckMessage('');
      }
    }

    // Clear message
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const checkAccountAvailability = async () => {
    if (!formData.account) {
      setErrors(prev => ({
        ...prev,
        account: 'Vui lòng nhập tài khoản trước khi kiểm tra'
      }));
      return;
    }

    const accountValidation = validateAccount(formData.account);
    if (!accountValidation.valid) {
      setErrors(prev => ({
        ...prev,
        account: accountValidation.message
      }));
      return;
    }

    setIsCheckingAccount(true);
    setCheckMessage('');
    setMessage({ type: '', text: '' });

    try {
      // Gọi API kiểm tra account
      const url = `${getApiUrl('/account/check')}?account=${encodeURIComponent(formData.account)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAccountAvailable(!data.exists);
        setLastCheckedAccount(formData.account);
        
        if (data.exists) {
          setCheckMessage(`❌ ${data.message}`);
          setMessage({ 
            type: 'error', 
            text: `Account "${formData.account}" đã tồn tại. Vui lòng chọn tên khác.` 
          });
        } else {
          setCheckMessage(`✅ ${data.message}`);
        }
      } else {
        setCheckMessage(`⚠️ ${data.error || 'Lỗi khi kiểm tra account'}`);
        setIsAccountAvailable(null);
      }
    } catch (error) {
      console.error('Error checking account:', error);
      setCheckMessage('⚠️ Lỗi kết nối server. Vui lòng thử lại.');
      setIsAccountAvailable(null);
    } finally {
      setIsCheckingAccount(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate account
    if (!formData.account) {
      newErrors.account = 'Vui lòng nhập tài khoản';
    } else {
      const accountValidation = validateAccount(formData.account);
      if (!accountValidation.valid) {
        newErrors.account = accountValidation.message;
      }
    }

    // Check account availability
    if (isAccountAvailable === false) {
      newErrors.account = `Account "${formData.account}" đã tồn tại`;
    } else if (isAccountAvailable === null && formData.account) {
      newErrors.account = 'Vui lòng kiểm tra tính khả dụng của tài khoản';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Tên hiển thị không được để trống';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Tên hiển thị phải có ít nhất 2 ký tự';
    } else if (formData.username.length > 40) {
      newErrors.username = 'Tên hiển thị không được vượt quá 40 ký tự';
    }

    // Validate birthday (optional)
    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (birthDate > today) {
        newErrors.birthday = 'Ngày sinh không được ở tương lai';
      }
      
      // Kiểm tra tuổi hợp lý (không quá 120 năm)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      if (birthDate < minDate) {
        newErrors.birthday = 'Ngày sinh không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        account: formData.account,
        password: formData.password,
        username: formData.username,
        birthday: formData.birthday || null,
      };

      const result = await AccountService.register(userData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: SUCCESS_MESSAGES.REGISTER_SUCCESS
        });
        
        // Reset form after successful registration
        setTimeout(() => {
          setFormData({
            account: '',
            password: '',
            confirmPassword: '',
            username: '',
            birthday: '',
          });
          setIsAccountAvailable(null);
          setLastCheckedAccount('');
          setCheckMessage('');
          
          // Optionally redirect or show login
          if (onBack) {
            setTimeout(() => onBack(), 2000);
          }
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.message || ERROR_MESSAGES.VALIDATION_ERROR
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMsg = error.message || ERROR_MESSAGES.SERVER_ERROR;
      
      // Xử lý lỗi cụ thể
      if (errorMsg.includes('Account đã tồn tại')) {
        errorMsg = `Account "${formData.account}" đã tồn tại. Vui lòng chọn tên khác.`;
        setIsAccountAvailable(false);
        setCheckMessage(`❌ Account "${formData.account}" đã tồn tại`);
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

  const getAccountStatusClass = () => {
    if (isAccountAvailable === true) return 'available';
    if (isAccountAvailable === false) return 'unavailable';
    return '';
  };

  return (
    <div className="dialog-account-regist">
      <div className="regist-header">
        <h2>📝 Đăng ký tài khoản mới</h2>
      </div>

      <form onSubmit={handleSubmit} className="regist-form">
        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* Account field with availability check */}
        <div className="form-group">
          <label htmlFor="account">
            Tài khoản *
            <span className={`account-status ${getAccountStatusClass()}`}>
              {isAccountAvailable === true && '✓ Có thể sử dụng'}
              {isAccountAvailable === false && '✗ Đã tồn tại'}
            </span>
          </label>
          
          <div className="account-check-group">
            <input
              type="text"
              id="account"
              name="account"
              value={formData.account}
              onChange={handleInputChange}
              placeholder="Nhập tên đăng nhập (3-20 ký tự)"
              disabled={isSubmitting}
              className={errors.account ? 'error' : isAccountAvailable === true ? 'success' : isAccountAvailable === false ? 'error' : ''}
              autoComplete="username"
            />
            <button
              type="button"
              onClick={checkAccountAvailability}
              className="check-btn"
              disabled={isSubmitting || isCheckingAccount || !formData.account}
            >
              {isCheckingAccount ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </button>
          </div>
          
          {checkMessage && (
            <div className={`check-message ${isAccountAvailable === true ? 'success' : isAccountAvailable === false ? 'error' : ''}`}>
              {checkMessage}
            </div>
          )}
          
          {errors.account && <span className="error-text">{errors.account}</span>}
          <small className="hint">
            Chỉ được dùng chữ cái, số và dấu gạch dưới (a-z, A-Z, 0-9, _)
          </small>
        </div>

        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password">Mật khẩu *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Nhập mật khẩu"
            disabled={isSubmitting}
            className={errors.password ? 'error' : ''}
            autoComplete="new-password"
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
          <small className="hint">
            Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số
          </small>
        </div>

        {/* Confirm Password field */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Nhập lại mật khẩu"
            disabled={isSubmitting}
            className={errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <span className="success-text">✓ Mật khẩu khớp</span>
          )}
        </div>

        {/* Username field */}
        <div className="form-group">
          <label htmlFor="username">Tên hiển thị *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Nhập tên sẽ hiển thị cho người khác"
            disabled={isSubmitting}
            className={errors.username ? 'error' : ''}
            autoComplete="name"
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
          <small className="hint">
            Tên hiển thị sẽ được người khác nhìn thấy
          </small>
        </div>

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
          <small className="hint">Không bắt buộc. Nhấn để chọn ngày từ lịch</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleBack}
            className="secondary-btn"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting || isCheckingAccount || !isAccountAvailable}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký tài khoản'
            )}
          </button>
        </div>

        <div className="form-footer">
          <p className="terms-hint">
            Bằng cách đăng ký, bạn đồng ý với <a href="/terms" target="_blank">Điều khoản sử dụng</a> và <a href="/privacy" target="_blank">Chính sách bảo mật</a> của chúng tôi.
          </p>
          <p className="login-link">
            Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); handleBack(); }}>Đăng nhập ngay</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default DialogAccountRegist;