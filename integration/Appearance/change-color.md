# Appearance: Custom Color Settings untuk Public Page

**Deskripsi Fitur:**
Fitur ini memungkinkan admin untuk mengubah warna CSS variables yang digunakan pada halaman publik (`Home`, `About`, `Projects`, `Blog`, `Contact`) melalui tab "Appearance" di halaman Settings dashboard. Tidak ada lagi dark/light mode toggle — hanya 1 tampilan dengan warna yang bisa dikustomisasi.

---

## Konteks Teknis

### CSS Variables yang ada (di `frontend/src/style.css`, class `.public`)

```css
.public {
  --bg: #eeeeee; /* warna background utama */
  --bg-card: #ffffff; /* warna background card */
  --bg-nav: rgba(...); /* warna background navbar */
  --border: #d0d0d0; /* warna garis border */
  --text: #222831; /* warna teks utama */
  --text-muted: #555e6a; /* warna teks sekunder */
  --accent: #00adb5; /* warna aksen (tombol, highlight) */
}
```

Dan ada override di `.dark .public` yang **HARUS DIHAPUS** (lihat tugas 1).

---

## Daftar Tugas

### Tugas 1 — Hapus Dark/Light Mode dari Style CSS

**File:** `frontend/src/style.css`

Hapus seluruh blok berikut (sekitar baris 899–919):

```css
/* Dark Mode Overrides for Public */
.dark .public {
  --bg: #222831;
  --bg-card: #393e46;
  --bg-nav: rgba(34, 40, 49, 0.85);
  --border: #393e46;
  --text: #eeeeee;
  --text-muted: rgba(238, 238, 238, 0.6);
  ...
}
```

Juga hapus `transition: background-color 0.3s, color 0.3s;` dari `.public` jika tidak diperlukan lagi.

---

### Tugas 2 — Hapus Dark/Light Mode Toggle dari Navbar Public

**File:** Cari di `frontend/src/` — bisa di file `Navbar.vue` atau komponen yang render navbar publik.

Cari dan hapus tombol/logika toggle dark mode. Biasanya ada kode seperti:

```js
document.documentElement.classList.toggle("dark");
```

atau class conditional `:class="{ dark: isDark }"` pada `<html>` atau wrapper `.public`.

Hapus juga state `isDark`, `toggleDark`, atau `useColorMode` jika ada.

---

### Tugas 3 — Hapus Preferences lama di Settings.vue

**File:** `frontend/src/views/private/Settings.vue`

**Di bagian `<script>`:**

- Hapus `const activeTheme = ref("dark")`
- Hapus `const notifications = reactive({ messages, deployments, analytics, marketing })`
- Hapus fungsi `setTheme()`

**Di bagian `<template>`:**

- Hapus seluruh blok tab `prefs` (dicari dengan `v-show="activeTab === 'prefs'"`)
- Hapus tab `prefs` dari daftar tab (array tabs di template)

---

### Tugas 4 — Tambah Tab "Appearance" di Settings.vue

**File:** `frontend/src/views/private/Settings.vue`

#### 4a. Tambah tab baru di array tab list

Di bagian `<template>`, cari array tab yang ada (`profile`, `messages`, `security`, `danger`), tambahkan `'appearance'`:

```html
v-for="tab in ['profile', 'messages', 'security', 'appearance', 'danger']"
```

Dan tambahkan label display-nya:

```html
tab === 'appearance' ? 'Appearance' : ...
```

#### 4b. Tambah state appearance di `<script>`

```ts
const appearance = reactive({
  bg: "#eeeeee",
  bgCard: "#ffffff",
  border: "#d0d0d0",
  text: "#222831",
  textMuted: "#555e6a",
  accent: "#00adb5",
});

const applyAppearance = () => {
  const root = document.querySelector(".public") as HTMLElement;
  if (!root) {
    // Jika tidak di public page, terapkan ke body dulu untuk preview
    document.documentElement.style.setProperty("--preview", "true");
  }
  // Simpan ke localStorage agar persistent
  localStorage.setItem("publicAppearance", JSON.stringify(appearance));
  // Apply ke semua element .public yang ada
  applyColorsToDOM();
  showToast("Appearance saved!");
};

const applyColorsToDOM = () => {
  const styles = `
    .public {
      --bg: ${appearance.bg} !important;
      --bg-card: ${appearance.bgCard} !important;
      --border: ${appearance.border} !important;
      --text: ${appearance.text} !important;
      --text-muted: ${appearance.textMuted} !important;
      --accent: ${appearance.accent} !important;
      --bg-nav: ${appearance.bg}dd !important;
    }
  `;
  let styleEl = document.getElementById("custom-appearance");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "custom-appearance";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = styles;
};

// Load dari localStorage saat mount
onMounted(() => {
  fetchProfile();
  const saved = localStorage.getItem("publicAppearance");
  if (saved) {
    Object.assign(appearance, JSON.parse(saved));
    applyColorsToDOM(); // Apply juga saat dashboard dibuka
  }
});
```

#### 4c. Tambah template tab Appearance

Letakkan sebelum tab `danger`, setelah tab `security`:

```html
<!-- ══ TAB: APPEARANCE ══ -->
<div v-show="activeTab === 'appearance'" class="tab-section animate-fade-up">
  <div class="card p-6">
    <h2
      style="font-size: 1rem; font-weight: 600; color: var(--p-light); margin-bottom: 4px;"
    >
      Appearance
    </h2>
    <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 24px;">
      Customize the color scheme of your public portfolio website.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <!-- Background Color -->
      <div>
        <label class="form-label">Background Color</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.bg"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.bg"
            class="form-input"
            placeholder="#eeeeee"
            style="font-family: monospace;"
          />
        </div>
      </div>

      <!-- Card Background -->
      <div>
        <label class="form-label">Card Background</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.bgCard"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.bgCard"
            class="form-input"
            placeholder="#ffffff"
            style="font-family: monospace;"
          />
        </div>
      </div>

      <!-- Accent / Primary Color -->
      <div>
        <label class="form-label">Accent Color</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.accent"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.accent"
            class="form-input"
            placeholder="#00adb5"
            style="font-family: monospace;"
          />
        </div>
      </div>

      <!-- Border Color -->
      <div>
        <label class="form-label">Border Color</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.border"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.border"
            class="form-input"
            placeholder="#d0d0d0"
            style="font-family: monospace;"
          />
        </div>
      </div>

      <!-- Text Color -->
      <div>
        <label class="form-label">Primary Text</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.text"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.text"
            class="form-input"
            placeholder="#222831"
            style="font-family: monospace;"
          />
        </div>
      </div>

      <!-- Muted Text Color -->
      <div>
        <label class="form-label">Muted Text</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input
            type="color"
            v-model="appearance.textMuted"
            style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;"
          />
          <input
            type="text"
            v-model="appearance.textMuted"
            class="form-input"
            placeholder="#555e6a"
            style="font-family: monospace;"
          />
        </div>
      </div>
    </div>

    <!-- Preview Box -->
    <div
      style="margin-top: 28px; padding: 20px; border-radius: 12px; border: 1px solid; transition: all 0.3s;"
      :style="{ background: appearance.bg, borderColor: appearance.border }"
    >
      <div
        style="font-size: 0.7rem; font-family: monospace; margin-bottom: 12px; opacity: 0.5;"
        :style="{ color: appearance.textMuted }"
      >
        LIVE PREVIEW
      </div>
      <div
        style="font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;"
        :style="{ color: appearance.text }"
      >
        Hello, I'm a Developer 👋
      </div>
      <div
        style="font-size: 0.85rem; margin-bottom: 16px;"
        :style="{ color: appearance.textMuted }"
      >
        This is how your public page will look with these colors.
      </div>
      <div
        style="display: inline-block; padding: 8px 18px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;"
        :style="{ background: appearance.accent, color: appearance.bg }"
      >
        View Projects →
      </div>
    </div>

    <!-- Reset & Save Buttons -->
    <div
      style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"
    >
      <button
        class="btn-ghost"
        @click="Object.assign(appearance, { bg: '#eeeeee', bgCard: '#ffffff', border: '#d0d0d0', text: '#222831', textMuted: '#555e6a', accent: '#00adb5' }); applyColorsToDOM()"
      >
        Reset to Default
      </button>
      <button class="btn-primary" @click="applyAppearance">
        Save Appearance
      </button>
    </div>
  </div>
</div>
```

---

### Tugas 5 — Apply Color Saat Public Page Dimuat

**File:** `frontend/src/App.vue` atau layout wrapper public (`PublicLayout.vue` / file yang wrap semua public views)

Tambahkan logika berikut di `onMounted` atau di composable setup:

```ts
onMounted(() => {
  const saved = localStorage.getItem("publicAppearance");
  if (saved) {
    const colors = JSON.parse(saved);
    const styles = `
      .public {
        --bg: ${colors.bg} !important;
        --bg-card: ${colors.bgCard} !important;
        --border: ${colors.border} !important;
        --text: ${colors.text} !important;
        --text-muted: ${colors.textMuted} !important;
        --accent: ${colors.accent} !important;
        --bg-nav: ${colors.bg}dd !important;
      }
    `;
    let styleEl = document.getElementById("custom-appearance");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "custom-appearance";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = styles;
  }
});
```

> **Catatan:** Jika tidak ada `App.vue` / `PublicLayout.vue` yang cocok, tambahkan di `Home.vue` saja sebagai fallback.

---

## Urutan Pengerjaan yang Direkomendasikan

1. ✅ Tugas 1: Hapus `.dark .public` di `style.css`
2. ✅ Tugas 2: Hapus toggle dark mode di navbar publik
3. ✅ Tugas 3: Hapus Preferences lama di `Settings.vue`
4. ✅ Tugas 4: Tambah tab + UI Appearance di `Settings.vue`
5. ✅ Tugas 5: Apply dari localStorage di public page

## Testing

Setelah selesai:

1. Buka dashboard → Settings → tab Appearance
2. Ubah warna accent menjadi merah (`#ff0000`)
3. Klik "Save Appearance"
4. Buka public page (misal `/`) di tab baru
5. Pastikan warna accent berubah sesuai yang dipilih
