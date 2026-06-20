# English Learning System (Hệ thống Học Tiếng Anh)

Hệ thống học tiếng Anh trực quan bao gồm Frontend (React + Tailwind CSS) và Backend (Node.js + Express + MongoDB).

## Cấu trúc thư mục dự án

```text
english-learning-system/
├── backend/            # Backend Node.js/Express (TypeScript)
└── frontend/           # Frontend React/Vite/Tailwind CSS (TypeScript)
```

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên.
- **MongoDB**: MongoDB Community Server chạy local hoặc MongoDB Atlas URI.

## Hướng dẫn cài đặt và chạy thử nghiệm

### 1. Cấu hình & Chạy Backend

Di chuyển vào thư mục `backend/`:
```bash
cd backend
```

Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

Tạo file cấu hình môi trường `.env` từ file mẫu:
```bash
cp .env.example .env
```
*(Hãy mở file `.env` và cập nhật thông số `MONGODB_URI` và `JWT_SECRET` nếu cần thiết)*.

Chạy backend ở chế độ Development:
```bash
npm run dev
```
Server backend sẽ chạy mặc định tại `http://localhost:5000`.

---

### 2. Cấu hình & Chạy Frontend

Di chuyển vào thư mục `frontend/`:
```bash
cd frontend
```

Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

Chạy frontend ở chế độ Development:
```bash
npm run dev
```
Mở trình duyệt theo địa chỉ được hiển thị trong terminal (mặc định là `http://localhost:5173`).
