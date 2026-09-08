# Konfigurasi AppSheet — Survey PJU

Gunakan spreadsheet `1IhB-agDYb7WcVSnZioHRWYE9Hm2iQLsJdA72E9jlXWY` dan tabel utama `PJU_Survey`.

## Kolom penting

- `ID Survey` → Text, Initial value `UNIQUEID()`
- `Timestamp` → DateTime, Initial value `NOW()`
- `ULP` → Enum: `ULP Sape`, `ULP Dompu`, `ULP Woha`, `ULP Bikot`
- `Wilayah` → Enum: `Kabupaten Bima`, `Kabupaten Dompu`, `Kota Bima`
- `Status Legalitas` → Enum: `LEGAL`, `ILEGAL`
- `IDPEL` → Text; Required hanya ketika `[Status Legalitas]="LEGAL"`
- `Latitude` → Decimal
- `Longitude` → Decimal
- `Foto PJU` → Image
- `Foto Meter` → Image
- `Foto Lokasi` → Image

## Formula Required untuk IDPEL

```appsheet
[Status Legalitas] = "LEGAL"
```

## Validasi IDPEL

```appsheet
OR(
  [Status Legalitas] = "ILEGAL",
  ISNOTBLANK([IDPEL])
)
```

## Pilihan kondisi

`Kondisi Tiang`: Baik, Rusak Ringan, Rusak Berat, Hilang, Perlu Pemeriksaan.

`Lampu Menyala`: Menyala, Mati, Redup.

`Prioritas`: Rendah, Sedang, Tinggi, Darurat.

## GPS

Simpan latitude dan longitude hasil GPS dari perangkat. Untuk lokasi yang lebih praktis di AppSheet, gunakan tipe `LatLong` pada kolom lokasi jika satu kolom LatLong digunakan oleh aplikasi, kemudian pecah/sinkronkan ke `Latitude` dan `Longitude` sesuai struktur database.

## Foto

Aktifkan tiga kolom image: Foto PJU, Foto Meter, Foto Lokasi. AppSheet akan menyimpan file sesuai mekanisme penyimpanan aplikasi dan menyimpan referensinya pada spreadsheet.
