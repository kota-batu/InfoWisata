/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : gallery.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Gallery: mengambil semua file dari sheet GALLERY
 * (lewat getAllGallery() backend) dan menampilkannya dikelompokkan
 * per Kategori. Read-only - upload dilakukan dari modul lain
 * (Sales, Wisata, Settings), sesuai Blueprint v3.0.
 ******************************************************************/

/******************************************************************
 * RIWAYAT VERSI
 * ----------------------------------------------------------------
 * v1.0.0
 * - Initial Release.
 ******************************************************************/

/******************************************************************
 * DEPENDENSI
 * ----------------------------------------------------------------
 * Dibutuhkan     : assets/api.js, assets/app.js
 * Digunakan Oleh : gallery.html
 ******************************************************************/

initAdminPage();
loadGallery();

/**
 ******************************************************************
 * Fungsi : loadGallery()
 * Tujuan : Mengambil seluruh file Gallery dari backend, lalu
 *          mengelompokkannya per Kategori sebelum dirender.
 ******************************************************************
 */
async function loadGallery() {
  try {
    const items = await getAction("adminGallery");
    renderGallery(items);
  } catch (error) {
    console.error("[LOAD GALLERY]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat Gallery</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

/**
 ******************************************************************
 * Fungsi : renderGallery()
 * Tujuan : Mengelompokkan item per Kategori, lalu merender tiap
 *          kelompok sebagai section grid tersendiri.
 ******************************************************************
 */
function renderGallery(items) {
  if (items.length === 0) {
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Belum ada gambar</h3><p>Upload foto lewat menu Sales, Wisata, atau Settings.</p></div>';
    return;
  }

  const groups = {};
  items.forEach(function (item) {
    if (!groups[item.kategori]) groups[item.kategori] = [];
    groups[item.kategori].push(item);
  });

  let html = '<p class="form-hint" style="margin-bottom:18px;">Halaman ini hanya untuk melihat. Untuk mengganti gambar, buka menu Sales, Wisata, atau Settings.</p>';

  Object.keys(groups).sort().forEach(function (kategori) {
    html += '<div class="gallery-section">';
    html += '<div class="gallery-section-title">' + escapeHtml(kategori) + ' &middot; ' + groups[kategori].length + ' file</div>';
    html += '<div class="gallery-grid">';
    groups[kategori].forEach(function (item) { html += galleryItemHtml(item); });
    html += '</div></div>';
  });

  document.getElementById("pageContent").innerHTML = html;
}

function galleryItemHtml(item) {
  const thumb = item.url
    ? '<img src="' + item.url + '" alt="' + escapeHtml(item.nama) + '">'
    : 'Tidak ada gambar';

  return '<div class="gallery-item">' +
      '<div class="gallery-thumb">' + thumb + '</div>' +
      '<div class="gallery-info">' +
        '<div class="gallery-name">' + escapeHtml(item.nama || "(tanpa nama)") + '</div>' +
        '<div class="gallery-id">' + escapeHtml(item.galleryId) + '</div>' +
      '</div>' +
    '</div>';
}