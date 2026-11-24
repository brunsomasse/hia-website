  function copyBank(){
    const txt = `Beneficiary: Hope International Association (Geneva-based Non-Profit Organization)
Bank: PostFinance
Account Number: 16-799930-3
IBAN: CH05 0900 0000 1679 9930 3
BIC/SWIFT: POFICHBEXXX
Currency: CHF (Swiss Franc)
Country: Switzerland`;
    const feedback = document.getElementById('bank-copy-feedback');
    if(!navigator.clipboard || !navigator.clipboard.writeText){
      feedback.textContent = uiText('bank-copy-fail');
      return;
    }
    navigator.clipboard.writeText(txt).then(()=>{
      feedback.textContent = uiText('bank-copy-success');
    }).catch(()=>{ feedback.textContent = uiText('bank-copy-fail'); });
  }

  function loadHiaVideo(button){
    const frame = button.parentElement.querySelector('iframe');
    if(!frame.src || frame.src === 'about:blank'){
      frame.src = frame.dataset.src + '&autoplay=1';
    }
    button.hidden = true;
    frame.focus();
  }

  let analyticsStarted = false;
  function loadAnalytics(){
    if(analyticsStarted) return;
    analyticsStarted = true;
    const sdk = document.createElement('script');
    sdk.src = 'https://unpkg.com/@grafana/faro-web-sdk@2.14.0/dist/bundle/faro-web-sdk.iife.js';
    sdk.onload = () => {
      if(window.GrafanaFaroWebSdk) window.GrafanaFaroWebSdk.initializeFaro({
        url: 'https://faro-collector-prod-us-east-6.grafana.net/collect/073ecfe0d472f44938c058c8ff6d615e',
        app: { name: 'hia-hope', version: '1.0.0', environment: 'production' }
      });
    };
    document.head.appendChild(sdk);
  }

  // mobile drawer
  const menuToggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  drawer.inert = true;
  let drawerReturnFocus = null;
  function toggleDrawer(open){
    if(open) drawerReturnFocus = document.activeElement;
    drawer.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    document.body.style.overflow = open || (overlay && overlay.classList.contains('open')) ? 'hidden' : '';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if(open) drawer.querySelector('a,button').focus();
    else if(drawerReturnFocus) drawerReturnFocus.focus();
  }
  menuToggle.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('open')));
  scrim.addEventListener('click', () => toggleDrawer(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));

  // donate modal
  const overlay = document.getElementById('modalOverlay');
  const modalBox = overlay.querySelector('.modal-box');
  let modalReturnFocus = null;
  function openModal(method){
    modalReturnFocus = document.activeElement;
    if(drawer.classList.contains('open')){
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.inert = true;
      scrim.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    }
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTab(method || 'card');
    modalBox.focus();
    if((method || 'card') === 'card') initStripe();
  }
  function closeModal(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const payButton = document.getElementById('stripePayBtn');
    payButton.disabled = false;
    payButton.textContent = uiText('card-pay');
    payButton.style.background = '';
    document.getElementById('stripe-errors').textContent = '';
    if(modalReturnFocus && !drawer.contains(modalReturnFocus)) modalReturnFocus.focus();
    else menuToggle.focus();
  }
  overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') {
      if(overlay.classList.contains('open')) closeModal();
      else if(drawer.classList.contains('open')) toggleDrawer(false);
    }
    if(e.key === 'Tab' && overlay.classList.contains('open')) {
      const focusable = [...modalBox.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),iframe')]
        .filter(el => el.getClientRects().length && !el.disabled);
      if(!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if(e.shiftKey && (document.activeElement === first || document.activeElement === modalBox)) { e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if(e.key === 'Tab' && drawer.classList.contains('open')) {
      const focusable = [...drawer.querySelectorAll('a[href],button:not(:disabled)')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function setTab(name){
    document.querySelectorAll('.tab-btn').forEach(b => {
      const selected = b.dataset.tab === name;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-selected', String(selected));
      b.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('.modal-panel').forEach(p => {
      const active = p.dataset.panel === name;
      p.classList.toggle('active', active);
      p.hidden = !active;
    });
  }
  const modalTabs = [...document.querySelectorAll('.tab-btn')];
  modalTabs.forEach((b, i) => {
    b.addEventListener('click', () => setTab(b.dataset.tab));
    b.addEventListener('keydown', e => {
      if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const next = modalTabs[(i + step + modalTabs.length) % modalTabs.length];
      setTab(next.dataset.tab);
      next.focus();
    });
  });

  // amount buttons
  document.querySelectorAll('.amt-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.amt-btn').forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('active');
      b.setAttribute('aria-pressed', 'true');
    });
  });

  // language toggle (placeholder behavior)
  // Language switching handled by applyLang() below

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:0.15});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---- CONTACT FORM (Formspree) ----
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const btn = document.getElementById('formSubmitBtn');
      const success = document.getElementById('formSuccess');
      const error = document.getElementById('formError');
      btn.disabled = true;
      btn.textContent = uiText('form-sending');
      success.style.display = 'none';
      error.style.display = 'none';
      try{
        const res = await fetch(contactForm.action, {
          method:'POST',
          body: new FormData(contactForm),
          headers:{'Accept':'application/json'}
        });
        if(res.ok){
          success.style.display = 'block';
          contactForm.reset();
          btn.textContent = uiText('form-sent');
          btn.disabled = false;
        } else {
          throw new Error('Form error');
        }
      } catch(err){
        error.style.display = 'block';
        btn.disabled = false;
        btn.textContent = uiText('form-submit');
      }
    });
  }

  // ---- STRIPE PAYMENT ----
  // The publishable key is browser-safe. Configure its matching secret key in Netlify.
  const STRIPE_KEY = 'pk_live_51TjZpAKbDaOJhVN0giZdAnW3mO5OTRxQ2dlVuOzclo2ZGi6i13ajp0CIgfH6gKArWoJhVvuIk70DkoKPU9MBPO2i00KpGKTKEK';
  let stripe = null, cardElement = null;

  function initStripe(){
    if(STRIPE_KEY === 'YOUR_STRIPE_PUBLISHABLE_KEY') return Promise.resolve(false);
    if(!window.Stripe){
      if(!stripeLoadPromise){
        stripeLoadPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      return stripeLoadPromise.then(() => initStripe()).catch(() => false);
    }
    if(cardElement) return Promise.resolve(true);
    if(!document.getElementById('stripe-card-element')) return Promise.resolve(false);
    stripe = window.Stripe(STRIPE_KEY);
    const elements = stripe.elements();
    cardElement = elements.create('card', {
      style:{
        base:{
          color:'#f3ecd9', fontFamily:'Jost, sans-serif', fontSize:'15px',
          '::placeholder':{color:'#8a6a26'}
        }
      }
    });
    const mount = document.getElementById('stripe-card-element');
    if(mount){
      cardElement.mount('#stripe-card-element');
    }
    return Promise.resolve(Boolean(cardElement));
  }

  let stripeLoadPromise = null;
  async function handleStripePayment(){
    if(!stripe || !cardElement){
      const btn = document.getElementById('stripePayBtn');
      btn.textContent = uiText('card-loading');
      btn.disabled = true;
      const loaded = await initStripe();
      if(!loaded){
        document.getElementById('stripe-errors').textContent = uiText('card-unavailable');
        btn.textContent = uiText('card-pay');
        btn.disabled = false;
        return;
      }
      btn.textContent = uiText('card-pay');
      btn.disabled = false;
    }
    const activeAmt = document.querySelector('.amt-btn.active');
    const amount = activeAmt ? parseInt(activeAmt.dataset.amount) : 50;
    const btn = document.getElementById('stripePayBtn');
    const errDiv = document.getElementById('stripe-errors');
    btn.disabled = true;
    btn.textContent = uiText('card-processing');
    errDiv.textContent = '';

    try {
      // 1. Create PaymentIntent via Netlify function
      const res = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'chf' })
      });
      const { clientSecret, error: serverError } = await res.json();
      if (serverError) throw new Error(serverError);

      // 2. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      });

      if (error) {
        errDiv.textContent = error.message || "Your card couldn't be charged. Please check your details and try again.";
        btn.disabled = false;
        btn.textContent = uiText('card-pay');
      } else if (paymentIntent.status === 'succeeded') {
        btn.textContent = uiText('card-thanks');
        btn.style.background = 'linear-gradient(135deg,#5FA87A,#2E7A50)';
        errDiv.style.color = '#8fcca0';
        errDiv.textContent = 'Donation of CHF ' + amount + ' received. Thank you for your generosity!';
        cardElement.clear();
        setTimeout(() => closeModal(), 3000);
      }
    } catch(err) {
      errDiv.textContent = "We couldn't process your card. You haven't been charged — please try PayPal or Bank Transfer instead.";
      btn.disabled = false;
      btn.textContent = uiText('card-pay');
    }
  }

  // ---- COOKIE BANNER ----
  function setCookieChoice(choice){
    try { localStorage.setItem('hia_cookies', choice); } catch(e) {}
    document.getElementById('cookieBanner').style.display='none';
    if(choice === 'accepted') loadAnalytics();
    if(cookieSettingsReturnFocus) cookieSettingsReturnFocus.focus();
  }
  function acceptCookies(){
    setCookieChoice('accepted');
  }
  function declineCookies(){
    setCookieChoice('declined');
  }
  let cookieSettingsReturnFocus = null;
  function showCookieSettings(){
    cookieSettingsReturnFocus = document.activeElement;
    document.getElementById('cookieBanner').style.display='block';
    document.querySelector('.cookie-accept').focus();
  }
  let cookieChoice = null;
  try { cookieChoice = localStorage.getItem('hia_cookies'); } catch(e) {}
  if(cookieChoice === 'accepted') loadAnalytics();
  if(!cookieChoice){
    setTimeout(()=>{
      document.getElementById('cookieBanner').style.display='block';
    }, 1500);
  }

  // ---- STAGGERED CARD REVEAL ----
  const cardEls = document.querySelectorAll('.reveal-card');
  if('IntersectionObserver' in window){
    const cardIO = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if(en.isIntersecting){ en.target.classList.add('in'); cardIO.unobserve(en.target); }
      });
    }, {threshold:0.12});
    cardEls.forEach(el => cardIO.observe(el));
  } else {
    cardEls.forEach(el => el.classList.add('in'));
  }


  // ========== TRANSLATIONS ==========

  const LANG = {
    en: {
      'nav-about': `About`,
      'nav-programs': `Programs`,
      'nav-stories': `How we work`,
      'nav-contact': `Contact`,
      'nav-donate': `Donate Now`,
      'contact-eyebrow': `Get in touch`,
      'contact-title': `Send us a <em>message.</em>`,
      'contact-lede': `Whether you want to donate, volunteer, partner with us, or simply learn more — we'd love to hear from you.`,
      'form-name': `Full name`, 'form-name-placeholder': `Your name`,
      'form-email': `Email`, 'form-email-placeholder': `you@example.com`,
      'form-subject': `Subject`, 'form-message': `Message`, 'form-message-placeholder': `Your message`,
      'form-topic-general': `General inquiry`, 'form-topic-donation': `Donation question`,
      'form-topic-volunteer': `Volunteering`, 'form-topic-partner': `Partnership`, 'form-topic-media': `Media`,
      'form-submit': `Send message`, 'form-success': `✓ Message sent! We'll be in touch within 48 hours.`,
      'form-error': `Your message didn't go through. Please email us directly and we'll respond within 48 hours.`,
      'social-coming': `More channels coming soon`,
      'hero-h1': `Support for widows and children rebuilding after loss.`,
      'hero-tagline': `Practical help. Long-term care.`,
      'hero-lede': `Hope International Association is a Swiss nonprofit supporting widows and orphaned children through education, healthcare, emergency relief, and livelihood programs.`,
      'hero-btn-mission': `How we work`,
      'mission-eyebrow': `Our Mission`,
      'mission-title': `Loss should never be<br><em>a life sentence.</em>`,
      'mission-p1': `When a husband or father is lost, a family's entire foundation can collapse overnight — income, housing, education, and security all at risk at once. Hope International Association exists to close that gap.`,
      'mission-p2': `We are not a relief organization that disappears once the crisis fades from the headlines. We are a <strong>long-term partner</strong> in rebuilding — through scholarships, microfinance, healthcare access, and vocational training that help widows regain independence and give orphaned children a real path forward.`,
      'mission-p3': `Every franc raised supports our work with families and communities.`,
      'mission-sig': `Hope International Association`,
      'mission-sig-small': `Founder &amp; President — H.I.A · Geneva`,
      'pillar1-num': `01 — Immediate Relief`,
      'pillar1-title': `When crisis hits first`,
      'pillar1-p': `Emergency support for widows and orphans facing housing insecurity, hunger, or sudden medical need.`,
      'pillar2-num': `02 — Education &amp; Empowerment`,
      'pillar2-title': `Building independence`,
      'pillar2-p': `Scholarships, vocational training, and microfinance that help families stand on their own again.`,
      'pillar3-num': `03 — Long-Term Care`,
      'pillar3-title': `Hope that continues`,
      'pillar3-p': `Ongoing health services, mentorship, and community support — care that continues beyond a single gift.`,
      'video-eyebrow': `Our Story`,
      'video-lede': `Learn about Hope International Association and the people we aim to support.`,
      'video-title': `Meet the <em>association.</em>`,
      'video-play': `Load video`,
      'gallery-eyebrow': `From The Field`,
      'gallery-title': `Faces of <em>hope.</em>`,
      'gallery-lede': `Every face tells a story. Every story is a life changed.`,
      'programs-eyebrow': `What We Do`,
      'programs-title': `Support that follows<br><em>real need.</em>`,
      'programs-lede': `Our programs are structured around the real, sequential needs of the families we serve — from emergency stabilization to lasting independence.`,
      'prog1-title': `Emergency Relief`,
      'prog1-p': `Housing support, food security, and urgent medical care when a family needs it most.`,
      'prog2-title': `Education &amp; Scholarships`,
      'prog2-p': `School fees, supplies, and tuition for orphaned children — and continuing education for widows.`,
      'prog3-title': `Microfinance &amp; Livelihood`,
      'prog3-p': `Small loans and business training that build lasting financial independence for widows.`,
      'prog4-title': `Health Services`,
      'prog4-p': `Access to medical care, screenings, and ongoing wellness support for families in need.`,
      'prog5-title': `Vocational Training`,
      'prog5-p': `Practical, locally relevant skills — tailoring, agriculture, trades — built around real opportunity.`,
      'prog6-title': `Community &amp; Mentorship`,
      'prog6-p': `Support networks connecting widows and giving orphaned children mentors as they grow.`,
      'stats-eyebrow': `Impact`,
      'stats-title': `Support that can meet <em>changing needs.</em>`,
      'stats-lede': `H.I.A describes its work as a combination of immediate assistance and longer-term support. We’ll share verified impact figures here when reporting is available.`,
      'story-eyebrow': `A long-term approach`,
      'story-quote': `From urgent needs to education, health, and livelihood support, our programs are intended to help families move toward greater stability.`,
      'donate-eyebrow': `Give`,
      'donate-title': `Select how you'd like<br><em>to give.</em>`,
      'donate-lede': `Every gift — large or small — helps support emergency relief, education, healthcare, and livelihood training for widows and orphans.`,
      'method-paypal-title': `PayPal`,
      'method-paypal-p': `Fast &amp; secure`,
      'method-bank-title': `Bank Transfer`,
      'method-bank-p': `Direct &amp; traceable`,
      'method-mobile-title': `Other methods`,
      'method-mobile-p': `PayPal or bank transfer`,
      'donate-legal': `Hope International Association (H.I.A) is a registered nonprofit organization based in Switzerland (Reg. No. 482.5.021.9302). Donations processed via PostFinance (IBAN: CH05 0900 0000 1679 9930 3) or PayPal (judmaria9@gmail.com).`,
      'cta-title': `You can be <em>someone's hope</em> today.`,
      'cta-btn-involved': `Get Involved`,
      'footer-about': `A Geneva-based nonprofit supporting widows and orphans through education, healthcare, and community-driven programs that last.`,
      'footer-links-title': `Quick Links`,
      'footer-link1': `About Us`,
      'footer-link2': `Our Programs`,
      'footer-link3': `Our approach`,
      'footer-link4': `Donate`,
      'footer-contact-title': `Contact`,
      'modal-title': `Make a Donation`,
      'modal-p': `Choose a method below to support widows and orphans through H.I.A.`,
      'modal-tab-paypal': `PayPal`,
      'modal-tab-bank': `Bank Transfer`,
      'modal-tab-mobile': `Other methods`,
      'modal-paypal-p': `Donate securely via PayPal to`,
      'modal-paypal-btn': `Donate with PayPal`,
      'modal-bank-btn': `Copy Bank Details`,
    },
    fr: {
      'nav-about': `À propos`,
      'nav-programs': `Programmes`,
      'nav-stories': `Notre approche`,
      'nav-contact': `Contact`,
      'nav-donate': `Faire un don`,
      'contact-eyebrow': `Nous contacter`,
      'contact-title': `Écrivez-nous un <em>message.</em>`,
      'contact-lede': `Pour faire un don, devenir bénévole, créer un partenariat ou en savoir plus, écrivez-nous.`,
      'form-name': `Nom complet`, 'form-name-placeholder': `Votre nom`,
      'form-email': `E-mail`, 'form-email-placeholder': `vous@exemple.com`,
      'form-subject': `Sujet`, 'form-message': `Message`, 'form-message-placeholder': `Votre message`,
      'form-topic-general': `Demande générale`, 'form-topic-donation': `Question sur un don`,
      'form-topic-volunteer': `Bénévolat`, 'form-topic-partner': `Partenariat`, 'form-topic-media': `Médias`,
      'form-submit': `Envoyer`, 'form-success': `✓ Message envoyé ! Nous vous répondrons sous 48 heures.`,
      'form-error': `L'envoi a échoué. Écrivez-nous directement par e-mail ; nous vous répondrons sous 48 heures.`,
      'social-coming': `D'autres réseaux bientôt`,
      'hero-h1': `Soutenir les veuves et les enfants qui se reconstruisent après un deuil.`,
      'hero-tagline': `Une aide concrète. Un soutien durable.`,
      'hero-lede': `Hope International Association est une association suisse qui soutient les veuves et les enfants orphelins par l'éducation, la santé, l'aide d'urgence et des programmes de subsistance.`,
      'hero-btn-mission': `Notre approche`,
      'mission-eyebrow': `Notre Mission`,
      'mission-title': `La perte ne devrait jamais être<br><em>une condamnation à vie.</em>`,
      'mission-p1': `Quand un mari ou un père disparaît, toute la fondation d'une famille peut s'effondrer du jour au lendemain — revenus, logement, éducation et sécurité, tout est menacé à la fois. H.I.A existe pour combler ce vide.`,
      'mission-p2': `Nous ne sommes pas une organisation d'aide qui disparaît une fois que la crise sort des manchettes. Nous sommes un <strong>partenaire à long terme</strong> dans la reconstruction — grâce à des bourses, des microfinances, l'accès aux soins de santé et une formation professionnelle qui aide les veuves à retrouver leur indépendance.`,
      'mission-p3': `Chaque franc collecté soutient nos actions auprès des familles et des communautés.`,
      'mission-sig': `Hope International Association`,
      'mission-sig-small': `Fondateur &amp; Président — H.I.A · Genève`,
      'pillar1-num': `01 — Secours d'urgence`,
      'pillar1-title': `Quand la crise frappe en premier`,
      'pillar1-p': `Soutien d'urgence aux veuves et aux orphelins confrontés à l'insécurité du logement, à la faim ou à un besoin médical soudain.`,
      'pillar2-num': `02 — Éducation &amp; Autonomisation`,
      'pillar2-title': `Construire l'indépendance`,
      'pillar2-p': `Bourses, formation professionnelle et microfinance qui aident les familles à se tenir de nouveau sur leurs propres pieds.`,
      'pillar3-num': `03 — Soins à long terme`,
      'pillar3-title': `Un espoir qui dure`,
      'pillar3-p': `Services de santé continus, mentorat et soutien communautaire — un accompagnement qui se poursuit au-delà d'un seul don.`,
      'video-eyebrow': `Notre histoire`,
      'video-lede': `Découvrez Hope International Association et les personnes que nous souhaitons soutenir.`,
      'video-title': `Découvrez <em>l'association.</em>`,
      'video-play': `Charger la vidéo`,
      'gallery-eyebrow': `Sur le terrain`,
      'gallery-title': `Visages de <em>l'espoir.</em>`,
      'gallery-lede': `Chaque visage raconte une histoire. Chaque histoire est une vie transformée.`,
      'programs-eyebrow': `Ce que nous faisons`,
      'programs-title': `Un soutien adapté aux<br><em>besoins réels.</em>`,
      'programs-lede': `Nos programmes sont structurés autour des besoins réels et séquentiels des familles que nous servons — de la stabilisation d'urgence à l'indépendance durable.`,
      'prog1-title': `Secours d'urgence`,
      'prog1-p': `Soutien au logement, sécurité alimentaire et soins médicaux urgents quand une famille en a le plus besoin.`,
      'prog2-title': `Éducation &amp; Bourses`,
      'prog2-p': `Frais de scolarité, fournitures et droits universitaires pour les enfants orphelins — et formation continue pour les veuves.`,
      'prog3-title': `Microfinance &amp; Moyens de subsistance`,
      'prog3-p': `Petits prêts et formation commerciale qui construisent une indépendance financière durable pour les veuves.`,
      'prog4-title': `Services de santé`,
      'prog4-p': `Accès aux soins médicaux, dépistages et soutien au bien-être continu pour les familles dans le besoin.`,
      'prog5-title': `Formation professionnelle`,
      'prog5-p': `Compétences pratiques et localement pertinentes — couture, agriculture, métiers — construites autour de vraies opportunités.`,
      'prog6-title': `Communauté &amp; Mentorat`,
      'prog6-p': `Réseaux de soutien connectant les veuves et donnant aux enfants orphelins des mentors au fil de leur croissance.`,
      'stats-eyebrow': `Impact`,
      'stats-title': `Un soutien adapté à des <em>besoins changeants.</em>`,
      'stats-lede': `H.I.A décrit son action comme une combinaison d'aide immédiate et de soutien à long terme. Les chiffres d'impact vérifiés seront publiés lorsque les données seront disponibles.`,
      'story-eyebrow': `Une approche durable`,
      'story-quote': `De l'aide d'urgence à l'éducation, à la santé et aux moyens de subsistance, nos programmes visent à aider les familles à gagner en stabilité.`,
      'donate-eyebrow': `Donner`,
      'donate-title': `Choisissez comment<br><em>vous souhaitez donner.</em>`,
      'donate-lede': `Chaque don — petit ou grand — contribue aux secours d'urgence, à l'éducation, à la santé et à la formation professionnelle pour les veuves et les orphelins.`,
      'method-paypal-title': `PayPal`,
      'method-paypal-p': `Rapide &amp; sécurisé`,
      'method-bank-title': `Virement bancaire`,
      'method-bank-p': `Direct &amp; traçable`,
      'method-mobile-title': `Autres moyens`,
      'method-mobile-p': `PayPal ou virement bancaire`,
      'donate-legal': `Hope International Association (H.I.A) est une organisation à but non lucratif enregistrée en Suisse (N° d'immatriculation : 482.5.021.9302). Les dons sont traités via PostFinance (IBAN : CH05 0900 0000 1679 9930 3) ou PayPal (judmaria9@gmail.com).`,
      'cta-title': `Vous pouvez être <em>l'espoir de quelqu'un</em> aujourd'hui.`,
      'cta-btn-involved': `S'impliquer`,
      'footer-about': `Une organisation à but non lucratif basée à Genève, soutenant les veuves et les orphelins par l'éducation, les soins de santé et des programmes communautaires durables.`,
      'footer-links-title': `Liens rapides`,
      'footer-link1': `À propos`,
      'footer-link2': `Nos programmes`,
      'footer-link3': `Notre approche`,
      'footer-link4': `Faire un don`,
      'footer-contact-title': `Contact`,
      'modal-title': `Faire un don`,
      'modal-p': `Choisissez une méthode ci-dessous pour soutenir les veuves et orphelins via H.I.A.`,
      'modal-tab-paypal': `PayPal`,
      'modal-tab-bank': `Virement bancaire`,
      'modal-tab-mobile': `Autres moyens`,
      'modal-paypal-p': `Donnez en toute sécurité via PayPal à`,
      'modal-paypal-btn': `Donner via PayPal`,
      'modal-bank-btn': `Copier les coordonnées bancaires`,
    },

    it: {
      'nav-about': `Chi siamo`,
      'nav-programs': `Programmi`,
      'nav-stories': `Il nostro approccio`,
      'nav-contact': `Contatto`,
      'nav-donate': `Dona ora`,
      'contact-eyebrow': `Contattaci`,
      'contact-title': `Scrivici un <em>messaggio.</em>`,
      'contact-lede': `Per donare, fare volontariato, avviare una collaborazione o saperne di più, scrivici.`,
      'form-name': `Nome completo`, 'form-name-placeholder': `Il tuo nome`,
      'form-email': `E-mail`, 'form-email-placeholder': `tu@esempio.com`,
      'form-subject': `Oggetto`, 'form-message': `Messaggio`, 'form-message-placeholder': `Il tuo messaggio`,
      'form-topic-general': `Richiesta generale`, 'form-topic-donation': `Domanda su una donazione`,
      'form-topic-volunteer': `Volontariato`, 'form-topic-partner': `Collaborazione`, 'form-topic-media': `Media`,
      'form-submit': `Invia messaggio`, 'form-success': `✓ Messaggio inviato! Ti risponderemo entro 48 ore.`,
      'form-error': `Invio non riuscito. Scrivici direttamente via e-mail; ti risponderemo entro 48 ore.`,
      'social-coming': `Altri canali in arrivo`,
      'hero-h1': `Sostegno per vedove e bambini che ricostruiscono la propria vita dopo una perdita.`,
      'hero-tagline': `Aiuto concreto. Assistenza duratura.`,
      'hero-lede': `Hope International Association è un'organizzazione svizzera senza scopo di lucro che sostiene vedove e bambini orfani con istruzione, assistenza sanitaria, soccorso d'emergenza e programmi di sussistenza.`,
      'hero-btn-mission': `Il nostro approccio`,
      'mission-eyebrow': `La nostra missione`,
      'mission-title': `La perdita non dovrebbe mai essere<br><em>una condanna a vita.</em>`,
      'mission-p1': `Quando si perde un marito o un padre, l'intera base di una famiglia può crollare da un giorno all'altro — reddito, alloggio, istruzione e sicurezza tutti a rischio insieme. Hope International Association esiste per colmare questo vuoto.`,
      'mission-p2': `Non siamo un'organizzazione di soccorso che scompare quando la crisi esce dai titoli. Siamo un <strong>partner a lungo termine</strong> nella ricostruzione — attraverso borse di studio, microfinanza, accesso alle cure sanitarie e formazione professionale che aiutano le vedove a riconquistare l'indipendenza e offrono ai bambini orfani un vero percorso da seguire.`,
      'mission-p3': `Ogni franco raccolto sostiene il nostro lavoro con famiglie e comunità.`,
      'mission-sig': `Hope International Association`,
      'mission-sig-small': `Fondatore &amp; Presidente — H.I.A · Ginevra`,
      'pillar1-num': `01 — Soccorso immediato`,
      'pillar1-title': `Quando la crisi colpisce per prima`,
      'pillar1-p': `Supporto di emergenza per vedove e orfani che affrontano insicurezza abitativa, fame o un bisogno medico improvviso.`,
      'pillar2-num': `02 — Istruzione &amp; Empowerment`,
      'pillar2-title': `Costruire l'indipendenza`,
      'pillar2-p': `Borse di studio, formazione professionale e microfinanza che aiutano le famiglie a rimettersi in piedi da sole.`,
      'pillar3-num': `03 — Assistenza a lungo termine`,
      'pillar3-title': `Una speranza che continua`,
      'pillar3-p': `Servizi sanitari continui, tutoraggio e sostegno comunitario — un aiuto che continua oltre una singola donazione.`,
      'video-eyebrow': `La nostra storia`,
      'video-lede': `Scopri Hope International Association e le persone che desideriamo sostenere.`,
      'video-title': `Scopri <em>l'associazione.</em>`,
      'video-play': `Carica il video`,
      'gallery-eyebrow': `Dal campo`,
      'gallery-title': `Volti di <em>speranza.</em>`,
      'gallery-lede': `Ogni volto racconta una storia. Ogni storia è una vita cambiata.`,
      'programs-eyebrow': `Cosa facciamo`,
      'programs-title': `Un supporto che segue<br><em>bisogni reali.</em>`,
      'programs-lede': `I nostri programmi sono strutturati attorno ai bisogni reali e progressivi delle famiglie che serviamo — dalla stabilizzazione d'emergenza all'indipendenza duratura.`,
      'prog1-title': `Soccorso d'emergenza`,
      'prog1-p': `Supporto abitativo, sicurezza alimentare e cure medico urgenti quando una famiglia ne ha più bisogno.`,
      'prog2-title': `Istruzione &amp; Borse di studio`,
      'prog2-p': `Tasse scolastiche, materiali e iscrizione per i bambini orfani — e formazione continua per le vedove.`,
      'prog3-title': `Microfinanza &amp; Mezzi di sussistenza`,
      'prog3-p': `Piccoli prestiti e formazione imprenditoriale che costruiscono un'indipendenza finanziaria duratura per le vedove.`,
      'prog4-title': `Servizi sanitari`,
      'prog4-p': `Accesso alle cure medico, screening e supporto continuo al benessere per le famiglie bisognose.`,
      'prog5-title': `Formazione professionale`,
      'prog5-p': `Competenze pratiche e localmente rilevanti — sartoria, agricoltura, mestieri — costruite attorno a vere opportunità.`,
      'prog6-title': `Comunità &amp; Tutoraggio`,
      'prog6-p': `Reti di supporto che collegano le vedove e offrono ai bambini orfani dei mentori durante la crescita.`,
      'stats-eyebrow': `Impatto`,
      'stats-title': `Un sostegno che risponde a <em>esigenze diverse.</em>`,
      'stats-lede': `H.I.A descrive il proprio lavoro come una combinazione di aiuto immediato e sostegno a lungo termine. Condivideremo dati verificati sull'impatto quando saranno disponibili.`,
      'story-eyebrow': `Un approccio a lungo termine`,
      'story-quote': `Dai bisogni urgenti all'istruzione, alla salute e ai mezzi di sussistenza, i nostri programmi mirano ad aiutare le famiglie a raggiungere maggiore stabilità.`,
      'donate-eyebrow': `Dona`,
      'donate-title': `Scegli come<br><em>vuoi donare.</em>`,
      'donate-lede': `Ogni dono — piccolo o grande — contribuisce al soccorso d'emergenza, all'istruzione, alla salute e alla formazione professionale per vedove e orfani.`,
      'method-paypal-title': `PayPal`,
      'method-paypal-p': `Rapido &amp; sicuro`,
      'method-bank-title': `Bonifico bancario`,
      'method-bank-p': `Diretto &amp; tracciabile`,
      'method-mobile-title': `Altri metodi`,
      'method-mobile-p': `PayPal o bonifico bancario`,
      'donate-legal': `Hope International Association (H.I.A) è un'organizzazione non profit registrata in Svizzera (N. reg. 482.5.021.9302). Le donazioni sono elaborate tramite PostFinance (IBAN: CH05 0900 0000 1679 9930 3) o PayPal (judmaria9@gmail.com).`,
      'cta-title': `Puoi essere <em>la speranza di qualcuno</em> oggi.`,
      'cta-btn-involved': `Partecipa`,
      'footer-about': `Un'organizzazione non profit con sede a Ginevra che supporta vedove e orfani attraverso istruzione, assistenza sanitaria e programmi comunitari duraturi.`,
      'footer-links-title': `Link rapidi`,
      'footer-link1': `Chi siamo`,
      'footer-link2': `I nostri programmi`,
      'footer-link3': `Il nostro approccio`,
      'footer-link4': `Dona`,
      'footer-contact-title': `Contatto`,
      'modal-title': `Fai una donazione`,
      'modal-p': `Scegli un metodo qui sotto per supportare vedove e orfani tramite H.I.A.`,
      'modal-tab-paypal': `PayPal`,
      'modal-tab-bank': `Bonifico bancario`,
      'modal-tab-mobile': `Altri metodi`,
      'modal-paypal-p': `Dona in modo sicuro tramite PayPal a`,
      'modal-paypal-btn': `Dona con PayPal`,
      'modal-bank-btn': `Copia i dati bancari`,
    },

    es: {
      'nav-about': `Quienes somos`,
      'nav-programs': `Programas`,
      'nav-stories': `Nuestro enfoque`,
      'nav-contact': `Contacto`,
      'nav-donate': `Donar ahora`,
      'contact-eyebrow': `Contáctanos`,
      'contact-title': `Envíanos un <em>mensaje.</em>`,
      'contact-lede': `Si quieres donar, colaborar como voluntario, crear una alianza o saber más, escríbenos.`,
      'form-name': `Nombre completo`, 'form-name-placeholder': `Tu nombre`,
      'form-email': `Correo electrónico`, 'form-email-placeholder': `tu@ejemplo.com`,
      'form-subject': `Asunto`, 'form-message': `Mensaje`, 'form-message-placeholder': `Tu mensaje`,
      'form-topic-general': `Consulta general`, 'form-topic-donation': `Pregunta sobre donaciones`,
      'form-topic-volunteer': `Voluntariado`, 'form-topic-partner': `Alianzas`, 'form-topic-media': `Medios`,
      'form-submit': `Enviar mensaje`, 'form-success': `✓ ¡Mensaje enviado! Te responderemos en un plazo de 48 horas.`,
      'form-error': `No se pudo enviar. Escríbenos directamente por correo y te responderemos en 48 horas.`,
      'social-coming': `Pronto habrá más canales`,
      'hero-h1': `Apoyo para viudas y niños que reconstruyen sus vidas tras una pérdida.`,
      'hero-tagline': `Ayuda práctica. Apoyo duradero.`,
      'hero-lede': `Hope International Association es una organización suiza sin fines de lucro que apoya a viudas y niños huérfanos mediante educación, salud, ayuda de emergencia y programas de sustento.`,
      'hero-btn-mission': `Nuestro enfoque`,
      'mission-eyebrow': `Nuestra mision`,
      'mission-title': `La perdida nunca deberia ser<br><em>una condena de por vida.</em>`,
      'mission-p1': `Cuando se pierde un esposo o padre, toda la base de una familia puede derrumbarse de la noche a la manana. H.I.A existe para cerrar esa brecha.`,
      'mission-p2': `No somos una organizacion de socorro que desaparece. Somos un <strong>socio a largo plazo</strong> en la reconstruccion.`,
      'mission-p3': `Cada franco recaudado apoya nuestro trabajo con familias y comunidades.`,
      'mission-sig': `Hope International Association`,
      'mission-sig-small': `Fundador &amp; Presidente — H.I.A · Ginebra`,
      'pillar1-num': `01 — Ayuda inmediata`,
      'pillar1-title': `Cuando la crisis golpea primero`,
      'pillar1-p': `Apoyo de emergencia para viudas y huerfanos que enfrentan inseguridad habitacional o necesidades medicas.`,
      'pillar2-num': `02 — Educacion &amp; Empoderamiento`,
      'pillar2-title': `Construyendo independencia`,
      'pillar2-p': `Becas, formacion profesional y microfinanzas que ayudan a las familias a sostenerse.`,
      'pillar3-num': `03 — Atencion a largo plazo`,
      'pillar3-title': `Una esperanza que continua`,
      'pillar3-p': `Servicios de salud continuos, mentoría y apoyo comunitario — una ayuda que continúa más allá de una sola donación.`,
      'gallery-eyebrow': `Desde el campo`,
      'gallery-title': `Rostros de <em>esperanza.</em>`,
      'gallery-lede': `Cada rostro cuenta una historia. Cada historia es una vida cambiada.`,
      'programs-eyebrow': `Lo que hacemos`,
      'programs-title': `Apoyo que sigue<br><em>las necesidades reales.</em>`,
      'programs-lede': `Nuestros programas estan estructurados en torno a las necesidades reales de las familias que servimos.`,
      'prog1-title': `Ayuda de emergencia`,
      'prog1-p': `Apoyo de vivienda, seguridad alimentaria y atencion medica urgente.`,
      'prog2-title': `Educacion &amp; Becas`,
      'prog2-p': `Cuotas escolares y matricula para ninos huerfanos y educacion continua para viudas.`,
      'prog3-title': `Microfinanzas &amp; Medios de vida`,
      'prog3-p': `Prestamos y capacitacion que construyen independencia financiera para las viudas.`,
      'prog4-title': `Servicios de salud`,
      'prog4-p': `Acceso a atencion medica y apoyo continuo al bienestar para familias en necesidad.`,
      'prog5-title': `Formacion profesional`,
      'prog5-p': `Habilidades practicas — sastreria, agricultura, oficios — construidas en torno a oportunidades reales.`,
      'prog6-title': `Comunidad &amp; Tutoria`,
      'prog6-p': `Redes de apoyo que conectan a las viudas y dan mentores a los ninos huerfanos.`,
      'stats-eyebrow': `Impacto`,
      'stats-title': `Apoyo que responde a <em>necesidades cambiantes.</em>`,
      'stats-lede': `H.I.A describe su labor como una combinación de ayuda inmediata y apoyo a largo plazo. Compartiremos cifras de impacto verificadas cuando haya informes disponibles.`,
      'story-eyebrow': `Un enfoque a largo plazo`,
      'story-quote': `Desde las necesidades urgentes hasta la educación, la salud y los medios de vida, nuestros programas buscan ayudar a las familias a alcanzar una mayor estabilidad.`,
      'donate-eyebrow': `Donar`,
      'donate-title': `Elige como<br><em>quieres donar.</em>`,
      'donate-lede': `Cada donativo contribuye a la ayuda de emergencia, la educación, la salud y los programas de sustento para viudas y niños huérfanos.`,
      'method-paypal-title': `PayPal`,
      'method-paypal-p': `Rapido &amp; seguro`,
      'method-bank-title': `Transferencia bancaria`,
      'method-bank-p': `Directa &amp; rastreable`,
      'method-mobile-title': `Otros métodos`,
      'method-mobile-p': `PayPal o transferencia bancaria`,
      'donate-legal': `Hope International Association (H.I.A) es una organizacion sin fines de lucro registrada en Suiza (N.reg. 482.5.021.9302).`,
      'cta-title': `Puedes ser <em>la esperanza de alguien</em> hoy.`,
      'cta-btn-involved': `Involucrate`,
      'footer-about': `Una organizacion sin fines de lucro con sede en Ginebra que apoya a viudas y huerfanos.`,
      'footer-links-title': `Enlaces rapidos`,
      'footer-link1': `Quienes somos`,
      'footer-link2': `Nuestros programas`,
      'footer-link3': `Nuestro enfoque`,
      'footer-link4': `Donar`,
      'footer-contact-title': `Contacto`,
      'modal-title': `Hacer una donacion`,
      'modal-p': `Elige un metodo para apoyar a viudas y huerfanos a traves de H.I.A.`,
      'modal-tab-paypal': `PayPal`,
      'modal-tab-bank': `Transferencia bancaria`,
      'modal-tab-mobile': `Otros métodos`,
      'modal-paypal-p': `Dona de forma segura a traves de PayPal a`,
      'modal-paypal-btn': `Donar con PayPal`,
      'modal-bank-btn': `Copiar datos bancarios`,
      'video-eyebrow': `Nuestra historia`,
      'video-lede': `Conoce Hope International Association y a las personas a quienes queremos apoyar.`,
      'video-title': `Conoce la <em>asociación.</em>`,
      'video-play': `Cargar video`,
    }
  };

  const UI_TRANSLATIONS = {
    en: {
      'cookie-copy': `We use essential storage to remember your choices. Optional audience analytics load only if you allow them.`,
      'cookie-details': `Cookie details`, 'cookie-allow': `Allow analytics`, 'cookie-essential': `Essential only`,
      'cookie-settings': `Cookie settings`, 'privacy-link': `Privacy &amp; cookie details`,
      'method-mobile-title': `Other methods`, 'method-mobile-p': `PayPal or bank transfer`,
      'modal-tab-card': `Card`, 'modal-tab-mobile': `Other methods`,
      'modal-amount-label': `Choose an amount (CHF):`,
      'modal-mobile-instructions': `Choose PayPal or bank transfer for giving options.`,
      'payment-paypal-label': `PayPal`, 'payment-bank-label': `Bank transfer`, 'payment-bank-name': `Bank`,
      'form-sending': `Sending…`, 'form-sent': `✓ Sent!`,
      'bank-copy-success': `Bank details copied.`, 'bank-copy-fail': `Copy was unavailable; please select the details in the table.`,
      'card-pay': `Pay with Card`, 'card-loading': `Loading card form…`, 'card-processing': `Processing…`,
      'card-thanks': `✓ Thank you!`, 'card-unavailable': `Card payments could not load. Please choose another method.`
    },
    fr: {
      'cookie-copy': `Nous utilisons le stockage essentiel pour mémoriser vos choix. Les mesures d'audience facultatives ne sont activées qu'avec votre accord.`,
      'cookie-details': `Détails des cookies`, 'cookie-allow': `Autoriser les statistiques`, 'cookie-essential': `Essentiel uniquement`,
      'cookie-settings': `Paramètres des cookies`, 'privacy-link': `Confidentialité et cookies`,
      'method-mobile-title': `Autres moyens`, 'method-mobile-p': `PayPal ou virement bancaire`,
      'modal-tab-card': `Carte`, 'modal-tab-mobile': `Autres moyens`,
      'modal-amount-label': `Choisissez un montant (CHF) :`,
      'modal-mobile-instructions': `Choisissez PayPal ou le virement bancaire pour faire un don.`,
      'payment-paypal-label': `PayPal`, 'payment-bank-label': `Virement bancaire`, 'payment-bank-name': `Banque`,
      'form-sending': `Envoi…`, 'form-sent': `✓ Envoyé !`,
      'bank-copy-success': `Coordonnées bancaires copiées.`, 'bank-copy-fail': `Copie indisponible ; sélectionnez les coordonnées dans le tableau.`,
      'card-pay': `Payer par carte`, 'card-loading': `Chargement du formulaire…`, 'card-processing': `Traitement…`,
      'card-thanks': `✓ Merci !`, 'card-unavailable': `Le paiement par carte n'a pas pu se charger. Choisissez un autre moyen.`
    },
    it: {
      'cookie-copy': `Usiamo la memoria essenziale del browser per ricordare le tue scelte. Le statistiche facoltative si attivano solo con il tuo consenso.`,
      'cookie-details': `Dettagli sui cookie`, 'cookie-allow': `Consenti statistiche`, 'cookie-essential': `Solo essenziali`,
      'cookie-settings': `Impostazioni cookie`, 'privacy-link': `Privacy e cookie`,
      'method-mobile-title': `Altri metodi`, 'method-mobile-p': `PayPal o bonifico bancario`,
      'modal-tab-card': `Carta`, 'modal-tab-mobile': `Altri metodi`,
      'modal-amount-label': `Scegli un importo (CHF):`,
      'modal-mobile-instructions': `Scegli PayPal o il bonifico bancario per donare.`,
      'payment-paypal-label': `PayPal`, 'payment-bank-label': `Bonifico bancario`, 'payment-bank-name': `Banca`,
      'form-sending': `Invio…`, 'form-sent': `✓ Inviato!`,
      'bank-copy-success': `Coordinate bancarie copiate.`, 'bank-copy-fail': `Copia non disponibile; seleziona i dati nella tabella.`,
      'card-pay': `Paga con carta`, 'card-loading': `Caricamento del modulo…`, 'card-processing': `Elaborazione…`,
      'card-thanks': `✓ Grazie!`, 'card-unavailable': `Il pagamento con carta non è disponibile. Scegli un altro metodo.`
    },
    es: {
      'cookie-copy': `Usamos almacenamiento esencial para recordar tus opciones. Las estadísticas opcionales solo se activan si las autorizas.`,
      'cookie-details': `Detalles de cookies`, 'cookie-allow': `Permitir estadísticas`, 'cookie-essential': `Solo esenciales`,
      'cookie-settings': `Preferencias de cookies`, 'privacy-link': `Privacidad y cookies`,
      'method-mobile-title': `Otros métodos`, 'method-mobile-p': `PayPal o transferencia bancaria`,
      'modal-tab-card': `Tarjeta`, 'modal-tab-mobile': `Otros métodos`,
      'modal-amount-label': `Elige una cantidad (CHF):`,
      'modal-mobile-instructions': `Elige PayPal o transferencia bancaria para donar.`,
      'payment-paypal-label': `PayPal`, 'payment-bank-label': `Transferencia bancaria`, 'payment-bank-name': `Banco`,
      'form-sending': `Enviando…`, 'form-sent': `✓ Enviado!`,
      'bank-copy-success': `Datos bancarios copiados.`, 'bank-copy-fail': `No se pudo copiar; selecciona los datos de la tabla.`,
      'card-pay': `Pagar con tarjeta`, 'card-loading': `Cargando el formulario…`, 'card-processing': `Procesando…`,
      'card-thanks': `✓ ¡Gracias!`, 'card-unavailable': `No se pudo cargar el pago con tarjeta. Elige otro método.`
    }
  };

    let currentLang = 'en';
  function uiText(key){ return (UI_TRANSLATIONS[currentLang] && UI_TRANSLATIONS[currentLang][key]) || UI_TRANSLATIONS.en[key] || key; }

  function applyLang(lang) {
    currentLang = lang;
    const t = {...LANG[lang], ...UI_TRANSLATIONS[lang]};
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const value = t[el.getAttribute('data-i18n-placeholder')];
      if(value !== undefined) el.setAttribute('placeholder', value);
    });
    // Update html lang attribute
    document.documentElement.lang = lang;
    // Update lang buttons
    document.querySelectorAll('.lang button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  // ---- LANGUAGE MEMORY ----
  // Remember user's language choice between visits
  function applyLangAndRemember(lang) {
    applyLang(lang);
    try { localStorage.setItem('hia_lang', lang); } catch(e) {}
  }

  document.querySelectorAll('.lang button').forEach(b => {
    b.addEventListener('click', () => applyLangAndRemember(b.dataset.lang));
  });

  let savedLang = null;
  try { savedLang = localStorage.getItem('hia_lang'); } catch(e) {}
  if(savedLang && LANG[savedLang]) {
    applyLangAndRemember(savedLang);
  }
  // ---- END LANGUAGE MEMORY ----

  // ========== END TRANSLATIONS ==========


  // Remove old lang alert
