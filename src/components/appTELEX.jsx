import { useState, useRef } from 'react';

const TelexVietnameseInput = () => {
  const [text, setText] = useState('');
  const [lastInput, setLastInput] = useState('');
  const textareaRef = useRef(null);

  const convertTelexIncremental = (oldText, newText, cursorPos) => {
    // Nếu văn bản bị xóa, không xử lý
    if (newText.length < oldText.length) {
      return newText;
    }

    // Chỉ xử lý ký tự mới được thêm vào
    const addedChars = newText.length - oldText.length;
    if (addedChars <= 0) return newText;

    // Lấy phần văn bản không thay đổi và phần mới
    const unchangedPart = oldText.slice(0, cursorPos - addedChars);
    const newPart = newText.slice(cursorPos - addedChars, cursorPos);
    const afterPart = newText.slice(cursorPos);

    // Kiểm tra 2-3 ký tự trước cursor để áp dụng Telex
    const checkLength = Math.min(10, cursorPos);
    const beforeCheck = newText.slice(Math.max(0, cursorPos - checkLength), cursorPos);
    
    let converted = beforeCheck;
    let replacementMade = false;

    // Định nghĩa các quy tắc Telex theo thứ tự ưu tiên
    const rules = [
      // Quy tắc quay lại (3 ký tự giống nhau)
      { pattern: /([oO])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([aA])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([eE])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([aA])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /([oO])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /([uU])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /ddd$/gi, replace: 'dd', revert: true },
      
      // Quay lại từ ký tự đặc biệt
      { pattern: /âa$/, replace: 'aa', revert: true },
      { pattern: /Âa$/g, replace: 'Aa', revert: true },
      { pattern: /ăw$/g, replace: 'aw', revert: true },
      { pattern: /Ăw$/g, replace: 'Aw', revert: true },
      { pattern: /êe$/g, replace: 'ee', revert: true },
      { pattern: /Êe$/g, replace: 'Ee', revert: true },
      { pattern: /ôo$/g, replace: 'oo', revert: true },
      { pattern: /Ôo$/g, replace: 'Oo', revert: true },
      { pattern: /ơw$/g, replace: 'ow', revert: true },
      { pattern: /Ơw$/g, replace: 'Ow', revert: true },
      { pattern: /ưw$/g, replace: 'uw', revert: true },
      { pattern: /Ưw$/g, replace: 'Uw', revert: true },
      
      // Dấu thanh cho nguyên âm có dấu mũ/móc
      { pattern: /â[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ầ', 's': 'ấ', 'r': 'ẩ', 'x': 'ẫ', 'j': 'ậ' };
        return tones[m[1]];
      }},
      { pattern: /Â[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ầ', 's': 'Ấ', 'r': 'Ẩ', 'x': 'Ẫ', 'j': 'Ậ' };
        return tones[m[1]];
      }},
      { pattern: /ă[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ằ', 's': 'ắ', 'r': 'ẳ', 'x': 'ẵ', 'j': 'ặ' };
        return tones[m[1]];
      }},
      { pattern: /Ă[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ằ', 's': 'Ắ', 'r': 'Ẳ', 'x': 'Ẵ', 'j': 'Ặ' };
        return tones[m[1]];
      }},
      { pattern: /ê[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ề', 's': 'ế', 'r': 'ể', 'x': 'ễ', 'j': 'ệ' };
        return tones[m[1]];
      }},
      { pattern: /Ê[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ề', 's': 'Ế', 'r': 'Ể', 'x': 'Ễ', 'j': 'Ệ' };
        return tones[m[1]];
      }},
      { pattern: /ô[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ồ', 's': 'ố', 'r': 'ổ', 'x': 'ỗ', 'j': 'ộ' };
        return tones[m[1]];
      }},
      { pattern: /Ô[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ồ', 's': 'Ố', 'r': 'Ổ', 'x': 'Ỗ', 'j': 'Ộ' };
        return tones[m[1]];
      }},
      { pattern: /ơ[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ờ', 's': 'ớ', 'r': 'ở', 'x': 'ỡ', 'j': 'ợ' };
        return tones[m[1]];
      }},
      { pattern: /Ơ[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ờ', 's': 'Ớ', 'r': 'Ở', 'x': 'Ỡ', 'j': 'Ợ' };
        return tones[m[1]];
      }},
      { pattern: /ư[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ừ', 's': 'ứ', 'r': 'ử', 'x': 'ữ', 'j': 'ự' };
        return tones[m[1]];
      }},
      { pattern: /Ư[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ừ', 's': 'Ứ', 'r': 'Ử', 'x': 'Ữ', 'j': 'Ự' };
        return tones[m[1]];
      }},
      
      // Dấu mũ và móc
      { pattern: /aa$/, replace: 'â' },
      { pattern: /Aa$/g, replace: 'Â' },
      { pattern: /AA$/g, replace: 'Â' },
      { pattern: /aw$/gi, replace: (m) => m[0] === 'A' ? 'Ă' : 'ă' },
      { pattern: /ee$/, replace: 'ê' },
      { pattern: /Ee$/g, replace: 'Ê' },
      { pattern: /EE$/g, replace: 'Ê' },
      { pattern: /oo$/, replace: 'ô' },
      { pattern: /Oo$/g, replace: 'Ô' },
      { pattern: /OO$/g, replace: 'Ô' },
      { pattern: /ow$/gi, replace: (m) => m[0] === 'O' ? 'Ơ' : 'ơ' },
      { pattern: /uw$/gi, replace: (m) => m[0] === 'U' ? 'Ư' : 'ư' },
      { pattern: /dd$/gi, replace: (m) => m[0] === 'D' ? 'Đ' : 'đ' },
      
      // Dấu thanh cho nguyên âm cơ bản
      { pattern: /a[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'à', 's': 'á', 'r': 'ả', 'x': 'ã', 'j': 'ạ' };
        return tones[m[1]];
      }},
      { pattern: /A[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'À', 's': 'Á', 'r': 'Ả', 'x': 'Ã', 'j': 'Ạ' };
        return tones[m[1]];
      }},
      { pattern: /e[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'è', 's': 'é', 'r': 'ẻ', 'x': 'ẽ', 'j': 'ẹ' };
        return tones[m[1]];
      }},
      { pattern: /E[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'È', 's': 'É', 'r': 'Ẻ', 'x': 'Ẽ', 'j': 'Ẹ' };
        return tones[m[1]];
      }},
      { pattern: /i[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ì', 's': 'í', 'r': 'ỉ', 'x': 'ĩ', 'j': 'ị' };
        return tones[m[1]];
      }},
      { pattern: /I[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ì', 's': 'Í', 'r': 'Ỉ', 'x': 'Ĩ', 'j': 'Ị' };
        return tones[m[1]];
      }},
      { pattern: /o[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ò', 's': 'ó', 'r': 'ỏ', 'x': 'õ', 'j': 'ọ' };
        return tones[m[1]];
      }},
      { pattern: /O[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ò', 's': 'Ó', 'r': 'Ỏ', 'x': 'Õ', 'j': 'Ọ' };
        return tones[m[1]];
      }},
      { pattern: /u[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ù', 's': 'ú', 'r': 'ủ', 'x': 'ũ', 'j': 'ụ' };
        return tones[m[1]];
      }},
      { pattern: /U[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ù', 's': 'Ú', 'r': 'Ủ', 'x': 'Ũ', 'j': 'Ụ' };
        return tones[m[1]];
      }},
      { pattern: /y[fsrxj]$/, replace: (m) => {
        const tones = { 'f': 'ỳ', 's': 'ý', 'r': 'ỷ', 'x': 'ỹ', 'j': 'ỵ' };
        return tones[m[1]];
      }},
      { pattern: /Y[fsrxj]$/g, replace: (m) => {
        const tones = { 'f': 'Ỳ', 's': 'Ý', 'r': 'Ỷ', 'x': 'Ỹ', 'j': 'Ỵ' };
        return tones[m[1]];
      }},
    ];

    // Áp dụng quy tắc đầu tiên khớp
    for (const rule of rules) {
      const match = converted.match(rule.pattern);
      if (match) {
        const replacement = typeof rule.replace === 'function' 
          ? rule.replace(match[0]) 
          : rule.replace;
        converted = converted.replace(rule.pattern, replacement);
        replacementMade = true;
        break;
      }
    }

    // Ghép lại kết quả
    const beforeConverted = newText.slice(0, Math.max(0, cursorPos - checkLength));
    return beforeConverted + converted + afterPart;
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    const converted = convertTelexIncremental(text, newText, cursorPos);
    
    setText(converted);
    setLastInput(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const diff = converted.length - newText.length;
        const newCursorPos = cursorPos + diff;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
      }
    }, 0);
  };

  const handleClear = () => {
    setText('');
    setLastInput('');
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('appTELEXCopyBtn');
      const originalText = btn.textContent;
      btn.textContent = 'Đã sao chép!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi sao chép:', err);
      alert('Không thể sao chép văn bản');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bộ Gõ Tiếng Việt Telex</h1>
        <p style={styles.description}>
          Gõ văn bản theo kiểu Telex - Ví dụ: "xin chao" → "xin chào", "Viet Nam" → "Việt Nam"
        </p>
      </div>

      <div style={styles.guide}>
        <h3 style={styles.guideTitle}>Hướng dẫn sử dụng:</h3>
        <div style={styles.guideGrid}>
          <div style={styles.guideItem}>
            <strong style={styles.guideStrong}>Dấu thanh:</strong> s (sắc), f (huyền), r (hỏi), x (ngã), j (nặng)
          </div>
          <div style={styles.guideItem}>
            <strong style={styles.guideStrong}>Dấu mũ:</strong> aa (â), ee (ê), oo (ô)
          </div>
          <div style={styles.guideItem}>
            <strong style={styles.guideStrong}>Dấu móc:</strong> aw (ă), ow (ơ), uw (ư)
          </div>
          <div style={styles.guideItem}>
            <strong style={styles.guideStrong}>Đ gạch:</strong> dd (đ)
          </div>
        </div>
        <div style={styles.guideTip}>
          💡 <strong>Mẹo:</strong> Gõ thêm lần nữa để quay lại chữ gốc (ví dụ: "tooo" → "tool", "ddd" → "ddd")
        </div>
      </div>

      <div style={styles.main}>
        <textarea
          id="appTELEXTextArea"
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Nhập văn bản tiếng Việt theo kiểu Telex tại đây...&#10;Ví dụ: Tieengs Vieejt&#10;&#10;Gõ 3 lần để quay lại: tooo → tool"
          style={styles.textarea}
        />

        <div style={styles.actions}>
          <button
            id="appTELEXCopyBtn"
            onClick={handleCopy}
            style={{...styles.btn, ...styles.btnCopy, ...(text ? {} : styles.btnDisabled)}}
            disabled={!text}
          >
            📋 Sao chép
          </button>
          <button
            id="appTELEXClearBtn"
            onClick={handleClear}
            style={{...styles.btn, ...styles.btnClear, ...(text ? {} : styles.btnDisabled)}}
            disabled={!text}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      <div style={styles.examples}>
        <h3 style={styles.examplesTitle}>Ví dụ:</h3>
        <ul style={styles.examplesList}>
          <li style={styles.exampleItem}><code style={styles.code}>xin chao</code> → xin chào</li>
          <li style={styles.exampleItem}><code style={styles.code}>Viet Nam</code> → Việt Nam</li>
          <li style={styles.exampleItem}><code style={styles.code}>coos gawsng</code> → cố gắng</li>
          <li style={styles.exampleItem}><code style={styles.code}>hocs taps</code> → học tập</li>
          <li style={styles.exampleItem}><code style={styles.code}>tooo</code> → tool (gõ 3 o)</li>
          <li style={styles.exampleItem}><code style={styles.code}>ddd</code> → ddd (gõ 3 d)</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  description: {
    fontSize: '1.1rem',
    opacity: 0.95,
    lineHeight: 1.6,
  },
  guide: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  guideTitle: {
    color: '#667eea',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  guideGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  guideItem: {
    background: '#f8f9fa',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    borderLeft: '3px solid #667eea',
  },
  guideStrong: {
    color: '#764ba2',
    display: 'block',
    marginBottom: '0.25rem',
  },
  guideTip: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#fff3cd',
    borderRadius: '8px',
    borderLeft: '3px solid #ffc107',
    fontSize: '0.9rem',
    color: '#856404',
  },
  main: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    marginBottom: '2rem',
  },
  textarea: {
    width: '100%',
    minHeight: '300px',
    padding: '1.5rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    resize: 'vertical',
    lineHeight: 1.8,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
    justifyContent: 'center',
  },
  btn: {
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    minWidth: '150px',
    transition: 'all 0.3s ease',
  },
  btnCopy: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  btnClear: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  examples: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  examplesTitle: {
    color: '#667eea',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  examplesList: {
    listStyle: 'none',
    padding: 0,
  },
  exampleItem: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    background: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '1rem',
    borderLeft: '3px solid #764ba2',
  },
  code: {
    background: '#e9ecef',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontFamily: "'Courier New', monospace",
    color: '#764ba2',
    fontWeight: 600,
  },
};

export default TelexVietnameseInput;