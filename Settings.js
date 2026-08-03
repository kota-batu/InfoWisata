/******************************************************************
 * PROYEK        : Bio Card Marketing
 * MODUL         : Admin CMS
 * FILE          : settings.js
 * VERSI         : v1.0.0
 * PENULIS       : Jimmy
 * DIBUAT        : 2026-08-02
 * TERAKHIR UBAH : 2026-08-02
 *
 * DESKRIPSI
 * ----------------------------------------------------------------
 * Logika halaman Settings: menampilkan form pengaturan umum
 * website (nama, logo, warna, footer, dll), dan menyimpan
 * perubahan lewat action "updateSettings". ADMIN_PASSWORD tidak
 * pernah ditampilkan/diubah di sini (lihat catatan keamanan pada
 * Settings.gs backend).
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
 * Digunakan Oleh : settings.html
 ******************************************************************/

/******************************************************************
 * STATE HALAMAN
 ******************************************************************/
let currentSettings = {};
let selectedLogoBase64 = null;
let selectedLogoMime = null;

initAdminPage();
loadSettings();

/**
 ******************************************************************
 * Fungsi : loadSettings()
 * Tujuan : Mengambil settings dari backend lalu merender form.
 ******************************************************************
 */
async function loadSettings() {
  try {
    currentSettings = await getAction("settings");
    renderSettingsForm();
  } catch (error) {
    console.error("[LOAD SETTINGS]", error);
    document.getElementById("pageContent").innerHTML =
      '<div class="empty-state"><h3>Gagal memuat Settings</h3><p>Periksa koneksi atau URL Apps Script.</p></div>';
  }
}

/**
 ******************************************************************
 * Fungsi : renderSettingsForm()
 * Tujuan : Merender form pengaturan berdasarkan data yang sudah
 *          diambil dari backend.
 ******************************************************************
 */
function renderSettingsForm() {
  const s = currentSettings;

  document.getElementById("pageContent").innerHTML =
    '<div class="settings-card">' +

      '<div class="settings-section-title">Identitas Website</div>' +
      '<div class="form-row"><label class="field-label">Nama Aplikasi</label>' +
        '<input type="text" id="setAppName" class="field-input" value="' + escapeAttr(s.APP_NAME) + '"></div>' +
      '<div class="form-row"><label class="field-label">Nama Perusahaan</label>' +
        '<input type="text" id="setCompanyName" class="field-input" value="' + escapeAttr(s.COMPANY_NAME) + '"></div>' +

      '<div class="form-row">' +
        '<label class="field-label">Logo</label>' +
        '<div class="photo-upload" style="margin-bottom:0;">' +
          '<div class="settings-logo-preview" id="logoPreview">' + (s.LOGO_URL ? '<img src="' + s.LOGO_URL + '" alt="">' : 'Belum ada logo') + '</div>' +
          '<div>' +
            '<input type="file" id="logoInput" accept="image/*" style="display:none" onchange="handleLogoChange(event)">' +
            '<button type="button" class="upload-btn" onclick="document.getElementById(\'logoInput\').click()">Ganti Logo</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="settings-section-title">Tampilan</div>' +
      '<div class="form-row-2">' +
        '<div><label class="field-label">Warna Utama</label>' +
          '<div class="color-swatch-row"><div class="color-swatch" id="primarySwatch" style="background:' + escapeAttr(s.PRIMARY_COLOR || '#1565C0') + '"></div>' +
          '<input type="text" id="setPrimaryColor" class="field-input" value="' + escapeAttr(s.PRIMARY_COLOR) + '" oninput="updateSwatch(\'primarySwatch\',this.value)"></div></div>' +
        '<div><label class="field-label">Warna Kedua</label>' +
          '<div class="color-swatch-row"><div class="color-swatch" id="secondarySwatch" style="background:' + escapeAttr(s.SECONDARY_COLOR || '#FFFFFF') + '"></div>' +
          '<input type="text" id="setSecondaryColor" class="field-input" value="' + escapeAttr(s.SECONDARY_COLOR) + '" oninput="updateSwatch(\'secondarySwatch\',this.value)"></div></div>' +
      '</div>' +
      '<div class="form-row"><label class="field-label">Tinggi Header (px)</label>' +
        '<input type="number" id="setHeaderHeight" class="field-input" value="' + escapeAttr(s.HEADER_HEIGHT) + '"></div>' +

      '<div class="settings-section-title">Konten</div>' +
      '<div class="form-row"><label class="field-label">Sales Default</label>' +
        '<input type="text" id="setDefaultSales" class="field-input" value="' + escapeAttr(s.DEFAULT_SALES) + '" placeholder="jimmy"></div>' +
      '<div class="form-row"><label class="field-label">Pesan Default WhatsApp</label>' +
        '<textarea id="setWaMessage" class="field-input" rows="2">' + escapeAttr(s.WHATSAPP_MESSAGE) + '</textarea></div>' +
      '<div class="form-row"><label class="field-label">Copyright</label>' +
        '<input type="text" id="setCopyright" class="field-input" value="' + escapeAttr(s.COPYRIGHT) + '"></div>' +

      '<div class="checkbox-row" style="margin-top:20px;">' +
        '<input type="checkbox" id="setEnableAnalytics"' + (String(s.ENABLE_ANALYTICS).toUpperCase() === "TRUE" ? " checked" : "") + '>' +
        '<label for="setEnableAnalytics">Aktifkan pencatatan Analytics</label>' +
      '</div>' +

      '<button class="btn-primary" id="saveSettingsBtn" onclick="saveSettings()">Simpan Perubahan</button>' +
    '</div>';
}

function updateSwatch(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.style.background = value;
}

function handleLogoChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedLogoMime = file.type;

  const reader = new FileReader();
  reader.onload = function () {
    const dataUrl = reader.result;
    selectedLogoBase64 = dataUrl.split(",")[1];
    document.getElementById("logoPreview").innerHTML = '<img src="' + dataUrl + '" alt="">';
  };
  reader.readAsDataURL(file);
}

/**
 ******************************************************************
 * Fungsi : saveSettings()
 * Tujuan : Mengumpulkan nilai form, upload logo baru jika ada
 *          (galleryId tetap "LOGO_MAIN" agar konsisten), lalu
 *          mengirim seluruh perubahan lewat action "updateSettings".
 ******************************************************************
 */
async function saveSettings() {
  const btn = document.getElementById("saveSettingsBtn");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    const payload = {
      APP_NAME: document.getElementById("setAppName").value.trim(),
      COMPANY_NAME: document.getElementById("setCompanyName").value.trim(),
      PRIMARY_COLOR: document.getElementById("setPrimaryColor").value.trim(),
      SECONDARY_COLOR: document.getElementById("setSecondaryColor").value.trim(),
      HEADER_HEIGHT: document.getElementById("setHeaderHeight").value.trim(),
      DEFAULT_SALES: document.getElementById("setDefaultSales").value.trim(),
      WHATSAPP_MESSAGE: document.getElementById("setWaMessage").value.trim(),
      COPYRIGHT: document.getElementById("setCopyright").value.trim(),
      ENABLE_ANALYTICS: document.getElementById("setEnableAnalytics").checked ? "TRUE" : "FALSE"
    };

    if (selectedLogoBase64) {
      const galleryId = "LOGO_MAIN";
      await postAction("uploadGallery", {
        data: {
          galleryId: galleryId, kategori: "LOGO", nama: "Logo Website",
          base64: selectedLogoBase64, mimeType: selectedLogoMime
        }
      });
      payload.LOGO = galleryId;
    }

    await postAction("updateSettings", { data: payload });
    showToast("Settings disimpan.");
    selectedLogoBase64 = null;
    selectedLogoMime = null;
    await loadSettings();
  } catch (error) {
    console.error("[SAVE SETTINGS]", error);
    showToast("Gagal menyimpan. Coba lagi.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Perubahan";
  }
}

/**
 ******************************************************************
 * Fungsi : escapeAttr()
 * Tujuan : Sama seperti escapeHtml(), tapi mengembalikan string
 *          kosong dengan aman untuk value undefined/null (dipakai
 *          khusus untuk atribut value="" pada input form).
 ******************************************************************
 */
function escapeAttr(val) {
  if (val === undefined || val === null) return "";
  return escapeHtml(String(val));
}