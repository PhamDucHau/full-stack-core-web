# Secrets cần cấu hình cho CI/CD

Vào **Settings → Secrets and variables → Actions** của repo GitHub, thêm các secret sau:

| Secret | Mô tả |
|--------|--------|
| `DOCKER_USERNAME` | Tên đăng nhập Docker Hub |
| `DOCKER_PASSWORD` | Mật khẩu hoặc Access Token Docker Hub |
| `VPS_HOST` | IP hoặc domain VPS (ví dụ: `103.82.38.96`) |
| `VPS_USERNAME` | User SSH (ví dụ: `root`) |
| `VPS_PASSWORD` | Mật khẩu SSH (hoặc dùng `VPS_KEY` với ssh key thay cho password) |
| `MONGODB_URI` | Chuỗi kết nối MongoDB (ví dụ: `mongodb://user:pass@host:27017/core-web-cms?authSource=admin`) |
| `JWT_SECRET` | Secret dùng cho JWT |
| `FRONTEND_URL` | URL frontend (ví dụ: `https://yourdomain.com` hoặc `http://IP:3000`) |
| `NEXT_PUBLIC_API_URL` | URL API mà trình duyệt gọi (ví dụ: `https://api.yourdomain.com` hoặc `http://IP:3066`) — **dùng khi build frontend** |

**Lưu ý:** Nếu dùng SSH key thay mật khẩu, trong `deploy.yml` đổi `password: ${{ secrets.VPS_PASSWORD }}` thành `key: ${{ secrets.VPS_KEY }}`.
