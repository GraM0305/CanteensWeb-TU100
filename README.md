# CanteenWeb-TU100
พัฒนาเว็บสำหรับหาโรงอาหารและร้านอาหารภายในโรงอาหารนั้นๆ ว่ามีร้านอาหารอะไรอยู่บ้าง

## Frontend

The frontend uses native JavaScript ES modules. To run it locally, serve the repository over HTTP instead of opening `frontend/index.html` directly with `file://`:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/frontend/`. For static hosting, deploy the complete `frontend/` directory and preserve its relative paths so the module imports and CSS files can load.

## Database SQL files

SQL files are kept with the database they target. See [database/README.md](database/README.md) for the file guide and safe migration order. Do not move or delete numbered migrations that may already have been applied.
