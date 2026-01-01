EVDE FIZIK LABORATUVARI
=======================

Calistirma Adimlari:
--------------------

1. Windows'ta calistirmak icin:
   - Proje klasorune gidin (ornegin: cd "C:\Users\BİLSEM\Desktop\Nurdan Proje\Fizik")
   - Terminal/Command Prompt/PowerShell'de su komutu calistirin:
     python -m http.server 8000

2. Tarayicinizda su adresi acin:
   http://localhost:8000/ana_sayfa.html

3. Alternatif olarak:
   - Modern tarayicilarda (Chrome, Edge, Firefox) dogrudan ana_sayfa.html dosyasina 
     cift tiklayarak acabilirsiniz (bazi ozellikler calismayabilir - fetch hatasi verebilir).
   - En iyi calisma icin HTTP server kullanin (yukaridaki python komutu).

Proje Yapisi:
-------------
- ana_sayfa.html          : Ana HTML dosyasi
- stil/ana_stil.css       : CSS stilleri
- js/uygulama.js          : Ana uygulama mantigi
- js/veri_servisi.js      : Veri yukleme ve filtreleme
- js/depolama_servisi.js  : LocalStorage islemleri
- js/arayuz.js            : DOM render fonksiyonlari
- veri/deneyler.json      : Deney verileri (JSON formatinda)

Ozellikler:
-----------
- Kategori bazli filtreleme
- Deney basliginda arama
- Deney detay modal penceresi
- Tahmin ve olcum formu
- Otomatik analiz (kural ve formul destegi)
- Deney gecmisi (LocalStorage)
- Mobil uyumlu tasarim

Notlar:
-------
- Veriler LocalStorage'da saklanir (tarayici yerel depolamasi).
- Formul analizi guvenli sekilde yapilir (eval kullanilmaz).
- Tum dosya ve degisken isimleri Turkce ama Turkce karakter icermez.

