import { useState, useRef } from 'react';
import '../css/appTELEX.css';

const TelexVietnameseInput = () => {
  const [text, setText] = useState('');
  const [lastInput, setLastInput] = useState('');
  const textareaRef = useRef(null);

  const convertTelexIncremental = (oldText, newText, cursorPos) => {
    if (newText.length < oldText.length) {
      return newText;
    }

    const addedChars = newText.length - oldText.length;
    if (addedChars <= 0) return newText;

    const unchangedPart = oldText.slice(0, cursorPos - addedChars);
    const newPart = newText.slice(cursorPos - addedChars, cursorPos);
    const afterPart = newText.slice(cursorPos);

    const checkLength = Math.min(10, cursorPos);
    const beforeCheck = newText.slice(Math.max(0, cursorPos - checkLength), cursorPos);
    
    let converted = beforeCheck;
    let replacementMade = false;

    const rules = [
      { pattern: /([oO])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([aA])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([eE])\1\1$/, replace: (m) => m[0] + m[0], revert: true },
      { pattern: /([aA])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /([oO])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /([uU])ww$/gi, replace: (m) => m[0] + 'w', revert: true },
      { pattern: /ddd$/gi, replace: 'dd', revert: true },
      
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
    <div className="telex-container">
      <div className="telex-header">
        <h1>Bộ Gõ Tiếng Việt Telex</h1>
        <p className="telex-description">
          Gõ văn bản theo kiểu Telex - Ví dụ: "xin chao" → "xin chào", "Viet Nam" → "Việt Nam"
        </p>
      </div>

      <div className="telex-guide">
        <h3>Hướng dẫn sử dụng:</h3>
        <div className="guide-grid">
          <div className="guide-item">
            <strong>Dấu thanh:</strong> s (sắc), f (huyền), r (hỏi), x (ngã), j (nặng)
          </div>
          <div className="guide-item">
            <strong>Dấu mũ:</strong> aa (â), ee (ê), oo (ô)
          </div>
          <div className="guide-item">
            <strong>Dấu móc:</strong> aw (ă), ow (ơ), uw (ư)
          </div>
          <div className="guide-item">
            <strong>Đ gạch:</strong> dd (đ)
          </div>
        </div>
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#fff3cd',
          borderRadius: '8px',
          borderLeft: '3px solid #ffc107',
          fontSize: '0.9rem',
          color: '#856404'
        }}>
          💡 <strong>Mẹo:</strong> Gõ thêm lần nữa để quay lại chữ gốc (ví dụ: "tooo" → "tool", "ddd" → "ddd")
        </div>
      </div>

      <div className="telex-main">
        <textarea
          id="appTELEXTextArea"
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Nhập văn bản tiếng Việt theo kiểu Telex tại đây...&#10;Ví dụ: Tieengs Vieejt&#10;&#10;Gõ 3 lần để quay lại: tooo → tool"
          className="telex-textarea"
        />

        <div className="telex-actions">
          <button
            id="appTELEXCopyBtn"
            onClick={handleCopy}
            className="telex-btn telex-btn-copy"
            disabled={!text}
          >
            📋 Sao chép
          </button>
          <button
            id="appTELEXClearBtn"
            onClick={handleClear}
            className="telex-btn telex-btn-clear"
            disabled={!text}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      <div className="telex-examples">
        <h3>Ví dụ:</h3>
        <ul>
          <li><code>xin chao</code> → xin chào</li>
          <li><code>Viet Nam</code> → Việt Nam</li>
          <li><code>coos gawsng</code> → cố gắng</li>
          <li><code>hocs taps</code> → học tập</li>
          <li><code>tooo</code> → tool (gõ 3 o)</li>
          <li><code>ddd</code> → ddd (gõ 3 d)</li>
        </ul>
      </div>
    </div>
  );
};

export default TelexVietnameseInput;