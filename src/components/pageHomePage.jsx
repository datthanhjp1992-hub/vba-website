import React from 'react';
import '../css/pageHomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">Chào mừng đến với VBA-er!</h1>
          <p className="hero-subtitle">Nền tảng chia sẻ kiến thức VBA miễn phí</p>
        </div>

        <div className="content-section">
          <div className="intro-card">
            <h2>VBA là gì?</h2>
            <p>
              VBA (Visual Basic for Applications) là ngôn ngữ lập trình được tích hợp sẵn 
              trong các ứng dụng Microsoft Office như Excel, Word, PowerPoint, và Access.
            </p>
            <p>
              VBA cho phép bạn tự động hóa các tác vụ, tạo các chức năng tùy chỉnh, 
              và xây dựng các ứng dụng nhỏ ngay trong môi trường Office.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Tự động hóa</h3>
              <p>Giảm thiểu thao tác thủ công, tiết kiệm thời gian với macro</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Tùy chỉnh</h3>
              <p>Tạo các công cụ và hàm riêng phục vụ cho công việc cụ thể</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Xử lý dữ liệu</h3>
              <p>Xử lý số lượng lớn dữ liệu một cách nhanh chóng và chính xác</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Ứng dụng thực tế</h3>
              <p>Ứng dụng trong kế toán, phân tích dữ liệu, báo cáo tự động</p>
            </div>
          </div>

          <div className="why-learn">
            <h2>Tại sao nên học VBA?</h2>
            <ul>
              <li>✅ <strong>Dễ học, dễ sử dụng</strong> - Dựa trên ngôn ngữ Basic quen thuộc</li>
              <li>✅ <strong>Tích hợp sẵn</strong> - Không cần cài đặt phần mềm bổ sung</li>
              <li>✅ <strong>Ứng dụng rộng rãi</strong> - Sử dụng trong hầu hết các ngành nghề văn phòng</li>
              <li>✅ <strong>Tiết kiệm thời gian</strong> - Tự động hóa các công việc lặp đi lặp lại</li>
              <li>✅ <strong>Tăng hiệu suất</strong> - Xử lý công việc nhanh gấp nhiều lần</li>
            </ul>
          </div>

          <div className="get-started">
            <h2>Bắt đầu học VBA</h2>
            <p>
              Để bắt đầu với VBA, bạn chỉ cần:
            </p>
            <ol>
              <li>Mở ứng dụng Office (Excel, Word...)</li>
              <li>Nhấn <code>ALT + F11</code> để mở cửa sổ VBA Editor</li>
              <li>Bắt đầu viết code đơn giản</li>
            </ol>
            <div className="code-example">
              <p>Ví dụ: Hiển thị hộp thoại chào mừng</p>
              <pre>
{`Sub ChaoMung()
    MsgBox "Chào mừng đến với VBA!"
End Sub`}
              </pre>
            </div>
          </div>

          <div className="resources">
            <h2>Tài nguyên học tập</h2>
            <p>Trang web này cung cấp:</p>
            <ul>
              <li>📖 Bài học VBA từ cơ bản đến nâng cao</li>
              <li>💡 Ví dụ thực tế áp dụng trong công việc</li>
              <li>🔧 Macro mẫu để tham khảo và sử dụng</li>
              <li>❓ Hướng dẫn giải quyết các vấn đề thường gặp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;