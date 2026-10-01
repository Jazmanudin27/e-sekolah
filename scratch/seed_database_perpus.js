const UserModel = require('../src/models/user.model');
const PerpustakaanModel = require('../src/models/perpustakaan.model');

async function main() {
  console.log('=== SEEDING PERPUSTAKAAN DATABASE ===');
  
  try {
    // 1. Ensure Library Admin & Pustakawan accounts in users table
    console.log('1. Checking and creating adminperpus & pustakawan users...');
    await UserModel.ensureDefaultUsers();

    // Verify users
    const adminPerpus = await UserModel.findByUsernameOrEmail('adminperpus');
    console.log('-> User adminperpus:', adminPerpus ? { id: adminPerpus.id || adminPerpus.id_user, username: adminPerpus.username, role: adminPerpus.role || adminPerpus.level } : 'Not found');

    const pustakawan = await UserModel.findByUsernameOrEmail('pustakawan');
    console.log('-> User pustakawan:', pustakawan ? { id: pustakawan.id || pustakawan.id_user, username: pustakawan.username, role: pustakawan.role || pustakawan.level } : 'Not found');

    // 2. Ensure Perpustakaan tables & sample books
    console.log('2. Checking and creating perpustakaan_buku & perpustakaan_peminjaman tables...');
    await PerpustakaanModel.ensureTables();

    const books = await PerpustakaanModel.getAllBuku({});
    console.log(`-> Total books in database: ${books.length}`);
    books.forEach(b => console.log(`   [${b.kode_buku}] ${b.judul} (${b.kategori}) - ${b.tersedia}/${b.stok} tersedia`));

    const stats = await PerpustakaanModel.getStats();
    console.log('-> Library Stats:', stats);

    console.log('=== SEEDING SELESAI DENGAN SUKSES ===');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err.message);
    process.exit(1);
  }
}

main();
