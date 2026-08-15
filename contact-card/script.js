/* RISHIKESH DIGITAL BUSINESS CARD - INTERACTIONS */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================================================================
     1. TOAST NOTIFICATION
     ====================================================================== */
  let toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ======================================================================
     2. SAVE CONTACT (vCard download)
     ====================================================================== */
  const vcfLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Rishikesh R Alva",
    "N:Alva;Rishikesh R;;;",
    "TITLE:B.Tech CSE (AI) Student",
    "ORG:Yenepoya School of Engineering and Technology",
    "TEL;TYPE=CELL:+919902822296",
    "TEL;TYPE=WHATSAPP:+919902822296",
    "EMAIL:rishikeshalvahere@gmail.com",
    "URL:https://github.com/Rishikesh04alva",
    "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/rishikesh-r-alva-78543a426/",
    "END:VCARD"
  ].join("\r\n");

  function saveContact() {
    const blob = new Blob([vcfLines], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Rishikesh.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Contact saved!");
  }

  const saveBtn = document.getElementById("save-contact-btn");
  const quickSave = document.getElementById("quick-save");
  if (saveBtn) saveBtn.addEventListener("click", saveContact);
  if (quickSave) quickSave.addEventListener("click", saveContact);

  /* ======================================================================
     3. EMAIL - open mail client + copy to clipboard
     ====================================================================== */
  document.querySelectorAll("a[href^='mailto:']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText("rishikeshalvahere@gmail.com").catch(() => {});
      }
      toast("Email copied!");
    });
  });

  /* ======================================================================
     4. QR CODE (desktop only, encodes the live page URL)
     ====================================================================== */
  const qrBox = document.getElementById("qrcode");
  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  function renderQR() {
    if (!qrBox || qrBox.innerHTML || typeof QRCode === "undefined") return;
    try {
      new QRCode(qrBox, {
        text: window.location.href,
        width: 200,
        height: 200,
        colorDark: "#0a0b0e",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      qrBox.innerHTML = "<span style='color:#0a0b0e;font-family:monospace;'>QR unavailable</span>";
    }
  }

  if (isDesktop()) renderQR();
  window.addEventListener("resize", () => {
    if (isDesktop()) renderQR();
  });

  /* ======================================================================
     5. SERVICE WORKER (offline + installable PWA)
     ====================================================================== */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

});
