/**
 * HIA Website — Image Configuration
 * ===================================
 * To update any image:
 *   1. Add the new file to the /images/ folder (same filename)
 *   2. That's it — no changes to index.html needed.
 *
 * To use a completely different filename:
 *   1. Upload the new file to /images/
 *   2. Update the path string below
 *   3. Save and deploy
 */

const HIA_IMAGES = {

  // Logo — displayed in header, hero, and footer
  // Recommended: PNG with transparent background, min 400px wide
  logo: "images/logo.png",

  // HIA Donate banner — full-width image at top of gallery section
  // Recommended: landscape JPG/PNG, min 1200px wide
  hiaDonate: "images/hia-donate.jpg",

  // Gallery images — displayed in the 3-column grid below the banner
  // Recommended: landscape JPG, min 900px wide, 4:3 ratio works best
  gallery: [
    {
      src: "images/gallery-community.jpg",
      alt: "H.I.A community — families and volunteers"
    },
    {
      src: "images/gallery-education.jpg",
      alt: "H.I.A education — children in class"
    },
    {
      src: "images/gallery-care.jpg",
      alt: "H.I.A care — mother and child"
    }
  ]

};

// ---- Apply images to the page ----
// Runs immediately (script is loaded at bottom of body, DOM is already ready)
(function applyImages() {

  // Logo (all instances — header, hero, footer)
  document.querySelectorAll("img.hia-logo").forEach(function (el) {
    el.src = HIA_IMAGES.logo;
  });

  // HIA donate banner
  const donateImg = document.getElementById("hia-donate-img");
  if (donateImg) donateImg.src = HIA_IMAGES.hiaDonate;

  // Gallery tiles
  const galleryImgs = document.querySelectorAll(".hia-gallery-img");
  galleryImgs.forEach(function (el, i) {
    if (HIA_IMAGES.gallery[i]) {
      el.src = HIA_IMAGES.gallery[i].src;
      el.alt = HIA_IMAGES.gallery[i].alt;
    }
  });

})();
