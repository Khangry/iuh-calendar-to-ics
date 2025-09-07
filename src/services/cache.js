// Simple in-memory cache for serverless environments (e.g. Vercel)

const cache = new Map();

/**
 * Tạo key duy nhất cho mỗi lần tra cứu dựa trên tham số truyền vào
 * @param {string} k - mã sinh viên hoặc thông tin tra cứu
 * @param {string[]} mondayDates - danh sách các ngày thứ 2
 * @returns {string}
 */
function makeCacheKey(k, mondayDates) {
  return `${k}:${mondayDates.join(',')}`;
}

/**
 * Lưu dữ liệu vào cache
 * @param {string} k
 * @param {string[]} mondayDates
 * @param {any} data
 */
export function setCache(k, mondayDates, data) {
  const key = makeCacheKey(k, mondayDates);
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Lấy dữ liệu từ cache nếu có
 * @param {string} k
 * @param {string[]} mondayDates
 * @param {number} maxAgeMs - thời gian tối đa dữ liệu còn hợp lệ (ms)
 * @returns {any|null}
 */
export function getCache(k, mondayDates, maxAgeMs = 12 * 60 * 60 * 1000) {
  const key = makeCacheKey(k, mondayDates);
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > maxAgeMs) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}
