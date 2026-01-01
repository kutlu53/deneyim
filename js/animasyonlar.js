/**
 * Animasyon Servisi
 * Canvas tabanli animasyonlar
 */

// Animasyon kontrol degiskenleri
let animasyon_dongusu_id = null;
let animasyon_durumu = false;

/**
 * Canvas hiDPI ayari yapar (bulaniklik onleme)
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function canvas_hidpi_ayarla(tuval, ctx) {
    const oran = window.devicePixelRatio || 1;
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;
    
    // Canvas boyutunu cihaz pikseline gore ayarla
    tuval.width = genislik * oran;
    tuval.height = yukseklik * oran;
    
    // Transform ile CSS pikseli boyutlarina geri donustur
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
    
    // CSS boyutunu ayarla (gorsel boyut degismesin)
    tuval.style.width = genislik + 'px';
    tuval.style.height = yukseklik + 'px';
}

/**
 * Animasyonu baslatir
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {HTMLElement} not_alani - Not gosterilecek alan
 * @param {Object} animasyon_bilgisi - Animasyon bilgisi objesi
 * @param {HTMLElement} baslat_butonu - Baslat butonu (opsiyonel)
 */
function animasyonu_baslat(tuval, not_alani, animasyon_bilgisi, baslat_butonu) {
    // Her zaman once animasyonu durdur
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

    // Animasyon bilgisi yoksa
    if (!animasyon_bilgisi || !animasyon_bilgisi.tur || animasyon_bilgisi.tur !== 'canvas') {
        not_alani.textContent = 'Bu deney icin animasyon tanimli degil.';
        if (baslat_butonu) {
            baslat_butonu.disabled = true;
        }
        return;
    }

    const animasyon_adi = animasyon_bilgisi.ad;
    const ayarlar = animasyon_bilgisi.ayarlar || {};

    // Animasyon sablonlari esleme nesnesi
    const animasyon_sablonlari = {
        delikli_sise: delikli_sise_animasyonu_baslat,
        top_sekme: top_sekme_animasyonu_baslat,
        basinc_alan: basinc_alan_animasyonu_baslat
    };

    // Animasyon tipini sec
    const animasyon_fonksiyonu = animasyon_sablonlari[animasyon_adi];
    
    if (!animasyon_fonksiyonu) {
        not_alani.textContent = 'Bu deney icin animasyon tanimli degil.';
        if (baslat_butonu) {
            baslat_butonu.disabled = true;
        }
        return;
    }

    // Animasyonu baslat
    animasyon_durumu = true;
    not_alani.textContent = 'Animasyon calisiyor...';
    
    // Butonu guncelle
    if (baslat_butonu) {
        baslat_butonu.disabled = false;
        baslat_butonu.textContent = 'Tekrar Baslat';
    }

    // Animasyon fonksiyonunu cagir
    animasyon_fonksiyonu(ctx, tuval, ayarlar);
}

/**
 * Animasyonu durdurur
 */
function animasyonu_durdur() {
    animasyon_durumu = false;
    
    // Animation frame'i iptal et
    if (animasyon_dongusu_id !== null) {
        cancelAnimationFrame(animasyon_dongusu_id);
        animasyon_dongusu_id = null;
    }
    
    // Butonu guncelle
    const baslat_butonu = document.getElementById('animasyon_baslat_butonu');
    if (baslat_butonu) {
        baslat_butonu.disabled = false;
        baslat_butonu.textContent = 'Animasyonu Baslat';
    }
    
    // Not alanini guncelle
    const not_alani = document.getElementById('animasyon_notu');
    if (not_alani) {
        not_alani.textContent = '';
    }
    
    // Canvas'i temizle
    const tuval = document.getElementById('deney_animasyon_tuvali');
    if (tuval) {
        const ctx = tuval.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, tuval.width, tuval.height);
        }
    }
}

/**
 * Delikli sise animasyonu
 * Basinc farki nedeniyle alttaki delikten daha uzağa fiskiyetsin
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {Object} ayarlar - Animasyon ayarlari
 */
function delikli_sise_animasyonu_baslat(ctx, tuval, ayarlar) {
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;
    const delik_sayisi = ayarlar.delik_sayisi || 3;

    // Sise boyutlari
    const sise_genislik = 80;
    const sise_yukseklik = 120;
    const sise_x = genislik / 2 - sise_genislik / 2;
    const sise_y = 40;

    // Su seviyesi
    let su_seviyesi = sise_y + 30;

    // Delik pozisyonlari (ustten asagiya)
    const delikler = [];
    for (let i = 0; i < delik_sayisi; i++) {
        delikler.push({
            x: sise_x + sise_genislik,
            y: sise_y + 40 + (i * 35),
            fiskiye_uzunluk: 0,
            fiskiye_hiz: 0,
            aktif: false
        });
    }

    let zaman = 0;

    function ciz() {
        if (!animasyon_durumu) return;

        zaman += 0.02;

        // Arka plani temizle
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, genislik, yukseklik);

        // Sise cizimi
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        // Sise gövdesi
        ctx.beginPath();
        ctx.rect(sise_x, sise_y, sise_genislik, sise_yukseklik);
        ctx.fill();
        ctx.stroke();

        // Su cizimi
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(sise_x + 2, su_seviyesi, sise_genislik - 4, (sise_y + sise_yukseklik) - su_seviyesi);

        // Delikler ve fiskiyeler
        delikler.forEach((delik, index) => {
            // Delik cizimi
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(delik.x, delik.y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Su seviyesinden asagida olan delikler icin fiskiye
            if (delik.y < su_seviyesi) {
                const basinc_yuksekligi = su_seviyesi - delik.y;
                // Basinc yuksekligi arttikca fiskiye uzunlugu artar
                // Alttaki delikler daha uzun fiskiyetsin
                const uzunluk = basinc_yuksekligi * 0.8 + (sise_yukseklik - (delik.y - sise_y)) * 0.5;

                // Fiskive cizimi
                ctx.strokeStyle = '#4a90e2';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(delik.x, delik.y);
                ctx.lineTo(delik.x + uzunluk, delik.y + uzunluk * 0.3);
                ctx.stroke();

                // Fiskive damlalari
                const damla_sayisi = Math.floor(uzunluk / 8);
                for (let i = 0; i < damla_sayisi; i++) {
                    const damla_x = delik.x + (i * uzunluk / damla_sayisi) + Math.sin(zaman * 5 + i) * 2;
                    const damla_y = delik.y + (i * uzunluk / damla_sayisi) * 0.3 + Math.cos(zaman * 5 + i) * 2;
                    ctx.fillStyle = '#4a90e2';
                    ctx.beginPath();
                    ctx.arc(damla_x, damla_y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Bilgi metni (canvas alt kisimda yer alacak)
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Basinc farki: Alttaki delik daha uzaga fiskiyetsin', 10, yukseklik - 25);
        ctx.fillText('(Basinc = yogunluk × yer cekimi × yukseklik)', 10, yukseklik - 8);

        animasyon_dongusu_id = requestAnimationFrame(ciz);
    }

    ciz();
}

/**
 * Top sekme animasyonu
 * Top ziplasin ve her sekmede ziplama azalsin (enerji kaybi)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {Object} ayarlar - Animasyon ayarlari
 */
function top_sekme_animasyonu_baslat(ctx, tuval, ayarlar) {
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;
    const baslangic_yukseklik = ayarlar.baslangic_yukseklik || 150;

    // Top ozellikleri
    const top_yaricap = 15;
    let top_x = genislik / 2;
    let top_y = baslangic_yukseklik;
    let hiz_y = 0;
    let hiz_x = 2;
    let zemin_y = yukseklik - 30;
    let enerji_kaybi = 0.85; // Her sekmede %15 enerji kaybi

    // Yer cekimi ivmesi
    const yer_cekimi = 0.5;

    function ciz() {
        if (!animasyon_durumu) return;

        // Fizik hesaplamalari
        hiz_y += yer_cekimi; // Yer cekimi eklenir
        top_y += hiz_y;
        top_x += hiz_x;

        // Duvar carpma kontrolu
        if (top_x <= top_yaricap || top_x >= genislik - top_yaricap) {
            hiz_x = -hiz_x;
        }

        // Zemin carpma kontrolu (sekme)
        if (top_y >= zemin_y - top_yaricap) {
            top_y = zemin_y - top_yaricap;
            hiz_y = -Math.abs(hiz_y) * enerji_kaybi; // Enerji kaybi ile yukari firlat
            hiz_x *= 0.95; // Yatay surtunme
        }

        // Ust sinir
        if (top_y < top_yaricap) {
            top_y = top_yaricap;
            hiz_y = 0;
        }

        // Arka plani temizle
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, genislik, yukseklik);

        // Zemin cizimi
        ctx.fillStyle = '#888';
        ctx.fillRect(0, zemin_y, genislik, yukseklik - zemin_y);

        // Zemin cizgisi
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, zemin_y);
        ctx.lineTo(genislik, zemin_y);
        ctx.stroke();

        // Top cizimi
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(top_x, top_y, top_yaricap, 0, Math.PI * 2);
        ctx.fill();

        // Top golgesi
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(top_x, zemin_y, top_yaricap * 0.8, top_yaricap * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bilgi metni (canvas alt kisimda yer alacak)
        const potansiyel_enerji = (zemin_y - top_y) * 0.1; // Basit potansiyel enerji hesabi
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Potansiyel Enerji: ${potansiyel_enerji.toFixed(2)} J (tahmini)`, 10, yukseklik - 40);
        ctx.fillText('Her sekmede enerji kaybi (hava direnci, surtunme)', 10, yukseklik - 23);
        ctx.fillText('Top yuksekligi azaldikca potansiyel enerji azalir', 10, yukseklik - 8);

        animasyon_dongusu_id = requestAnimationFrame(ciz);
    }

    ciz();
}

/**
 * Basinc ve Alan animasyonu
 * Ayni agirlik/genis ve dar alan uzerinde basinc farkini gosterir (P = F/A)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} tuval - Canvas elementi
 * @param {Object} ayarlar - Animasyon ayarlari
 */
function basinc_alan_animasyonu_baslat(ctx, tuval, ayarlar) {
    const genislik = tuval.clientWidth;
    const yukseklik = tuval.clientHeight;

    // Genis ve dar alan pozisyonlari
    const genis_alan_x = 80;
    const dar_alan_x = 300;
    const alan_y = 50;
    
    const genis_alan_genislik = 120;
    const genis_alan_yukseklik = 20;
    const dar_alan_genislik = 40;
    const dar_alan_yukseklik = 20;

    // Agirlik ozellikleri
    const agirlik_genislik = 100;
    const agirlik_yukseklik = 30;
    let genis_agirlik_y = alan_y - agirlik_yukseklik;
    let dar_agirlik_y = alan_y - agirlik_yukseklik;

    // Basinc gostergeleri (derinlik)
    let genis_basinc_derinlik = 0;
    let dar_basinc_derinlik = 0;

    // Ayni kuvvet (F)
    const kuvvet = 100; // N (Newton)
    const genis_alan = genis_alan_genislik * genis_alan_yukseklik; // cm2
    const dar_alan = dar_alan_genislik * dar_alan_yukseklik; // cm2

    let zaman = 0;
    let animasyon_fazi = 0; // 0: agirliklar dusuyor, 1: basinc gosteriliyor

    function ciz() {
        if (!animasyon_durumu) return;

        zaman += 0.02;

        // Arka plani temizle
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, genislik, yukseklik);

        // Zemin cizgisi
        const zemin_y = yukseklik - 40;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, zemin_y);
        ctx.lineTo(genislik, zemin_y);
        ctx.stroke();

        // Animasyon fazi: agirliklar dusuyor
        if (animasyon_fazi === 0 && zaman < 1.5) {
            genis_agirlik_y = alan_y - agirlik_yukseklik - (zaman * 40);
            dar_agirlik_y = alan_y - agirlik_yukseklik - (zaman * 40);
            
            if (zaman >= 1.5) {
                animasyon_fazi = 1;
                genis_agirlik_y = alan_y - agirlik_yukseklik;
                dar_agirlik_y = alan_y - agirlik_yukseklik;
            }
        }

        // Basinc derinligi hesapla (P = F/A)
        if (animasyon_fazi === 1) {
            const genis_basinc = kuvvet / genis_alan; // N/cm2
            const dar_basinc = kuvvet / dar_alan; // N/cm2
            
            // Basinc orani gore derinlik (dar alanda 3 kat daha fazla basinc)
            genis_basinc_derinlik = Math.min(8, (genis_basinc / dar_basinc) * 5);
            dar_basinc_derinlik = Math.min(24, dar_basinc * 0.3);
        }

        // Genis alan cizimi (solda)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.fillRect(genis_alan_x, alan_y, genis_alan_genislik, genis_alan_yukseklik);
        ctx.strokeRect(genis_alan_x, alan_y, genis_alan_genislik, genis_alan_yukseklik);

        // Genis alan uzerindeki agirlik
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(genis_alan_x + (genis_alan_genislik - agirlik_genislik) / 2, genis_agirlik_y, agirlik_genislik, agirlik_yukseklik);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(genis_alan_x + (genis_alan_genislik - agirlik_genislik) / 2, genis_agirlik_y, agirlik_genislik, agirlik_yukseklik);

        // Genis alan altinda basinc derinligi (iz)
        if (animasyon_fazi === 1 && genis_basinc_derinlik > 0) {
            ctx.fillStyle = '#555';
            ctx.fillRect(genis_alan_x, alan_y + genis_alan_yukseklik, genis_alan_genislik, genis_basinc_derinlik);
        }

        // Dar alan cizimi (sagda)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.fillRect(dar_alan_x, alan_y, dar_alan_genislik, dar_alan_yukseklik);
        ctx.strokeRect(dar_alan_x, alan_y, dar_alan_genislik, dar_alan_yukseklik);

        // Dar alan uzerindeki agirlik
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(dar_alan_x + (dar_alan_genislik - agirlik_genislik) / 2, dar_agirlik_y, agirlik_genislik, agirlik_yukseklik);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(dar_alan_x + (dar_alan_genislik - agirlik_genislik) / 2, dar_agirlik_y, agirlik_genislik, agirlik_yukseklik);

        // Dar alan altinda basinc derinligi (iz)
        if (animasyon_fazi === 1 && dar_basinc_derinlik > 0) {
            ctx.fillStyle = '#555';
            ctx.fillRect(dar_alan_x, alan_y + dar_alan_yukseklik, dar_alan_genislik, dar_basinc_derinlik);
        }

        // Etiketler
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Genis Alan', genis_alan_x, alan_y - 10);
        ctx.fillText('Dar Alan', dar_alan_x, alan_y - 10);

        // Basinc bilgisi
        if (animasyon_fazi === 1) {
            ctx.font = '12px Arial';
            const genis_p = (kuvvet / genis_alan).toFixed(2);
            const dar_p = (kuvvet / dar_alan).toFixed(2);
            ctx.fillText(`P = ${genis_p} N/cm²`, genis_alan_x, alan_y + genis_alan_yukseklik + genis_basinc_derinlik + 15);
            ctx.fillText(`P = ${dar_p} N/cm²`, dar_alan_x, alan_y + dar_alan_yukseklik + dar_basinc_derinlik + 15);
            
            ctx.font = 'bold 11px Arial';
            ctx.fillText('(Daha az basinc)', genis_alan_x, alan_y + genis_alan_yukseklik + genis_basinc_derinlik + 30);
            ctx.fillText('(Daha fazla basinc)', dar_alan_x, alan_y + dar_alan_yukseklik + dar_basinc_derinlik + 30);
        }

        // Alt bilgi
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Ayni kuvvet (F), farkli alanlar (A)', 10, yukseklik - 25);
        ctx.fillText('Basinc = Kuvvet / Alan (P = F/A)', 10, yukseklik - 8);

        animasyon_dongusu_id = requestAnimationFrame(ciz);
    }

    ciz();
}

// Global fonksiyonlar (window'a ekle)
if (typeof window !== 'undefined') {
    window.animasyonu_baslat = animasyonu_baslat;
    window.animasyonu_durdur = animasyonu_durdur;
}
