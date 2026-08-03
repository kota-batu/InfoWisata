/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : analytics.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Analytics: menampilkan ringkasan kunjungan hari
 * ini, breakdown per jenis event, dan sales yang paling banyak
 * dipilih. Mengambil data dari getAnalyticsSummary() backend
 * (sudah diringkas di server, bukan data mentah baris per baris).
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
 * Digunakan Oleh : analytics.html
 ******************************************************************/

initAdminPage();
loadAnalytics();

/**
 ******************************************************************
 * Fungsi : loadAnalytics()
 * Tujuan : Mengambil ringkasan Analytics dari backend lalu
 *          merender kartu statistik + daftar breakdown.
 ******************************************************************
 */
async function loadAnalytics() {
  try {
    const summary = await getAction("adminAnalytics");
    renderAnalytics(summary);
  } catch (error) {
    console.error("[LOAD ANALYTICS]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat Analytics</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

/**
 ******************************************************************
 * Fungsi : renderAnalytics()
 * Tujuan : Merender kartu ringkasan (total & hari ini), daftar
 *          event per jenis, dan daftar sales paling banyak dipilih.
 ******************************************************************
 */
function renderAnalytics(summary) {
  let html = '<div class="card-grid">' +
    statCard("Total Event Tercatat", summary.total) +
    statCard("Aktivitas Hari Ini", summary.todayTotal) +
  '</div>';

  html += '<div class="gallery-section-title" style="margin-top:28px;">Aktivitas per Jenis</div>';
  html += eventListHtml(summary.eventCounts);

  html += '<div class="gallery-section-title" style="margin-top:28px;">Sales Terbanyak Dipilih</div>';
  html += topSalesListHtml(summary.topSales);

  document.getElementById("pageContent").innerHTML = html;
}

function statCard(label, value) {
  return '<div class="card">' +
      '<div class="card-topstrip"></div>' +
      '<div class="stat-label">' + label + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
    '</div>';
}

function eventListHtml(eventCounts) {
  const events = Object.keys(eventCounts).map(function (key) {
    return { name: key, count: eventCounts[key] };
  }).sort(function (a, b) { return b.count - a.count; });

  if (events.length === 0) {
    return '<div class="empty-state"><p>Belum ada data. Data akan muncul setelah Customer Website mengirim event lewat action "logAnalytics".</p></div>';
  }

  let html = '<div class="analytics-list">';
  events.forEach(function (e, idx) {
    html += '<div class="analytics-row">' +
        '<div class="analytics-row-label"><span class="analytics-rank">' + (idx + 1) + '</span>' + escapeHtml(e.name) + '</div>' +
        '<span class="analytics-count">' + e.count + '</span>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

function topSalesListHtml(topSales) {
  if (!topSales || topSales.length === 0) {
    return '<div class="empty-state"><p>Belum ada data sales yang dipilih.</p></div>';
  }

  let html = '<div class="analytics-list">';
  topSales.slice(0, 10).forEach(function (s, idx) {
    html += '<div class="analytics-row">' +
        '<div class="analytics-row-label"><span class="analytics-rank">' + (idx + 1) + '</span>' + escapeHtml(s.id) + '</div>' +
        '<span class="analytics-count">' + s.count + ' klik</span>' +
      '</div>';
  });
  html += '</div>';
  return html;
}
