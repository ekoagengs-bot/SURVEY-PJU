# SURVEY PJU — Bima, Dompu & Kota Bima

Dashboard monitoring Survey PJU berbasis GitHub Pages + Leaflet/OpenStreetMap, dengan Google Sheets sebagai database dan Google Apps Script sebagai backend.

## ULP
- ULP Sape
- ULP Dompu
- ULP Woha
- ULP Bikot

## Wilayah
- Kabupaten Bima
- Kabupaten Dompu
- Kota Bima

## Fitur Dashboard
- Total PJU
- Rekap 4 ULP
- LEGAL / ILEGAL
- Legal tanpa IDPEL
- Perlu penanganan
- Filter ULP, wilayah, legalitas, kondisi
- Pencarian ID, IDPEL, nomor tiang, desa, kecamatan, alamat
- Peta GPS interaktif
- Marker ILEGAL berwarna merah
- Ekspor CSV

## Database
Spreadsheet ID: `1IhB-agDYb7WcVSnZioHRWYE9Hm2iQLsJdA72E9jlXWY`
Tab utama: `PJU_Survey`

## Struktur Repository
```text
/
├── index.html
├── README.md
└── apps-script/
    └── Code.gs
```

## GitHub Pages
Setelah Pages diaktifkan dari branch `main` dan folder `/ (root)`, alamatnya akan menjadi:
`https://ekoagengs-bot.github.io/SURVEY-PJU/`

## Catatan
Dashboard membaca Google Sheets melalui Google Visualization API. Pastikan sheet dapat dibaca oleh pengguna dashboard, atau gunakan backend Apps Script yang telah disiapkan untuk akses terkontrol.
