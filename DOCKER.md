# Chạy full-stack bằng Docker

## Yêu cầu

- Docker & Docker Compose

## Chạy nhanh

1. **Tạo file env** (tùy chọn – đã có giá trị mặc định):

   ```bash
   cp .env.example .env
   # Chỉnh .env nếu cần (port, mật khẩu MongoDB, JWT_SECRET...)
   ```

2. **Build và chạy:**

   ```bash
   docker compose up -d --build
   ```

3. **Truy cập:**

   - Frontend: http://localhost:3000  
   - Backend API: http://localhost:3001  

## Cấu trúc

| Service   | Port (mặc định) | Mô tả                |
|----------|------------------|----------------------|
| frontend | 3000             | Next.js              |
| backend  | 3001             | NestJS API           |
| mongo    | 27017            | MongoDB (trong Docker) |

## Dùng MongoDB ngoài (không dùng container mongo)

1. Trong `.env` đặt `MONGODB_URI` trỏ tới MongoDB của bạn.
2. Chạy chỉ backend và frontend:

   ```bash
   docker compose up -d --build backend frontend
   ```

   (Bỏ qua service `mongo`.)

## Lệnh hữu ích

```bash
# Xem log
docker compose logs -f

# Dừng và xóa container
docker compose down

# Dừng và xóa cả volume (xóa dữ liệu MongoDB)
docker compose down -v
```
