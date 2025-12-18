import React from 'react';
import '../css/panel_right.css';

const RightPanel = () => {
  const advertisements = [
    {
      id: 1,
      title: 'Khóa học ReactJS',
      description: 'Học ReactJS từ cơ bản đến nâng cao',
      image: 'https://via.placeholder.com/300x150/3498db/ffffff?text=React+Course',
      link: '#'
    },
    {
      id: 2,
      title: 'Sách JavaScript',
      description: 'Bộ sách JavaScript đầy đủ nhất',
      image: 'https://via.placeholder.com/300x150/e74c3c/ffffff?text=JS+Book',
      link: '#'
    },
    {
      id: 3,
      title: 'Dịch vụ Hosting',
      description: 'Hosting chất lượng cao, giá tốt',
      image: 'https://via.placeholder.com/300x150/2ecc71/ffffff?text=Hosting',
      link: '#'
    }
  ];

  const trendingPosts = [
    { id: 1, title: '10 Tips học React hiệu quả', views: 1245 },
    { id: 2, title: 'State vs Props trong React', views: 987 },
    { id: 3, title: 'Hooks là gì?', views: 856 },
    { id: 4, title: 'Context API', views: 723 },
    { id: 5, title: 'Performance Optimization', views: 645 }
  ];

  return (
    <aside className="right-panel">
      <div className="trending-posts">
        <h3>Bài viết nổi bật</h3>
        <ul>
          {trendingPosts.map(post => (
            <li key={post.id} className="trending-item">
              <a href={`/post/${post.id}`} className="trending-link">
                <span className="trending-title">{post.title}</span>
                <span className="trending-views">👁 {post.views} lượt xem</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="newsletter">
        <h3>Đăng ký nhận tin</h3>
        <p>Nhận thông tin mới nhất về công nghệ</p>
        <form className="newsletter-form">
          <input 
            type="email" 
            placeholder="Nhập email của bạn"
            required
          />
          <button type="submit">Đăng ký</button>
        </form>
      </div>
    </aside>
  );
};

export default RightPanel;