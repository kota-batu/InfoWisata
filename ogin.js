/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : login.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman login: mengirim password ke backend lewat action
 * "login", menandai sesi jika benar, lalu redirect ke dashboard.
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
 * Dibutuhkan : assets/api.js (postAction), assets/app.js (markSessionLoggedIn)
 * Digunakan Oleh : login.html
 ******************************************************************/

/**
 ******************************************************************
 * Fungsi : handleLogin()
 * Tujuan : Verifikasi password admin lewat backend, lalu redirect
 *          ke dashboard.html jika berhasil.
 ******************************************************************
 */
async function handleLogin() {
  const password = document.getElementById("passwordInput").value;
  const btn = document.getElementById("loginBtn");
  const errorEl = document.getElementById("loginError");
  errorEl.style.display = "none";

  if (!password) return;

  btn.disabled = true;
  btn.textContent = "Memeriksa...";

  try {
    const res = await postAction("login", { password: password });

    if (res.status === "OK" && res.success) {
      markSessionLoggedIn();
      window.location.href = "dashboard.html";
    } else {
      errorEl.textContent = res.message || "Password salah. Coba lagi.";
      errorEl.style.display = "block";
    }
  } catch (error) {
    console.error("[LOGIN]", error);
    errorEl.textContent = "Tidak bisa terhubung ke server. Coba lagi.";
    errorEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Masuk";
  }
}

document.getElementById("passwordInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") handleLogin();
});
