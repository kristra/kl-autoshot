# KL Autoshot - Tool screenshot otomatis

#### Cara kerja
- Aplikasi ini menjalankan chrome secara 'headless' atau tanpa interface di background.
- Screenshot didapat dari semua creative yang berstatus aktif.

#### Kebutuhan
- Google Chrome stable
- Koneksi internal KLY

#### Panduan
1. LineItemID

    ID Line item Google Ad Manager, contoh isian yang benar:

    - https://admanager.google.com/36504930#delivery/LineItemDetail/lineItemId=5086579843&orderId=2547802983
    - lineItemId=5086579843
    - 2547802983

2. Devices (default: auto)

    Menentukan device, jika diset **auto**, aplikasi akan menentukan device dengan aturan:
    - 970x90, 728x90, 300x600 : desktop
    - 320x100, 320x50: mobile
    - 300x250 : mobile & desktop
    - Out-of-Page (1x1) : mobile & desktop

3. Sites

    Menentukan situs, wajib di isi minimal satu.

4. Settings

  - Parallel Tabs (default: 2 tab)

      Jumlah tabs yang terbuka bersamaan dari Google Chrome yang terbuka di background. Semakin banyak nilainya akan semakin berat penggunaan RAM dan CPU.

  - Timeout (default: 10000 milliseconds)

      Waktu tenggang untuk penelusuran web, jika iklan tidak muncul dalam waktu tenggang, aplikasi akan merefresh tab secara otomatis. Semakin banyak nilainya akan semakin lama proses pengambilan screenshot.

#### Errors
  - Jika terjadi error di luar pengambilan screenshot akan muncul "PepeHands".

![alt text](https://cdn.betterttv.net/emote/59f27b3f4ebd8047f54dee29/3x "PepeHands")

  - Jika proses screenshot berhasil dilakukan akan muncul "FeelsOkayMan".

![alt text](https://cdn.betterttv.net/emote/5803757f3d506fea7ee35267/3x "FeelsOkayMan")
  
  - Screenshot yang gagal akan di tambilkan beserta pesan errornya.

   `error: No node found for selector: [data-google-query-id=""]`

  > Jika pesan errornya seperti yang diatas, artinya materinya tidak ditemukan, misalnya SC desktop tapi devicenya diset mobile. 

  > Pesan error hampir selalu muncul jika device diset *auto*