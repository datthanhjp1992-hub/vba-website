// dialogContactInformation.jsx
import React from 'react';
import { BANK_INFORMATION } from '../services/contactInformation';
import '../css/dialogDonateInformation.css'; // Nếu có file CSS riêng

const DialogDonateInformation = () => {
    return (
        <div className="dialog-donate-information">
            <h3>Thông Donate cho page</h3>
            <p>Ngân hàng: {BANK_INFORMATION.BANK_NAME}</p>
            <p>Mã Chi Nhánh: {BANK_INFORMATION.BANK_BRANCH}</p>
            <p>Tên Chi Nhánh: {BANK_INFORMATION.BANK_BRANCH_NAME}</p>
            <p>Số tài khoản: {BANK_INFORMATION.BANK_NUMBER}</p>
            <p>Tên người nhận: {BANK_INFORMATION.USER_NAME}</p>
        </div>
    );
}

export default DialogDonateInformation;