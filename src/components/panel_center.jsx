import React from 'react';
import '../css/panel_center.css';

const CenterPanel = () => {
  const articles = [
    {
      id: 1,
      title: 'Giới thiệu về React',
      content: 'React là một thư viện JavaScript phổ biến cho việc xây dựng giao diện người dùng...',
      date: '2024-01-15',
      author: 'Admin'
    },
    {
      id: 2,
      title: 'Hướng dẫn sử dụng Vite',
      content: 'Vite là một build tool hiện đại giúp phát triển web nhanh chóng và hiệu quả...',
      date: '2024-01-14',
      author: 'Người dùng'
    },
    {
      id: 3,
      title: 'Best Practices trong React',
      content: 'Bài viết này sẽ chia sẻ những best practices khi phát triển ứng dụng với React...',
      date: '2024-01-13',
      author: 'Chuyên gia'
    }
  ];

  return (
    <main className="center-panel">
      <div className="content-header">
        <h2>Nội dung chính</h2>
        <p>Chào mừng bạn đến với trang web của chúng tôi</p>
      </div>
      
      <div className="articles-list">
        {articles.map(article => (
          <article key={article.id} className="article-card">
            <h3>{article.title}</h3>
            <div className="article-meta">
              <span className="date">📅 {article.date}</span>
              <span className="author">👤 {article.author}</span>
            </div>
            <p>{article.content}</p>
            <button className="read-more">Đọc thêm</button>
          </article>
        ))}
      </div>
      
      <div className="pagination">
        <button className="prev-btn">Trang trước</button>
        <span className="page-numbers">Trang 1 / 5</span>
        <button className="next-btn">Trang sau</button>
      </div>
    </main>
  );
};

export default CenterPanel;