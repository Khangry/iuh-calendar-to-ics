// utils.js

/**
 * Lấy ngày Thứ Hai gần nhất trước hoặc bằng ngày được cung cấp.
 * @param {Date} date - Ngày đầu vào.
 * @returns {Date} - Đối tượng Date đại diện cho ngày Thứ Hai.
 */
function getPreviousMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh để luôn lùi về Thứ Hai
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Đặt về đầu ngày để nhất quán
  return d;
}

/**
 * Định dạng một đối tượng Date thành chuỗi "DD/MM/YYYY".
 * @param {Date} date - Ngày cần định dạng.
 * @returns {string} - Chuỗi ngày đã được định dạng.
 */
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = {
  getPreviousMonday,
  formatDate,
};