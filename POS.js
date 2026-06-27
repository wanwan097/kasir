let keranjang = [];
let totalHarga = 0;

// 1. Fungsi menambah item ke keranjang
function tambahKeKeranjang(namaBarang, harga) {
    const pesanKosong = document.getElementById("pesanan-kosong");
    if (pesanKosong) pesanKosong.remove();

    const produkAda = keranjang.find(item => item.nama === namaBarang);

    if (produkAda) {
        produkAda.jumlah += 1;
    } else {
        character_data = keranjang.push({ nama: namaBarang, harga: harga, jumlah: 1 });
    }

    perbaruiTampilan();
}

// 2. Fungsi merender ulang daftar keranjang belanja
function perbaruiTampilan() {
    const daftarPesanan = document.getElementById("daftar-pesanan");
    daftarPesanan.innerHTML = ""; 
    totalHarga = 0;

    keranjang.forEach((item) => {
        const subTotal = item.harga * item.jumlah;
        totalHarga += subTotal;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.nama} (x${item.jumlah})</span>
            <span style="font-weight: 600;">Rp ${subTotal.toLocaleString('id-ID')}</span>
        `;
        daftarPesanan.appendChild(li);
    });

    document.getElementById("total-harga").innerText = "Rp " + totalHarga.toLocaleString('id-ID');
    hitungKembalian();
}

// 3. Fungsi membuat titik otomatis pada input ketikan uang
function formatRupiahInput(input) {
    let angka = input.value.replace(/[^0-9]/g, "");
    if (angka !== "") {
        input.value = parseInt(angka, 10).toLocaleString("id-ID");
    } else {
        input.value = "";
    }
    hitungKembalian();
}

// 4. Fungsi menghitung uang kembalian secara real-time
function hitungKembalian() {
    const uangDibayarInput = document.getElementById("uang-dibayar").value;
    const elemenKembalian = document.getElementById("uang-kembalian");
    const angkaPolos = uangDibayarInput.replace(/\./g, "");
    const uangDibayar = parseFloat(angkaPolos) || 0;

    if (totalHarga === 0 || uangDibayarInput === "") {
        elemenKembalian.innerText = "Rp 0";
        elemenKembalian.className = "text-emerald-600";
        return;
    }

    if (uangDibayar >= totalHarga) {
        const kembalian = uangDibayar - totalHarga;
        elemenKembalian.innerText = "Rp " + kembalian.toLocaleString('id-ID');
        elemenKembalian.className = "text-emerald-600"; 
    } else {
        elemenKembalian.innerText = "Uang Kurang!";
        elemenKembalian.className = "text-red-500"; 
    }
}

// 5. Fungsi Membayar, Menyimpan ke Brankas, dan Menampilkan Struk
function prosesPembayaran() {
    if (keranjang.length === 0) {
        alert("Keranjang belanjaan masih kosong!");
        return;
    }

    const uangDibayarInput = document.getElementById("uang-dibayar").value;
    const angkaPolos = uangDibayarInput.replace(/\./g, "");
    const uangDibayar = parseFloat(angkaPolos) || 0;

    if (uangDibayarInput === "" || uangDibayar < totalHarga) {
        alert("Pembayaran gagal! Nominal uang belum cukup.");
        return;
    }

    const kembalian = uangDibayar - totalHarga;
    const waktuSekarang = new Date();
    const stringWaktu = waktuSekarang.toLocaleString('id-ID');
    const idTransaksi = "TRX-" + waktuSekarang.getTime();

    // Packing data struk menjadi paket objek
    const dataStruk = {
        id: idTransaksi,
        waktu: stringWaktu,
        item: [...keranjang],
        total: totalHarga,
        bayar: uangDibayar,
        kembali: kembalian
    };

    // 💾 SIMPAN LANGSUNG KE BRANKAS MEMORI INTERNAL HP
    let isiBrankas = JSON.parse(localStorage.getItem("brankas_struk_bersama")) || [];
    isiBrankas.push(dataStruk);
    localStorage.setItem("brankas_struk_bersama", JSON.stringify(isiBrankas));


    // 🧾 MENCETAK NOTA DI LAYAR BAWAH WEB A
    const areaNota = document.getElementById("area-nota");
    areaNota.style.display = "block";

    let isiNotaHTML = `
        <div class="nota-header">
            <h3>NAMA TOKO</h3>
            <h4>STRUK PEMBAYARAN</h4>
            <p style="font-size: 11px; color:#555; margin-top:5px;">ID: ${idTransaksi}</p>
            <p style="font-size: 11px; color:#555;">${stringWaktu}</p>
        </div>
        <div style="margin-bottom: 10px;">
    `;

    keranjang.forEach(item => {
        isiNotaHTML += `
            <div class="nota-item">
                <span>${item.nama} x${item.jumlah}</span>
                <span>Rp ${(item.harga * item.jumlah).toLocaleString('id-ID')}</span>
            </div>
        `;
    });

    isiNotaHTML += `
        </div>
        <div class="nota-total">
            <span>TOTAL BELANJA:</span>
            <span>Rp ${totalHarga.toLocaleString('id-ID')}</span>
        </div>
        <div class="nota-item" style="margin-top: 5px;">
            <span>Bayar Tunai:</span>
            <span>Rp ${uangDibayar.toLocaleString('id-ID')}</span>
        </div>
        <div class="nota-item">
            <span>Kembalian:</span>
            <span>Rp ${kembalian.toLocaleString('id-ID')}</span>
        </div>
        <div style="text-align:center; margin-top:15px; font-size:12px; border-top:1px dashed #000; padding-top:8px;">
             -- Terima Kasih Atas Kunjungan Anda! -- 
        </div>
    `;

    areaNota.innerHTML = isiNotaHTML;
    areaNota.scrollIntoView({ behavior: 'smooth' });

    // Munculkan tombol cetak fisik ke mesin printer bluetooth
    document.getElementById("tombol-print-fisik").style.display = "block";
}

// 6. Fungsi membersihkan form kasir untuk pesanan baru
function resetKasir() {
    keranjang = [];
    totalHarga = 0;
    document.getElementById("uang-dibayar").value = "";
    document.getElementById("uang-kembalian").innerText = "Rp 0";
    document.getElementById("uang-kembalian").className = "text-emerald-600";
    document.getElementById("total-harga").innerText = "Rp 0";
    document.getElementById("area-nota").style.display = "none";
    document.getElementById("tombol-print-fisik").style.display = "none";
    document.getElementById("daftar-pesanan").innerHTML = `<li class="pesanan-kosong" id="pesanan-kosong">Belum ada pesanan</li>`;
}

// 7. Fungsi memanggil menu print sistem operasi untuk menembak printer thermal
function cetakKePrinterFisik() {
    window.print();
}

/**
 * 🔥 FITUR BARU: LOGIKA PENCARIAN PRODUK SECARA REAL-TIME
 */
function filterMenu() {
    // Ambil kata kunci ketikan kasir, paksa jadi huruf kecil semua biar gak sensitif
    let kataKunci = document.getElementById("cari-produk").value.toLowerCase();
    
    // Ambil semua tombol menu yang ada di dalam wadah
    let wadahMenu = document.getElementById("wadah-menu");
    let tombolMenu = wadahMenu.getElementsByClassName("tombol-menu");

    // Looping (periksa) satu per satu tombol produk
    for (let i = 0; i < tombolMenu.length; i++) {
        // Ambil teks nama produk di dalam tombol
        let namaProduk = tombolMenu[i].getElementsByClassName("nama-produk")[0].innerText.toLowerCase();

        // Jika nama produk mengandung kata kunci yang diketik
        if (namaProduk.includes(kataKunci)) {
            tombolMenu[i].style.display = ""; // Tampilkan tombol
        } else {
            tombolMenu[i].style.display = "none"; // Sembunyikan tombol
        }
    }
}


// Data produk bawaan (Default) toko jika brankas masih kosong
const produkDefault = [
    { nama: 'Nasi Goreng', harga: 15000 },
    { nama: 'Mie Goreng', harga: 12000 },
    { nama: 'Ayam Goreng', harga: 18000 },
    { nama: 'Es Teh Manis', harga: 5000 }
];

let modeEditAktif = false;

// Fungsi untuk menyalakan/mematikan tombol edit-hapus di menu
function saklarModeEdit() {
    modeEditAktif = !modeEditAktif;
    const btn = document.getElementById("btn-saklar-edit");
    if (modeEditAktif) {
        btn.innerText = "✅ Selesai";
        btn.style.background = "#059669";
    } else {
        btn.innerText = "⚙️ Mode Edit";
        btn.style.background = "rgba(255,255,255,0.1)";
    }
    renderEtalaseMenu(); // Render ulang tampilan tombol menu
}

// 🔥 FUNGSI UTAMA: MERENDER DAFTAR MENU DARI BRANKAS + TOMBOL AKSI EDIT/HAPUS
function renderEtalaseMenu() {
    // Ambil produk kustom di brankas, jika tidak ada pakai produk kustom kosong []
    let produkKustom = JSON.parse(localStorage.getItem("brankas_produk_kustom")) || [];
    
    // Gabungkan produk default bawaan sistem dengan produk buatan user
    let semuaProduk = [...produkDefault, ...produkKustom];
    
    const wadahMenu = document.getElementById("wadah-menu");
    wadahMenu.innerHTML = ""; // Bersihkan etalase lama

    semuaProduk.forEach((produk, index) => {
        // Buat kotak pembungkus produk agar posisi tombol edit tidak merusak layout
        const divGrup = document.createElement("div");
        divGrup.style.position = "relative";
        divGrup.className = "grup-item-menu";

        // 1. Tombol Utama Produk
        const tombolMenu = document.createElement("button");
        tombolMenu.className = "tombol-menu";
        tombolMenu.style.width = "100%";
        tombolMenu.style.height = "100%";
        tombolMenu.onclick = function() {
            if (!modeEditAktif) {
                tambahKeKeranjang(produk.nama, produk.harga);
            }
        };

        tombolMenu.innerHTML = `
            <p class="nama-produk">${produk.nama}</p>
            <p class="harga-produk">Rp ${produk.harga.toLocaleString('id-ID')}</p>
        `;
        divGrup.appendChild(tombolMenu);

        // 2. Jika Mode Edit Sedang Dinyalakan, Munculkan Tombol Aksi Mini (Kecuali produk default sistem)
        if (modeEditAktif) {
            if (index < produkDefault.length) {
                // Beri tanda kalau produk bawaan sistem tidak bisa di-edit/hapus
                tombolMenu.style.opacity = "0.5";
                tombolMenu.style.cursor = "not-allowed";
            } else {
                // Hitung index asli produk kustom di dalam brankasnya
                let indexKustom = index - produkDefault.length;

                const wadahAksiMini = document.createElement("div");
                wadahAksiMini.style.cssText = "position:absolute; top:5px; right:5px; display:flex; gap:4px; z-index:10;";

                // Tombol Pensil (Edit)
                const btnEdit = document.createElement("button");
                btnEdit.innerText = "✏️";
                btnEdit.style.cssText = "background:#eab308; border:none; padding:4px 6px; border-radius:4px; font-size:10px; cursor:pointer;";
                btnEdit.onclick = (e) => {
                    e.stopPropagation(); // Mencegah item terklik masuk keranjang
                    bukaFormEditProduk(indexKustom);
                };

                // Tombol Silang (Hapus)
                const btnHapus = document.createElement("button");
                btnHapus.innerText = "❌";
                btnHapus.style.cssText = "background:#ef4444; border:none; padding:4px 6px; border-radius:4px; font-size:10px; cursor:pointer; color:#fff;";
                btnHapus.onclick = (e) => {
                    e.stopPropagation();
                    eksekusiHapusProduk(indexKustom);
                };

                wadahAksiMini.appendChild(btnEdit);
                wadahAksiMini.appendChild(btnHapus);
                divGrup.appendChild(wadahAksiMini);
            }
        }

        wadahMenu.appendChild(divGrup);
    });
}

// 🔥 FUNGSI EDIT DATA PRODUK ETALASE
function bukaFormEditProduk(indexKustom) {
    let produkKustom = JSON.parse(localStorage.getItem("brankas_produk_kustom")) || [];
    let produk = produkKustom[indexKustom];

    let namaBaru = prompt(`Ubah Nama Produk:\nSebelumnya: ${produk.nama}`, produk.nama);
    if (namaBaru === null || namaBaru.trim() === "") return;

    let hargaBaru = prompt(`Ubah Harga Produk (Angka Saja):\nSebelumnya: ${produk.harga}`, produk.harga);
    if (hargaBaru === null) return;

    let nominalHarga = parseInt(hargaBaru.replace(/\D/g, ''));
    if (isNaN(nominalHarga) || nominalHarga <= 0) {
        alert("Gagal! Harga yang dimasukkan tidak valid.");
        return;
    }

    // Update data di dalam brankas
    produkKustom[indexKustom].nama = namaBaru.trim();
    produkKustom[indexKustom].harga = nominalHarga;

    localStorage.setItem("brankas_produk_kustom", JSON.stringify(produkKustom));
    renderEtalaseMenu(); // Refresh menu di layar
    alert("Produk berhasil di-update!");
}

// 🔥 FUNGSI HAPUS PRODUK DARI ETALASE
function eksekusiHapusProduk(indexKustom) {
    let produkKustom = JSON.parse(localStorage.getItem("brankas_produk_kustom")) || [];
    let namaProduk = produkKustom[indexKustom].nama;

    if (confirm(`Apakah anda yakin ingin menghapus produk "${namaProduk}" dari etalase jualan?`)) {
        produkKustom.splice(indexKustom, 1);
        localStorage.setItem("brankas_produk_kustom", JSON.stringify(produkKustom));
        renderEtalaseMenu(); // Refresh menu di layar
    }
}

// 🔥 FUNGSI TAMBAH PRODUK BARU
function tambahProdukKeEtalase() {
    const namaBaru = document.getElementById("input-nama-baru").value.trim();
    const hargaBaru = parseInt(document.getElementById("input-harga-baru").value);

    if (namaBaru === "" || isNaN(hargaBaru) || hargaBaru <= 0) {
        alert("Gagal! Mohon isi nama produk dan harga dengan benar.");
        return;
    }

    let produkKustom = JSON.parse(localStorage.getItem("brankas_produk_kustom")) || [];

    // Cek duplikasi nama
    const sudahAda = produkKustom.some(p => p.nama.toLowerCase() === namaBaru.toLowerCase());
    if (sudahAda) {
        alert("Produk dengan nama tersebut sudah terdaftar!");
        return;
    }

    produkKustom.push({ nama: namaBaru, harga: hargaBaru });
    localStorage.setItem("brankas_produk_kustom", JSON.stringify(produkKustom));

    // Kosongkan form input kembali
    document.getElementById("input-nama-baru").value = "";
    document.getElementById("input-harga-baru").value = "";

    renderEtalaseMenu(); // Render ulang seluruh menu beserta item baru secara instan
}

// Ganti fungsi inisialisasi awal agar meluncurkan sistem etalase dinamis yang baru
window.addEventListener("DOMContentLoaded", renderEtalaseMenu);


let metodePembayaranAktif = "TUNAI"; // Default pembayaran awal

// 🔥 LOGIKA BARU: SAKLAR METODE BAYAR + DETEKSI POP-UP JUMBO
function pilihMetodeBayar(metode) {
    metodePembayaranAktif = metode;
    const btnTunai = document.getElementById("btn-metode-tunai");
    const btnQris = document.getElementById("btn-metode-qris");
    const grupTunai = document.getElementById("grup-input-tunai");
    const inputUang = document.getElementById("uang-dibayar");
    const textKembalian = document.getElementById("uang-kembalian");
    const labelKembalian = document.getElementById("label-kembalian");

    if (metode === "QRIS") {
        // Validasi: Jangan ijinkan buka QRIS kalau keranjang masih kosong melompong
        if (totalHarga <= 0) {
            alert("Keranjang masih kosong! Silakan pilih menu terlebih dahulu.");
            metodePembayaranAktif = "TUNAI";
            return;
        }

        // Nyalakan warna tombol QRIS
        btnQris.style.background = "#2563eb"; btnQris.style.color = "#fff"; btnQris.style.border = "1px solid #2563eb";
        btnTunai.style.background = "rgba(255,255,255,0.05)"; btnTunai.style.color = "#9ca3af"; btnTunai.style.border = "1px solid rgba(255,255,255,0.1)";

        // Sembunyikan form cash tunai
        grupTunai.style.display = "none";

        // Set otomatis nominal bayar pas
        inputUang.value = totalHarga.toLocaleString('id-ID');
        labelKembalian.innerText = "Status:";
        textKembalian.innerText = "LUNAS (QRIS)";
        textKembalian.className = "text-emerald-600";

        // MUNCULKAN POP-UP QRIS JUMBO KE LAYAR
        document.getElementById("modal-total-tagihan").innerText = `Total: Rp ${totalHarga.toLocaleString('id-ID')}`;
        document.getElementById("modal-qris-jumbo").style.display = "flex";
    } else {
        // Kembalikan ke mode TUNAI biasa
        btnTunai.style.background = "#2563eb"; btnTunai.style.color = "#fff"; btnTunai.style.border = "1px solid #2563eb";
        btnQris.style.background = "rgba(255,255,255,0.05)"; btnQris.style.color = "#9ca3af"; btnQris.style.border = "1px solid rgba(255,255,255,0.1)";

        grupTunai.style.display = "flex";
        inputUang.value = "";
        labelKembalian.innerText = "Kembalian:";
        textKembalian.innerText = "Rp 0";
        textKembalian.className = "";
    }
}

// 🔥 FUNGSI BARU: MENUTUP MODAL QRIS JUMBO
function tutupModalQris() {
    document.getElementById("modal-qris-jumbo").style.display = "none";
}
