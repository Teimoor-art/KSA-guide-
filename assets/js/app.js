/* =========================================================
   KSA GUIDE — GLOBAL JAVASCRIPT
   Version: 2026
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


  /* ---------------------------------------------------------
     SAFE STORAGE
  --------------------------------------------------------- */

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* Ignore storage errors */
    }
  }


  /* ---------------------------------------------------------
     LANGUAGE / RTL
  --------------------------------------------------------- */

  const translations = {
    en: {
      Home: "Home",
      "Saudi Guide": "Saudi Guide",
      Travel: "Travel",
      Destinations: "Destinations",
      "Digital Services": "Digital Services",
      Blog: "Blog",
      About: "About",
      Contact: "Contact"
    },

    ar: {
      Home: "الرئيسية",
      "Saudi Guide": "دليل السعودية",
      Travel: "السفر",
      Destinations: "الوجهات",
      "Digital Services": "الخدمات الرقمية",
      Blog: "المدونة",
      About: "من نحن",
      Contact: "تواصل معنا"
    },

    ur: {
      Home: "ہوم",
      "Saudi Guide": "سعودی گائیڈ",
      Travel: "سفر",
      Destinations: "مقامات",
      "Digital Services": "ڈیجیٹل سروسز",
      Blog: "بلاگ",
      About: "ہمارے بارے میں",
      Contact: "رابطہ"
    }
  };


  function setLanguage(language) {
    if (!["en", "ar", "ur"].includes(language)) {
      language = "en";
    }

    storageSet("ksa_lang", language);

    document.documentElement.lang = language;

    if (language === "ar" || language === "ur") {
      document.documentElement.dir = "rtl";
      document.body.classList.add("rtl");
    } else {
      document.documentElement.dir = "ltr";
      document.body.classList.remove("rtl");
    }

    /* Sync all language selectors */
    $$("select#language").forEach((select) => {
      select.value = language;
    });

    /*
      Optional translation support.
      Any future element with data-i18n="Home",
      data-i18n="Travel", etc. will translate automatically.
    */
    $$("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      if (
        translations[language] &&
        translations[language][key]
      ) {
        element.textContent = translations[language][key];
      }
    });
  }


  function initLanguage() {
    const savedLanguage = storageGet("ksa_lang") || "en";

    setLanguage(savedLanguage);

    $$("select#language").forEach((select) => {
      select.addEventListener("change", function () {
        setLanguage(this.value);
      });
    });
  }


  /* ---------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------- */

  function initMobileMenu() {
    const menuToggle = $("#menuToggle");
    const mobileMenu = $("#mobileMenu");
    const mobileMenuClose = $("#mobileMenuClose");

    if (!menuToggle || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add("open");
      mobileMenu.setAttribute("aria-hidden", "false");
      menuToggle.setAttribute("aria-expanded", "true");

      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuToggle.setAttribute("aria-expanded", "false");

      document.body.classList.remove("menu-open");
    }

    menuToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileMenuClose?.addEventListener("click", closeMenu);

    $$(".mobile-nav a, .mobile-menu-cta", mobileMenu)
      .forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }


  /* ---------------------------------------------------------
     HEADER SCROLL EFFECT
  --------------------------------------------------------- */

  function initHeaderScroll() {
    const header = $("#siteHeader");

    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* ---------------------------------------------------------
     SEARCH OVERLAY
  --------------------------------------------------------- */

  function initSearchOverlay() {
    const searchOpen = $("#searchOpen");
    const searchOverlay = $("#searchOverlay");
    const searchClose = $("#searchClose");
    const overlayInput = $("#overlaySearchInput");

    if (!searchOverlay) return;

    function openSearch() {
      searchOverlay.classList.add("open");
      searchOverlay.setAttribute("aria-hidden", "false");

      document.body.classList.add("search-open");

      setTimeout(() => {
        overlayInput?.focus();
      }, 150);
    }

    function closeSearch() {
      searchOverlay.classList.remove("open");
      searchOverlay.setAttribute("aria-hidden", "true");

      document.body.classList.remove("search-open");
    }

    searchOpen?.addEventListener("click", openSearch);

    searchClose?.addEventListener("click", closeSearch);

    /* Close when clicking outside search content */
    searchOverlay.addEventListener("click", function (event) {
      if (event.target === searchOverlay) {
        closeSearch();
      }
    });

    /* ESC closes search */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });

    /* Search from overlay with Enter */
    overlayInput?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        const query = this.value.trim();

        if (query) {
          performSearch(query, "all");
        }
      }
    });
  }


  /* ---------------------------------------------------------
     SMART SEARCH
  --------------------------------------------------------- */

  function initSmartSearch() {
    const input = $("#globalSearch");
    const button = $("#searchButton");
    const category = $("#searchCategory");

    if (!input) return;

    function submitSearch() {
      const query = input.value.trim();

      if (!query) {
        showToast("Please enter something to search.");
        input.focus();
        return;
      }

      performSearch(
        query,
        category ? category.value : "all"
      );
    }

    button?.addEventListener("click", submitSearch);

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitSearch();
      }
    });
  }


  function performSearch(query, category) {
    const encodedQuery = encodeURIComponent(query);

    /*
      Category-based routing keeps the search useful
      even before a full search-index system is added.
    */

    let destination = "/blog.html";

    if (category === "guides") {
      destination = "/saudi-guide.html";
    }

    if (category === "travel") {
      destination = "/travel.html";
    }

    if (category === "destinations") {
      destination = "/destinations.html";
    }

    if (category === "services") {
      destination = "/digital-services.html";
    }

    if (category === "articles") {
      destination = "/blog.html";
    }

    window.location.href =
      destination + "?q=" + encodedQuery;
  }


  /* ---------------------------------------------------------
     COOKIE CONSENT
  --------------------------------------------------------- */

  function initCookies() {
    const banner = $("#cookieBanner");

    if (!banner) return;

    const savedConsent = storageGet("ksa_cookie_consent");

    if (savedConsent) {
      banner.classList.remove("show");
      banner.classList.add("hidden");
    } else {
      banner.classList.add("show");
    }

    $$("[data-cookie-accept]").forEach((button) => {
      button.addEventListener("click", function () {
        storageSet("ksa_cookie_consent", "accepted");

        banner.classList.remove("show");
        banner.classList.add("hidden");

        showToast("Cookie preferences saved.");
      });
    });

    $$("[data-cookie-reject]").forEach((button) => {
      button.addEventListener("click", function () {
        storageSet("ksa_cookie_consent", "essential");

        banner.classList.remove("show");
        banner.classList.add("hidden");

        showToast("Only essential cookies will be used.");
      });
    });
  }


  /* ---------------------------------------------------------
     NEWSLETTER
  --------------------------------------------------------- */

  function initNewsletter() {
    const form = $("#newsletterForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const emailInput = form.querySelector(
        'input[type="email"]'
      );

      if (!emailInput) return;

      const email = emailInput.value.trim();

      if (!email) {
        showToast("Please enter your email address.");
        return;
      }

      if (!emailInput.checkValidity()) {
        showToast("Please enter a valid email address.");
        return;
      }

      /*
        No fake subscription is claimed here.
        The form is ready for a newsletter provider/backend.
      */

      showToast(
        "Thank you. Newsletter signup is ready to connect."
      );

      form.reset();
    });
  }


  /* ---------------------------------------------------------
     LOCATION BUTTON
     --------------------------------------------------------- */

  function initLocation() {
    const locationButtons = $$(
      "#locBtn, [data-location-button]"
    );

    if (!locationButtons.length) return;

    locationButtons.forEach((button) => {
      button.addEventListener("click", function () {

        if (!navigator.geolocation) {
          showToast(
            "Location is not supported. Please choose a city manually."
          );
          return;
        }

        showToast("Requesting your location permission...");

        navigator.geolocation.getCurrentPosition(
          function () {
            showToast(
              "Location permission granted."
            );
          },

          function () {
            showToast(
              "Location was not shared. You can choose a city manually."
            );
          },

          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000
          }
        );
      });
    });
  }


  /* ---------------------------------------------------------
     REVEAL ANIMATIONS
  --------------------------------------------------------- */

  function initRevealAnimations() {
    const elements = $$(".reveal");

    if (!elements.length) return;

    /*
      Respect reduced-motion preference.
    */
    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach((element) => {
        element.classList.add("show");
      });

      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("show");
      });

      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }


  /* ---------------------------------------------------------
     BLOG SEARCH
  --------------------------------------------------------- */

  function initBlogSearch() {
    const blogSearch = $("#blogSearch");

    if (!blogSearch) return;

    const params = new URLSearchParams(
      window.location.search
    );

    const query = params.get("q") || "";

    if (query) {
      blogSearch.value = query;
      filterPosts(query);
    }

    blogSearch.addEventListener("input", function () {
      filterPosts(this.value);
    });
  }


  function filterPosts(query) {
    const searchTerm = query
      .toLowerCase()
      .trim();

    $$("[data-post]").forEach((post) => {
      const text =
        post.textContent.toLowerCase();

      post.style.display =
        !searchTerm || text.includes(searchTerm)
          ? ""
          : "none";
    });
  }


  /* ---------------------------------------------------------
     GENERIC FORM SUPPORT
  --------------------------------------------------------- */

  function initGenericForms() {
    $$(".fake-submit").forEach((form) => {
      form.addEventListener("click", function (event) {
        event.preventDefault();

        showToast(
          "Thanks. Your request is ready to connect."
        );
      });
    });
  }


  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */

  function showToast(message) {
    let toast = $("#toast");

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "toast";
      toast.className = "toast";

      toast.setAttribute(
        "role",
        "status"
      );

      toast.setAttribute(
        "aria-live",
        "polite"
      );

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
      window.__ksaToastTimer
    );

    window.__ksaToastTimer =
      setTimeout(function () {
        toast.classList.remove("show");
      }, 3200);
  }


  /* ---------------------------------------------------------
     EXTERNAL / NORMAL LINKS
     --------------------------------------------------------- */

  /*
    IMPORTANT:
    We intentionally do NOT intercept normal links.

    This prevents links from opening unexpectedly
    or being redirected by JavaScript.
  */


  /* ---------------------------------------------------------
     INITIALIZE EVERYTHING
  --------------------------------------------------------- */

  function init() {
    initLanguage();
    initMobileMenu();
    initHeaderScroll();
    initSearchOverlay();
    initSmartSearch();
    initCookies();
    initNewsletter();
    initLocation();
    initRevealAnimations();
    initBlogSearch();
    initGenericForms();
  }


  /* ---------------------------------------------------------
     DOM READY
  --------------------------------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
