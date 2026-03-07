# Telegram Chatbox Module

Module Telegram bot dùng để nhận tin nhắn từ user (khi được @ mention) và chuyển **title** + **description** lên Automaker API.

## Cấu hình (.env)

```env
# Bắt buộc: token bot từ @BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# URL API Automaker (tạo feature)
AUTOMAKER_API_URL=http://103.82.38.96:3008

# x-api-key (bắt buộc cho API features/create)
AUTOMAKER_API_KEY=c86f7919-f45a-45b0-b7d2-bfd30ff223cb

# Đường dẫn project (mặc định /projects/full-stack-core-web)
AUTOMAKER_PROJECT_PATH=/projects/full-stack-core-web
```

## Cách dùng

1. Tạo bot tại [@BotFather](https://t.me/BotFather), lấy token.
2. Thêm `TELEGRAM_BOT_TOKEN` và `AUTOMAKER_API_URL` vào `.env`.
3. Chạy backend; bot sẽ dùng long polling (không cần webhook).
4. Trong Telegram (nhóm hoặc chat với bot), gửi tin nhắn **có @ mention bot**, ví dụ:

   ```
   @YourBotName
   Thêm form đăng ký
   Form đăng ký email và số điện thoại ở trang chủ, validate số ĐT Việt Nam.
   ```

- **Dòng đầu** sau phần mention = **title** gửi lên Automaker.
- **Các dòng sau** = **description**.

Bot sẽ trả lời xác nhận hoặc báo lỗi sau khi gọi API.

## Tùy chỉnh Automaker API

Nếu API Automaker của bạn khác (method, path, body), chỉnh trong:

- `src/automaker/automaker.service.ts`: method `createWithTitleAndDescription` (URL, headers, body).

Hiện tại service gửi `POST {AUTOMAKER_API_URL}/api/features/create` với header `x-api-key` và body `{ projectPath, feature: { title, description, ... } }`.
