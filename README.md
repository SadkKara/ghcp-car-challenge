# Geneva Ski Weather App

Geneva bölgesine yakın 3 kayak merkezi için (Chamonix, Verbier, Zermatt) canlı hava durumu uygulaması.

## Özellikler

- Responsive kart tabanlı grid arayüz
- Open-Meteo API üzerinden canlı veri çekme
- Her merkez için hava durumu ikonu ve koşul bilgisi
- Sıcaklık, rüzgar, günlük kar yağışı, mevcut kar yüksekliği
- Mobil uyumlu tasarım
- Temel web güvenliği uygulamaları (CSP, güvenli DOM güncelleme, istek zaman aşımı)

## Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Open-Meteo API

## Projeyi Çalıştırma

Bu proje statik dosyalardan oluşur. CSP nedeniyle doğrudan dosya açmak yerine yerel bir HTTP sunucu ile çalıştırmanız önerilir.

### Seçenek 1: Python ile

```bash
python3 -m http.server 5500
```

Sonra tarayıcıda açın:

```text
http://localhost:5500
```

### Seçenek 2: VS Code Live Server

`index.html` dosyasını açıp **Open with Live Server** ile başlatabilirsiniz.

## Proje Yapısı

```text
.
├── index.html   # Uygulama iskeleti ve güvenlik meta ayarları
├── styles.css   # Responsive kart ve grid stilleri
└── script.js    # API çağrıları, veri işleme, kart render etme
```

## Veri Kaynağı

Uygulama aşağıdaki endpoint'i kullanır:

- `https://api.open-meteo.com/v1/forecast`

İstenen alanlar:

- `current`: `temperature_2m`, `weather_code`, `wind_speed_10m`
- `daily`: `snowfall_sum`
- `hourly`: `snow_depth`

## Güvenlik Notları

- `Content-Security-Policy` ile sadece aynı origin script/style ve Open-Meteo bağlantısı izinli
- Dinamik içerik `textContent` ile render edilir (XSS riskini azaltır)
- `fetch` isteklerinde `AbortController` ile zaman aşımı uygulanır
- API hataları kart bazında güvenli şekilde yönetilir

## Geliştirme Notu

API yanıtı veya hava kodları zamanla değişebilir. Gerekirse `script.js` içindeki `weatherMap` güncellenebilir.