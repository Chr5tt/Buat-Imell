(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const DURASI_PRANK_MS = 15000;

  /* ---------- Elemen ---------- */
  const el = {
    layarAwal: $("layarAwal"),
    layarTenang: $("layarTenang"),
    galeri: $("galeri"),
    btnPrank: $("btnPrank"),
    btnSkip: $("btnSkip"),
    judulTenang: $("judulTenang"),
    teksTenang: $("teksTenang"),
    btnGaleri: $("btnGaleri"),
    btnBack: $("btnBack"),
    btnNext: $("btnNext"),
    titik: $("titik"),
    jumpscare: $("jumpscare"),
    videoJumpscare: $("videoJumpscare"),
    audioJumpscare: $("audioJumpscare"),
    audioMusik: $("audioMusik"),
    pemutar: $("pemutar"),
    btnPlay: $("btnPlay"),
    btnMute: $("btnMute"),
    progres: $("progres"),
    waktuSekarang: $("waktuSekarang"),
    waktuTotal: $("waktuTotal"),
  };

  function setThemeColor(warna) {
    const tc = document.getElementById("themeColor");
    if (tc) tc.setAttribute("content", warna);
  }

  /* PRANK */
  let prankBerjalan = false;
  let prankSelesai = false;

  const TEKS_SKIP = {
    judul: "Alaa, diskip 😒",
    isi: "Oke lah, kalau buru-buru lihat aibmu.",
  };

  // diskip = true bila video dilewati sebelum habis
  function selesaikanPrank(diskip) {
    if (prankSelesai) return;
    prankSelesai = true;
    akhiriPrank(diskip);
  }

  function mulaiPrank() {
    if (prankBerjalan) return;
    prankBerjalan = true;
    el.btnPrank.disabled = true;

    el.audioJumpscare.volume = 1;
    el.audioJumpscare.currentTime = 0;
    el.audioJumpscare.play().catch(() => {});

    document.documentElement.classList.add("scare");
    setThemeColor("#000000");
    el.jumpscare.classList.add("aktif");
    el.jumpscare.setAttribute("aria-hidden", "false");
    el.videoJumpscare.currentTime = 0;
    el.videoJumpscare.play().catch(() => {});

    // Selesai saat video habis
    el.videoJumpscare.addEventListener("ended", () => selesaikanPrank(false), { once: true });
    setTimeout(() => selesaikanPrank(false), DURASI_PRANK_MS);
  }

  function akhiriPrank(diskip) {
    el.videoJumpscare.pause();
    el.audioJumpscare.pause();
    el.jumpscare.classList.remove("aktif");
    document.documentElement.classList.remove("scare");
    el.jumpscare.setAttribute("aria-hidden", "true");

    document.body.classList.add("tema-tenang");
    document.documentElement.classList.add("tema-tenang");
    setThemeColor("#e8f5e9");

    if (diskip) {
      el.judulTenang.textContent = TEKS_SKIP.judul;
      el.teksTenang.textContent = TEKS_SKIP.isi;
    }

    el.layarAwal.hidden = true;
    el.layarTenang.hidden = false;
    el.layarTenang.classList.add("masuk");

    tampilkanPemutar();
    putarMusik();
  }

  /* GALERI */
  const slides = Array.from(document.querySelectorAll("[data-slide]"));
  let indeks = 0;
  const dibuka = new Set();

  const semuaDibuka = () => dibuka.size === slides.length;
  // Back muncul mulai slide 2. Di slide 1 baru muncul setelah semua slide pernah dibuka.
  const bolehMundur = () => semuaDibuka() || indeks >= 1;

  function mundur() {
    if (bolehMundur()) tampilkanSlide(indeks - 1);
  }

  function perbaruiNavigasi() {
    const tampil = bolehMundur();
    el.btnBack.classList.toggle("tersembunyi", !tampil);
    el.btnBack.tabIndex = tampil ? 0 : -1;
    el.btnBack.setAttribute("aria-hidden", String(!tampil));

    Array.from(el.titik.children).forEach((b, i) => {
      b.disabled = !semuaDibuka();
      b.setAttribute("aria-selected", String(i === indeks));
    });
  }

  // Titik penanda slide
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1} dari ${slides.length}`);
    b.addEventListener("click", () => { if (semuaDibuka()) tampilkanSlide(i); });
    el.titik.appendChild(b);
  });

  function bukaGaleri() {
    el.layarTenang.hidden = true;
    el.galeri.hidden = false;
    tampilkanSlide(0);
  }

  function tampilkanSlide(n) {
    indeks = (n + slides.length) % slides.length;
    dibuka.add(indeks);

    slides.forEach((slide, i) => {
      const aktif = i === indeks;
      slide.hidden = !aktif;

      const video = slide.querySelector("video");
      if (video) {
        if (aktif) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });

    perbaruiNavigasi();
  }

  // Keyboard dan geser jari
  document.addEventListener("keydown", (e) => {
    if (el.galeri.hidden) return;
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "ArrowRight") tampilkanSlide(indeks + 1);
    if (e.key === "ArrowLeft") mundur();
  });

  let awalX = null;
  el.galeri.addEventListener("touchstart", (e) => { awalX = e.changedTouches[0].clientX; }, { passive: true });
  el.galeri.addEventListener("touchend", (e) => {
    if (awalX === null) return;
    const selisih = e.changedTouches[0].clientX - awalX;
    awalX = null;
    if (Math.abs(selisih) < 50) return;
    if (selisih < 0) tampilkanSlide(indeks + 1);
    else mundur();
  }, { passive: true });

  /* PEMUTAR MUSIK */
  const musik = el.audioMusik;

  function format(detik) {
    if (!Number.isFinite(detik)) return "0:00";
    const m = Math.floor(detik / 60);
    const s = Math.floor(detik % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function tampilkanPemutar() {
    if (!el.pemutar.hidden) return;
    el.pemutar.hidden = false;
    el.pemutar.classList.add("muncul");
  }

  function isiProgres() {
    const persen = musik.duration ? (musik.currentTime / musik.duration) * 100 : 0;
    el.progres.value = persen;
    el.progres.style.setProperty("--isi", `${persen}%`);
    el.waktuSekarang.textContent = format(musik.currentTime);
  }

  function putarMusik() {
    musik.volume = 1;
    return musik.play().catch(() => {
      // pemutar tetap tampil, tombol play siap dipakai.
    });
  }

  function toggleMusik() {
    if (musik.paused) putarMusik();
    else musik.pause();
  }

  musik.addEventListener("play", () => {
    el.pemutar.classList.add("main");
    el.btnPlay.setAttribute("aria-label", "Jeda lagu");
  });

  musik.addEventListener("pause", () => {
    el.pemutar.classList.remove("main");
    el.btnPlay.setAttribute("aria-label", "Putar lagu");
  });

  musik.addEventListener("loadedmetadata", () => {
    el.waktuTotal.textContent = format(musik.duration);
  });

  musik.addEventListener("timeupdate", isiProgres);

  el.progres.addEventListener("input", () => {
    if (!musik.duration) return;
    musik.currentTime = (el.progres.value / 100) * musik.duration;
    isiProgres();
  });

  el.btnPlay.addEventListener("click", toggleMusik);

  el.btnMute.addEventListener("click", () => {
    musik.muted = !musik.muted;
    el.btnMute.setAttribute("aria-pressed", String(musik.muted));
    el.btnMute.setAttribute("aria-label", musik.muted ? "Nyalakan suara" : "Bisukan suara");
  });

  // Kontrol dari layar kunci dan notifikasi media
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Labyrinth",
      artist: "Taylor Swift",
      artwork: [{ src: "assets/img/cover.jpg", sizes: "480x480", type: "image/jpeg" }],
    });
    navigator.mediaSession.setActionHandler("play", putarMusik);
    navigator.mediaSession.setActionHandler("pause", () => musik.pause());
  }

  /* PROTEKSI KONTEN */
  document.querySelectorAll("img").forEach((img) => { img.draggable = false; });

  ["contextmenu", "dragstart", "selectstart", "copy", "cut"].forEach((nama) => {
    document.addEventListener(nama, (e) => e.preventDefault());
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && ["s", "u", "p", "a", "c"].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });

  /* ---------- Pasang event ---------- */
  el.btnPrank.addEventListener("click", mulaiPrank);
  el.btnSkip.addEventListener("click", () => selesaikanPrank(true));
  el.btnGaleri.addEventListener("click", bukaGaleri);
  el.btnBack.addEventListener("click", mundur);
  el.btnNext.addEventListener("click", () => tampilkanSlide(indeks + 1));
})();
