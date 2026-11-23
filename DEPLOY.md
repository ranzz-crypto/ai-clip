# Cara memperbaiki "Analysis backend not found (HTTP 404)"

Vercel hanya menjalankan frontend (React). Server analisis (Python + FFmpeg + Whisper) tidak bisa jalan di Vercel, jadi harus di-host di tempat lain memakai `Dockerfile` yang sudah ada di repo ini. Setelah backend punya URL publik, `vercel.json` akan meneruskan semua request `/api/*` ke sana.

## Syarat server

- RAM minimal 2 GB (Whisper + PyTorch). Paket gratis 512 MB akan crash (out of memory), dan itu terlihat sebagai "Connection closed".
- Punya `GEMINI_API_KEY` dari https://aistudio.google.com/apikey

## Opsi A: Railway (paling mudah)

1. Buka https://railway.com lalu login dengan GitHub.
2. Klik **New Project** > **Deploy from GitHub repo** > pilih `ranzz-crypto/ai-clip` (branch `dev/galih`, branch default repo ini).
3. Railway otomatis memakai `Dockerfile`. Tunggu build selesai (sekitar 5-10 menit pertama).
4. Buka tab **Variables**, tambahkan `GEMINI_API_KEY` dengan nilai API key Anda.
5. Buka tab **Settings** > **Networking** > **Generate Domain**. Isi port dengan `8000`.
6. Salin URL yang muncul, misalnya `https://ai-clip-production.up.railway.app`.
7. Tes di browser: buka `URL-ANDA/api/health`. Jika muncul JSON, backend sudah jalan.

## Opsi B: Render

1. Buka https://render.com > **New** > **Blueprint** > pilih repo `ranzz-crypto/ai-clip`. File `render.yaml` sudah disiapkan (paket Standard, RAM 2 GB).
2. Isi `GEMINI_API_KEY` saat diminta, lalu **Apply**.
3. Setelah deploy selesai, salin URL `https://...onrender.com` dan tes `URL-ANDA/api/health`.

## Opsi C: Fly.io

1. Install flyctl, lalu jalankan `fly launch --no-deploy` di folder repo (pilih Dockerfile, port `8000`).
2. Di `fly.toml`, atur memori: `[[vm]] memory = "2gb"`.
3. `fly secrets set GEMINI_API_KEY=isi_key_anda` lalu `fly deploy`.
4. URL-nya `https://nama-app.fly.dev`.

## Hubungkan Vercel ke backend

Setelah punya URL backend (harus `https://`), jalankan di folder repo:

```bash
node scripts/set-backend-url.mjs https://URL-BACKEND-ANDA
git add vercel.json
git commit -m "Point /api to backend"
git push
```

Vercel akan redeploy otomatis. Atau, tanpa terminal: edit `vercel.json` di GitHub dan ganti `https://GANTI-DENGAN-URL-BACKEND.example.com` dengan URL backend Anda.

## Cek hasil

1. Buka `https://ai-clip-nu.vercel.app/api/health`. Jika muncul JSON, routing berhasil.
2. Coba analisis klip lagi. Pesan 404 tidak akan muncul lagi.

## Jika masih gagal

- 404 tetap muncul: `vercel.json` belum diganti URL-nya atau Vercel belum selesai redeploy.
- 502/503: backend belum selesai start atau crash. Lihat log di dashboard hosting.
- "Connection closed" saat analisis: biasanya RAM kurang. Naikkan ke 2 GB atau lebih.
