/**
 * HIA Website — Image Configuration
 * ===================================
 * To update any image:
 *   1. Add the new file to the /images/ folder (same filename)
 *   2. Bump the CACHE_VERSION number below (e.g. v3 → v4)
 *   3. Save and deploy — all browsers will fetch the new images
 *
 * To use a completely different filename:
 *   1. Upload the new file to /images/
 *   2. Update the path string below
 *   3. Bump CACHE_VERSION and deploy
 */

// Bump this number every time you update any image
const CACHE_VERSION = "v4";

const HIA_IMAGES = {

  // Logo — displayed in header, hero, and footer
  logo: `images/logo.png?${CACHE_VERSION}`,

  // HIA Donate banner — full-width image at top of gallery section
  hiaDonate: `images/hia-donate.jpg?${CACHE_VERSION}`,

  // Gallery images — displayed in the 3-column grid below the banner
  gallery: [
    {
      src: `images/gallery-community.jpg?${CACHE_VERSION}`,
      alt: "H.I.A community — families and volunteers"
    },
    {
      src: `images/gallery-education.jpg?${CACHE_VERSION}`,
      alt: "H.I.A education — children in class"
    },
    {
      src: `images/gallery-care.jpg?${CACHE_VERSION}`,
      alt: "H.I.A care — mother and child"
    }
  ]

};

// ---- Apply images to the page ----
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
