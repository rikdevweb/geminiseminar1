document.addEventListener("DOMContentLoaded", () => {
    
    // 1. SCROLL ANIMATION (Intersection Observer)
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animasi berjalan 1x saja
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach((el) => {
        observer.observe(el);
    });

    // 2. RIPPLE EFFECT PADA TOMBOL
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            if(this.disabled) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            setTimeout(() => { ripple.remove() }, 600);
        });
    });

    // 3. LOGIKA FORM, VALIDASI EMAIL, DAN FETCH APPS SCRIPT
    const form = document.getElementById('regForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const kuotaAlert = document.getElementById('kuotaAlert');
    const modal = document.getElementById('successModal');
    const emailInput = document.getElementById('email');
    const emailGroup = document.getElementById('emailGroup');
    const emailError = document.getElementById('emailError');

    // URL GOOGLE APPS SCRIPT (Pastikan ini URL hasil Deployment TERBARU)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzf6R4SaCQCI374b3vaK3W7nxZq7pfr-hflwbK474Y6EcoTSyusORm2hJDZ39ud0Q2_AQ/exec'; 

    // Hilangkan error merah saat user mulai mengetik ulang email
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            emailGroup.classList.remove('invalid');
            emailError.style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            
            // --- LOGIKA VALIDASI EMAIL KAMPUS HORIZON ---
            const emailValue = emailInput.value.toLowerCase().trim();
            const kampusDomain = "@krw.horizon.ac.id";
            
            if (!emailValue.endsWith(kampusDomain)) {
                // Jika bukan email kampus, munculkan error merah
                emailGroup.classList.add('invalid');
                emailError.style.display = 'block';
                emailError.innerText = "Wajib menggunakan email @krw.horizon.ac.id";
                
                // Efek getar (shake)
                emailGroup.style.transform = "translateX(-5px)";
                setTimeout(() => emailGroup.style.transform = "translateX(5px)", 100);
                setTimeout(() => emailGroup.style.transform = "translateX(0)", 200);
                
                return; // Berhenti di sini, data TIDAK dikirim
            } else {
                // Jika valid, pastikan status error hilang
                emailGroup.classList.remove('invalid');
                emailError.style.display = 'none';
            }

            // Ubah UI tombol menjadi Loading (Spinner)
            submitBtn.disabled = true;
            spinner.style.display = 'inline-block';
            btnText.innerText = 'Memproses Data...';

            const formData = new FormData(form);

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        // Munculkan Modal Sukses (Join Group WA)
                        modal.classList.add('active');
                        form.reset(); // Kosongkan input form
                        
                        // Kembalikan tombol submit seperti semula
                        submitBtn.disabled = false;
                        spinner.style.display = 'none';
                        btnText.innerText = 'Daftar Sekarang';

                    } else if (data.result === 'full') {
                        // Jika kuota habis (maksimal 5 pendaftar terpenuhi)
                        kuotaAlert.innerHTML = '<span class="material-symbols-rounded">sentiment_dissatisfied</span> Maaf, Kuota Sudah Terpenuhi!';
                        kuotaAlert.style.backgroundColor = 'rgba(234, 67, 53, 0.15)'; 
                        kuotaAlert.style.color = 'var(--g-red)';
                        kuotaAlert.style.borderColor = 'rgba(234, 67, 53, 0.3)';
                        kuotaAlert.style.display = 'block';
                        
                        spinner.style.display = 'none';
                        btnText.innerText = 'Pendaftaran Ditutup';
                        // Tombol tetap disabled karena kuota sudah habis

                    } else if (data.result === 'duplicate') {
                        // Jika email sudah pernah mendaftar
                        emailGroup.classList.add('invalid');
                        emailError.style.display = 'block';
                        emailError.innerText = "Email ini sudah terdaftar! Gunakan email lain.";
                        
                        // Efek getar (shake)
                        emailGroup.style.transform = "translateX(-5px)";
                        setTimeout(() => emailGroup.style.transform = "translateX(5px)", 100);
                        setTimeout(() => emailGroup.style.transform = "translateX(0)", 200);

                        submitBtn.disabled = false;
                        spinner.style.display = 'none';
                        btnText.innerText = 'Daftar Sekarang';
                    }
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('Gagal terhubung ke server. Pastikan koneksi internet stabil lalu coba lagi.');
                    
                    submitBtn.disabled = false;
                    spinner.style.display = 'none';
                    btnText.innerText = 'Daftar Sekarang';
                });
        });
    }

    // Event penutupan modal ketika mengklik tombol Join Grup WA
    const joinGroupBtn = document.getElementById('joinGroupBtn');
    if(joinGroupBtn) {
        joinGroupBtn.addEventListener('click', () => {
            // Tunggu 1,5 detik agar tab WhatsApp terbuka, baru tutup pop-up modalnya
            setTimeout(() => {
                closeModal();
            }, 1500);
        });
    }

    // Fungsi global untuk menutup modal
    window.closeModal = function() {
        if (modal) {
            modal.classList.remove('active');
        }
    }
});
