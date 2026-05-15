"use strict";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let cart = [];

function init() {
  initCursor();
  initScrollProgress();
  initNavbar();
  initHamburger();
  initTheme();
  initScrollReveal();
  initCounters();
  initMenuFilter();
  initCart();
  initGalleryLightbox();
  initReservationForm();
  initReviewsSlider();
  initBackToTop();
}

function initCursor() {
  const cursor = $("#custom-cursor");
  const dot = $("#cursor-dot");
  if (!cursor || !dot) return;

  let mx = 0,
    my = 0,
    cx = 0,
    cy = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
  });

  function animateCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener(
    "mousedown",
    () => (cursor.style.transform = "translate(-50%,-50%) scale(0.8)"),
  );
  document.addEventListener(
    "mouseup",
    () => (cursor.style.transform = "translate(-50%,-50%) scale(1)"),
  );

  $$("a, button, .gallery-item, .menu-card").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1.5)";
      cursor.style.borderColor = "var(--orange)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1)";
      cursor.style.borderColor = "var(--gold)";
    });
  });
}

function initScrollProgress() {
  const bar = $("#scroll-progress");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    () => {
      const pct =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      bar.style.width = pct + "%";
    },
    { passive: true },
  );
}

function initNavbar() {
  const nav = $("#navbar");
  if (!nav) return;
  const links = $$(".nav-link");
  const sections = $$("section[id]");

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);

      const scrollY = window.scrollY + 100;
      sections.forEach((sec) => {
        if (
          scrollY >= sec.offsetTop &&
          scrollY < sec.offsetTop + sec.offsetHeight
        ) {
          links.forEach((l) => l.classList.remove("active"));
          const active = $(`a[href="#${sec.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    },
    { passive: true },
  );
}

function initHamburger() {
  const burger = $("#hamburger");
  const navLinks = $("#nav-links");
  if (!burger || !navLinks) return;

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("mobile-open");
    document.body.style.overflow = navLinks.classList.contains("mobile-open")
      ? "hidden"
      : "";
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-link")) {
      burger.classList.remove("open");
      navLinks.classList.remove("mobile-open");
      document.body.style.overflow = "";
    }
  });
}

function initTheme() {
  const btn = $("#theme-toggle");
  const icon = $("#theme-icon");
  if (!btn || !icon) return;

  const saved = localStorage.getItem("rjr-theme") || "dark";
  applyTheme(saved);

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("rjr-theme", next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
  }
}

function initScrollReveal() {
  const els = $$(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  els.forEach((el) => observer.observe(el));
}

function initCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((c) => observer.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(eased * target);
      el.textContent = val >= 1000 ? (val / 1000).toFixed(1) + "K+" : val + "+";
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
}

function initMenuFilter() {
  const btns = $$(".filter-btn");
  const cards = $$(".menu-card");
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.classList.remove("filtered-out");
        } else {
          card.classList.add("filtered-out");
        }
      });
    });
  });
}

function initCart() {
  const cartBtn = $("#cart-btn");
  const closeCart = $("#close-cart");
  const cartSidebar = $("#cart-sidebar");
  const cartOverlay = $("#cart-overlay");
  const placeOrderBtn = $("#place-order-btn");

  function openCart() {
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCartFn() {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  cartBtn?.addEventListener("click", openCart);
  closeCart?.addEventListener("click", closeCartFn);
  cartOverlay?.addEventListener("click", closeCartFn);

  $$(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      const img = btn.dataset.img;
      addToCart(name, price, img);
      animateCartIcon();
    });
  });

  placeOrderBtn?.addEventListener("click", () => {
    if (!cart.length) return;
    closeCartFn();
    showPopup(
      "Order Placed!",
      "Your order has been received. We'll prepare it shortly. Thank you for dining with Royal Jaipur!",
    );
    cart = [];
    renderCart();
  });

  function addToCart(name, price, img) {
    const existing = cart.find((i) => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }
    renderCart();
    openCart();
  }

  function renderCart() {
    const itemsEl = $("#cart-items");
    const countEl = $("#cart-count");
    const totalEl = $("#cart-total");
    if (!itemsEl) return;

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    countEl && (countEl.textContent = totalQty);
    totalEl && (totalEl.textContent = "₹" + totalPrice);

    if (!cart.length) {
      itemsEl.innerHTML =
        '<div class="empty-cart"><span class="empty-icon">🛒</span><p>Your cart is empty.<br>Add some delicious items!</p></div>';
      return;
    }

    itemsEl.innerHTML = cart
      .map(
        (item, idx) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price * item.qty}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
          <button class="remove-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `,
      )
      .join("");

    $$(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (btn.dataset.action === "inc") cart[idx].qty++;
        else cart[idx].qty = Math.max(0, cart[idx].qty - 1);
        if (cart[idx].qty === 0) cart.splice(idx, 1);
        renderCart();
      });
    });

    $$(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  renderCart();
}

function animateCartIcon() {
  const btn = $("#cart-btn");
  if (!btn) return;
  btn.style.transform = "scale(1.3)";
  setTimeout(() => (btn.style.transform = ""), 200);
}

function initGalleryLightbox() {
  const lightbox = $("#lightbox");
  const img = $("#lightbox-img");
  const caption = $("#lightbox-caption");
  const closeBtn = $("#close-lightbox");

  $$(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      img.src = item.dataset.src;
      img.alt = item.dataset.caption;
      caption.textContent = item.dataset.caption;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function initReservationForm() {
  const form = $("#reservation-form");
  if (!form) return;

  const dateInput = $("#res-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = $("#submit-btn");
    const btnText = $("#btn-text");
    const btnLoading = $("#btn-loading");

    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");

    await new Promise((r) => setTimeout(r, 1200));

    const name = $("#res-name").value.trim();
    const phone = $("#res-phone").value.trim();
    const email = $("#res-email").value.trim();
    const guests = $("#res-guests").value;
    const date = $("#res-date").value;
    const time = $("#res-time").value;
    const message = $("#res-message").value.trim();

    const waMsg = encodeURIComponent(
      `🍽️ New Booking Request - Royal Jaipur Restaurant\n\n` +
        `👤 Name: ${name}\n📞 Phone: ${phone}\n📧 Email: ${email}\n` +
        `📅 Date: ${date}\n⏰ Time: ${time}\n👥 Guests: ${guests}\n` +
        `💬 Message: ${message || "None"}\n\nBooking submitted via website.`,
    );

    window.open(`https://wa.me/919352996749?text=${waMsg}`, "_blank");

    submitBtn.disabled = false;
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
    form.reset();

    showPopup(
      "Booking Confirmed! 🎉",
      `Thank you, ${name}! Your table for ${guests} on ${date} at ${time} has been requested. Our team will confirm via WhatsApp shortly.`,
    );
  });

  function validateForm() {
    let valid = true;

    function setError(id, msg) {
      const el = $(`#err-${id}`);
      if (el) el.textContent = msg;
      if (msg) valid = false;
    }

    const name = $("#res-name")?.value.trim();
    setError("name", !name ? "Full name is required." : "");

    const phone = $("#res-phone")?.value.trim();
    setError(
      "phone",
      !phone
        ? "Phone number is required."
        : !/^[\d\s+\-()]{7,15}$/.test(phone)
          ? "Enter a valid phone number."
          : "",
    );

    const email = $("#res-email")?.value.trim();
    setError(
      "email",
      !email
        ? "Email is required."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? "Enter a valid email address."
          : "",
    );

    const guests = $("#res-guests")?.value;
    setError("guests", !guests ? "Please select number of guests." : "");

    const date = $("#res-date")?.value;
    const today = new Date().toISOString().split("T")[0];
    setError(
      "date",
      !date
        ? "Please select a date."
        : date < today
          ? "Please select a future date."
          : "",
    );

    const time = $("#res-time")?.value;
    setError("time", !time ? "Please select a time." : "");

    return valid;
  }
}

function initReviewsSlider() {
  const track = $("#reviews-track");
  const dotsContainer = $("#slider-dots");
  const prevBtn = $("#prev-btn");
  const nextBtn = $("#next-btn");
  if (!track) return;

  const cards = $$(".review-card", track);
  let current = 0;
  let perPage = getPerPage();
  let autoTimer;

  function getPerPage() {
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  }

  const totalSlides = Math.ceil(cards.length / perPage);

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    $$(".dot", dotsContainer).forEach((dot, i) =>
      dot.classList.toggle("active", i === current),
    );
  }

  function goTo(idx) {
    current = (idx + totalSlides) % totalSlides;
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * perPage * cardWidth}px)`;
    updateDots();
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn?.addEventListener("click", () => {
    stopAuto();
    goTo(current - 1);
    startAuto();
  });
  nextBtn?.addEventListener("click", () => {
    stopAuto();
    goTo(current + 1);
    startAuto();
  });

  window.addEventListener("resize", () => {
    perPage = getPerPage();
    goTo(0);
  });

  buildDots();
  startAuto();
}

function showPopup(title, msg) {
  const popup = $("#success-popup");
  const overlay = $("#popup-overlay");
  const titleEl = $("#popup-title");
  const msgEl = $("#popup-msg");
  const closeBtn = $("#close-popup");

  if (!popup) return;

  titleEl && (titleEl.textContent = title);
  msgEl && (msgEl.textContent = msg);
  popup.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  function close() {
    popup.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  closeBtn?.addEventListener("click", close, { once: true });
  overlay?.addEventListener("click", close, { once: true });
}

function initBackToTop() {
  const btn = $("#back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    },
    { passive: true },
  );

  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
