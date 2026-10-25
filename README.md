# Ucapan HBD

Web ucapan ulang tahun dengan prank jumpscare, slide kenangan, dan pemutar musik.

## Struktur

```
ucapan-hbd/
├── index.html
├── css/style.css
├── js/main.js
└── assets/
    ├── img/    imel.jpg, imel1.jpg, imel2.jpg, cover.jpg
    ├── audio/  labyrinth.mp3, jumpscare.mp3
    └── video/  imel-video.mp4, jumpscare.mp4
```

## Menjalankan

Buka `index.html` di browser. Koneksi internet hanya dipakai untuk font Google;
tanpa internet, font cadangan sistem tampil.

## Mengubah isi

- Teks dan slide: `index.html`
- Warna dan tema: variabel di bagian atas `css/style.css`
- Lama prank: `DURASI_PRANK_MS` di `js/main.js`
- Lagu: ganti `assets/audio/labyrinth.mp3`, lalu ubah judul dan artis di blok `.pemutar` pada `index.html` dan di `mediaSession` pada `js/main.js`
