// dialogContactInformation.jsx
import React from 'react';
import { CONTACT_INFORMATION } from '../services/contactInformation';
import '../css/dialogContactInformation.css'; // Nếu có file CSS riêng

const DialogContactInformation = () => {
    return (
        <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <p>Email: {CONTACT_INFORMATION.CONTACT_EMAIL}</p>
            <p>Điện thoại: {CONTACT_INFORMATION.CONTACT_TEL}</p>
            <p>Địa chỉ: {CONTACT_INFORMATION.CONTACT_ADDRESS}</p>
        </div>
    );
}

export default DialogContactInformation;