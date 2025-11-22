import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  query,
  limitToLast,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// --- CONFIGURATION ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCb38p7mT9R0vqcnDrWo_QVtTpSyqdN1aA",
  authDomain: "cek-khodam-db.firebaseapp.com",
  projectId: "cek-khodam-db",
  storageBucket: "cek-khodam-db.firebasestorage.app",
  messagingSenderId: "411043116392",
  appId: "1:411043116392:web:4730c942fac2ed22fbd2dd",
  measurementId: "G-VYNQPXBW41",
  databaseURL:
    "https://cek-khodam-db-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// --- INITIALIZATION ---
const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  // --- AUDIO ENGINE (Procedural Horror SFX) ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const HorrorSound = {
    ctx: audioCtx,
    createNoise() {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    },
    hover() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoise();
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.linearRampToValueAtTime(600, t + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);

      noise.connect(filter).connect(gain).connect(this.ctx.destination);
      noise.start();
      noise.stop(t + 0.5);
    },
    click() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);

      const shaper = this.ctx.createWaveShaper();
      shaper.curve = new Float32Array([-0.5, 0.5]);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.connect(shaper).connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(t + 0.3);
    },
    type() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoise();

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      noise.connect(filter).connect(gain).connect(this.ctx.destination);
      noise.start();
      noise.stop(t + 0.05);
    },
  };

  // --- DATA: KHODAMS ---
  const KHODAMS = [
    // LEGENDARY
    {
      name: "Nyi Roro Kidul",
      desc: "Ratu Laut Selatan. Keanggunan yang mematikan.",
      rarity: "LEGENDARY",
      power: 100,
      img: "./img/nyi_roro.jpg",
    },
    {
      name: "Prabu Siliwangi",
      desc: "Spirit Harimau Putih Pajajaran.",
      rarity: "LEGENDARY",
      power: 98,
      img: "./img/prabu.jpg",
    },
    {
      name: "Badarawuhi",
      desc: "Penari ular penjaga desa keramat.",
      rarity: "LEGENDARY",
      power: 96,
      img: "./img/badarawuhi.jpg",
    },
    {
      name: "Leak Rangda",
      desc: "Ratu penyihir hitam dari Bali.",
      rarity: "LEGENDARY",
      power: 97,
      img: "./img/leak.jpg",
    },
    {
      name: "Naga Basuki",
      desc: "Naga penjaga keseimbangan alam.",
      rarity: "LEGENDARY",
      power: 95,
      img: "./img/naga_basuki.jpg",
    },
    // EPIC
    {
      name: "Genderuwo Alas",
      desc: "Raksasa hitam berbulu lebat.",
      rarity: "EPIC",
      power: 85,
      img: "./img/genderuwo.jpg",
    },
    {
      name: "Banaspati",
      desc: "Bola api neraka yang melayang.",
      rarity: "EPIC",
      power: 88,
      img: "./img/banaspati.jpg",
    },
    {
      name: "Buto Ijo",
      desc: "Raksasa hijau pemakan daging.",
      rarity: "EPIC",
      power: 82,
      img: "./img/buto_ijo.jpg",
    },
    {
      name: "Jenglot Berdarah",
      desc: "Makhluk kecil peminum darah.",
      rarity: "EPIC",
      power: 80,
      img: "./img/jenglot.jpg",
    },
    {
      name: "Kuyang",
      desc: "Kepala terbang pencari bayi.",
      rarity: "EPIC",
      power: 84,
      img: "./img/kuyang.jpg",
    },
    {
      name: "Ambatron",
      desc: "Robot besi dari Ngawi.",
      rarity: "EPIC",
      power: 90,
      img: "./img/ambatron.jpg",
    },
    {
      name: "Kecoa Terbang",
      desc: "Teror sesungguhnya bagi umat manusia.",
      rarity: "EPIC",
      power: 99,
      img: "./img/kecoa.jpg",
    },
    // RARE
    {
      name: "Kuntilanak Merah",
      desc: "Tawanya memecahkan gendang telinga.",
      rarity: "RARE",
      power: 75,
      img: "./img/kuntilanak.jpg",
    },
    {
      name: "Wewe Gombel",
      desc: "Menculik mereka yang berkeliaran maghrib.",
      rarity: "RARE",
      power: 70,
      img: "./img/wewe_gombel.jpg",
    },
    {
      name: "Sundel Bolong",
      desc: "Membawa aroma melati busuk.",
      rarity: "RARE",
      power: 65,
      img: "./img/sundel_bolong.jpg",
    },
    {
      name: "Suster Ngesot",
      desc: "Menyeret kaki di lorong rumah sakit.",
      rarity: "RARE",
      power: 55,
      img: "./img/suster_ngesot.jpg",
    },
    {
      name: "Sapu Lidi",
      desc: "Senjata emak-emak legendaris.",
      rarity: "RARE",
      power: 78,
      img: "./img/sapu_lidi.jpg",
    },
    {
      name: "Mio Mirza",
      desc: "Motor gaib yang viral.",
      rarity: "RARE",
      power: 66,
      img: "./img/mio_mirza.jpg",
    },
    // COMMON
    {
      name: "Pocong",
      desc: "Suka mengetuk pintu tengah malam.",
      rarity: "COMMON",
      power: 40,
      img: "./img/pocong.jpg",
    },
    {
      name: "Tuyul Botak",
      desc: "Pencuri uang yang lincah.",
      rarity: "COMMON",
      power: 30,
      img: "./img/tuyul.jpg",
    },
    {
      name: "Jeruk Purut",
      desc: "Membawa aura kesedihan.",
      rarity: "COMMON",
      power: 35,
      img: "./img/jeruk_purut.jpg",
    },
    {
      name: "Kulkas 2 Pintu",
      desc: "Dingin tapi penuh makanan.",
      rarity: "COMMON",
      power: 10,
      img: "./img/kulkas.jpg",
    },
    {
      name: "Beat Mber",
      desc: "Suaranya memekakkan telinga warga.",
      rarity: "COMMON",
      power: 45,
      img: "./img/beat_mber.jpg",
    },
    {
      name: "Seblak Ceker",
      desc: "Pedasnya bikin nangis.",
      rarity: "COMMON",
      power: 25,
      img: "./img/seblak.jpg",
    },
    {
      name: "Tutup Botol",
      desc: "Kecil tapi menyakitkan kalau keinjak.",
      rarity: "COMMON",
      power: 5,
      img: "./img/tutup_botol.jpg",
    },
    {
      name: "Kasur Kapuk",
      desc: "Bikin mager seharian.",
      rarity: "COMMON",
      power: 15,
      img: "./img/kasur.jpg",
    },
    {
      name: "Vario Getar",
      desc: "Bergetar sampai ke jiwa.",
      rarity: "COMMON",
      power: 40,
      img: "./img/vario.jpg",
    },
    {
      name: "Cicak Dinding",
      desc: "Diam-diam merayap.",
      rarity: "COMMON",
      power: 2,
      img: "./img/cicak.jpg",
    },
  ];

  // --- DOM ELEMENTS ---
  const els = {
    screens: {
      input: document.getElementById("screenInput"),
      loading: document.getElementById("screenLoading"),
      result: document.getElementById("screenResult"),
    },
    input: document.getElementById("inputName"),
    btnSummon: document.getElementById("btnSummon"),
    btnRetry: document.getElementById("btnRetry"),
    btnShare: document.getElementById("btnShare"),
    btnSave: document.getElementById("btnSave"),
    card: {
      box: document.getElementById("captureArea"),
      img: document.getElementById("khodamImg"),
      name: document.getElementById("khodamName"),
      desc: document.getElementById("khodamDesc"),
      badge: document.getElementById("rarityBadge"),
      id: document.getElementById("cardId"),
      barAtk: document.getElementById("barAtk"),
      barMag: document.getElementById("barMag"),
    },
    lbList: document.getElementById("leaderboardList"),
    audio: {
      bgm: document.getElementById("bgm"),
      heart: document.getElementById("sfxHeart"),
      jump: document.getElementById("sfxJump"),
    },
  };

  // --- EVENT LISTENERS ---
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("mouseenter", () => HorrorSound.hover());
    btn.addEventListener("click", () => HorrorSound.click());
  });
  els.input.addEventListener("input", () => HorrorSound.type());

  els.btnSummon.addEventListener("click", startRitual);
  els.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startRitual();
    }
  });
  els.btnRetry.addEventListener("click", () => location.reload());
  els.btnShare.addEventListener("click", handleShare);
  els.btnSave.addEventListener("click", handleSave);

  // --- CORE LOGIC ---
  function showScreen(screenName) {
    Object.values(els.screens).forEach((s) => {
      s.classList.remove("active", "show");
      s.classList.add("hidden", "hide");
    });
    els.screens[screenName].classList.remove("hidden", "hide");
    els.screens[screenName].classList.add("active", "show");
  }

  function startRitual() {
    const name = els.input.value.trim();
    if (!name) {
      const group = els.input.parentElement;
      group.classList.add("shake");
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => group.classList.remove("shake"), 400);
      return;
    }

    HorrorSound.click();
    els.audio.bgm.volume = 0.4;
    els.audio.bgm.play().catch(() => {});
    els.audio.heart.play();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    showScreen("loading");

    setTimeout(() => {
      els.audio.heart.pause();
      els.audio.jump.play();
      if (navigator.vibrate) navigator.vibrate(500);
      revealKhodam(name);
    }, 3500);
  }

  function revealKhodam(name) {
    els.card.name.innerText = khodam.name;
    els.card.desc.innerText = khodam.desc;
    els.card.badge.innerText = khodam.rarity;
    els.card.id.innerText = String(hash).slice(0, 3);
    els.card.img.src = khodam.img;
    els.card.img.onerror = function () {
      this.src =
        "https://via.placeholder.com/300x400/000000/FFFFFF?text=ENTITY+UNKNOWN";
    };

    const colorMap = {
      LEGENDARY: "#c5a059",
      EPIC: "#8a0303",
      RARE: "#0044ff",
      COMMON: "#555",
    };
    const color = colorMap[khodam.rarity] || "#555";
    els.card.badge.style.borderColor = color;
    els.card.badge.style.color = color;

    setTimeout(() => {
      els.card.barAtk.style.width = `${khodam.power}%`;
      els.card.barMag.style.width = `${khodam.power - (hash % 10)}%`;
    }, 300);

    saveToFirebase(name, khodam);
  }

  // --- SHARE & SAVE ---
  async function handleShare() {
    HorrorSound.click();
    const btn = els.btnShare;
    const oldContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const card = els.card.box;
    card.classList.add("capture-mode");

    try {
      const canvas = await html2canvas(card, {
        backgroundColor: "#050505",
        useCORS: true,
        scale: 2,
        logging: false,
      });
      card.classList.remove("capture-mode");

      canvas.toBlob(
        async (blob) => {
          const file = new File([blob], "khodam.jpg", { type: "image/jpeg" });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "Cek Khodam",
                text: `Khodam gw: ${els.card.name.innerText}. Cek punya lu!`,
                files: [file],
              });
            } catch (err) {
              console.log("Share cancelled", err);
            }
          } else {
            window.open(
              `https://wa.me/?text=${encodeURIComponent(
                `Khodam gw: ${els.card.name.innerText}. Cek khodam lu sekarang!`
              )}`,
              "_blank"
            );
          }
          btn.innerHTML = oldContent;
        },
        "image/jpeg",
        0.9
      );
    } catch (e) {
      console.error(e);
      card.classList.remove("capture-mode");
      btn.innerHTML = oldContent;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Khodam gw: ${els.card.name.innerText}. Cek khodam lu sekarang!`
        )}`,
        "_blank"
      );
    }
  }

  function handleSave() {
    HorrorSound.click();
    const btn = els.btnSave;
    const card = els.card.box;
    const oldContent = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    card.classList.add("capture-mode");

    setTimeout(() => {
      html2canvas(card, {
        backgroundColor: "#050505",
        useCORS: true,
        scale: 2,
        allowTaint: true,
        logging: false,
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `Khodam-${Date.now()}.jpg`;
          link.href = canvas.toDataURL("image/jpeg", 0.9);
          link.click();

          card.classList.remove("capture-mode");
          btn.innerHTML = oldContent;
          btn.disabled = false;
        })
        .catch((err) => {
          console.error("Save failed:", err);
          card.classList.remove("capture-mode");
          btn.innerHTML = oldContent;
          btn.disabled = false;
          alert("Gagal menyimpan gambar.");
        });
    }, 300);
  }

  // --- LEADERBOARD ---
  function initLeaderboard() {
    const lbRef = ref(db, "leaderboard");
    const q = query(lbRef, limitToLast(10));

    onValue(q, (snapshot) => {
      els.lbList.innerHTML = "";
      const data = snapshot.val();
      if (data) {
        let sortedData = Object.values(data);
        const score = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
        sortedData.sort((a, b) => {
          let sA = score[a.rarity] || 0;
          let sB = score[b.rarity] || 0;
          if (sB !== sA) return sB - sA;
          return b.timestamp - a.timestamp;
        });

        sortedData.slice(0, 10).forEach((item, index) => {
          let badgeClass = "badge-common";
          if (item.rarity === "LEGENDARY") badgeClass = "badge-legend";
          else if (item.rarity === "EPIC") badgeClass = "badge-epic";
          else if (item.rarity === "RARE") badgeClass = "badge-rare";

          const li = document.createElement("li");
          li.className = `lb-item`;
          li.innerHTML = `
                        <div class="lb-left">
                            <span class="rank">#${index + 1}</span>
                            <div>
                                <span class="user">${escapeHtml(
                                  item.user
                                )}</span>
                                <span class="khodam-small">${item.khodam}</span>
                            </div>
                        </div>
                        <div class="lb-badge ${badgeClass}">${item.rarity}</div>
                    `;
          els.lbList.appendChild(li);
        });
      } else {
        els.lbList.innerHTML =
          "<li style='padding:15px; text-align:center; color:#555; font-size:0.8rem;'>Belum ada data arwah...</li>";
      }
    });
  }

  function saveToFirebase(userName, khodamData) {
    push(ref(db, "leaderboard"), {
      user: userName,
      khodam: khodamData.name,
      rarity: khodamData.rarity,
      timestamp: Date.now(),
    });
  }

  function escapeHtml(text) {
    if (!text) return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  initLeaderboard();
});
