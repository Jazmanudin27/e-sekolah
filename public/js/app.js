// State Store
let currentUser = null;
let authToken = localStorage.getItem('esekolah_token') || null;
let activeModalType = 'in'; // 'in' or 'out'
let currentHari = 'Senin';
let studentBatchData = {};
let mapelBatchData = {};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  initLogin();
  
  if (authToken) {
    fetchProfile();
  }
});

// Realtime Ticker
function startClock() {
  updateTime();
  setInterval(updateTime, 1000);
}

function updateTime() {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('id-ID', options);

  const liveClock = document.getElementById('liveClock');
  const liveDate = document.getElementById('liveDate');

  if (liveClock) liveClock.innerText = timeStr;
  if (liveDate) liveDate.innerText = dateStr;
}

// Toast Notification
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.innerText = message;
  toastIcon.className = isSuccess ? 'fa-solid fa-circle-check text-emerald' : 'fa-solid fa-circle-xmark text-rose';
  
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// Quick Preset Login
function quickLogin(username) {
  document.getElementById('loginUsername').value = username;
  document.getElementById('loginPassword').value = '123456';
  document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// Initialize Login Form
function initLogin() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();

      if (json.success) {
        authToken = json.data.token;
        currentUser = json.data.user;
        localStorage.setItem('esekolah_token', authToken);
        showToast('Login berhasil! Selamat datang.');
        showMainScreen();
      } else {
        showToast(json.message || 'Login gagal.', false);
      }
    } catch (err) {
      showToast('Koneksi gagal. Pastikan API running.', false);
    }
  });
}

// Fetch Profile
async function fetchProfile() {
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();

    if (json.success) {
      currentUser = json.data;
      showMainScreen();
    } else {
      logout();
    }
  } catch (err) {
    console.error(err);
  }
}

// Show Main Screen
function showMainScreen() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('mainScreen').classList.add('active');

  if (currentUser) {
    document.getElementById('userName').innerText = currentUser.nama_guru;
    document.getElementById('userRole').innerText = currentUser.role || 'Guru SMK ARTANITA';
    
    // Set Avatar initials
    const initials = currentUser.nama_guru.split(' ').slice(0, 2).map(n => n[0]).join('');
    document.getElementById('userAvatar').innerText = initials || 'G';
  }

  loadDashboard();
  loadKelasOptions();
  loadMapelOptions();
  loadTodayStatus();
}

// Logout
function logout() {
  localStorage.removeItem('esekolah_token');
  authToken = null;
  currentUser = null;
  document.getElementById('mainScreen').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
  showToast('Anda telah keluar aplikasi.');
}

// Navigation Tabs
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

  const activeTab = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  const activeNav = document.getElementById(`nav-${tabName}`);

  if (activeTab) activeTab.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  if (tabName === 'jadwal') loadJadwalData();
  if (tabName === 'riwayat') loadRiwayatData();
}

// Load Dashboard Overview
async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard/summary', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      document.getElementById('statGuru').innerText = json.data.total_guru;
      document.getElementById('statKelas').innerText = json.data.total_kelas;
      document.getElementById('statPresensi').innerText = json.data.total_presensi_hari_ini;
    }
  } catch (err) {
    console.error(err);
  }
}

// Load Today Presensi Status
async function loadTodayStatus() {
  try {
    const res = await fetch('/api/presensi/today', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      const d = json.data;
      const statusBadge = document.getElementById('todayStatusBadge');
      const jamIn = document.getElementById('todayJamIn');
      const jamOut = document.getElementById('todayJamOut');
      const btnIn = document.getElementById('btnCheckIn');
      const btnOut = document.getElementById('btnCheckOut');

      jamIn.innerText = d.jam_in || '--:--';
      jamOut.innerText = d.jam_out || '--:--';

      if (d.status === 'BELUM_CHECKIN') {
        statusBadge.innerText = 'BELUM ABSEN';
        statusBadge.className = 'status-pill';
        btnIn.disabled = false;
        btnOut.disabled = true;
      } else if (d.status === 'CHECKIN') {
        statusBadge.innerText = 'SUDAH MASUK';
        statusBadge.className = 'status-pill success';
        btnIn.disabled = true;
        btnOut.disabled = false;
      } else if (d.status === 'CHECKOUT') {
        statusBadge.innerText = 'SUDAH PULANG';
        statusBadge.className = 'status-pill success';
        btnIn.disabled = true;
        btnOut.disabled = true;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Open Presensi Modal
function openPresensiModal(type) {
  activeModalType = type;
  document.getElementById('modalTitle').innerText = type === 'in' ? 'Absen Masuk (Check-In)' : 'Absen Pulang (Check-Out)';
  document.getElementById('presensiModal').classList.add('active');

  // Fetch real/simulated GPS
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      document.getElementById('modalCoords').innerText = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    }, () => {
      document.getElementById('modalCoords').innerText = '-7.325205, 108.208354';
    });
  }
}

function closePresensiModal() {
  document.getElementById('presensiModal').classList.remove('active');
}

// Submit Presensi
async function doSubmitPresensi() {
  const endpoint = activeModalType === 'in' ? '/api/presensi/checkin' : '/api/presensi/checkout';
  const lokasi = document.getElementById('modalCoords').innerText;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ lokasi, foto: 'upload/presensi/selfie.jpg' })
    });
    const json = await res.json();

    if (json.success) {
      showToast(json.message);
      closePresensiModal();
      loadTodayStatus();
      loadDashboard();
    } else {
      showToast(json.message || 'Presensi gagal.', false);
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', false);
  }
}

// Load Dropdown Kelas
async function loadKelasOptions() {
  try {
    const res = await fetch('/api/kelas', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      const selectSiswa = document.getElementById('selectKelasSiswa');
      const selectMapel = document.getElementById('selectKelasMapel');
      let html = '<option value="">-- Pilih Kelas --</option>';
      json.data.forEach(k => {
        html += `<option value="${k.kode_kelas}">${k.nama_kelas} (${k.jurusan})</option>`;
      });
      selectSiswa.innerHTML = html;
      selectMapel.innerHTML = html;
    }
  } catch (err) {
    console.error(err);
  }
}

// Load Dropdown Mapel
async function loadMapelOptions() {
  try {
    const res = await fetch('/api/mapel', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      const selectMapel = document.getElementById('selectMapel');
      let html = '<option value="">-- Pilih Mapel --</option>';
      json.data.forEach(m => {
        html += `<option value="${m.kode_mapel}">${m.nama_mapel}</option>`;
      });
      selectMapel.innerHTML = html;
    }
  } catch (err) {
    console.error(err);
  }
}

// Render Demo Student Attendance List
function loadAbsensiSiswaData() {
  const kelas = document.getElementById('selectKelasSiswa').value;
  const container = document.getElementById('studentListContainer');
  const saveBar = document.getElementById('saveSiswaBar');

  if (!kelas) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-chalkboard-user"></i>
        <p>Silakan pilih kelas dan tanggal untuk menampilkan absensi siswa.</p>
      </div>`;
    saveBar.style.display = 'none';
    return;
  }

  // Generate Sample Student List for selected Class
  const sampleStudents = [
    { id: 101, nis: '202401', nama: 'Ahmad Fauzi' },
    { id: 102, nis: '202402', nama: 'Budi Santoso' },
    { id: 103, nis: '202403', nama: 'Citra Dewi' },
    { id: 104, nis: '202404', nama: 'Dinda Lestari' },
    { id: 105, nis: '202405', nama: 'Eko Prasetyo' }
  ];

  studentBatchData = {};
  let html = '';

  sampleStudents.forEach(s => {
    studentBatchData[s.id] = 'H'; // Default Hadir
    html += `
      <div class="student-card">
        <div class="info">
          <span class="name">${s.nama}</span>
          <span class="nis">NIS: ${s.nis}</span>
        </div>
        <div class="status-group">
          <button type="button" class="status-btn active-H" onclick="setStudentStatus(${s.id}, 'H', this)">H</button>
          <button type="button" class="status-btn" onclick="setStudentStatus(${s.id}, 'S', this)">S</button>
          <button type="button" class="status-btn" onclick="setStudentStatus(${s.id}, 'I', this)">I</button>
          <button type="button" class="status-btn" onclick="setStudentStatus(${s.id}, 'A', this)">A</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  saveBar.style.display = 'block';
}

function setStudentStatus(siswaId, status, btn) {
  studentBatchData[siswaId] = status;
  const group = btn.parentElement;
  group.querySelectorAll('.status-btn').forEach(b => {
    b.className = 'status-btn';
  });
  btn.className = `status-btn active-${status}`;
}

// Submit Student Batch Attendance
async function submitAbsensiSiswa() {
  const kode_kelas = document.getElementById('selectKelasSiswa').value;
  let tanggal = document.getElementById('inputTanggalSiswa').value;
  if (!tanggal) tanggal = new Date().toISOString().split('T')[0];

  const list_absensi = Object.keys(studentBatchData).map(id => ({
    kode_siswa: parseInt(id, 10),
    status: studentBatchData[id]
  }));

  try {
    const res = await fetch('/api/absensi-siswa/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ tanggal, kode_kelas, list_absensi })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message);
    } else {
      showToast(json.message || 'Gagal menyimpan absensi.', false);
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', false);
  }
}

// Load Absensi Mapel Student List
function loadAbsensiMapelData() {
  const mapel = document.getElementById('selectMapel').value;
  const kelas = document.getElementById('selectKelasMapel').value;
  const container = document.getElementById('studentMapelContainer');
  const saveBar = document.getElementById('saveMapelBar');

  if (!mapel || !kelas) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-book"></i>
        <p>Pilih mata pelajaran, kelas, dan tanggal untuk mengisi absensi.</p>
      </div>`;
    saveBar.style.display = 'none';
    return;
  }

  const sampleStudents = [
    { id: 201, nis: '202401', nama: 'Ahmad Fauzi' },
    { id: 202, nis: '202402', nama: 'Budi Santoso' },
    { id: 203, nis: '202403', nama: 'Citra Dewi' },
    { id: 204, nis: '202404', nama: 'Dinda Lestari' }
  ];

  mapelBatchData = {};
  let html = '';

  sampleStudents.forEach(s => {
    mapelBatchData[s.id] = 'H';
    html += `
      <div class="student-card">
        <div class="info">
          <span class="name">${s.nama}</span>
          <span class="nis">NIS: ${s.nis}</span>
        </div>
        <div class="status-group">
          <button type="button" class="status-btn active-H" onclick="setMapelStatus(${s.id}, 'H', this)">H</button>
          <button type="button" class="status-btn" onclick="setMapelStatus(${s.id}, 'S', this)">S</button>
          <button type="button" class="status-btn" onclick="setMapelStatus(${s.id}, 'I', this)">I</button>
          <button type="button" class="status-btn" onclick="setMapelStatus(${s.id}, 'A', this)">A</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  saveBar.style.display = 'block';
}

function setMapelStatus(siswaId, status, btn) {
  mapelBatchData[siswaId] = status;
  const group = btn.parentElement;
  group.querySelectorAll('.status-btn').forEach(b => {
    b.className = 'status-btn';
  });
  btn.className = `status-btn active-${status}`;
}

// Submit Subject Batch Attendance
async function submitAbsensiMapel() {
  const kode_mapel = document.getElementById('selectMapel').value;
  const kode_kelas = document.getElementById('selectKelasMapel').value;
  const kode_guru = currentUser ? currentUser.kode_guru : 21;
  let tanggal = document.getElementById('inputTanggalMapel').value;
  if (!tanggal) tanggal = new Date().toISOString().split('T')[0];

  const list_absensi = Object.keys(mapelBatchData).map(id => ({
    kode_siswa: parseInt(id, 10),
    status: mapelBatchData[id]
  }));

  try {
    const res = await fetch('/api/absensi-mapel/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ tanggal, kode_kelas, kode_guru, kode_mapel, list_absensi })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message);
    } else {
      showToast(json.message || 'Gagal menyimpan absensi mapel.', false);
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', false);
  }
}

// Load Schedules
async function loadJadwalData() {
  try {
    const res = await fetch(`/api/jadwal?hari=${currentHari}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    const container = document.getElementById('scheduleListContainer');

    if (json.success && json.data.length > 0) {
      let html = '';
      json.data.forEach(j => {
        html += `
          <div class="glass-card schedule-card">
            <div class="time"><i class="fa-regular fa-clock"></i> Jam ke-${j.jam_ke || '-'} (${j.jam || 'Waktu N/A'})</div>
            <div class="title">${j.nama_mapel || 'Mata Pelajaran'}</div>
            <div class="meta">
              <span><i class="fa-solid fa-users"></i> Kelas: ${j.nama_kelas || '-'}</span> | 
              <span><i class="fa-solid fa-user-tie"></i> Pengajar: ${j.nama_guru || '-'}</span>
            </div>
          </div>`;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>Tidak ada jadwal mengajar pada hari ${currentHari}.</p>
        </div>`;
    }
  } catch (err) {
    console.error(err);
  }
}

function filterJadwalHari(hari) {
  currentHari = hari;
  document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  loadJadwalData();
}

// Load Riwayat Presensi
async function loadRiwayatData() {
  try {
    const res = await fetch('/api/presensi/history?limit=20', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    const container = document.getElementById('historyListContainer');

    if (json.success && json.data.length > 0) {
      let html = '';
      json.data.forEach(item => {
        html += `
          <div class="glass-card student-card" style="margin-bottom: 10px;">
            <div class="info">
              <span class="name"><i class="fa-solid fa-calendar-day text-sky"></i> ${item.tanggal}</span>
              <span class="nis">Masuk: ${item.jam_in || '--:--'} | Pulang: ${item.jam_out || '--:--'}</span>
            </div>
            <span class="status-pill ${item.jam_out ? 'success' : ''}">
              ${item.jam_out ? 'LENGKAP' : 'MASUK'}
            </span>
          </div>`;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>Belum ada riwayat presensi.</p>
        </div>`;
    }
  } catch (err) {
    console.error(err);
  }
}
