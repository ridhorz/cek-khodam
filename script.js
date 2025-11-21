import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, query, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCb38p7mT9R0vqcnDrWo_QVtTpSyqdN1aA",
  authDomain: "cek-khodam-db.firebaseapp.com",
  projectId: "cek-khodam-db",
  storageBucket: "cek-khodam-db.firebasestorage.app",
  messagingSenderId: "411043116392",
  appId: "1:411043116392:web:4730c942fac2ed22fbd2dd",
  measurementId: "G-VYNQPXBW41",
  databaseURL: "https://cek-khodam-db-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {

    const KHODAMS = [
        { name: "Nyi Roro Kidul", desc: "Ratu Laut Selatan. Keanggunan yang mematikan.", rarity: "LEGENDARY", power: 100, img: "./img/nyi_roro.jpg" },
        { name: "Prabu Siliwangi", desc: "Spirit Harimau Putih Pajajaran.", rarity: "LEGENDARY", power: 98, img: "./img/prabu.jpg" },
        { name: "Badarawuhi", desc: "Penari ular penjaga desa keramat.", rarity: "LEGENDARY", power: 96, img: "./img/badarawuhi.jpg" },
        { name: "Leak Rangda", desc: "Ratu penyihir hitam dari Bali.", rarity: "LEGENDARY", power: 97, img: "./img/leak.jpg" },
        { name: "Genderuwo Alas", desc: "Raksasa hitam berbulu lebat.", rarity: "EPIC", power: 85, img: "./img/genderuwo.jpg" },
        { name: "Banaspati", desc: "Bola api neraka yang melayang.", rarity: "EPIC", power: 88, img: "./img/banaspati.jpg" },
        { name: "Buto Ijo", desc: "Raksasa hijau pemakan daging.", rarity: "EPIC", power: 82, img: "./img/buto_ijo.jpg" },
        { name: "Kuntilanak Merah", desc: "Tawanya memecahkan gendang telinga.", rarity: "RARE", power: 75, img: "./img/kuntilanak.jpg" },
        { name: "Wewe Gombel", desc: "Menculik mereka yang berkeliaran maghrib.", rarity: "RARE", power: 70, img: "./img/wewe_gombel.jpg" },
        { name: "Sundel Bolong", desc: "Membawa aroma melati busuk.", rarity: "RARE", power: 65, img: "./img/sundel_bolong.jpg" },
        { name: "Pocong", desc: "Suka mengetuk pintu tengah malam.", rarity: "COMMON", power: 40, img: "./img/pocong.jpg" },
        { name: "Tuyul", desc: "Pencuri uang yang lincah.", rarity: "COMMON", power: 30, img: "./img/tuyul.jpg" },
        { name: "Jeruk Purut", desc: "Membawa aura kesedihan.", rarity: "COMMON", power: 35, img: "./img/jeruk_purut.jpg" }
    ];

    const els = {
        screens: { 
            input: document.getElementById('screenInput'), 
            loading: document.getElementById('screenLoading'), 
            result: document.getElementById('screenResult') 
        },
        input: document.getElementById('inputName'),
        btnSummon: document.getElementById('btnSummon'),
        btnRetry: document.getElementById('btnRetry'),
        card: {
            box: document.getElementById('captureArea'), img: document.getElementById('khodamImg'),
            name: document.getElementById('khodamName'), desc: document.getElementById('khodamDesc'),
            badge: document.getElementById('rarityBadge'), id: document.getElementById('cardId'),
            barAtk: document.getElementById('barAtk'), barMag: document.getElementById('barMag')
        },
        lbList: document.getElementById('leaderboardList'),
        audio: { bgm: document.getElementById('bgm'), heart: document.getElementById('sfxHeart'), jump: document.getElementById('sfxJump') }
    };

    function showScreen(screenName) {
        Object.values(els.screens).forEach(s => {
            s.classList.remove('active', 'show');
            s.classList.add('hidden', 'hide');
        });
        els.screens[screenName].classList.remove('hidden', 'hide');
        els.screens[screenName].classList.add('active', 'show');
    }

    function initLeaderboard() {
        const lbRef = ref(db, 'leaderboard');
        const q = query(lbRef, limitToLast(10)); 

        onValue(q, (snapshot) => {
            els.lbList.innerHTML = ""; 
            const data = snapshot.val();

            if (data) {
                let sortedData = Object.values(data);
                const score = { "LEGENDARY": 4, "EPIC": 3, "RARE": 2, "COMMON": 1 };
                
                sortedData.sort((a, b) => {
                    let sA = score[a.rarity] || 0;
                    let sB = score[b.rarity] || 0;
                    if(sB !== sA) return sB - sA;
                    return b.timestamp - a.timestamp;
                });

                sortedData = sortedData.slice(0, 10);

                sortedData.forEach((item, index) => {
                    let badgeClass = "badge-common";
                    if(item.rarity === "LEGENDARY") badgeClass = "badge-legend";
                    else if(item.rarity === "EPIC") badgeClass = "badge-epic";
                    else if(item.rarity === "RARE") badgeClass = "badge-rare";

                    const li = document.createElement('li');
                    li.className = `lb-item`;
                    li.innerHTML = `
                        <div class="lb-left">
                            <span class="rank">#${index + 1}</span>
                            <div>
                                <span class="user">${escapeHtml(item.user)}</span>
                                <span class="khodam-small">${item.khodam}</span>
                            </div>
                        </div>
                        <div class="lb-badge ${badgeClass}">${item.rarity}</div>
                    `;
                    els.lbList.appendChild(li);
                });
            } else {
                els.lbList.innerHTML = "<li style='padding:15px; text-align:center; color:#555; font-size:0.8rem;'>Belum ada data arwah...</li>";
            }
        });
    }
    initLeaderboard();

    function saveToFirebase(userName, khodamData) {
        const lbRef = ref(db, 'leaderboard');
        push(lbRef, { user: userName, khodam: khodamData.name, rarity: khodamData.rarity, timestamp: Date.now() });
    }

    els.btnSummon.addEventListener('click', startRitual);
    els.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); startRitual(); }
    });
    els.btnRetry.addEventListener('click', () => location.reload());

    function startRitual() {
        const name = els.input.value.trim();
        if(!name) {
            const group = els.input.parentElement;
            group.classList.add('shake');
            setTimeout(() => group.classList.remove('shake'), 400);
            return;
        }

        els.audio.bgm.volume = 0.4;
        els.audio.bgm.play().catch(()=>{});
        els.audio.heart.play();

        showScreen('loading');

        setTimeout(() => {
            els.audio.heart.pause();
            els.audio.jump.play();
            revealKhodam(name);
        }, 3000);
    }

    function revealKhodam(name) {
        showScreen('result');

        let hash = 0;
        if(name.toLowerCase() === "admin") hash = 0;
        else for(let i=0; i<name.length; i++) hash += name.charCodeAt(i);
        
        const khodam = KHODAMS[hash % KHODAMS.length];

        els.card.name.innerText = khodam.name;
        els.card.desc.innerText = khodam.desc;
        els.card.badge.innerText = khodam.rarity;
        els.card.id.innerText = String(hash).slice(0,3);
        
        els.card.img.src = khodam.img;
        els.card.img.onerror = function() { this.style.display = 'none'; };

        const colorMap = { 'LEGENDARY': '#c5a059', 'EPIC': '#8a0303', 'RARE': '#0044ff', 'COMMON': '#555' };
        const color = colorMap[khodam.rarity] || '#555';
        els.card.badge.style.borderColor = color; 
        els.card.badge.style.color = color;
        
        setTimeout(() => {
            els.card.barAtk.style.width = `${khodam.power}%`;
            els.card.barMag.style.width = `${khodam.power - (hash % 10)}%`;
        }, 300);

        saveToFirebase(name, khodam);
    }

    function escapeHtml(text) {
        if (!text) return text;
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    document.getElementById('btnShare').addEventListener('click', () => {
        const text = `Khodam gw: ${els.card.name.innerText}. Cek khodam lu sekarang!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });

    // LOGIKA SIMPAN GAMBAR (Fix Animasi)
    document.getElementById('btnSave').addEventListener('click', function() {
        const btn = this;
        const card = els.card.box;
        const oldContent = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        // Matikan animasi sebelum foto
        card.classList.add('snapshot-mode');

        setTimeout(() => {
            html2canvas(card, { 
                backgroundColor: '#080808', 
                useCORS: true, 
                scale: 3, // High Quality
                allowTaint: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Khodam-${Date.now()}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
                
                // Kembalikan semula
                card.classList.remove('snapshot-mode');
                btn.innerHTML = oldContent;
                btn.disabled = false;
            }).catch(err => {
                console.error("Gagal save:", err);
                card.classList.remove('snapshot-mode');
                btn.innerHTML = oldContent;
                btn.disabled = false;
                alert("Gagal menyimpan gambar. Pastikan dijalankan via Live Server.");
            });
        }, 100);
    });
});