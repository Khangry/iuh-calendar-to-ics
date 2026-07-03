const $ = (id) => document.getElementById(id);

function showError(msg) {
  const el = $('error');
  el.textContent = msg;
  el.classList.add('show');
}
function hideError() {
  $('error').classList.remove('show');
}
function flashCopied() {
  const el = $('copied');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}
function copy(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    flashCopied();
    if (btn) {
      const old = btn.textContent;
      btn.textContent = 'Đã copy';
      setTimeout(() => (btn.textContent = old), 1500);
    }
  });
}

function setLoading(on) {
  const btn = $('submitBtn');
  btn.classList.toggle('loading', on);
  btn.disabled = on;
  btn.querySelector('.btn-label').textContent = on
    ? 'Đang đăng nhập...'
    : 'Tạo link lịch';
}

// Ẩn/hiện mật khẩu
$('togglePw').addEventListener('click', () => {
  const input = $('password');
  const btn = $('togglePw');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Ẩn' : 'Hiện';
  btn.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
});

async function handleSubmit(e) {
  e.preventDefault();
  hideError();
  $('result').hidden = true;

  const mssv = $('mssv').value.trim();
  const password = $('password').value;
  if (!mssv || !password) {
    showError('Vui lòng nhập MSSV và mật khẩu.');
    return;
  }

  setLoading(true);
  try {
    const res = await fetch('/api/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mssv, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra.');

    $('greeting').textContent = data.name
      ? `Xin chào ${data.name}! Link lịch đã sẵn sàng.`
      : 'Link lịch đã sẵn sàng.';

    const webcal = $('webcalLink');
    webcal.href = data.webcalUrl;
    $('httpsLink').value = data.httpsUrl;
    $('copyHttps').onclick = () => copy(data.httpsUrl, $('copyHttps'));

    $('result').hidden = false;
    $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

$('linkForm').addEventListener('submit', handleSubmit);
