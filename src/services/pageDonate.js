//[file name]: pageDonate.js

/**
 * Donate Service
 * Service để thao tác với các API donate
 */

import { 
    API_ENDPOINTS, 
    SERVER_CONFIG,
    getApiUrl,
    getErrorMessage 
} from "./constants";

class DonateService {
    // 1. Tạo mã QR với số tiền cụ thể (sử dụng VietQR.io)
    static async generateQR(amount, description = 'Ủng hộ dự án') {
        const url = getApiUrl('/donate/generate-qr');
        console.log("Calling generate QR API via VietQR:", url);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description
                }),
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            // Kiểm tra status HTTP trước
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`
                };
            }

            const data = await response.json();
            console.log("Generate QR response:", data);
            
            // Kiểm tra response từ server
            if (!data.success) {
                return {
                    success: false,
                    error: data.error || 'Không thể tạo mã QR',
                    data: data
                };
            }

            // Trả về định dạng chuẩn cho React component
            return {
                success: true,
                qr_url: data.qr_url,
                qr_image: data.qr_image || data.qr_url, // Sử dụng qr_url từ VietQR
                qr_string: data.qr_string,
                filename: data.filename || `qr_${amount}_${Date.now()}.png`,
                timestamp: data.timestamp || new Date().toISOString(),
                amount: data.amount || amount,
                description: data.description || description,
                message: 'QR generated successfully via VietQR'
            };
        }
        catch (error) {
            console.error('Generate QR error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.'
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // 2. Lấy mã QR tĩnh (không có số tiền) từ VietQR
    static async getStaticQR() {
        const url = getApiUrl('/donate/static-qr');
        console.log("Calling static QR API via VietQR:", url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            // Kiểm tra status HTTP trước
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`
                };
            }

            const data = await response.json();
            console.log("Static QR response:", data);
            
            // Kiểm tra response từ server
            if (!data.success) {
                return {
                    success: false,
                    error: data.error || 'Không thể tạo mã QR tĩnh',
                    data: data
                };
            }

            // Trả về định dạng chuẩn cho React component
            return {
                success: true,
                qr_url: data.qr_url,
                qr_image: data.qr_image || data.qr_url,
                qr_string: data.qr_string,
                filename: data.filename || `qr_static_${Date.now()}.png`,
                timestamp: data.timestamp || new Date().toISOString(),
                message: 'Static QR fetched successfully via VietQR'
            };
        }
        catch (error) {
            console.error('Get static QR error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.'
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // 3. Kiểm tra tính hợp lệ của mã QR (cho VietQR)
    static async verifyQR(qrString) {
        // Với VietQR, chúng ta có thể kiểm tra định dạng chuỗi
        const url = getApiUrl('/donate/verify-qr');
        console.log("Calling verify QR API:", url);
        
        try {
            // Kiểm tra cơ bản định dạng VietQR string
            if (!qrString) {
                return {
                    success: false,
                    error: 'Chuỗi QR không hợp lệ'
                };
            }

            // Kiểm tra định dạng (cho VietQR)
            const parts = qrString.split('|');
            let isValid = false;
            let crc = 'N/A';
            let length = qrString.length;

            // Simple validation for VietQR format
            if (parts.length >= 2) {
                isValid = true;
                crc = this.calculateSimpleCRC(qrString);
            }

            return {
                success: true,
                valid: isValid,
                crc: crc,
                length: length,
                message: 'QR verification completed'
            };
        }
        catch (error) {
            console.error('Verify QR error:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // 4. Lấy thông tin ngân hàng từ backend
    static async getBankInfo() {
        const url = getApiUrl('/donate/bank-info');
        console.log("Calling bank info API:", url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            // Kiểm tra status HTTP trước
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`
                };
            }

            const data = await response.json();
            console.log("Bank info response:", data);
            
            // Kiểm tra response từ server
            if (!data.success) {
                return {
                    success: false,
                    error: data.error || 'Không thể lấy thông tin ngân hàng',
                    data: data
                };
            }

            return {
                success: true,
                bank_info: data.bank_info,
                message: 'Bank info fetched successfully'
            };
        }
        catch (error) {
            console.error('Get bank info error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.'
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // 5. Lấy danh sách mệnh giá định sẵn từ backend
    static async getPredefinedAmounts() {
        const url = getApiUrl('/donate/predefined-amounts');
        console.log("Calling predefined amounts API:", url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            // Kiểm tra status HTTP trước
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`
                };
            }

            const data = await response.json();
            console.log("Predefined amounts response:", data);
            
            // Kiểm tra response từ server
            if (!data.success) {
                return {
                    success: false,
                    error: data.error || 'Không thể lấy danh sách mệnh giá',
                    data: data
                };
            }

            return {
                success: true,
                amounts: data.amounts || [],
                currency: data.currency || 'VND',
                default_amount: data.default_amount || 50000,
                message: 'Predefined amounts fetched successfully'
            };
        }
        catch (error) {
            console.error('Get predefined amounts error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.'
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // 6. Kiểm tra kết nối API (optional)
    static async testConnection() {
        const url = getApiUrl('/donate/test-vietqr');
        console.log("Calling test VietQR connection API:", url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(SERVER_CONFIG.TIMEOUT)
            });

            // Kiểm tra status HTTP trước
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`
                };
            }

            const data = await response.json();
            console.log("Test VietQR connection response:", data);
            
            return {
                success: true,
                data: data,
                message: data.message || 'VietQR service connection successful'
            };
        }
        catch (error) {
            console.error('Test VietQR connection error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.'
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.'
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    // Helper: Tính CRC đơn giản cho chuỗi QR
    static calculateSimpleCRC(str) {
        let crc = 0;
        for (let i = 0; i < str.length; i++) {
            crc = (crc + str.charCodeAt(i)) % 256;
        }
        return crc.toString(16).toUpperCase().padStart(2, '0');
    }
}

// Hook cho React components
export const useDonateService = () => {
    return {
        getBankInfo: DonateService.getBankInfo,
        getPredefinedAmounts: DonateService.getPredefinedAmounts,
        generateQR: DonateService.generateQR,
        getStaticQR: DonateService.getStaticQR,
        verifyQR: DonateService.verifyQR,
        testConnection: DonateService.testConnection
    };
};

export default DonateService;
