/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : assets/api.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Pembungkus fetch ke Apps Script Web App Bio Card Marketing.
 * Dipakai oleh semua halaman yang butuh baca/tulis data.
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
 * - (tidak ada)
 *
 * Digunakan Oleh
 * - login.js, dashboard.js, sales.js, links.js, wisata.js,
 *   gallery.js, settings.js, analytics.js
 ******************************************************************/

/******************************************************************
 * KONFIGURASI
 * ----------------------------------------------------------------
 * URL Web App Apps Script Bio Card Marketing.
 ******************************************************************/
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzyQ-OcjzRHi2Y1HaCMsq8cZte8OXRoycV5jiKw3tFstFpZZBP8bv6Nl5mO1KFlZYpA1Q/exec";

/******************************************************************
 * FUNGSI KOMUNIKASI API
 * ----------------------------------------------------------------
 ******************************************************************/

/**
 ******************************************************************
 * Fungsi : getAction()
 * Tujuan : Melakukan request GET ke Apps Script dengan parameter
 *          action, mengembalikan hasil JSON.
 ******************************************************************
 */
async function getAction(action) {
  const res = await fetch(APPS_SCRIPT_URL + "?action=" + encodeURIComponent(action));
  return res.json();
}

/**
 ******************************************************************
 * Fungsi : postAction()
 * Tujuan : Melakukan request POST ke Apps Script dengan action dan
 *          payload tambahan. Memakai Content-Type text/plain agar
 *          tidak memicu CORS preflight yang tidak didukung
 *          Apps Script.
 ******************************************************************
 */
async function postAction(action, extra) {
  const body = Object.assign({ action: action }, extra);
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  });
  return res.json();
}
