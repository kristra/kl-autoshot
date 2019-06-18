# KL Autoshot - Tool screenshot otomatis

#### Cara kerja
- Aplikasi ini menjalankan chrome secara 'headless' atau tanpa interface di background.
- Screenshot di dapat dari semua creative yang berstatus aktif.

#### Kebutuhan
- Google Chrome stable
- Koneksi internal KLY

#### Panduan
##### 1. LineItemID

    ID Line item Google Ad Manager, isian yang valid dapat dicek dibawah.

  - https://admanager.google.com/36504930#delivery/LineItemDetail/lineItemId=5086579843&orderId=2547802983
  - lineItemId=5086579843
  - 2547802983

##### 2. Devices

    Menentukan device, jika diset auto, aplikasi akan menentukan sendiri devicenya sesuai aturan di bawah.
    - 970x90, 728x90, 300x600 : desktop
    - 320x100, 320x50: mobile
    - 300x250 : mobile & desktop
    - Out-of-Page (1x1) : mobile & desktop

##### 3. Sites

    Menentukan situs, wajib di isi minimal satu.

##### 4. Settings

    - Parallel Tabs

        Jumlah tabs yang terbuka bersamaan dari Google Chrome yang terbuka di background. Semakin banyak nilainya akan semakin berat penggunaan RAM dan CPU.
    - Timeout (milliseconds)

        Waktu tenggang untuk penelusuran web, jika iklan tidak muncul dalam waktu tenggang, aplikasi akan merefresh tab secara otomatis. Semakin banyak nilainya akan semakin lama proses pengambilan screenshot.