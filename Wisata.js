/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : wisata.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Wisata: list semua wisata (aktif & nonaktif),
 * tambah, ubah, upload/ganti gambar katalog, aktifkan/nonaktifkan.
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
 * Digunakan Oleh : wisata.html
 ******************************************************************/

/******************************************************************
 * STATE HALAMAN
 ******************************************************************/
let wisataList = [];
let editingWisataRowIndex = null;
let selectedWisataPhotoBase64 = null;
let selectedWisataPhotoMime = null;

initAdminPage();
loadWisata();

/******************************************************************
 * TAMPILAN
 ******************************************************************/

async function loadWisata() {
  try {
    wisataList = await getAction("adminWisata");
    renderWisataGrid();
  } catch (error) {
    console.error("[LOAD WISATA]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat data Wisata</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

function renderWisataGrid() {
  let html = '<div class="toolbar">' +
    '<div class="toolbar-title-group">' +
      '<span class="toolbar-title">Daftar Wisata</span>' +
      '<span class="count-pill">' + wisataList.length + ' wisata</span>' +
    '</div>' +
    '<button class="btn-add" onclick="openAddWisataModal()">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>' +
      'Tambah Wisata' +
    '</button>' +
  '</div>';

  html += '<div class="card-grid">';
  wisataList.forEach(function (w) { html += wisataCardHtml(w); });
  html += '<button class="add-card wide" onclick="openAddWisataModal()">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>' +
      'Tambah Wisata' +
    '</button>';
  html += '</div>';

  document.getElementById("pageContent").innerHTML = html;
}

function wisataCardHtml(w) {
  const photoHtml = w.gambar
    ? '<img src="' + w.gambar + '" alt="' + escapeHtml(w.nama) + '">'
    : 'Belum ada gambar';

  const statusHtml = w.aktif
    ? '<span class="status-dot"></span><span class="status-label">Aktif</span>'
    : '<span class="status-dot"></span><span class="status-label">Nonaktif</span>';

  const actionBtn = w.aktif
    ? '<button class="icon-btn danger" onclick="deactivateWisata(' + w.rowIndex + ')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>' +
        'Nonaktifkan</button>'
    : '<button class="icon-btn success" onclick="reactivateWisata(' + w.rowIndex + ')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>' +
        'Aktifkan</button>';

  return '<div class="card ' + (w.aktif ? '' : 'inactive') + '">' +
      '<div class="wisata-photo">' + photoHtml + '</div>' +
      '<div class="card-name">' + escapeHtml(w.nama) + '</div>' +
      '<div class="status-row">' + statusHtml + '</div>' +
      '<div class="card-actions">' +
        '<button class="icon-btn" onclick="openEditWisataModal(' + w.rowIndex + ')">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
          'Ubah</button>' +
        actionBtn +
      '</div>' +
    '</div>';
}

/******************************************************************
 * FORM (TAMBAH / UBAH)
 ******************************************************************/

function openAddWisataModal() {
  editingWisataRowIndex = null;
  selectedWisataPhotoBase64 = null;
  selectedWisataPhotoMime = null;

  document.getElementById("wisataModalTitle").textContent = "Tambah Wisata";
  document.getElementById("wisataNama").value = "";
  document.getElementById("wisataUrutan").value = wisataList.length + 1;
  document.getElementById("wisataStatusRow").style.display = "none";
  document.getElementById("wisataPhotoPreview").innerHTML = "Belum ada gambar";

  document.getElementById("wisataModalOverlay").classList.add("open");
}

function openEditWisataModal(rowIndex) {
  const w = wisataList.find(function (item) { return item.rowIndex === rowIndex; });
  if (!w) return;

  editingWisataRowIndex = rowIndex;
  selectedWisataPhotoBase64 = null;
  selectedWisataPhotoMime = null;

  document.getElementById("wisataModalTitle").textContent = "Ubah Wisata";
  document.getElementById("wisataNama").value = w.nama || "";
  document.getElementById("wisataUrutan").value = w.urutan || 1;
  document.getElementById("wisataAktif").checked = !!w.aktif;
  document.getElementById("wisataStatusRow").style.display = "flex";
  document.getElementById("wisataPhotoPreview").innerHTML = w.gambar
    ? '<img src="' + w.gambar + '" alt="">'
    : "Belum ada gambar";

  document.getElementById("wisataModalOverlay").classList.add("open");
}

function closeWisataModal() {
  document.getElementById("wisataModalOverlay").classList.remove("open");
}

function handleWisataPhotoChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedWisataPhotoMime = file.type;

  const reader = new FileReader();
  reader.onload = function () {
    const dataUrl = reader.result;
    selectedWisataPhotoBase64 = dataUrl.split(",")[1];
    document.getElementById("wisataPhotoPreview").innerHTML = '<img src="' + dataUrl + '" alt="">';
  };
  reader.readAsDataURL(file);
}

/**
 ******************************************************************
 * Fungsi : saveWisata()
 * Tujuan : Menyimpan form Wisata (Tambah atau Ubah). Kalau ada
 *          gambar baru dipilih, upload dulu ke Gallery dengan
 *          galleryId = "WISATA_" + slug(nama).
 ******************************************************************
 */
async function saveWisata() {
  const nama = document.getElementById("wisataNama").value.trim();
  if (!nama) {
    showToast("Nama wisata wajib diisi.", true);
    return;
  }

  const btn = document.getElementById("saveWisataBtn");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    const slug = nama.toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
    const galleryId = "WISATA_" + slug;
    let finalGalleryId = editingWisataRowIndex
      ? (wisataList.find(function (w) { return w.rowIndex === editingWisataRowIndex; }).galleryId || "")
      : "";

    if (selectedWisataPhotoBase64) {
      await postAction("uploadGallery", {
        data: {
          galleryId: galleryId, kategori: "WISATA", nama: nama,
          base64: selectedWisataPhotoBase64, mimeType: selectedWisataPhotoMime
        }
      });
      finalGalleryId = galleryId;
    }

    const payload = {
      nama: nama,
      galleryId: finalGalleryId,
      urutan: parseInt(document.getElementById("wisataUrutan").value, 10) || 1
    };

    if (editingWisataRowIndex) {
      payload.aktif = document.getElementById("wisataAktif").checked;
      await postAction("updateWisata", { rowIndex: editingWisataRowIndex, data: payload });
      showToast("Wisata diperbarui.");
    } else {
      await postAction("addWisata", { data: payload });
      showToast("Wisata ditambahkan.");
    }

    closeWisataModal();
    await loadWisata();
  } catch (error) {
    console.error("[SAVE WISATA]", error);
    showToast("Gagal menyimpan. Coba lagi.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan";
  }
}

async function deactivateWisata(rowIndex) {
  if (!confirm("Nonaktifkan wisata ini? Wisata tidak akan tampil di katalog.")) return;

  try {
    await postAction("deleteWisata", { rowIndex: rowIndex });
    showToast("Wisata dinonaktifkan.");
    await loadWisata();
  } catch (error) {
    console.error("[DEACTIVATE WISATA]", error);
    showToast("Gagal menonaktifkan wisata.", true);
  }
}

async function reactivateWisata(rowIndex) {
  const w = wisataList.find(function (item) { return item.rowIndex === rowIndex; });
  if (!w) return;

  try {
    await postAction("updateWisata", {
      rowIndex: rowIndex,
      data: { aktif: true, urutan: w.urutan, nama: w.nama, galleryId: w.galleryId }
    });
    showToast("Wisata diaktifkan kembali.");
    await loadWisata();
  } catch (error) {
    console.error("[REACTIVATE WISATA]", error);
    showToast("Gagal mengaktifkan wisata.", true);
  }
}