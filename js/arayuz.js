/**
 * Arayuz Servisi
 * DOM islemleri ve render fonksiyonlari
 */

/**
 * Kategori dropdown'unu doldurur
 * @param {Array} kategoriler - Kategori listesi
 */
function kategori_dropdown_doldur(kategoriler) {
    const kategori_select = document.getElementById('kategori_filtresi');
    if (!kategori_select) return;

    // Mevcut secenekleri koru (Tumu secenegi)
    const tumu_secenek = kategori_select.querySelector('option[value="tumu"]');
    kategori_select.innerHTML = '';
    if (tumu_secenek) {
        kategori_select.appendChild(tumu_secenek);
    }

    // Kategorileri ekle
    kategoriler.forEach(kategori => {
        const secenek = document.createElement('option');
        secenek.value = kategori.kimlik;
        secenek.textContent = kategori.ad;
        kategori_select.appendChild(secenek);
    });
}

/**
 * Deney kartlarini listeler
 * @param {Array} deneyler - Deney listesi
 */
function deney_kartlarini_bas(deneyler) {
    const liste_alani = document.getElementById('deney_listesi');
    if (!liste_alani) return;

    if (deneyler.length === 0) {
        liste_alani.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Deney bulunamadi.</p>';
        return;
    }

    liste_alani.innerHTML = '';

    deneyler.forEach(deney => {
        const kart = deney_karti_olustur(deney);
        liste_alani.appendChild(kart);
    });
}

/**
 * Tek bir deney kartı olusturur
 * @param {Object} deney - Deney objesi
 * @returns {HTMLElement} Kart elementi
 */
function deney_karti_olustur(deney) {
    const kart = document.createElement('div');
    kart.className = 'deney_karti';
    kart.dataset.kimlik = deney.kimlik;

    const kategori_adi = kategori_adi_getir(deney.kategori);
    const sinif_araligi = `${deney.sinif_araligi.en_az}. - ${deney.sinif_araligi.en_cok}. Sinif`;

    kart.innerHTML = `
        <div class="deney_karti_baslik">${deney.baslik}</div>
        <div class="deney_karti_bilgi">
            <span class="deney_karti_sinif">${sinif_araligi}</span>
            ${kategori_adi}
        </div>
        <div class="deney_karti_bilgi">Tahmini sure: ${deney.tahmini_sure_dk} dakika</div>
    `;

    // Tiklama olayı
    kart.addEventListener('click', () => {
        deney_modal_ac(deney.kimlik);
    });

    return kart;
}

/**
 * Deney detay modalini acar
 * @param {string} deney_kimlik - Deney kimligi
 */
function deney_modal_ac(deney_kimlik) {
    const deney = deneyi_kimlige_gore_bul(deney_kimlik);
    if (!deney) return;

    const modal = document.getElementById('deney_modal');
    const icerik_alani = document.getElementById('modal_icerik_alani');
    if (!modal || !icerik_alani) return;

    // Modal icerigini olustur
    icerik_alani.innerHTML = deney_detay_icerik_olustur(deney);

    // Animasyon butonu olay dinleyicisini ayarla
    setTimeout(() => {
        const baslat_butonu = document.getElementById('animasyon_baslat_butonu');
        const tuval = document.getElementById('deney_animasyon_tuvali');
        const not_alani = document.getElementById('animasyon_notu');
        
        if (baslat_butonu && tuval && not_alani) {
            baslat_butonu.addEventListener('click', () => {
                if (typeof window.animasyonu_oynat === 'function') {
                    window.animasyonu_oynat(tuval, not_alani, deney.animasyon);
                }
            });
        }
    }, 100);

    // Modal'i goster
    modal.style.display = 'block';

    // Kapat butonlarini ayarla
    const kapat_butonlari = modal.querySelectorAll('.modal_kapat');
    kapat_butonlari.forEach(buton => {
        buton.onclick = () => {
            // Animasyonu durdur
            if (typeof window.animasyonu_durdur === 'function') {
                window.animasyonu_durdur();
            }
            modal.style.display = 'none';
        };
    });

    // Disariya tiklaninca kapat
    modal.onclick = (olay) => {
        if (olay.target === modal) {
            // Animasyonu durdur
            if (typeof window.animasyonu_durdur === 'function') {
                window.animasyonu_durdur();
            }
            modal.style.display = 'none';
        }
    };
}

/**
 * Deney detay icerigini olusturur
 * @param {Object} deney - Deney objesi
 * @returns {string} HTML icerigi
 */
function deney_detay_icerik_olustur(deney) {
    const kategori_adi = kategori_adi_getir(deney.kategori);
    const sinif_araligi = `${deney.sinif_araligi.en_az}. - ${deney.sinif_araligi.en_cok}. Sinif`;

    let html = `
        <h2 class="deney_detay_baslik">${deney.baslik}</h2>
        <div class="deney_detay_bolum">
            <div class="deney_karti_bilgi">Kategori: ${kategori_adi}</div>
            <div class="deney_karti_bilgi">Sinif: ${sinif_araligi}</div>
            <div class="deney_karti_bilgi">Tahmini sure: ${deney.tahmini_sure_dk} dakika</div>
        </div>

        <div class="deney_detay_bolum">
            <h3 class="deney_detay_bolum_baslik">Malzemeler</h3>
            <ul class="deney_detay_liste">
                ${deney.malzemeler.map(m => `<li>${m}</li>`).join('')}
            </ul>
        </div>
    `;

    if (deney.guvenlik && deney.guvenlik.length > 0) {
        html += `
            <div class="deney_detay_bolum">
                <h3 class="deney_detay_bolum_baslik">Guvenlik</h3>
                <div class="guvenlik_uyari">
                    ${deney.guvenlik.map(g => `<div>⚠ ${g}</div>`).join('')}
                </div>
            </div>
        `;
    }

    html += `
        <div class="deney_detay_bolum">
            <h3 class="deney_detay_bolum_baslik">Adimlar</h3>
            <ol class="deney_detay_liste">
                ${deney.adimlar.map((a, i) => `<li>${a}</li>`).join('')}
            </ol>
        </div>

        <div class="deney_detay_bolum">
            <h3 class="deney_detay_bolum_baslik">Animasyon</h3>
            <div class="animasyon_alani">
                <canvas id="deney_animasyon_tuvali" width="520" height="240"></canvas>
                <div class="animasyon_kontrol">
                    <button id="animasyon_baslat_butonu" class="animasyon_butonu">Animasyonu Baslat</button>
                    <div id="animasyon_notu"></div>
                </div>
            </div>
        </div>

        <div class="deney_detay_bolum">
            <h3 class="deney_detay_bolum_baslik">Tahmin Sorusu</h3>
            <p>${deney.tahmin_sorusu}</p>
        </div>
    `;

    // Form alanlari
    html += `
        <form id="deney_formu" data-kimlik="${deney.kimlik}">
            <div class="deney_detay_bolum">
                <h3 class="deney_detay_bolum_baslik">Tahminin</h3>
                <div class="form_grup">
                    <label for="tahmin_metin">Tahmin:</label>
                    <textarea id="tahmin_metin" name="tahmin_metin" required></textarea>
                </div>
                ${deney.olcum_alanlari.some(oa => oa.tip === 'sayi') ? `
                    <div class="form_grup">
                        <label for="tahmin_sayi">Tahmin Sayisi (Opsiyonel):</label>
                        <input type="number" id="tahmin_sayi" name="tahmin_sayi" step="any">
                    </div>
                ` : ''}
            </div>

            <div class="deney_detay_bolum">
                <h3 class="deney_detay_bolum_baslik">Olcumler</h3>
                ${deney.olcum_alanlari.map(oa => olcum_alani_html_olustur(oa)).join('')}
            </div>

            <div class="buton_grup">
                <button type="submit" class="ana_buton">Kaydet ve Analiz Et</button>
            </div>
        </form>
    `;

    return html;
}

/**
 * Olcum alani HTML'i olusturur
 * @param {Object} olcum_alani - Olcum alani objesi
 * @returns {string} HTML
 */
function olcum_alani_html_olustur(olcum_alani) {
    const birim_etiketi = olcum_alani.birim ? ` <span class="birim_etiketi">(${olcum_alani.birim})</span>` : '';
    
    if (olcum_alani.tip === 'sayi') {
        return `
            <div class="form_grup">
                <label for="olcum_${olcum_alani.anahtar}">${olcum_alani.etiket}${birim_etiketi}:</label>
                <input type="number" id="olcum_${olcum_alani.anahtar}" name="olcum_${olcum_alani.anahtar}" step="any" required>
            </div>
        `;
    } else {
        return `
            <div class="form_grup">
                <label for="olcum_${olcum_alani.anahtar}">${olcum_alani.etiket}${birim_etiketi}:</label>
                <textarea id="olcum_${olcum_alani.anahtar}" name="olcum_${olcum_alani.anahtar}" required></textarea>
            </div>
        `;
    }
}

/**
 * Modal'i kapatir
 */
function deney_modal_kapat() {
    // Animasyonu durdur
    if (typeof window.animasyonu_durdur === 'function') {
        window.animasyonu_durdur();
    }
    const modal = document.getElementById('deney_modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Gecmis modalini acar
 */
function gecmis_modal_ac() {
    const modal = document.getElementById('gecmis_modal');
    const liste_alani = document.getElementById('gecmis_liste_alani');
    if (!modal || !liste_alani) return;

    const kayitlar = kayitlari_getir();
    
    if (kayitlar.length === 0) {
        liste_alani.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Henuz kayit yok.</p>';
    } else {
        liste_alani.innerHTML = kayitlar.map(kayit => gecmis_kayit_html_olustur(kayit)).join('');
    }

    modal.style.display = 'block';

    // Kapat butonlarini ayarla
    const kapat_butonlari = modal.querySelectorAll('.modal_kapat');
    kapat_butonlari.forEach(buton => {
        buton.onclick = () => {
            modal.style.display = 'none';
        };
    });

    // Disariya tiklaninca kapat
    modal.onclick = (olay) => {
        if (olay.target === modal) {
            modal.style.display = 'none';
        }
    };
}

/**
 * Gecmis kayit HTML'i olusturur
 * @param {Object} kayit - Kayit objesi
 * @returns {string} HTML
 */
function gecmis_kayit_html_olustur(kayit) {
    const deney = deneyi_kimlige_gore_bul(kayit.kimlik);
    const deney_baslik = deney ? deney.baslik : kayit.kimlik;
    const tarih = new Date(kayit.tarih).toLocaleString('tr-TR');

    // Tahmin ozeti
    const tahmin_ozeti = kayit.tahmin ? (kayit.tahmin.length > 100 ? kayit.tahmin.substring(0, 100) + '...' : kayit.tahmin) : 'Yok';

    // Olcum ozeti
    const olcum_ozeti = Object.keys(kayit.olcumler || {}).length > 0 
        ? Object.entries(kayit.olcumler).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Yok';

    // Analiz ozeti
    const analiz_ozeti = kayit.analiz_sonuc ? (kayit.analiz_sonuc.length > 150 ? kayit.analiz_sonuc.substring(0, 150) + '...' : kayit.analiz_sonuc) : 'Yok';

    return `
        <div class="gecmis_kayit">
            <div class="gecmis_kayit_baslik">${deney_baslik}</div>
            <div class="gecmis_kayit_tarih">${tarih}</div>
            <div class="gecmis_kayit_ozet">
                <span class="gecmis_kayit_ozet_baslik">Tahmin: </span>${tahmin_ozeti}
            </div>
            <div class="gecmis_kayit_ozet">
                <span class="gecmis_kayit_ozet_baslik">Olcumler: </span>${olcum_ozeti}
            </div>
            <div class="gecmis_kayit_ozet">
                <span class="gecmis_kayit_ozet_baslik">Analiz: </span>${analiz_ozeti}
            </div>
        </div>
    `;
}

/**
 * Hata mesajini gosterir
 * @param {string} mesaj - Hata mesaji
 */
function hata_mesaji_goster(mesaj) {
    const hata_div = document.getElementById('hata_mesaji');
    if (hata_div) {
        hata_div.textContent = mesaj;
        hata_div.style.display = 'block';
    }
}

/**
 * Hata mesajini gizler
 */
function hata_mesaji_gizle() {
    const hata_div = document.getElementById('hata_mesaji');
    if (hata_div) {
        hata_div.style.display = 'none';
    }
}

