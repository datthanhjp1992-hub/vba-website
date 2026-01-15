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
    // 1. Tạo mã QR với số tiền cụ thể
    static async generateQR(amount, description = 'Donate') {
        const url = getApiUrl('/donate/generate-qr');
        console.log("Calling generate QR API:", url);
        
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
                    error: data.error || 'Something went wrong',
                    data: data
                };
            }

            return {
                success: true,
                data: data,
                qr_image: data.qr_image,
                qr_string: data.qr_string,
                filename: data.filename,
                timestamp: data.timestamp,
                amount: data.amount,
                description: data.description,
                message: 'QR generated successfully'
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

    // 2. Lấy mã QR tĩnh (không có số tiền)
    static async getStaticQR() {
        const url = getApiUrl('/donate/static-qr');
        console.log("Calling static QR API:", url);
        
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
                    error: data.error || 'Something went wrong',
                    data: data
                };
            }

            return {
                success: true,
                data: data,
                qr_image: data.qr_image,
                qr_string: data.qr_string,
                filename: data.filename,
                timestamp: data.timestamp,
                message: 'Static QR fetched successfully'
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

    // 3. Kiểm tra tính hợp lệ của mã QR
    static async verifyQR(qrString) {
        const url = getApiUrl('/donate/verify-qr');
        console.log("Calling verify QR API:", url);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ qr_string: qrString }),
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
            console.log("Verify QR response:", data);
            
            // Kiểm tra response từ server
            if (!data.success) {
                return {
                    success: false,
                    error: data.error || 'Something went wrong',
                    data: data
                };
            }

            return {
                success: true,
                data: data,
                valid: data.valid || false,
                crc: data.crc,
                length: data.length,
                message: 'QR verification completed'
            };
        }
        catch (error) {
            console.error('Verify QR error:', error);
            
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

    // 4. Lấy thông tin ngân hàng
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
                    error: data.error || 'Something went wrong',
                    data: data
                };
            }

            return {
                success: true,
                data: data,
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

    // 5. Lấy danh sách mệnh giá định sẵn
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
                    error: data.error || 'Something went wrong',
                    data: data
                };
            }

            return {
                success: true,
                data: data,
                amounts: data.amounts || [],
                currency: data.currency || 'VND',
                default_amount: data.default_amount,
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
        const url = getApiUrl('/donate/test');
        console.log("Calling test connection API:", url);
        
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
            console.log("Test connection response:", data);
            
            return {
                success: true,
                data: data,
                message: data.message || 'Test connection successful'
            };
        }
        catch (error) {
            console.error('Test connection error:', error);
            
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