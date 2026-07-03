const $ = (id) => document.getElementById(id);

function showError(msg) {
  const el = $('error');
  el.textContent = msg;
  el.style.display = 'block';
}
function hideError() {
  $('error').style.display = 'none';
}
function flashCopied() {
  const el = $('copied');
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 2000);
}
function copy(text) {
  navigator.clipboard.writeText(text).then(flashCopied);
}

async function handleSubmit(e) {
  e.preventDefault();
  hideError();
  $('result').style.display = 'none';

  const mssv = $('mssv').value.trim();
  const password = $('password').value;
  if (!mssv || !password) {
    showError('Vui lòng nhập MSSV và mật khẩu.');
    return;
  }

  const btn = $('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Đang đăng nhập...';
  try {
    const res = await fetch('/api/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mssv, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Có lỗi xảy ra.');
    }

    $('greeting').textContent = data.name
      ? `Xin chào ${data.name}! Link lịch của bạn đã sẵn sàng.`
      : 'Link lịch của bạn đã sẵn sàng.';

    const webcal = $('webcalLink');
    webcal.href = data.webcalUrl;
    webcal.textContent = data.webcalUrl;
    $('httpsLink').value = data.httpsUrl;

    $('copyWebcal').onclick = () => copy(data.webcalUrl);
    $('copyHttps').onclick = () => copy(data.httpsUrl);

    $('result').style.display = 'block';
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Tạo link lịch';
  }
}

$('linkForm').addEventListener('submit', handleSubmit);
