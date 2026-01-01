/**
 * Animasyon Motoru
 * Storyboard tabanli ozel animasyonlar
 */

// Animasyon kontrol degiskenleri
let animasyon_dongusu_id = null;
let animasyon_durumu = false;
let animasyon_baslangic_zamani = null;
let mevcut_sahne_indeksi = 0;
let animasyon_sahneleri = [];
let animasyon_tuval = null;
let animasyon_ctx = null;

/**
 * Canvas hiDPI ayari yapar
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function canvas_hidpi_ayarla(tuval, ctx) {
    const oran = window.devicePixelRatio || 1;
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;
    
    tuval.width = genislik * oran;
    tuval.height = yukseklik * oran;
    
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
    
    tuval.style.width = genislik + 'px';
    tuval.style.height = yukseklik + 'px';
}

/**
 * Animasyonu oynatir
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {HTMLElement} not_alani - Not gosterilecek alan
 * @param {Object} animasyon_verisi - Animasyon verisi objesi
 */
function animasyonu_oynat(tuval, not_alani, animasyon_verisi) {
    // Once mevcut animasyonu durdur
    animasyonu_durdur();
    
    if (!tuval || !not_alani) {
        if (not_alani) {
            not_alani.textContent = 'Animasyon icin gerekli elementler bulunamadi.';
        }
        return;
    }

    // Canvas context al
    const ctx = tuval.getContext('2d');
    if (!ctx) {
        not_alani.textContent = 'Canvas desteklenmiyor.';
        return;
    }
    
    // hiDPI ayari
    canvas_hidpi_ayarla(tuval, ctx);
    
    // Canvas'i temizle
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;
    ctx.clearRect(0, 0, genislik, yukseklik);

    // Animasyon verisi kontrolu
    if (!animasyon_verisi || !animasyon_verisi.tur || animasyon_verisi.tur !== 'canvas' || !animasyon_verisi.sahneler || animasyon_verisi.sahneler.length === 0) {
        not_alani.textContent = 'Bu deney icin animasyon tanimli degil.';
        return;
    }

    // Animasyon baslat
    animasyon_tuval = tuval;
    animasyon_ctx = ctx;
    animasyon_sahneleri = animasyon_verisi.sahneler;
    animasyon_durumu = true;
    animasyon_baslangic_zamani = null;
    mevcut_sahne_indeksi = 0;
    
    not_alani.textContent = animasyon_sahneleri[0].metin || 'Animasyon calisiyor...';
    
    // Animasyon dongusunu baslat
    animasyon_dongusu_id = requestAnimationFrame(animasyon_ciz);
}

/**
 * Animasyon cizim dongusu
 */
function animasyon_ciz(zaman) {
    if (!animasyon_durumu || !animasyon_ctx || !animasyon_tuval) return;
    
    // Ilk frame'de zaman kaydini baslat
    if (animasyon_baslangic_zamani === null) {
        animasyon_baslangic_zamani = zaman;
    }
    
    const gecen_sure = zaman - animasyon_baslangic_zamani;
    const genislik = animasyon_tuval.clientWidth;
    const yukseklik = animasyon_tuval.clientHeight;
    
    // Arka plani temizle
    animasyon_ctx.fillStyle = '#f0f0f0';
    animasyon_ctx.fillRect(0, 0, genislik, yukseklik);
    
    // Mevcut sahnenin surelerini topla
    let toplam_sure = 0;
    for (let i = 0; i < mevcut_sahne_indeksi; i++) {
        toplam_sure += animasyon_sahneleri[i].sure_ms || 1000;
    }
    
    // Sahne degisimi kontrolu
    if (mevcut_sahne_indeksi < animasyon_sahneleri.length) {
        const mevcut_sahne = animasyon_sahneleri[mevcut_sahne_indeksi];
        const sahne_suresi = mevcut_sahne.sure_ms || 1000;
        
        if (gecen_sure >= toplam_sure + sahne_suresi) {
            mevcut_sahne_indeksi++;
            if (mevcut_sahne_indeksi < animasyon_sahneleri.length) {
                const not_alani = document.getElementById('animasyon_notu');
                if (not_alani && animasyon_sahneleri[mevcut_sahne_indeksi].metin) {
                    not_alani.textContent = animasyon_sahneleri[mevcut_sahne_indeksi].metin;
                }
            } else {
                // Tum sahneler bitti, basa don
                animasyon_baslangic_zamani = null;
                mevcut_sahne_indeksi = 0;
                const not_alani = document.getElementById('animasyon_notu');
                if (not_alani && animasyon_sahneleri[0].metin) {
                    not_alani.textContent = animasyon_sahneleri[0].metin;
                }
            }
            animasyon_dongusu_id = requestAnimationFrame(animasyon_ciz);
            return;
        }
    }
    
    // Mevcut sahnedeki ogeleri ciz
    if (mevcut_sahne_indeksi < animasyon_sahneleri.length) {
        const sahne = animasyon_sahneleri[mevcut_sahne_indeksi];
        const sahne_icindeki_sure = gecen_sure - toplam_sure;
        
        if (sahne.ogeler && sahne.ogeler.length > 0) {
            sahne.ogeler.forEach(oge => {
                oge_ciz(animasyon_ctx, oge, sahne_icindeki_sure, genislik, yukseklik);
            });
        }
    }
    
    animasyon_dongusu_id = requestAnimationFrame(animasyon_ciz);
}

/**
 * Oge cizim fonksiyonu
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} oge - Oge objesi
 * @param {number} sure - Sahne icindeki sure (ms)
 * @param {number} genislik - Canvas genislik
 * @param {number} yukseklik - Canvas yukseklik
 */
function oge_ciz(ctx, oge, sure, genislik, yukseklik) {
    const tur = oge.tur || 'daire';
    const x = oge.x || 0;
    const y = oge.y || 0;
    const w = oge.w || 50;
    const h = oge.h || 50;
    const r = oge.r || 25;
    const renk = oge.renk || '#333333';
    const anim = oge.anim || '';
    const hiz = oge.hiz || 1.0;
    const yon = oge.yon || 'sag';
    
    // Hareket hesaplamalari
    let anim_x = x;
    let anim_y = y;
    let anim_aci = 0;
    
    if (anim) {
        const anim_sure = sure / 1000; // Saniye cinsinden
        
        switch (anim) {
            case 'kaydir':
                if (yon === 'sag') anim_x = x + (anim_sure * hiz * 50);
                else if (yon === 'sol') anim_x = x - (anim_sure * hiz * 50);
                else if (yon === 'yukari') anim_y = y - (anim_sure * hiz * 50);
                else if (yon === 'asagi') anim_y = y + (anim_sure * hiz * 50);
                break;
            case 'dus':
                anim_y = y + (anim_sure * hiz * 100);
                break;
            case 'ziplat':
                anim_y = y - Math.abs(Math.sin(anim_sure * hiz * 3)) * 30;
                break;
            case 'titre':
                anim_x = x + Math.sin(anim_sure * hiz * 10) * 5;
                anim_y = y + Math.cos(anim_sure * hiz * 10) * 5;
                break;
            case 'dalgalan':
                anim_y = y + Math.sin(anim_sure * hiz * 5) * 10;
                break;
            case 'don':
                anim_aci = (anim_sure * hiz * 60) % 360;
                break;
        }
    }
    
    // Oge turune gore ciz
    ctx.save();
    ctx.translate(anim_x, anim_y);
    if (anim_aci !== 0) {
        ctx.rotate((anim_aci * Math.PI) / 180);
    }
    ctx.fillStyle = renk;
    ctx.strokeStyle = renk;
    
    switch (tur) {
        case 'daire':
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'dikdortgen':
            ctx.fillRect(-w/2, -h/2, w, h);
            break;
        case 'cizgi':
            ctx.lineWidth = oge.kalinlik || 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w, h);
            ctx.stroke();
            break;
        case 'ok':
            ctx.lineWidth = oge.kalinlik || 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w, 0);
            ctx.lineTo(w - 10, -5);
            ctx.moveTo(w, 0);
            ctx.lineTo(w - 10, 5);
            ctx.stroke();
            break;
        case 'kap':
            // Kap cizimi (dikdortgen + ust kenar)
            ctx.fillRect(-w/2, -h/2, w, h);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(-w/2, -h/2, w, h);
            // Ust kenar
            ctx.fillStyle = '#fff';
            ctx.fillRect(-w/2, -h/2, w, 5);
            break;
        case 'sise':
            // Sise cizimi (ust dar, alt genis)
            ctx.beginPath();
            ctx.moveTo(-w/4, -h/2);
            ctx.lineTo(w/4, -h/2);
            ctx.lineTo(w/2, h/4);
            ctx.lineTo(-w/2, h/4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        case 'rampa':
            // Rampa cizimi (egik duzlem)
            ctx.beginPath();
            ctx.moveTo(-w/2, h/2);
            ctx.lineTo(w/2, -h/2);
            ctx.lineTo(w/2, h/2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        case 'ayna':
            // Ayna cizimi (dikdortgen + yansima efekti)
            ctx.fillRect(-w/2, -h/2, w, h);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(-w/2, -h/2, w, h);
            // Yansima efekti
            ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
            ctx.fillRect(-w/2, -h/2, w/2, h);
            break;
        case 'termometre':
            // Termometre cizimi (daire + cubuk)
            ctx.beginPath();
            ctx.arc(0, h/2 - 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-3, -h/2, 6, h - 10);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
        case 'dalga':
            // Dalga cizimi (sinus egrisi)
            ctx.strokeStyle = renk;
            ctx.lineWidth = oge.kalinlik || 2;
            ctx.beginPath();
            const dalga_genislik = w || 100;
            const dalga_yukseklik = h || 20;
            for (let i = 0; i < dalga_genislik; i++) {
                const y_pos = Math.sin((i / dalga_genislik) * Math.PI * 4 + (sure / 100)) * dalga_yukseklik;
                if (i === 0) ctx.moveTo(i - dalga_genislik/2, y_pos);
                else ctx.lineTo(i - dalga_genislik/2, y_pos);
            }
            ctx.stroke();
            break;
        default:
            // Varsayilan: daire
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
    }
    
    ctx.restore();
}

/**
 * Animasyonu durdurur
 */
function animasyonu_durdur() {
    animasyon_durumu = false;
    
    if (animasyon_dongusu_id !== null) {
        cancelAnimationFrame(animasyon_dongusu_id);
        animasyon_dongusu_id = null;
    }
    
    animasyon_baslangic_zamani = null;
    mevcut_sahne_indeksi = 0;
    animasyon_sahneleri = [];
    
    // Canvas'i temizle
    if (animasyon_tuval && animasyon_ctx) {
        const genislik = animasyon_tuval.clientWidth;
        const yukseklik = animasyon_tuval.clientHeight;
        animasyon_ctx.clearRect(0, 0, genislik, yukseklik);
    }
    
    animasyon_tuval = null;
    animasyon_ctx = null;
    
    // Not alanini temizle
    const not_alani = document.getElementById('animasyon_notu');
    if (not_alani) {
        not_alani.textContent = '';
    }
}

// Global fonksiyonlar
if (typeof window !== 'undefined') {
    window.animasyonu_oynat = animasyonu_oynat;
    window.animasyonu_durdur = animasyonu_durdur;
}

