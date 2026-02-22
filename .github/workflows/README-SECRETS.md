# Secrets cần cấu hình cho CI/CD

Vào **Settings → Secrets and variables → Actions** của repo GitHub, thêm các secret sau:

| Secret | Mô tả |
|--------|--------|
| `DOCKER_USERNAME` | Tên đăng nhập Docker Hub |
| `DOCKER_PASSWORD` | Mật khẩu hoặc Access Token Docker Hub |
| `VPS_HOST` | IP hoặc domain VPS (ví dụ: `103.82.38.96`) |
| `VPS_USERNAME` | User SSH (ví dụ: `root`) |
| `VPS_KEY` | **Nội dung private key SSH** (toàn bộ file, kể cả dòng `-----BEGIN ... KEY-----` và `-----END ... KEY-----`). Dùng cách này vì hầu hết VPS tắt đăng nhập bằng mật khẩu. |
| `VPS_PASSWORD` | Chỉ dùng nếu VPS bật PasswordAuthentication; nếu dùng thì trong `deploy.yml` đổi `key` thành `password: ${{ secrets.VPS_PASSWORD }}`. |
| `MONGODB_URI` | Chuỗi kết nối MongoDB (ví dụ: `mongodb://user:pass@host:27017/core-web-cms?authSource=admin`) |
| `JWT_SECRET` | Secret dùng cho JWT |
| `FRONTEND_URL` | URL frontend (ví dụ: `https://yourdomain.com` hoặc `http://IP:3000`) |
| `NEXT_PUBLIC_API_URL` | URL API mà trình duyệt gọi (ví dụ: `https://api.yourdomain.com` hoặc `http://IP:3066`) — **dùng khi build frontend** |

**Tạo SSH key (nếu chưa có):** trên máy chạy `ssh-keygen -t ed25519 -C "github-actions" -f vps_deploy -N ""`, copy nội dung `vps_deploy` vào secret `VPS_KEY`, rồi copy nội dung `vps_deploy.pub` vào file `~/.ssh/authorized_keys` trên VPS.
