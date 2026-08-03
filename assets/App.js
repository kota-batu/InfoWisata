/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : assets/app.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Fungsi umum yang dipakai di semua halaman Admin CMS (kecuali
 * login.html): penjaga sesi login (authGuard), memuat sidebar dari
 * partials/sidebar.html, logout, toast notifikasi, dan escapeHtml.
 ******************************************************************/

/******************************************************************
 * RIWAYAT VERSI
 * ----------------------------------------------------------------
 * v1.0.0
 * - Initial Release. Dipecah dari admin/index.html versi SPA lama.
 ******************************************************************/

/******************************************************************
 * DEPENDENSI
 * ----------------------------------------------------------------
 * Dibutuhkan
 * - partials/sidebar.html (dimuat lewat fetch)
 *
 * Digunakan Oleh
 * - dashboard.html, sales.html, links.html, wisata.html,
 *   gallery.html, settings.html, analytics.html
 ******************************************************************/

/******************************************************************
 * CATATAN SESI LOGIN
 * ----------------------------------------------------------------
 * Status login disimpan di sessionStorage (bukan localStorage),
 * jadi otomatis hilang saat tab ditutup - sesuai catatan keamanan
 * sederhana pada Auth.gs (1 password bersama, tanpa token).
 *
 * CATATAN UNTUK TESTING LOKAL
 * ----------------------------------------------------------------
 * Sidebar dimuat lewat fetch("partials/sidebar.html"). Ini hanya
 * berfungsi kalau folder admin/ diakses lewat server (GitHub Pages,
 * atau local server semacam "npx serve"), BUKAN dengan membuka
 * file HTML langsung (double-click / protokol file://), karena
 * browser memblokir fetch file lokal untuk alasan keamanan.
 ******************************************************************/

const SESSION_KEY = "bcm_admin_logged_in";

/**
 ******************************************************************
 * Fungsi : authGuard()
 * Tujuan : Memastikan admin sudah login sebelum halaman ini bisa
 *          diakses. Kalau belum, langsung diarahkan ke login.html.
 *          Dipanggil di baris paling atas setiap halaman terproteksi.
 ******************************************************************
 */
function authGuard() {
  try {
    if (sessionStorage.getItem(SESSION_KEY) !== "true") {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("[AUTH GUARD]", error);
    window.location.href = "login.html";
  }
}

/**
 ******************************************************************
 * Fungsi : markSessionLoggedIn()
 * Tujuan : Menandai sesi sebagai sudah login. Dipanggil oleh
 *          login.js setelah password terverifikasi benar.
 ******************************************************************
 */
function markSessionLoggedIn() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch (error) {
    console.error("[SESSION]", error);
  }
}

/**
 ******************************************************************
 * Fungsi : handleLogout()
 * Tujuan : Menghapus status sesi lalu kembali ke halaman login.
 ******************************************************************
 */
function handleLogout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("[LOGOUT]", error);
  }
  window.location.href = "login.html";
}

/**
 ******************************************************************
 * Fungsi : loadSidebar()
 * Tujuan : Mengambil partials/sidebar.html lalu menyisipkannya ke
 *          <div id="sidebarContainer">, kemudian menyorot menu
 *          yang sedang aktif berdasarkan document.body.dataset.page.
 ******************************************************************
 */
async function loadSidebar() {
  const container = document.getElementById("sidebarContainer");
  if (!container) return;

  try {
    const res = await fetch("partials/sidebar.html");
    container.innerHTML = await res.text();

    const currentPage = document.body.dataset.page;
    document.querySelectorAll(".nav-item[data-page]").forEach(function (el) {
      el.classList.toggle("active", el.dataset.page === currentPage);
    });
  } catch (error) {
    console.error("[LOAD SIDEBAR]", error);
  }
}

/**
 ******************************************************************
 * Fungsi : initAdminPage()
 * Tujuan : Bootstrap standar untuk setiap halaman terproteksi -
 *          cek sesi login, lalu muat sidebar. Dipanggil di awal
 *          setiap file *.js halaman (sales.js, links.js, dst).
 ******************************************************************
 */
function initAdminPage() {
  authGuard();
  loadSidebar();
}

/******************************************************************
 * TOAST NOTIFIKASI
 * ----------------------------------------------------------------
 ******************************************************************/

/**
 ******************************************************************
 * Fungsi : showToast()
 * Tujuan : Menampilkan notifikasi kecil di bawah layar selama
 *          3 detik.
 ******************************************************************
 */
function showToast(message, isError) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = isError ? "show error" : "show";
  setTimeout(function () { toast.className = ""; }, 3000);
}

/******************************************************************
 * HELPER TEKS
 * ----------------------------------------------------------------
 ******************************************************************/

/**
 ******************************************************************
 * Fungsi : escapeHtml()
 * Tujuan : Mencegah HTML/script asing ikut ter-render saat
 *          menampilkan teks dari data (nama, judul, dsb).
 ******************************************************************
 */
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}