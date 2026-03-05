# Database Backup và Gửi qua Telegram

Tính năng này cho phép dump MySQL database và tự động gửi file dump qua Telegram Bot.

## Cấu hình

### 1. Cấu hình Telegram Bot

Đảm bảo đã cấu hình các biến môi trường sau trong `.env` hoặc `docker-compose.yml`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_ENABLED=true
```

**Lấy Bot Token:**
1. Tìm @BotFather trên Telegram
2. Gửi lệnh `/newbot` và làm theo hướng dẫn
3. Copy token được cấp

**Lấy Chat ID:**
1. Tìm @userinfobot trên Telegram
2. Gửi bất kỳ message nào
3. Bot sẽ trả về Chat ID của bạn

### 2. Cấu hình Backup (Tùy chọn)

Thêm vào `.env` hoặc `application.properties`:

```properties
# Bật/tắt tự động backup (mặc định: false)
BACKUP_ENABLED=false

# Lịch backup theo cron expression (mặc định: 2:00 AM mỗi ngày)
BACKUP_CRON=0 0 2 * * ?

# Số file backup cần giữ lại (mặc định: 5)
BACKUP_KEEP_FILES=5
```

**Cron Expression Examples:**
- `0 0 2 * * ?` - 2:00 AM mỗi ngày
- `0 0 */6 * * ?` - Mỗi 6 giờ
- `0 0 0 * * ?` - Nửa đêm mỗi ngày
- `0 0 0 * * MON` - Nửa đêm mỗi thứ 2

## Sử dụng

### Backup thủ công

Gọi API endpoint để trigger backup thủ công:

```bash
POST /api/backup/database
```

**Response:**
```json
{
  "success": true,
  "message": "Backup database thành công và đã gửi qua Telegram",
  "filePath": "ops/backup/class_management_20250117_140530.sql"
}
```

### Backup tự động

Khi bật `BACKUP_ENABLED=true`, hệ thống sẽ tự động backup theo lịch đã cấu hình trong `BACKUP_CRON`.

## Lưu ý

### Yêu cầu hệ thống

- **mysqldump** phải được cài đặt và có trong PATH
- Nếu chạy trong Docker container, cần đảm bảo container có mysqldump:
  ```dockerfile
  RUN apt-get update && apt-get install -y default-mysql-client
  ```

### Vị trí file backup

File backup được lưu tại: `ops/backup/`

Format tên file: `{database_name}_{timestamp}.sql`

### Giới hạn file size Telegram

Telegram Bot API có giới hạn:
- File tối đa: **50MB** cho document
- Nếu file lớn hơn, cần sử dụng phương pháp khác (nén file, chia nhỏ, hoặc upload lên cloud storage)

## Troubleshooting

### Lỗi: "mysqldump: command not found"

**Giải pháp:** Cài đặt MySQL client:
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y default-mysql-client

# CentOS/RHEL
sudo yum install mysql
```

### Lỗi: "Gửi file qua Telegram thất bại"

**Kiểm tra:**
1. Bot token và Chat ID đã đúng chưa
2. Bot đã được thêm vào group/channel (nếu dùng group chat)
3. File size có vượt quá 50MB không

### Lỗi: "Không thể lấy tên database từ URL"

**Giải pháp:** Đảm bảo JDBC URL có format đúng:
```
jdbc:mysql://host:port/database_name?params
```

