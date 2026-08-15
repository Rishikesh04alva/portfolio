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
     4. QR CODE (encodes the live page URL, all devices)
     ====================================================================== */
  const qrBox = document.getElementById("qrcode");

  function renderQR() {
    if (!qrBox || qrBox.innerHTML || typeof QRCode === "undefined") return;
    try {
      new QRCode(qrBox, {
        text: window.location.href,
        width: 180,
        height: 180,
        colorDark: "#0a0b0e",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      qrBox.innerHTML = "<span style='color:#0a0b0e;font-family:monospace;'>QR unavailable</span>";
    }
  }

  renderQR();

  /* ======================================================================
     5. SHARE - native share sheet, clipboard fallback
     ====================================================================== */
  const shareBtn = document.getElementById("quick-share");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const shareData = {
        title: "Rishikesh - AI Engineering Student",
        text: "Connect with Rishikesh - AI & ML Engineering Student",
        url,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (e) {
          /* user cancelled - fall through to clipboard */
        }
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => toast("Link copied!")).catch(() => {});
      } else {
        toast("Link copied!");
      }
    });
  }

  /* ======================================================================
     6. SERVICE WORKER (offline + installable PWA)
     ====================================================================== */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

});
