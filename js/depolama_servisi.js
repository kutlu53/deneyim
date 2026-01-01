/**
 * Depolama Servisi
 * LocalStorage islemleri icin fonksiyonlar
 */

const DEPOLAMA_ANAHTARI = 'fizik_deney_kayitlari';

/**
 * Yeni bir deney kaydi ekler
 * @param {Object} kayit - Kayit objesi (kimlik, tarih, tahmin, olcumler, analiz_sonuc)
 */
function kayit_ekle(kayit) {
    try {
        const mevcut_kayitlar = kayitlari_getir();
        mevcut_kayitlar.push(kayit);
        localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(mevcut_kayitlar));
    } catch (hata) {
        console.error('Kayit ekleme hatasi:', hata);
        throw hata;
    }
}

/**
 * Tum kayitlari getirir
 * @returns {Array} Kayit listesi
 */
function kayitlari_getir() {
    try {
        const kayitlar_json = localStorage.getItem(DEPOLAMA_ANAHTARI);
        if (!kayitlar_json) {
            return [];
        }
        return JSON.parse(kayitlar_json);
    } catch (hata) {
        console.error('Kayit getirme hatasi:', hata);
        return [];
    }
}

/**
 * Belirli bir kaydi siler (opsiyonel - kullanilmiyor simdilik)
 * @param {string} kayit_id - Silinecek kayit ID'si
 */
function kayit_sil(kayit_id) {
    try {
        const mevcut_kayitlar = kayitlari_getir();
        const filtrelenmis = mevcut_kayitlar.filter(k => k.id !== kayit_id);
        localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(filtrelenmis));
    } catch (hata) {
        console.error('Kayit silme hatasi:', hata);
        throw hata;
    }
}

/**
 * Tum kayitlari siler (opsiyonel - kullanilmiyor simdilik)
 */
function kayitlari_temizle() {
    try {
        localStorage.removeItem(DEPOLAMA_ANAHTARI);
    } catch (hata) {
        console.error('Kayit temizleme hatasi:', hata);
        throw hata;
    }
}

/**
 * Benzersiz bir kayit ID'si olusturur
 * @returns {string} Benzersiz ID
 */
function benzersiz_id_olustur() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

