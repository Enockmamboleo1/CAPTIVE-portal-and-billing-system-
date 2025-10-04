
document.addEventListener('DOMContentLoaded', () => {
  // update year
  document.getElementById('year').textContent = new Date().getFullYear();

  // package buy buttons
  const buyButtons = document.querySelectorAll('.buy-btn');
  buyButtons.forEach(btn => btn.addEventListener('click', onBuyClicked));

  // voucher form
  const voucherForm = document.getElementById('voucherForm');
  voucherForm.addEventListener('submit', onVoucherSubmit);

  // mpesa text form
  const mpesaMsgForm = document.getElementById('mpesaMsgForm');
  mpesaMsgForm.addEventListener('submit', onMpesaMsgSubmit);

  // already paid quick btn
  document.getElementById('alreadyPaidBtn').addEventListener('click', openAlreadyPaidModal);

  // modal controls
  const modal = document.getElementById('mpesaModal');
  const closeModal = document.getElementById('closeModal');
  closeModal.addEventListener('click', () => closeModalWindow());
  document.getElementById('simulateStk').addEventListener('click', simulateStkPush);
  document.getElementById('simulateFail').addEventListener('click', simulateFailure);
  document.getElementById('doneBtn').addEventListener('click', () => closeModalWindow(true));
});

/* ---------- state ---------- */
let currentPackage = null;

/* ---------- handlers ---------- */
function onBuyClicked(e) {
  const planCard = e.currentTarget.closest('.plan');
  const planName = planCard.dataset.name;
  const price = planCard.dataset.price;

  // set modal state
  currentPackage = { name: planName, price: Number(price) };
  openPaymentModal(currentPackage);
}

function onVoucherSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('voucherCode').value.trim();
  const phone = document.getElementById('voucherPhone').value.trim();

  if (!code || !phone) {
    alert('Please enter both voucher/username and phone number.');
    return;
  }

  // In a real system we would call the backend to validate voucher.
  // Here we simulate success if code length >=4
  if (code.length >= 4) {
    alert(`Voucher ${code} activated for ${phone}. You are now connected.`);
    // Optionally show connection UI or redirect
  } else {
    alert('Voucher invalid. Try again or purchase a package.');
  }
}

function onMpesaMsgSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('mpesaMsg').value.trim();
  if (!msg) {
    alert('Paste your Mpesa SMS text here then submit.');
    return;
  }

  // Simple simulation: detect an MPESA-like amount pattern
  const found = msg.match(/KSh?\.?\s?(\d{1,6})|KES\s?(\d{1,6})/i);
  if (found) {
    alert('Thank you — we received your Mpesa message (simulated). Voucher issued.');
    // generate voucher
    const voucher = generateVoucher(8);
    alert(`Voucher: ${voucher}\nUse it as username to connect.`);
  } else {
    alert('Could not detect amount in message. Make sure you pasted the exact M-Pesa SMS text.');
  }
}

/* ---------- modal controls ---------- */
function openPaymentModal(pkg) {
  const modal = document.getElementById('mpesaModal');
  modal.setAttribute('aria-hidden', 'false');

  // fill modal info
  document.getElementById('modalTitle').textContent = 'Pay with M-Pesa (simulation)';
  document.getElementById('selectedPlanLine').textContent = `Plan: ${pkg.name} — Ksh ${pkg.price}`;
  document.getElementById('phoneInput').value = '';
  hideElementById('stkProgress');
  hideElementById('stkResult');
}

function closeModalWindow(showDone=false) {
  const modal = document.getElementById('mpesaModal');
  modal.setAttribute('aria-hidden', 'true');

  if (showDone) {
    // optional behavior: show instructions or redirect
  }
}

function openAlreadyPaidModal() {
  // Small helper to prefill modal with instruction
  currentPackage = { name: 'Manual reconnect', price: 0 };
  openPaymentModal(currentPackage);
  document.getElementById('modalTitle').textContent = 'Enter phone number used for payment';
  document.getElementById('simulateStk').textContent = 'Verify Payment (Sim)';
}

/* ---------- STK Simulation ---------- */
function simulateStkPush() {
  const phone = document.getElementById('phoneInput').value.trim();
  if (!validatePhone(phone)) {
    alert('Enter a valid phone number (07xxxxxxxx).');
    return;
  }

  // show progress UI
  showElementById('stkProgress');
  hideElementById('stkResult');

  // simulate waiting for user to enter MPESA PIN and complete payment
  setTimeout(() => {
    // simulate success 90% of the time
    const success = Math.random() < 0.92;
    hideElementById('stkProgress');

    if (success) {
      const voucher = generateVoucher(8);
      showStkResult(true, `Payment of Ksh ${currentPackage.price} confirmed. Connected!`, voucher);
    } else {
      showStkResult(false, 'Payment not completed or failed. Try again or use manual Mpesa SMS.');
    }
  }, 2200 + Math.floor(Math.random() * 2200));
}

function simulateFailure(){
  hideElementById('stkProgress');
  showStkResult(false, 'Simulated failure: transaction timed out. Try again.');
}

/* ---------- result UI ---------- */
function showStkResult(success, message, voucher) {
  const result = document.getElementById('stkResult');
  const msg = document.getElementById('resultMsg');
  const voucherSpan = document.getElementById('generatedVoucher');

  msg.textContent = message;
  if (success && voucher) {
    voucherSpan.textContent = voucher;
  } else {
    voucherSpan.textContent = '—';
  }

  // show UI
  hideElementById('stkProgress');
  showElementById('stkResult');

  // small beep (optional) — comment out if not wanted
  // playBeep(success ? 880 : 220);
}

/* ---------- helpers ---------- */
function hideElementById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
function showElementById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function generateVoucher(len = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function validatePhone(phone) {
  // Accept formats: 07xxxxxxxx OR +2547xxxxxxxx OR 2547xxxxxxxx
  if (!phone) return false;
  const cleaned = phone.replace(/\s|\-/g, '');
  return /^(?:0|\+?254)?7\d{8}$/.test(cleaned);
}
