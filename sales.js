/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : sales.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Sales: list semua sales (aktif & nonaktif),
 * tambah, ubah, upload/ganti foto, aktifkan/nonaktifkan.
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
 * Digunakan Oleh : sales.html
 ******************************************************************/

/******************************************************************
 * STATE HALAMAN
 ******************************************************************/
let salesList = [];
let editingSalesId = null;
let selectedPhotoBase64 = null;
let selectedPhotoMime = null;

initAdminPage();
loadSales();

/******************************************************************
 * TAMPILAN
 ******************************************************************/

/**
 ******************************************************************
 * Fungsi : loadSales()
 * Tujuan : Mengambil SEMUA sales (aktif & nonaktif) dari backend
 *          lalu menampilkannya sebagai grid badge card.
 ******************************************************************
 */
async function loadSales() {
  try {
    salesList = await getAction("adminSales");
    renderSalesGrid();
  } catch (error) {
    console.error("[LOAD SALES]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat data Sales</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

function renderSalesGrid() {
  let html = '<div class="toolbar">' +
    '<div class="toolbar-title-group">' +
      '<span class="toolbar-title">Daftar Sales</span>' +
      '<span class="count-pill">' + salesList.length + ' orang</span>' +
    '</div>' +
    '<button class="btn-add" onclick="openAddModal()">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>' +
      'Tambah Sales' +
    '</button>' +
  '</div>';

  html += '<div class="card-grid">';
  salesList.forEach(function (s) { html += salesCardHtml(s); });
  html += '<button class="add-card" onclick="openAddModal()">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>' +
      'Tambah Sales' +
    '</button>';
  html += '</div>';

  document.getElementById("pageContent").innerHTML = html;
}

function salesCardHtml(s) {
  const initials = (s.nama || "?").trim().charAt(0).toUpperCase();
  const photoHtml = s.foto ? '<img src="' + s.foto + '" alt="' + s.nama + '">' : initials;

  const statusHtml = s.aktif
    ? '<span class="status-dot"></span><span class="status-label">Aktif</span>'
    : '<span class="status-dot"></span><span class="status-label">Nonaktif</span>';

  const actionBtn = s.aktif
    ? '<button class="icon-btn danger" onclick=\'deactivateSales(' + JSON.stringify(s.id) + ')\'>' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>' +
        'Nonaktifkan</button>'
    : '<button class="icon-btn success" onclick=\'reactivateSales(' + JSON.stringify(s.id) + ')\'>' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>' +
        'Aktifkan</button>';

  return '<div class="card ' + (s.aktif ? '' : 'inactive') + '">' +
      '<div class="card-topstrip"></div>' +
      '<div class="card-head">' +
        '<div class="avatar-photo">' + photoHtml + '</div>' +
        '<div>' +
          '<div class="card-name">' + escapeHtml(s.nama) + '</div>' +
          '<div class="card-sub">' + escapeHtml(s.jabatan || "-") + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="status-row">' + statusHtml + '</div>' +
      '<div class="card-actions">' +
        '<button class="icon-btn" onclick=\'openEditModal(' + JSON.stringify(s.id) + ')\'>' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
          'Ubah</button>' +
        actionBtn +
      '</div>' +
    '</div>';
}

/******************************************************************
 * FORM (TAMBAH / UBAH)
 ******************************************************************/

function openAddModal() {
  editingSalesId = null;
  selectedPhotoBase64 = null;
  selectedPhotoMime = null;

  document.getElementById("salesModalTitle").textContent = "Tambah Sales";
  document.getElementById("inputNama").value = "";
  document.getElementById("inputJabatan").value = "Marketing";
  document.getElementById("inputId").value = "";
  document.getElementById("inputId").disabled = false;
  document.getElementById("inputWa").value = "";
  document.getElementById("inputUrutan").value = salesList.length + 1;
  document.getElementById("inputInstagram").value = "";
  document.getElementById("inputTiktok").value = "";
  document.getElementById("inputFacebook").value = "";
  document.getElementById("inputTelegram").value = "";
  document.getElementById("inputEmail").value = "";
  document.getElementById("statusRow").style.display = "none";
  document.getElementById("photoPreview").innerHTML = "?";
  document.getElementById("idError").style.display = "none";

  document.getElementById("salesModalOverlay").classList.add("open");
}

function openEditModal(id) {
  const s = salesList.find(function (item) { return item.id === id; });
  if (!s) return;

  editingSalesId = id;
  selectedPhotoBase64 = null;
  selectedPhotoMime = null;

  document.getElementById("salesModalTitle").textContent = "Ubah Sales";
  document.getElementById("inputNama").value = s.nama || "";
  document.getElementById("inputJabatan").value = s.jabatan || "";
  document.getElementById("inputId").value = s.id;
  document.getElementById("inputId").disabled = true;
  document.getElementById("inputWa").value = s.wa || "";
  document.getElementById("inputUrutan").value = s.urutan || 1;
  document.getElementById("inputInstagram").value = s.instagram || "";
  document.getElementById("inputTiktok").value = s.tiktok || "";
  document.getElementById("inputFacebook").value = s.facebook || "";
  document.getElementById("inputTelegram").value = s.telegram || "";
  document.getElementById("inputEmail").value = s.email || "";
  document.getElementById("inputAktif").checked = !!s.aktif;
  document.getElementById("statusRow").style.display = "flex";
  document.getElementById("idError").style.display = "none";

  document.getElementById("photoPreview").innerHTML = s.foto
    ? '<img src="' + s.foto + '" alt="">'
    : (s.nama || "?").trim().charAt(0).toUpperCase();

  document.getElementById("salesModalOverlay").classList.add("open");
}

function closeSalesModal() {
  document.getElementById("salesModalOverlay").classList.remove("open");
}

function autoSlug() {
  if (editingSalesId) return;
  const nama = document.getElementById("inputNama").value;
  const slug = nama.toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
  document.getElementById("inputId").value = slug;
}

function handlePhotoChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedPhotoMime = file.type;

  const reader = new FileReader();
  reader.onload = function () {
    const dataUrl = reader.result;
    selectedPhotoBase64 = dataUrl.split(",")[1];
    document.getElementById("photoPreview").innerHTML = '<img src="' + dataUrl + '" alt="">';
  };
  reader.readAsDataURL(file);
}

async function saveSales() {
  const id = document.getElementById("inputId").value.trim();
  const nama = document.getElementById("inputNama").value.trim();
  const jabatan = document.getElementById("inputJabatan").value.trim();

  if (!id || !nama) {
    showToast("Nama dan ID wajib diisi.", true);
    return;
  }

  if (!editingSalesId && salesList.some(function (s) { return s.id === id; })) {
    document.getElementById("idError").style.display = "block";
    return;
  }
  document.getElementById("idError").style.display = "none";

  const btn = document.getElementById("saveSalesBtn");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    const galleryId = "SALES_" + id;
    let finalGalleryId = editingSalesId
      ? (salesList.find(function (s) { return s.id === editingSalesId; }).galleryId || "")
      : "";

    if (selectedPhotoBase64) {
      await postAction("uploadGallery", {
        data: {
          galleryId: galleryId, kategori: "SALES", nama: nama,
          base64: selectedPhotoBase64, mimeType: selectedPhotoMime
        }
      });
      finalGalleryId = galleryId;
    }

    const payload = {
      id: id, nama: nama, jabatan: jabatan, galleryId: finalGalleryId,
      wa: document.getElementById("inputWa").value.trim(),
      urutan: parseInt(document.getElementById("inputUrutan").value, 10) || 1,
      instagram: document.getElementById("inputInstagram").value.trim(),
      tiktok: document.getElementById("inputTiktok").value.trim(),
      facebook: document.getElementById("inputFacebook").value.trim(),
      telegram: document.getElementById("inputTelegram").value.trim(),
      email: document.getElementById("inputEmail").value.trim()
    };

    if (editingSalesId) {
      payload.aktif = document.getElementById("inputAktif").checked;
      await postAction("updateSales", { data: payload });
      showToast("Sales diperbarui.");
    } else {
      await postAction("addSales", { data: payload });
      showToast("Sales ditambahkan.");
    }

    closeSalesModal();
    await loadSales();
  } catch (error) {
    console.error("[SAVE SALES]", error);
    showToast("Gagal menyimpan. Coba lagi.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan";
  }
}

async function deactivateSales(id) {
  if (!confirm("Nonaktifkan sales ini? Sales tidak akan tampil di website.")) return;

  try {
    await postAction("deleteSales", { id: id });
    showToast("Sales dinonaktifkan.");
    await loadSales();
  } catch (error) {
    console.error("[DEACTIVATE SALES]", error);
    showToast("Gagal menonaktifkan sales.", true);
  }
}

async function reactivateSales(id) {
  const s = salesList.find(function (item) { return item.id === id; });
  if (!s) return;

  try {
    await postAction("updateSales", {
      data: {
        id: s.id, nama: s.nama, jabatan: s.jabatan, galleryId: s.galleryId,
        wa: s.wa, urutan: s.urutan, instagram: s.instagram, tiktok: s.tiktok,
        facebook: s.facebook, telegram: s.telegram, email: s.email, aktif: true
      }
    });
    showToast("Sales diaktifkan kembali.");
    await loadSales();
  } catch (error) {
    console.error("[REACTIVATE SALES]", error);
    showToast("Gagal mengaktifkan sales.", true);
  }
}
