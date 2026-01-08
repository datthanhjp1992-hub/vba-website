/**
 * Service để lấy dữ liệu thời tiết
 * Sử dụng API miễn phí của Open-Meteo không cần API key
 */

/**
 * Lấy dữ liệu thời tiết từ Open-Meteo API
 * @param {number} latitude - Vĩ độ
 * @param {number} longitude - Kinh độ
 * @returns {Promise<object>} - Dữ liệu thời tiết
 */
export const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.current) {
        throw new Error('Invalid weather data received');
      }
  
      // Chuyển đổi mã thời tiết thành mô tả
      const weatherDescription = getWeatherDescription(data.current.weather_code);
      
      return {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code,
        description: weatherDescription,
        timestamp: data.current.time
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  };
  
  /**
   * Lấy tên địa điểm từ tọa độ (sử dụng Nominatim API miễn phí)
   * @param {number} latitude - Vĩ độ
   * @param {number} longitude - Kinh độ
   * @returns {Promise<string>} - Tên địa điểm
   */
  export const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=vi`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.address) {
        // Ưu tiên hiển thị thành phố/tỉnh
        if (data.address.city) {
          return `${data.address.city}, ${data.address.country}`;
        } else if (data.address.town) {
          return `${data.address.town}, ${data.address.country}`;
        } else if (data.address.village) {
          return `${data.address.village}, ${data.address.country}`;
        } else if (data.address.state) {
          return `${data.address.state}, ${data.address.country}`;
        }
      }
      
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    } catch (error) {
      console.error('Error fetching location name:', error);
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    }
  };
  
  /**
   * Chuyển đổi mã thời tiết thành mô tả tiếng Việt
   * @param {number} code - Mã thời tiết từ API
   * @returns {string} - Mô tả thời tiết
   */
  const getWeatherDescription = (code) => {
    const weatherMap = {
      0: 'Trời quang đãng',
      1: 'Chủ yếu quang đãng',
      2: 'Có mây rải rác',
      3: 'U ám',
      45: 'Sương mù',
      48: 'Sương mù đóng băng',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn vừa',
      55: 'Mưa phùn dày đặc',
      56: 'Mưa phùn nhẹ đóng băng',
      57: 'Mưa phùn dày đặc đóng băng',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa to',
      66: 'Mưa đá nhẹ',
      67: 'Mưa đá nặng',
      71: 'Tuyết rơi nhẹ',
      73: 'Tuyết rơi vừa',
      75: 'Tuyết rơi nặng',
      77: 'Hạt tuyết',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào vừa',
      82: 'Mưa rào nặng',
      85: 'Tuyết rơi rải rác',
      86: 'Tuyết rơi dày đặc',
      95: 'Giông bão',
      96: 'Giông bão với mưa đá nhẹ',
      99: 'Giông bão với mưa đá nặng'
    };
    
    return weatherMap[code] || 'Điều kiện thời tiết bình thường';
  };
  
  /**
   * Hàm utility để định dạng ngày tháng
   * @param {string} dateString - Chuỗi ngày tháng
   * @returns {string} - Ngày tháng đã định dạng
   */
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Chuyển đổi hướng gió từ độ sang hướng
   * @param {number} degrees - Độ
   * @returns {string} - Hướng gió
   */
  export const getWindDirection = (degrees) => {
    const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };