/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : links.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Links: list semua link (aktif & nonaktif), tambah,
 * ubah, aktifkan/nonaktifkan, dan ubah urutan lewat drag-drop
 * (dengan tombol panah atas/bawah sebagai fallback).
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
 * Digunakan Oleh : links.html
 ******************************************************************/

/******************************************************************
 * STATE HALAMAN
 ******************************************************************/
let linksList = [];
let editingLinkRowIndex = null;
let draggedRowIndex = null;

initAdminPage();
loadLinks();

/******************************************************************
 * TAMPILAN
 ******************************************************************/

async function loadLinks() {
  try {
    linksList = await getAction("adminLinks");
    renderLinksList();
  } catch (error) {
    console.error("[LOAD LINKS]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat data Links</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

function renderLinksList() {
  let html = '<div class="toolbar">' +
    '<div class="toolbar-title-group">' +
      '<span class="toolbar-title">Daftar Links</span>' +
      '<span class="count-pill">' + linksList.length + ' link</span>' +
    '</div>' +
    '<button class="btn-add" onclick="openAddLinkModal()">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>' +
      'Tambah Link' +
    '</button>' +
  '</div>';

  html += '<div class="links-list" id="linksListEl">';
  linksList.forEach(function (l, idx) { html += linkRowHtml(l, idx); });
  html += '</div>';
  html += '<p class="form-hint" style="margin-top:10px;">Geser ikon &#9776; untuk mengubah urutan, atau pakai tombol panah.</p>';

  document.getElementById("pageContent").innerHTML = html;
  attachDragEvents();
}

function linkRowHtml(l, idx) {
  const iconLabel = (l.icon || l.judul || "?").trim().slice(0, 2).toUpperCase();

  const statusHtml = l.aktif
    ? '<span class="status-dot"></span><span class="status-label">Aktif</span>'
    : '<span class="status-dot"></span><span class="status-label">Nonaktif</span>';

  const actionBtn = l.aktif
    ? '<button class="icon-btn danger" title="Nonaktifkan" onclick="deactivateLink(' + l.rowIndex + ')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>' +
      '</button>'
    : '<button class="icon-btn success" title="Aktifkan" onclick="reactivateLink(' + l.rowIndex + ')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>' +
      '</button>';

  return '<div class="link-row ' + (l.aktif ? '' : 'inactive') + '" draggable="true" data-rowindex="' + l.rowIndex + '">' +
      '<span class="drag-handle" title="Geser untuk ubah urutan">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</span>' +
      '<div class="reorder-btns">' +
        '<button class="reorder-btn" title="Naik" onclick="moveLink(' + idx + ',-1)"' + (idx === 0 ? ' disabled style="opacity:.3"' : '') + '>' +
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg></button>' +
        '<button class="reorder-btn" title="Turun" onclick="moveLink(' + idx + ',1)"' + (idx === linksList.length - 1 ? ' disabled style="opacity:.3"' : '') + '>' +
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg></button>' +
      '</div>' +
      '<div class="link-icon-badge">' + iconLabel + '</div>' +
      '<div class="link-info">' +
        '<div class="link-title">' + escapeHtml(l.judul) + '</div>' +
        '<div class="link-desc">' + escapeHtml(l.deskripsi || l.url || "") + '</div>' +
      '</div>' +
      '<div class="link-status">' + statusHtml + '</div>' +
      '<div class="link-actions">' +
        '<button class="icon-btn" title="Ubah" onclick="openEditLinkModal(' + l.rowIndex + ')">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
        '</button>' +
        actionBtn +
      '</div>' +
    '</div>';
}

/******************************************************************
 * DRAG & DROP + REORDER
 ******************************************************************/

function attachDragEvents() {
  const rows = document.querySelectorAll(".link-row");

  rows.forEach(function (row) {
    row.addEventListener("dragstart", function () {
      draggedRowIndex = parseInt(row.dataset.rowindex, 10);
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", function () {
      row.classList.remove("dragging");
      document.querySelectorAll(".link-row").forEach(function (r) { r.classList.remove("drop-target"); });
    });

    row.addEventListener("dragover", function (e) {
      e.preventDefault();
      row.classList.add("drop-target");
    });

    row.addEventListener("dragleave", function () {
      row.classList.remove("drop-target");
    });

    row.addEventListener("drop", function (e) {
      e.preventDefault();
      row.classList.remove("drop-target");
      const targetRowIndex = parseInt(row.dataset.rowindex, 10);
      if (draggedRowIndex === null || draggedRowIndex === targetRowIndex) return;
      reorderLinksByRowIndex(draggedRowIndex, targetRowIndex);
    });
  });
}

function reorderLinksByRowIndex(fromRowIndex, toRowIndex) {
  const fromIdx = linksList.findIndex(function (l) { return l.rowIndex === fromRowIndex; });
  const toIdx = linksList.findIndex(function (l) { return l.rowIndex === toRowIndex; });
  if (fromIdx === -1 || toIdx === -1) return;

  const moved = linksList.splice(fromIdx, 1)[0];
  linksList.splice(toIdx, 0, moved);

  renderLinksList();
  saveLinksOrder();
}

function moveLink(idx, direction) {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= linksList.length) return;

  const temp = linksList[idx];
  linksList[idx] = linksList[targetIdx];
  linksList[targetIdx] = temp;

  renderLinksList();
  saveLinksOrder();
}

async function saveLinksOrder() {
  try {
    const updates = linksList.map(function (l, idx) {
      const newUrutan = idx + 1;
      l.urutan = newUrutan;
      return postAction("updateLink", {
        rowIndex: l.rowIndex,
        data: { aktif: l.aktif, urutan: newUrutan, judul: l.judul, deskripsi: l.deskripsi, icon: l.icon, url: l.url }
      });
    });
    await Promise.all(updates);
    showToast("Urutan link disimpan.");
  } catch (error) {
    console.error("[SAVE LINKS ORDER]", error);
    showToast("Gagal menyimpan urutan.", true);
  }
}

/******************************************************************
 * FORM (TAMBAH / UBAH)
 ******************************************************************/

function openAddLinkModal() {
  editingLinkRowIndex = null;
  document.getElementById("linkModalTitle").textContent = "Tambah Link";
  document.getElementById("linkJudul").value = "";
  document.getElementById("linkDeskripsi").value = "";
  document.getElementById("linkIcon").value = "";
  document.getElementById("linkUrl").value = "";
  document.getElementById("linkStatusRow").style.display = "none";
  document.getElementById("linkModalOverlay").classList.add("open");
}

function openEditLinkModal(rowIndex) {
  const l = linksList.find(function (item) { return item.rowIndex === rowIndex; });
  if (!l) return;

  editingLinkRowIndex = rowIndex;
  document.getElementById("linkModalTitle").textContent = "Ubah Link";
  document.getElementById("linkJudul").value = l.judul || "";
  document.getElementById("linkDeskripsi").value = l.deskripsi || "";
  document.getElementById("linkIcon").value = l.icon || "";
  document.getElementById("linkUrl").value = l.url || "";
  document.getElementById("linkAktif").checked = !!l.aktif;
  document.getElementById("linkStatusRow").style.display = "flex";
  document.getElementById("linkModalOverlay").classList.add("open");
}

function closeLinkModal() {
  document.getElementById("linkModalOverlay").classList.remove("open");
}

async function saveLink() {
  const judul = document.getElementById("linkJudul").value.trim();
  const url = document.getElementById("linkUrl").value.trim();

  if (!judul || !url) {
    showToast("Judul dan URL wajib diisi.", true);
    return;
  }

  const btn = document.getElementById("saveLinkBtn");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    const payload = {
      judul: judul,
      deskripsi: document.getElementById("linkDeskripsi").value.trim(),
      icon: document.getElementById("linkIcon").value.trim(),
      url: url
    };

    if (editingLinkRowIndex) {
      payload.aktif = document.getElementById("linkAktif").checked;
      const existing = linksList.find(function (l) { return l.rowIndex === editingLinkRowIndex; });
      payload.urutan = existing ? existing.urutan : linksList.length + 1;
      await postAction("updateLink", { rowIndex: editingLinkRowIndex, data: payload });
      showToast("Link diperbarui.");
    } else {
      payload.urutan = linksList.length + 1;
      await postAction("addLink", { data: payload });
      showToast("Link ditambahkan.");
    }

    closeLinkModal();
    await loadLinks();
  } catch (error) {
    console.error("[SAVE LINK]", error);
    showToast("Gagal menyimpan. Coba lagi.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan";
  }
}

async function deactivateLink(rowIndex) {
  if (!confirm("Nonaktifkan link ini? Link tidak akan tampil di website.")) return;

  try {
    await postAction("deleteLink", { rowIndex: rowIndex });
    showToast("Link dinonaktifkan.");
    await loadLinks();
  } catch (error) {
    console.error("[DEACTIVATE LINK]", error);
    showToast("Gagal menonaktifkan link.", true);
  }
}

async function reactivateLink(rowIndex) {
  const l = linksList.find(function (item) { return item.rowIndex === rowIndex; });
  if (!l) return;

  try {
    await postAction("updateLink", {
      rowIndex: rowIndex,
      data: { aktif: true, urutan: l.urutan, judul: l.judul, deskripsi: l.deskripsi, icon: l.icon, url: l.url }
    });
    showToast("Link diaktifkan kembali.");
    await loadLinks();
  } catch (error) {
    console.error("[REACTIVATE LINK]", error);
    showToast("Gagal mengaktifkan link.", true);
  }
}