//[file name]: pageDonate.jsx
import React, { useState, useEffect } from 'react';
import { useDonateService } from '../services/pageDonate';
import '../css/pageDonate.css';

const PageDonate = () => {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [description, setDescription] = useState('Ủng hộ dự án');
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bankInfo, setBankInfo] = useState(null);
    const [predefinedAmounts, setPredefinedAmounts] = useState([]);
    const [showStaticQR, setShowStaticQR] = useState(false);
    const [staticQR, setStaticQR] = useState(null);
    const [error, setError] = useState(null);

    const {
        getBankInfo,
        getPredefinedAmounts,
        generateQR,
        getStaticQR,
        verifyQR
    } = useDonateService();

    // Load dữ liệu ban đầu
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Lấy thông tin ngân hàng
            const bankInfoResult = await getBankInfo();
            if (bankInfoResult.success) {
                setBankInfo(bankInfoResult.bank_info);
            } else {
                setError(bankInfoResult.error);
            }

            // Lấy danh sách mệnh giá định sẵn
            const amountsResult = await getPredefinedAmounts();
            if (amountsResult.success) {
                setPredefinedAmounts(amountsResult.amounts);
                // Chọn mệnh giá mặc định
                const defaultAmount = amountsResult.amounts.find(
                    amount => amount.value === amountsResult.default_amount
                );
                if (defaultAmount) {
                    setSelectedAmount(defaultAmount);
                }
            } else {
                setError(amountsResult.error);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            setError('Lỗi kết nối server');
        }
    };

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount('');
        setQrData(null);
        setShowStaticQR(false);
        setError(null);
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setCustomAmount(value);
        setSelectedAmount(null);
        setQrData(null);
        setShowStaticQR(false);
        setError(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleGenerateQR = async () => {
        const amountValue = customAmount 
            ? parseFloat(customAmount) 
            : (selectedAmount ? selectedAmount.value : null);

        if (!amountValue || amountValue <= 0) {
            setError('Vui lòng chọn hoặc nhập số tiền hợp lệ');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await generateQR(amountValue, description);
            if (result.success) {
                setQrData(result);
                setShowStaticQR(false);
                console.log('QR generated via VietQR:', result.qr_url);
            } else {
                setError('Lỗi tạo mã QR: ' + result.error);
            }
        } catch (err) {
            setError('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGetStaticQR = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getStaticQR();
            if (result.success) {
                setStaticQR(result);
                setShowStaticQR(true);
                setQrData(null);
                console.log('Static QR from VietQR:', result.qr_url);
            } else {
                setError('Lỗi tạo mã QR tĩnh: ' + result.error);
            }
        } catch (err) {
            setError('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyQR = async () => {
        const qrString = qrData?.qr_string || staticQR?.qr_string;
        if (!qrString) {
            setError('Không có mã QR để kiểm tra');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await verifyQR(qrString);
            if (result.success) {
                alert(`Mã QR ${result.valid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}\nĐộ dài: ${result.length} ký tự\nCRC: ${result.crc}`);
            } else {
                setError('Lỗi kiểm tra QR: ' + result.error);
            }
        } catch (err) {
            setError('Lỗi kiểm tra QR: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAccount = () => {
        if (bankInfo?.account_number) {
            navigator.clipboard.writeText(bankInfo.account_number)
                .then(() => {
                    alert('Đã sao chép số tài khoản!');
                })
                .catch(() => {
                    setError('Không thể sao chép số tài khoản');
                });
        }
    };

    // Thêm thông báo lỗi
    const renderError = () => {
        if (!error) return null;
        
        return (
            <div className="pageDonate-error">
                <span className="pageDonate-error-icon">⚠️</span>
                <span className="pageDonate-error-message">{error}</span>
                <button 
                    className="pageDonate-error-close"
                    onClick={() => setError(null)}
                >
                    ✕
                </button>
            </div>
        );
    };

    // Hiển thị QR từ VietQR
    const renderQRImage = () => {
        const qrToShow = showStaticQR ? staticQR : qrData;
        const qrUrl = qrToShow?.qr_url || qrToShow?.qr_image;
        
        if (!qrUrl) return null;

        return (
            <img 
                src={qrUrl}
                alt="Mã QR thanh toán"
                className="pageDonate-qr-image"
                onError={(e) => {
                    console.error('Failed to load QR image:', qrUrl);
                    e.target.style.display = 'none';
                    setError('Không thể tải ảnh QR. Vui lòng thử lại.');
                }}
                onLoad={() => console.log('QR image loaded successfully:', qrUrl)}
            />
        );
    };

    return (
        <div className="pageDonate-container">
            {renderError()}
            
            <div className="pageDonate-header">
                <h1 className="pageDonate-title">🎗️ Ủng Hộ Dự Án</h1>
                <p className="pageDonate-subtitle">
                    Mọi đóng góp của bạn sẽ giúp chúng tôi duy trì và phát triển dịch vụ tốt hơn
                </p>
            </div>

            <div className="pageDonate-content">
                <div className="pageDonate-left">
                    {/* Thông tin ngân hàng */}
                    {bankInfo && (
                        <div className="pageDonate-bank-info">
                            <h3>💳 Thông Tin Chuyển Khoản</h3>
                            <div className="pageDonate-bank-details">
                                <div className="pageDonate-bank-row">
                                    <span className="pageDonate-bank-label">Ngân hàng:</span>
                                    <span className="pageDonate-bank-value">{bankInfo.bank_name}</span>
                                </div>
                                <div className="pageDonate-bank-row">
                                    <span className="pageDonate-bank-label">Số tài khoản:</span>
                                    <div className="pageDonate-account-container">
                                        <span className="pageDonate-bank-value">{bankInfo.masked_account}</span>
                                        <button 
                                            className="pageDonate-copy-btn"
                                            onClick={handleCopyAccount}
                                            title="Sao chép số tài khoản"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                                <div className="pageDonate-bank-row">
                                    <span className="pageDonate-bank-label">Chủ tài khoản:</span>
                                    <span className="pageDonate-bank-value">{bankInfo.account_name}</span>
                                </div>
                                <div className="pageDonate-bank-row">
                                    <span className="pageDonate-bank-label">Đối tác:</span>
                                    <span className="pageDonate-bank-value">{bankInfo.provider}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chọn mệnh giá */}
                    <div className="pageDonate-amount-section">
                        <h3>💰 Chọn Mệnh Giá Ủng Hộ</h3>
                        
                        {/* Mệnh giá định sẵn */}
                        <div className="pageDonate-amount-grid">
                            {predefinedAmounts.map((amount) => (
                                <button
                                    key={amount.value}
                                    className={`pageDonate-amount-btn ${
                                        selectedAmount?.value === amount.value ? 'pageDonate-amount-btn-active' : ''
                                    }`}
                                    onClick={() => handleAmountSelect(amount)}
                                >
                                    <div className="pageDonate-amount-value">{formatCurrency(amount.value)}</div>
                                    <div className="pageDonate-amount-desc">{amount.description}</div>
                                </button>
                            ))}
                        </div>

                        {/* Mệnh giá tùy chỉnh */}
                        <div className="pageDonate-custom-amount">
                            <label htmlFor="pageDonateCustomAmount">💎 Hoặc nhập số tiền khác:</label>
                            <div className="pageDonate-input-group">
                                <input
                                    id="pageDonateCustomAmount"
                                    type="text"
                                    value={customAmount}
                                    onChange={handleCustomAmountChange}
                                    placeholder="Nhập số tiền (VND)"
                                    className="pageDonate-input"
                                />
                                <span className="pageDonate-currency">VND</span>
                            </div>
                            {customAmount && (
                                <div className="pageDonate-amount-preview">
                                    Bạn đang chọn: <strong>{formatCurrency(customAmount)}</strong>
                                </div>
                            )}
                        </div>

                        {/* Mô tả */}
                        <div className="pageDonate-description">
                            <label htmlFor="pageDonateDescription">📝 Lời nhắn (tùy chọn):</label>
                            <input
                                id="pageDonateDescription"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="pageDonate-input"
                                placeholder="Nhập lời nhắn của bạn"
                                maxLength="50"
                            />
                        </div>

                        {/* Nút tạo QR */}
                        <button
                            className="pageDonate-generate-btn"
                            onClick={handleGenerateQR}
                            disabled={loading || (!selectedAmount && !customAmount)}
                        >
                            {loading ? '⏳ Đang tạo...' : '🎯 Tạo Mã QR Thanh Toán'}
                        </button>

                        {/* Nút QR tĩnh */}
                        <button
                            className="pageDonate-static-btn"
                            onClick={handleGetStaticQR}
                            disabled={loading}
                        >
                            📱 Mã QR Tĩnh (Không số tiền)
                        </button>
                    </div>
                </div>

                <div className="pageDonate-right">
                    {/* Hiển thị QR Code */}
                    <div className="pageDonate-qr-section">
                        <h3>📱 Mã QR Thanh Toán</h3>
                        
                        {loading ? (
                            <div className="pageDonate-loading">
                                <div className="pageDonate-spinner"></div>
                                <p>Đang tạo mã QR...</p>
                                <p className="pageDonate-loading-note">
                                    (Đang kết nối với VietQR.io)
                                </p>
                            </div>
                        ) : showStaticQR && staticQR ? (
                            <div className="pageDonate-qr-display">
                                {renderQRImage()}
                                <div className="pageDonate-qr-info">
                                    <p><strong>QR Tĩnh - MBBank via VietQR</strong></p>
                                    <p>Không có số tiền cụ thể</p>
                                    <p className="pageDonate-timestamp">
                                        ⏰ {new Date(staticQR.timestamp).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ) : qrData ? (
                            <div className="pageDonate-qr-display">
                                {renderQRImage()}
                                <div className="pageDonate-qr-info">
                                    <p className="pageDonate-amount-display">
                                        💰 Số tiền: <strong>{formatCurrency(qrData.amount)}</strong>
                                    </p>
                                    <p className="pageDonate-desc-display">
                                        📝 {qrData.description}
                                    </p>
                                    <p className="pageDonate-bank-display">
                                        🏦 {bankInfo?.bank_name || 'MBBank'}
                                    </p>
                                    <p className="pageDonate-timestamp">
                                        ⏰ {new Date(qrData.timestamp).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="pageDonate-qr-placeholder">
                                <div className="pageDonate-qr-icon">📱</div>
                                <p>Chọn mệnh giá và nhấn "Tạo Mã QR" để hiển thị mã QR thanh toán</p>
                                <p className="pageDonate-qr-source">
                                    Mã QR được tạo bởi <strong>VietQR.io</strong>
                                </p>
                            </div>
                        )}

                        {/* Nút hành động */}
                        <div className="pageDonate-qr-actions">
                            {(qrData || staticQR) && (
                                <>
                                    <button
                                        className="pageDonate-action-btn pageDonate-verify-btn"
                                        onClick={handleVerifyQR}
                                        disabled={loading}
                                    >
                                        🔍 Kiểm Tra QR
                                    </button>
                                    <button
                                        className="pageDonate-action-btn pageDonate-download-btn"
                                        onClick={() => {
                                            const qrToDownload = qrData || staticQR;
                                            const qrUrl = qrToDownload.qr_url || qrToDownload.qr_image;
                                            if (qrUrl) {
                                                const link = document.createElement('a');
                                                link.href = qrUrl;
                                                link.download = qrToDownload.filename || 'vietqr_qrcode.png';
                                                link.target = '_blank';
                                                link.click();
                                            }
                                        }}
                                    >
                                        💾 Tải Xuống
                                    </button>
                                    <button
                                        className="pageDonate-action-btn pageDonate-view-btn"
                                        onClick={() => {
                                            const qrToView = qrData || staticQR;
                                            const qrUrl = qrToView.qr_url || qrToView.qr_image;
                                            if (qrUrl) {
                                                window.open(qrUrl, '_blank');
                                            }
                                        }}
                                    >
                                        👁️ Xem Ảnh Gốc
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Hướng dẫn */}
                        <div className="pageDonate-instructions">
                            <h4>📋 Hướng Dẫn Thanh Toán:</h4>
                            <ol>
                                <li>Chọn mệnh giá ủng hộ hoặc nhập số tiền tùy ý</li>
                                <li>Nhấn "Tạo Mã QR Thanh Toán"</li>
                                <li>Mã QR sẽ được tạo bởi VietQR.io</li>
                                <li>Mở ứng dụng Mobile Banking trên điện thoại</li>
                                <li>Chọn tính năng quét mã QR</li>
                                <li>Quét mã QR trên màn hình</li>
                                <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông báo */}
            <div className="pageDonate-notice">
                <p>💝 <strong>Lưu ý:</strong> Mọi giao dịch đều được bảo mật. Bạn chỉ chuyển khoản khi đã kiểm tra kỹ thông tin.</p>
                <p>Mã QR được tạo bởi <strong>VietQR.io</strong> - Dịch vụ mã QR chuẩn Ngân hàng Nhà nước Việt Nam</p>
                <p>Nếu có vấn đề, vui lòng liên hệ qua email: support@example.com</p>
            </div>
        </div>
    );
};

export default PageDonate;
