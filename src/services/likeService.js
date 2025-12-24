/**
 * Like Service
 * Service để thao tác với like của bài viết
 */

import { API_ENDPOINTS, 
    SERVER_CONFIG,
    getApiUrl,
    getErrorMessage} 
  from "./constants";

class LikeService {
    // Check like
    static async getCheckLike(userID, functID){
    const url = `${getApiUrl(API_ENDPOINTS.LIKESERVICE.CHECK_LIKE)}/${userID}/${functID}`;
    console.log("Calling check like API:", url);
    
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
                error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`,
                has_like: false
            };
        }

        const data = await response.json();
        console.log("API Response data:", data);
        
        // Kiểm tra response từ server
        if (!data.success) {
            return {
                success: false,
                error: data.message || 'Something went wrong',
                has_like: false,
                data: data.data
            };
        }

        return {
            success: true,
            has_like: data.has_like || false,
            data: data.data || {},
            message: data.message || ''
        };
    }
    catch (error) {
        console.error('Get check like error:', error);
        
        if (error.name === 'TimeoutError') {
            return {
                success: false,
                error: 'Request timeout. Vui lòng thử lại sau.',
                has_like: false
            };
        }
        
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request was aborted.',
                has_like: false
            };
        }
        
        return {
            success: false,
            error: error.message || 'Network error occurred',
            has_like: false
        };
    }
    }

    // Toggle like status
    static async toggleLike(userID, functID) {
    const url = `${getApiUrl(API_ENDPOINTS.LIKESERVICE.TOOGLE_LIKE_STATUS)}/${userID}/${functID}`;
    //console.log("Calling toggle like API:", url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
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
                error: `HTTP ${response.status}: ${getErrorMessage(response.status) || 'Request failed'}`,
                has_like: false
            };
        }

        const data = await response.json();
        console.log("Toggle like response:", data);
        
        // Kiểm tra response từ server
        if (!data.success) {
            return {
                success: false,
                error: data.message || 'Something went wrong',
                has_like: false,
                data: data.data
            };
        }

        return {
            success: true,
            has_like: data.has_like || false,
            data: data.data || {},
            message: data.message || ''
        };
    }
    catch (error) {
        console.error('Toggle like error:', error);
        
        if (error.name === 'TimeoutError') {
            return {
                success: false,
                error: 'Request timeout. Vui lòng thử lại sau.',
                has_like: false
            };
        }
        
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request was aborted.',
                has_like: false
            };
        }
        
        return {
            success: false,
            error: error.message || 'Network error occurred',
            has_like: false
        };
    }
    }

    // Get totals like
    static async getTotalLike(functID){
        const url = `${getApiUrl(API_ENDPOINTS.LIKESERVICE.FUNCTION_LIKE_TOTAL)}/${functID}`;
        try{

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
                console.error('Request Failed!');
                return {
                    success: false,
                    error: 'Request Failed',
                    count: 0
                };
            } else {

                const data = await response.json();
                console.log(data);
                return {
                    success: data.success,
                    error: '',
                    count: data.count || 0,
                    data: data.data || []
                };
            }
            

        }catch (error) {
            console.error('Get total like error:', error);
            
            if (error.name === 'TimeoutError') {
                return {
                    success: false,
                    error: 'Request timeout. Vui lòng thử lại sau.',
                    has_like: false
                };
            }
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request was aborted.',
                    has_like: false
                };
            }
            
            return {
                success: false,
                error: error.message || 'Network error occurred',
                has_like: false
            };
        }
    }
}

export default LikeService;