import React, { useState, useEffect } from 'react';
import '../css/componentWeather.css';
import { fetchWeatherData, getLocationName } from '../services/componentWeather';

const ComponentWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        
        // Lấy vị trí hiện tại
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        // Lấy tên địa điểm
        const locationName = await getLocationName(latitude, longitude);
        setLocation(locationName);
        
        // Lấy dữ liệu thời tiết
        const data = await fetchWeatherData(latitude, longitude);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Không thể lấy thông tin thời tiết. Vui lòng kiểm tra kết nối và cho phép quyền truy cập vị trí.');
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      getWeather();
    } else {
      setError('Trình duyệt không hỗ trợ định vị địa lý');
      setLoading(false);
    }
  }, []);

  const getWeatherIcon = (code) => {
    const iconMap = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '⛈️', // Heavy rain
      71: '❄️', // Slight snow
      73: '❄️', // Moderate snow
      75: '❄️', // Heavy snow
      80: '🌦️', // Slight rain showers
      81: '🌦️', // Moderate rain showers
      82: '⛈️', // Violent rain showers
      85: '🌨️', // Slight snow showers
      86: '🌨️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with slight hail
      99: '⛈️', // Thunderstorm with heavy hail
    };
    
    return iconMap[code] || '🌡️';
  };

  const getTemperatureColor = (temp) => {
    if (temp <= 0) return '#4dabf7'; // Lạnh
    if (temp <= 10) return '#74c0fc'; // Mát
    if (temp <= 25) return '#40c057'; // Ấm
    if (temp <= 35) return '#ff922b'; // Nóng
    return '#fa5252'; // Rất nóng
  };

  if (loading) {
    return (
      <div id="comWeather-container" className="comWeather-container">
        <div id="comWeather-loading" className="comWeather-loading">
          <div className="comWeather-spinner"></div>
          <p>Đang tải dữ liệu thời tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="comWeather-container" className="comWeather-container">
        <div id="comWeather-error" className="comWeather-error">
          <p>⚠️ {error}</p>
          <button 
            id="comWeather-retry-btn"
            className="comWeather-retry-btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div id="comWeather-container" className="comWeather-container">
      <div id="comWeather-card" className="comWeather-card">
        <div id="comWeather-header" className="comWeather-header">
          <h2 id="comWeather-title" className="comWeather-title">
            Thời tiết hiện tại
          </h2>
          {location && (
            <p id="comWeather-location" className="comWeather-location">
              📍 {location}
            </p>
          )}
        </div>

        <div id="comWeather-content" className="comWeather-content">
          <div id="comWeather-main" className="comWeather-main">
            <div id="comWeather-temp" className="comWeather-temp">
              <span 
                id="comWeather-temp-value"
                className="comWeather-temp-value"
                style={{ color: getTemperatureColor(weatherData.temperature) }}
              >
                {Math.round(weatherData.temperature)}°C
              </span>
              <span id="comWeather-icon" className="comWeather-icon">
                {getWeatherIcon(weatherData.weatherCode)}
              </span>
            </div>
            <p id="comWeather-description" className="comWeather-description">
              {weatherData.description}
            </p>
          </div>

          <div id="comWeather-details" className="comWeather-details">
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">🌡️ Cảm giác như</span>
              <span id="comWeather-apparent-temp" className="comWeather-detail-value">
                {Math.round(weatherData.apparentTemperature)}°C
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">💧 Độ ẩm</span>
              <span id="comWeather-humidity" className="comWeather-detail-value">
                {weatherData.humidity}%
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">💨 Tốc độ gió</span>
              <span id="comWeather-wind-speed" className="comWeather-detail-value">
                {Math.round(weatherData.windSpeed)} km/h
              </span>
            </div>
            
            <div id="comWeather-detail-item" className="comWeather-detail-item">
              <span className="comWeather-detail-label">🧭 Hướng gió</span>
              <span id="comWeather-wind-direction" className="comWeather-detail-value">
                {weatherData.windDirection}°
              </span>
            </div>
          </div>
        </div>

        <div id="comWeather-footer" className="comWeather-footer">
          <p id="comWeather-updated" className="comWeather-updated">
            Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
          </p>
          <button 
            id="comWeather-refresh-btn"
            className="comWeather-refresh-btn"
            onClick={() => window.location.reload()}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentWeather;