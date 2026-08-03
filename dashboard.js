/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : dashboard.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Mengambil ringkasan Sales, Links, Wisata, dan Analytics hari ini,
 * lalu menampilkannya sebagai kartu statistik.
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
 * Digunakan Oleh : dashboard.html
 ******************************************************************/

initAdminPage();
loadDashboard();

/**
 ******************************************************************
 * Fungsi : loadDashboard()
 * Tujuan : Mengambil data Sales, Links, Wisata, dan ringkasan
 *          Analytics, lalu merender kartu statistik.
 ******************************************************************
 */
async function loadDashboard() {
  try {
    const sales = await getAction("adminSales");
    const links = await getAction("adminLinks");
    const wisata = await getAction("adminWisata");
    const analytics = await getAction("adminAnalytics");

    const salesAktif = sales.filter(function (s) { return s.aktif; }).length;
    const linksAktif = links.filter(function (l) { return l.aktif; }).length;
    const wisataAktif = wisata.filter(function (w) { return w.aktif; }).length;

    document.getElementById("pageContent").innerHTML =
      '<div class="card-grid">' +
        statCard("Sales Aktif", salesAktif + " / " + sales.length) +
        statCard("Link Aktif", linksAktif + " / " + links.length) +
        statCard("Wisata Aktif", wisataAktif + " / " + wisata.length) +
        statCard("Kunjungan Hari Ini", analytics.todayTotal) +
      '</div>';
  } catch (error) {
    console.error("[DASHBOARD]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat ringkasan</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

/**
 ******************************************************************
 * Fungsi : statCard()
 * Tujuan : Membuat 1 kartu statistik sederhana (label + angka).
 ******************************************************************
 */
function statCard(label, value) {
  return '<div class="card">' +
      '<div class="card-topstrip"></div>' +
      '<div class="stat-label">' + label + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
    '</div>';
}
