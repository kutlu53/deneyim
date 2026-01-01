/**
 * Veri Servisi
 * deneyler.json dosyasini yukler ve veri yonetimi saglar
 */

// Global veri saklama
let deneyler_verisi = null;

/**
 * deneyler.json dosyasini fetch ile yukler
 * @returns {Promise<Object>} JSON verisi
 */
async function deneyleri_jsondan_yukle() {
    try {
        const yanit = await fetch('veri/deneyler.json');
        if (!yanit.ok) {
            throw new Error(`HTTP hatasi: ${yanit.status}`);
        }
        const veri = await yanit.json();
        deneyler_verisi = veri;
        return veri;
    } catch (hata) {
        console.error('Veri yukleme hatasi:', hata);
        throw hata;
    }
}

/**
 * Tum deneyleri getirir
 * @returns {Array} Deney listesi
 */
function tum_deneyleri_getir() {
    if (!deneyler_verisi || !deneyler_verisi.deneyler) {
        return [];
    }
    return deneyler_verisi.deneyler;
}

/**
 * Tum kategorileri getirir
 * @returns {Array} Kategori listesi
 */
function tum_kategorileri_getir() {
    if (!deneyler_verisi || !deneyler_verisi.kategoriler) {
        return [];
    }
    return deneyler_verisi.kategoriler;
}

/**
 * Belirli bir kategoriye ait deneyleri getirir
 * @param {string} kategori_kimlik - Kategori kimligi
 * @returns {Array} Deney listesi
 */
function kategoriye_gore_deneyleri_getir(kategori_kimlik) {
    const tum_deneyler = tum_deneyleri_getir();
    if (kategori_kimlik === 'tumu' || !kategori_kimlik) {
        return tum_deneyler;
    }
    return tum_deneyler.filter(deney => deney.kategori === kategori_kimlik);
}

/**
 * Basliga gore deneyleri filtreler
 * @param {Array} deneyler - Deney listesi
 * @param {string} arama_metni - Arama metni
 * @returns {Array} Filtrelenmis deney listesi
 */
function deneyleri_arama_ile_filtrele(deneyler, arama_metni) {
    if (!arama_metni || arama_metni.trim() === '') {
        return deneyler;
    }
    const arama_kucuk = arama_metni.toLowerCase().trim();
    return deneyler.filter(deney => 
        deney.baslik.toLowerCase().includes(arama_kucuk)
    );
}

/**
 * Belirli bir deneyi kimlige gore bulur
 * @param {string} kimlik - Deney kimligi
 * @returns {Object|null} Deney objesi veya null
 */
function deneyi_kimlige_gore_bul(kimlik) {
    const tum_deneyler = tum_deneyleri_getir();
    return tum_deneyler.find(deney => deney.kimlik === kimlik) || null;
}

/**
 * Kategori adini kimlige gore bulur
 * @param {string} kategori_kimlik - Kategori kimligi
 * @returns {string} Kategori adi
 */
function kategori_adi_getir(kategori_kimlik) {
    const kategoriler = tum_kategorileri_getir();
    const kategori = kategoriler.find(kat => kat.kimlik === kategori_kimlik);
    return kategori ? kategori.ad : kategori_kimlik;
}

