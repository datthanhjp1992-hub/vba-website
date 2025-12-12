
//[file name]: connection_service.js
//[file content begin]
/**
 * Service để kiểm tra kết nối đến server
 */

import {
    SERVER_CONFIG,
    CONNECTION_TEST,
    getApiUrl
} from './constants';

class ConnectionService {
    /**
     * Kiểm tra kết nối cơ bản
     * @returns {Promise} Promise với kết quả kiểm tra
     */
    static async testConnection() {
        try {
            const url = getApiUrl(CONNECTION_TEST.TEST_ENDPOINT);

            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(CONNECTION_TEST.TIMEOUT)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();
            return {
                success: true,
                status: response.status,
                message: text.trim(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Test connection error:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Kiểm tra health check chi tiết
     * @returns {Promise} Promise với thông tin health
     */
    static async healthCheck() {
        try {
            const url = getApiUrl(CONNECTION_TEST.HEALTH_ENDPOINT);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(CONNECTION_TEST.TIMEOUT)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                status: response.status,
                data: data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Health check error:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Kiểm tra kết nối toàn diện
     * @returns {Promise} Promise với tất cả thông tin kết nối
     */
    static async comprehensiveCheck() {
        try {
            // Thực hiện cả 2 kiểm tra song song
            const [testResult, healthResult] = await Promise.allSettled([
                this.testConnection(),
                this.healthCheck()
            ]);

            const results = {
                basicTest: testResult.status === 'fulfilled' ? testResult.value : testResult.reason,
                healthCheck: healthResult.status === 'fulfilled' ? healthResult.value : healthResult.reason,
                timestamp: new Date().toISOString(),
                serverUrl: SERVER_CONFIG.BASE_URL
            };

            // Xác định trạng thái tổng thể
            const basicOk = testResult.status === 'fulfilled' && testResult.value.success;
            const healthOk = healthResult.status === 'fulfilled' && healthResult.value.success;
            
            results.overallStatus = basicOk && healthOk ? 'healthy' : 'unhealthy';
            results.connected = basicOk && healthOk;

            return results;
        } catch (error) {
            console.error('Comprehensive check error:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                connected: false,
                overallStatus: 'error'
            };
        }
    }

    /**
     * Bắt đầu kiểm tra định kỳ
     * @param {Function} callback - Hàm callback khi có kết quả
     * @param {number} interval - Khoảng thời gian (ms)
     * @returns {Object} Đối tượng điều khiển (có thể dừng)
     */
    static startPeriodicCheck(callback, interval = CONNECTION_TEST.INTERVAL) {
        let isRunning = true;
        let timeoutId = null;

        const executeCheck = async () => {
            if (!isRunning) return;

            try {
                const result = await this.comprehensiveCheck();
                callback(result);
            } catch (error) {
                callback({
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    connected: false
                });
            }

            if (isRunning) {
                timeoutId = setTimeout(executeCheck, interval);
            }
        };

        // Bắt đầu kiểm tra ngay lập tức
        executeCheck();

        // Trả về đối tượng để có thể dừng
        return {
            stop: () => {
                isRunning = false;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            },
            restart: (newInterval) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                executeCheck();
            }
        };
    }

    /**
     * Kiểm tra kết nối một lần
     * @returns {Promise} Promise với kết quả đơn giản
     */
    static async quickCheck() {
        try {
            const result = await this.testConnection();
            return {
                connected: result.success,
                message: result.message || 'Unknown',
                timestamp: result.timestamp
            };
        } catch (error) {
            return {
                connected: false,
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default ConnectionService;
//[file content end]