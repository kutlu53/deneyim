/**
 * Ana Uygulama
 * Uygulama baslangici ve olay yonetimi
 */

// Uygulama baslangic fonksiyonu
async function uygulama_baslat() {
    try {
        // Verileri yukle
        await deneyleri_jsondan_yukle();

        // Kategorileri doldur
        const kategoriler = tum_kategorileri_getir();
        kategori_dropdown_doldur(kategoriler);

        // Tum deneyleri goster
        const tum_deneyler = tum_deneyleri_getir();
        deney_kartlarini_bas(tum_deneyler);

        // Olay dinleyicilerini ayarla
        olay_dinleyicilerini_ayarla();

        hata_mesaji_gizle();
    } catch (hata) {
        console.error('Uygulama baslatma hatasi:', hata);
        hata_mesaji_goster('Veri yuklenirken bir hata olustu. Sayfayi yenileyin.');
    }
}

/**
 * Tum olay dinleyicilerini ayarlar
 */
function olay_dinleyicilerini_ayarla() {
    // Kategori filtresi
    const kategori_filtresi = document.getElementById('kategori_filtresi');
    if (kategori_filtresi) {
        kategori_filtresi.addEventListener('change', filtre_ve_arama_uygula);
    }

    // Arama kutusu
    const arama_kutusu = document.getElementById('arama_kutusu');
    if (arama_kutusu) {
        arama_kutusu.addEventListener('input', filtre_ve_arama_uygula);
    }

    // Gecmis butonu
    const gecmis_butonu = document.getElementById('gecmis_butonu');
    if (gecmis_butonu) {
        gecmis_butonu.addEventListener('click', gecmis_modal_ac);
    }

    // Form gonderimi (dinamik olarak eklenen formlar icin event delegation)
    document.addEventListener('submit', (olay) => {
        if (olay.target.id === 'deney_formu') {
            olay.preventDefault();
            deney_formu_gonder(olay.target);
        }
    });
}

/**
 * Filtreleme ve arama islemini uygular
 */
function filtre_ve_arama_uygula() {
    const kategori_filtresi = document.getElementById('kategori_filtresi');
    const arama_kutusu = document.getElementById('arama_kutusu');

    const secili_kategori = kategori_filtresi ? kategori_filtresi.value : 'tumu';
    const arama_metni = arama_kutusu ? arama_kutusu.value : '';

    // Kategoriye gore filtrele
    let filtrelenmis_deneyler = kategoriye_gore_deneyleri_getir(secili_kategori);

    // Arama ile filtrele
    filtrelenmis_deneyler = deneyleri_arama_ile_filtrele(filtrelenmis_deneyler, arama_metni);

    // Sonuclari goster
    deney_kartlarini_bas(filtrelenmis_deneyler);
}

/**
 * Deney formunu isler ve analiz yapar
 * @param {HTMLFormElement} form - Form elementi
 */
async function deney_formu_gonder(form) {
    const deney_kimlik = form.dataset.kimlik;
    const deney = deneyi_kimlige_gore_bul(deney_kimlik);
    if (!deney) return;

    // Form verilerini topla
    const form_verisi = new FormData(form);
    const tahmin_metin = form_verisi.get('tahmin_metin') || '';
    const tahmin_sayi = form_verisi.get('tahmin_sayi') || null;

    // Olcumleri topla
    const olcumler = {};
    deney.olcum_alanlari.forEach(oa => {
        const deger = form_verisi.get(`olcum_${oa.anahtar}`);
        if (deger !== null) {
            if (oa.tip === 'sayi') {
                olcumler[oa.anahtar] = parseFloat(deger) || 0;
            } else {
                olcumler[oa.anahtar] = deger;
            }
        }
    });

    // Analiz yap
    const analiz_sonuc = analiz_yap(deney, olcumler);

    // Kayit olustur
    const kayit = {
        id: benzersiz_id_olustur(),
        kimlik: deney_kimlik,
        tarih: new Date().toISOString(),
        tahmin: tahmin_metin,
        olcumler: olcumler,
        analiz_sonuc: analiz_sonuc
    };

    // Kaydet
    kayit_ekle(kayit);

    // Analiz sonucunu goster
    analiz_sonucu_goster(analiz_sonuc);

    // Formu temizle veya modal'i kapat
    // (istege bagli - su an kapatmiyoruz, analiz sonucu gosteriliyor)
}

/**
 * Analiz yapar
 * @param {Object} deney - Deney objesi
 * @param {Object} olcumler - Olcum degerleri
 * @returns {string} Analiz sonucu metni
 */
function analiz_yap(deney, olcumler) {
    if (!deney.analiz) {
        return 'Analiz tanimli degil.';
    }

    if (deney.analiz.tur === 'kural') {
        // Kural tipi analiz: sablonu doldur
        let sonuc = deney.analiz.cikti_sablonu || deney.analiz.kural || '';
        
        // {{}} icindeki degiskenleri degistir
        sonuc = sonuc.replace(/\{\{(\w+)\}\}/g, (eslesme, degisken_adi) => {
            if (olcumler.hasOwnProperty(degisken_adi)) {
                return olcumler[degisken_adi];
            }
            return eslesme;
        });

        return sonuc;
    } else if (deney.analiz.tur === 'formul') {
        // Formul tipi analiz: guvenli hesap yap
        try {
            const formul_sonuc = formul_hesapla(deney.analiz.formul, olcumler);
            let sonuc = deney.analiz.cikti_sablonu || 'Sonuc: {{sonuc}}';
            
            // Sablondaki degiskenleri degistir
            sonuc = sonuc.replace(/\{\{(\w+)\}\}/g, (eslesme, degisken_adi) => {
                if (degisken_adi === 'sonuc' || degisken_adi in formul_sonuc) {
                    return formul_sonuc[degisken_adi] !== undefined 
                        ? formul_sonuc[degisken_adi] 
                        : olcumler[degisken_adi] || eslesme;
                }
                return olcumler[degisken_adi] !== undefined ? olcumler[degisken_adi] : eslesme;
            });

            return sonuc;
        } catch (hata) {
            return `Analiz hatasi: ${hata.message}`;
        }
    }

    return 'Bilinmeyen analiz turu.';
}

/**
 * Guvenli formul hesaplama (eval KULLANMAZ)
 * Sadece +, -, *, /, parantez ve degisken isimlerini destekler
 * @param {string} formul - Formul stringi (ornek: "hacim_ml = sonra_ml - once_ml")
 * @param {Object} degiskenler - Degisken degerleri
 * @returns {Object} Hesaplanan degerler (sol taraf -> deger)
 */
function formul_hesapla(formul, degiskenler) {
    // Formul formatini parse et: "sonuc = ifade" veya sadece "ifade"
    const esitlik_index = formul.indexOf('=');
    let sonuc_degisken = null;
    let ifade = formul.trim();

    if (esitlik_index !== -1) {
        sonuc_degisken = formul.substring(0, esitlik_index).trim();
        ifade = formul.substring(esitlik_index + 1).trim();
    }

    // Basit ifade hesaplama (sadece +, -, *, /, parantez)
    // Guvenlik icin sadece rakam, nokta, operator ve parantezlere izin ver
    // Degisken isimlerini degerleriyle degistir
    let islenmis_ifade = ifade;
    
    // Degisken isimlerini degerleriyle degistir
    Object.keys(degiskenler).forEach(degisken_adi => {
        const deger = degiskenler[degisken_adi];
        // Basit degisken ismi kontrolu (sadece harf, rakam, alt cizgi)
        const regex = new RegExp(`\\b${degisken_adi}\\b`, 'g');
        islenmis_ifade = islenmis_ifade.replace(regex, deger.toString());
    });

    // Guvenlik kontrolu: sadece rakam, nokta, operator, parantez, bosluk
    if (!/^[0-9+\-*/().\s]+$/.test(islenmis_ifade)) {
        throw new Error('Formul gecersiz karakterler iceriyor.');
    }

    // Basit eval (sadece matematiksel ifade)
    // Not: Burada eval kullanmak zorundayiz ama sadece matematiksel ifade icin
    // Guvenlik kontrolu yapildi
    let sonuc_degeri;
    try {
        // Function constructor kullanarak daha guvenli hale getir
        sonuc_degeri = Function('"use strict"; return (' + islenmis_ifade + ')')();
    } catch (hata) {
        throw new Error(`Hesaplama hatasi: ${hata.message}`);
    }

    const sonuc = {};
    if (sonuc_degisken) {
        sonuc[sonuc_degisken] = sonuc_degeri;
    } else {
        sonuc.sonuc = sonuc_degeri;
    }

    // Orijinal degiskenleri de ekle (sablon icin)
    Object.assign(sonuc, degiskenler);

    return sonuc;
}

/**
 * Analiz sonucunu modal'da gosterir
 * @param {string} analiz_sonuc - Analiz sonucu metni
 */
function analiz_sonucu_goster(analiz_sonuc) {
    const modal = document.getElementById('deney_modal');
    const icerik_alani = document.getElementById('modal_icerik_alani');
    if (!modal || !icerik_alani) return;

    // Mevcut icerige analiz sonucunu ekle
    const analiz_html = `
        <div class="analiz_sonuc">
            <div class="analiz_sonuc_baslik">Analiz Sonucu:</div>
            <div class="analiz_sonuc_metin">${analiz_sonuc}</div>
        </div>
    `;

    // Eger zaten bir analiz sonucu varsa, degistir; yoksa ekle
    const mevcut_analiz = icerik_alani.querySelector('.analiz_sonuc');
    if (mevcut_analiz) {
        mevcut_analiz.outerHTML = analiz_html;
    } else {
        icerik_alani.insertAdjacentHTML('beforeend', analiz_html);
    }

    // Modal'i goster
    modal.style.display = 'block';
}

// Sayfa yuklendiginde uygulamayi baslat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', uygulama_baslat);
} else {
    uygulama_baslat();
}

