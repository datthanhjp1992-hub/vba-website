// dialogAccountDetails.jsx
import React, { useState, useEffect } from 'react';
import '../css/dialogAccountDetails.css';
import AccountService from '../services/account_service';

const DialogAccountDetails = ({ userId, onBack }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching user details for ID:', userId); // DEBUG
      const result = await AccountService.getAccountDetail(userId);
      console.log('API Response:', result); // DEBUG
      
      if (result.success) {
        setUserData(result.data);
      } else {
        setError(result.message || 'Không thể tải thông tin người dùng');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Lỗi kết nối server. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dialog-account-details loading">
        <div className="spinner">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dialog-account-details error">
        <p>{error}</p>
        <button onClick={onBack}>Quay lại</button>
      </div>
    );
  }

  // Hàm tính tuổi dựa vào năm sinh
  const calculateAge = (birthday) =>{
    if(!birthday) return 'Chưa cập nhật';
    try{
      const birthDate = new Date(birthday);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // Điều chỉnh nếu chưa đến sinh nhật trong năm nay
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
    
    return `${age} tuổi`;
    }catch (error) {
      console.error('Error calculating age:', error);
      return 'Không xác định';
    } 
  }

  

  return (
    <div className="dialog-account-details">
      <div className="details-header">
        <h2>👤 Thông tin chi tiết tài khoản</h2>
        
      </div>

      <div className="user-details-card">
        {/* Tên tài khoản */} 
        <div className="detail-row">
          <span className="label">Tài khoản:</span>
          <span className="value">{userData.account}</span>
        </div>
        {/* Tên hiển thị */}
        <div className="detail-row">
          <span className="label">Tên hiển thị:</span>
          <span className="value">{userData.username}</span>
        </div>
        {/* Tuổi */}
        <div className='detail-row'>
          <span className='label'>Tuổi:</span>
          <span className='value'>
            {userData.birthday 
              ? `${calculateAge(userData.birthday)}`
              : 'Chưa cập nhật'}
          </span>
        </div>
        {/* Email */}
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{userData.email}</span>
        </div>
        {/* Số điện thoại */}
        <div className="detail-row">
          <span className="label">TEL:</span>
          <span className="value">{userData.tel}</span>
        </div>

      </div>

      <div className="action-buttons">
        <button className="edit-btn" onClick={() => console.log('Edit clicked')}>
          ✏️ Chỉnh sửa thông tin
        </button>
        <button className="change-password-btn" onClick={() => console.log('Change password clicked')}>
          🔒 Đổi mật khẩu
        </button>
      </div>
    </div>
  );
};

export default DialogAccountDetails;