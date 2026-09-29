/* =========================================================
   KSA GUIDE — PREMIUM GLOBAL JAVASCRIPT
   Mobile Menu + Search + Language + Location + Cookies
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     HELPERS
     ======================================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const html = document.documentElement;
  const body = document.body;

  /* =======================================================
     HEADER — SCROLL EFFECT
     ======================================================= */

  const header = $(".site-header");

  function updateHeader() {
    if (!header) return;

    if (window.scrollY > 35) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();

  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  const mobileNav = $(".mobile-nav");
  const menuToggle = $(".menu-toggle");
  const mobileClose = $(".mobile-close");

  function openMobileMenu() {
    if (!mobileNav) return;

    mobileNav.classList.add("open");
    body.style.overflow = "hidden";

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
    }
  }

  function closeMobileMenu() {
    if (!mobileNav) return;

    mobileNav.classList.remove("open");
    body.style.overflow = "";

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMobileMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener("click", closeMobileMenu);
  }

  $$(".mobile-nav a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileMenu();
      closeSearch();
    }
  });

  /* =======================================================
     SEARCH OVERLAY
     ======================================================= */

  const searchOverlay = $("#searchOverlay");
  const searchInput = searchOverlay
    ? $("input", searchOverlay)
    : null;

  function openSearch() {
    if (!searchOverlay) return;

    searchOverlay.classList.add("open");
    body.style.overflow = "hidden";

    setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }

  function closeSearch() {
    if (!searchOverlay) return;

    searchOverlay.classList.remove("open");

    if (!mobileNav || !mobileNav.classList.contains("open")) {
      body.style.overflow = "";
    }
  }

  $$("[data-open-search]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openSearch();
    });
  });

  $$("[data-close-search]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      closeSearch();
    });
  });

  if (searchOverlay) {
    searchOverlay.addEventListener("click", function (event) {
      if (event.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  /* =======================================================
     SEARCH FORM
     ======================================================= */

  $$("form[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const input = $("input", form);

      if (!input) return;

      const query = input.value.trim();

      if (!query) {
        input.focus();
        return;
      }

      window.location.href =
        "/blog.html?q=" + encodeURIComponent(query);
    });
  });

  /* =======================================================
     LANGUAGE SYSTEM
     English / Arabic / Urdu
     ======================================================= */

  const languageSelectors = $$("select#language");

  const savedLanguage =
    localStorage.getItem("ksa_lang") || "en";

  function setLanguage(language) {
    let lang = language;

    if (!["en", "ar", "ur"].includes(lang)) {
      lang = "en";
    }

    localStorage.setItem("ksa_lang", lang);

    languageSelectors.forEach(function (select) {
      select.value = lang;
    });

    /*
      Arabic and Urdu use RTL.
      English uses LTR.
    */

    if (lang === "ar" || lang === "ur") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", lang);
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "en");
    }

    /*
      Optional translation system.

      If an element contains:
      data-en="Explore Saudi Arabia"
      data-ar="اكتشف المملكة العربية السعودية"
      data-ur="سعودی عرب دریافت کریں"

      JavaScript will automatically change its text.
    */

    $$("[data-en], [data-ar], [data-ur]").forEach(
      function (element) {

        const translation =
          element.getAttribute("data-" + lang);

        if (!translation) return;

        if (
          element.tagName === "INPUT" ||
          element.tagName === "TEXTAREA"
        ) {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    );

    /*
      Optional HTML translation attributes.
      Useful for title/tooltips.
    */

    $$("[data-title-en], [data-title-ar], [data-title-ur]")
      .forEach(function (element) {

        const title =
          element.getAttribute("data-title-" + lang);

        if (title) {
          element.setAttribute("title", title);
        }
      });
  }

  setLanguage(savedLanguage);

  languageSelectors.forEach(function (select) {

    select.addEventListener("change", function (event) {
      setLanguage(event.target.value);
    });

  });

  /* =======================================================
     LOCATION
     Permission is requested ONLY after clicking button
     ======================================================= */

  const locationButtons = $$(
    "[data-location], #locationButton, .location-button"
  );

  function locationSuccess(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    localStorage.setItem(
      "ksa_location",
      JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        savedAt: Date.now()
      })
    );

    locationButtons.forEach(function (button) {

      button.classList.add("location-active");

      const originalText =
        button.getAttribute("data-location-success");

      if (originalText) {
        button.textContent = originalText;
      } else {
        const label =
          button.querySelector("span");

        if (label) {
          label.textContent = "Location enabled";
        }
      }
    });
  }

  function locationError(error) {

    console.log(
      "Location permission was not granted:",
      error
    );

    const city =
      window.prompt(
        "Enter your Saudi city (for example Riyadh, Jeddah or AlUla):"
      );

    if (!city) return;

    localStorage.setItem(
      "ksa_city",
      city.trim()
    );

    locationButtons.forEach(function (button) {

      const label =
        button.querySelector("span");

      if (label) {
        label.textContent = city.trim();
      }

    });
  }

  function requestLocation() {

    if (!navigator.geolocation) {

      const city =
        window.prompt(
          "Location is not supported. Enter your Saudi city:"
        );

      if (city) {
        localStorage.setItem(
          "ksa_city",
          city.trim()
        );
      }

      return;
    }

    navigator.geolocation.getCurrentPosition(
      locationSuccess,
      locationError,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  locationButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

      event.preventDefault();

      requestLocation();

    });

  });

  /* =======================================================
     COOKIE CONSENT
     ======================================================= */

  const cookieBanner = $("#cookieBanner");

  const cookieAccept =
    $("[data-cookie-accept]");

  const cookieReject =
    $("[data-cookie-reject]");

  const COOKIE_KEY =
    "ksa_cookie_consent";

  function hideCookieBanner() {

    if (!cookieBanner) return;

    cookieBanner.classList.add("hidden");

    setTimeout(function () {
      cookieBanner.style.display = "none";
    }, 400);
  }

  function saveCookieConsent(type) {

    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({
        type: type,
        date: new Date().toISOString()
      })
    );

    hideCookieBanner();
  }

  if (cookieAccept) {

    cookieAccept.addEventListener(
      "click",
      function () {
        saveCookieConsent("all");
      }
    );

  }

  if (cookieReject) {

    cookieReject.addEventListener(
      "click",
      function () {
        saveCookieConsent("essential");
      }
    );

  }

  /*
    Hide banner if the user has already selected
    a cookie preference.
  */

  if (
    cookieBanner &&
    localStorage.getItem(COOKIE_KEY)
  ) {
    cookieBanner.classList.add("hidden");

    setTimeout(function () {
      cookieBanner.style.display = "none";
    }, 400);
  }

  /* =======================================================
     NEWSLETTER FORM
     ======================================================= */

  $$("form[data-newsletter]").forEach(
    function (form) {

      form.addEventListener(
        "submit",
        function (event) {

          event.preventDefault();

          const emailInput =
            $("input[type='email']", form);

          if (!emailInput) return;

          const email =
            emailInput.value.trim();

          if (!email) {
            emailInput.focus();
            return;
          }

          /*
            Front-end confirmation only.

            Real email subscriptions can later be
            connected to Mailchimp, Brevo, ConvertKit
            or another provider.
          */

          let message =
            $(".newsletter-message", form);

          if (!message) {

            message =
              document.createElement("div");

            message.className =
              "newsletter-message";

            message.style.marginTop = "12px";
            message.style.color =
              "#E5C77B";
            message.style.fontSize =
              "12px";

            form.appendChild(message);
          }

          message.textContent =
            "Thank you! You're on the KSA GUIDE list.";

          emailInput.value = "";

        }
      );

    }
  );

  /* =======================================================
     CONTACT FORM
     ======================================================= */

  $$("form[data-contact-form]").forEach(
    function (form) {

      form.addEventListener(
        "submit",
        function (event) {

          /*
            Allow normal form submission if
            an action attribute exists.
          */

          const action =
            form.getAttribute("action");

          if (action && action.trim() !== "") {
            return;
          }

          event.preventDefault();

          let message =
            $(".form-message", form);

          if (!message) {

            message =
              document.createElement("div");

            message.className =
              "form-message notice notice-success";

            message.style.marginTop =
              "15px";

            form.appendChild(message);
          }

          message.textContent =
            "Thank you. Your message has been prepared successfully.";

        }
      );

    }
  );

  /* =======================================================
     SCROLL REVEAL
     ======================================================= */

  const revealElements =
    $$(".reveal");

  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        function (entries, observer) {

          entries.forEach(function (entry) {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("visible");

            observer.unobserve(entry.target);

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

    revealElements.forEach(
      function (element) {
        revealObserver.observe(element);
      }
    );

  } else {

    revealElements.forEach(
      function (element) {
        element.classList.add("visible");
      }
    );

  }

  /* =======================================================
     ACTIVE NAVIGATION
     ======================================================= */

  const currentPath =
    window.location.pathname
      .replace(/\/+$/, "") || "/";

  $$(".main-nav a, .mobile-nav a").forEach(
    function (link) {

      const href =
        link.getAttribute("href");

      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("http")
      ) {
        return;
      }

      let linkPath = href
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+$/, "");

      if (linkPath === "") {
        linkPath = "/";
      }

      if (linkPath === currentPath) {
        link.classList.add("active");
      }

    }
  );

  /* =======================================================
     BACK TO TOP
     ======================================================= */

  let backToTop =
    $(".back-to-top");

  /*
    If the HTML doesn't contain a back-to-top button,
    create one automatically.
  */

  if (!backToTop) {

    backToTop =
      document.createElement("button");

    backToTop.className =
      "back-to-top";

    backToTop.type = "button";

    backToTop.setAttribute(
      "aria-label",
      "Back to top"
    );

    backToTop.innerHTML = "↑";

    body.appendChild(backToTop);
  }

  function updateBackToTop() {

    if (window.scrollY > 500) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }

  }

  window.addEventListener(
    "scroll",
    updateBackToTop,
    { passive: true }
  );

  updateBackToTop();

  backToTop.addEventListener(
    "click",
    function () {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

  /* =======================================================
     SMOOTH ANCHOR LINKS
     ======================================================= */

  $$("a[href^='#']").forEach(
    function (link) {

      link.addEventListener(
        "click",
        function (event) {

          const id =
            link.getAttribute("href");

          if (!id || id === "#") {
            return;
          }

          const target =
            document.querySelector(id);

          if (!target) {
            return;
          }

          event.preventDefault();

          const headerHeight =
            header
              ? header.offsetHeight
              : 0;

          const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            20;

          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });

        }
      );

    }
  );

  /* =======================================================
     HERO 3D DEPTH EFFECT
     Lightweight — desktop only
     ======================================================= */

  const hero =
    $(".hero");

  const heroMap =
    $(".hero-map");

  if (
    hero &&
    heroMap &&
    window.matchMedia(
      "(pointer:fine)"
    ).matches
  ) {

    hero.addEventListener(
      "mousemove",
      function (event) {

        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
          rect.width;

        const y =
          (event.clientY - rect.top) /
          rect.height;

        const rotateY =
          (x - 0.5) * 8;

        const rotateX =
          (0.5 - y) * 5;

        heroMap.style.transform =
          "rotateY(" +
          rotateY +
          "deg) rotateX(" +
          rotateX +
          "deg)";

      }
    );

    hero.addEventListener(
      "mouseleave",
      function () {

        heroMap.style.transform =
          "rotateY(-9deg) rotateX(3deg)";

      }
    );

  }

  /* =======================================================
     IMAGE LAZY LOADING
     ======================================================= */

  $$("img").forEach(function (image) {

    if (
      !image.hasAttribute("loading") &&
      !image.hasAttribute("fetchpriority")
    ) {
      image.setAttribute(
        "loading",
        "lazy"
      );
    }

  });

  /* =======================================================
     EXTERNAL LINKS
     ======================================================= */

  $$("a[href^='http']").forEach(
    function (link) {

      const url =
        link.getAttribute("href");

      if (!url) return;

      if (
        !url.includes(
          window.location.hostname
        )
      ) {

        link.setAttribute(
          "target",
          "_blank"
        );

        link.setAttribute(
          "rel",
          "noopener noreferrer"
        );

      }

    }
  );

  /* =======================================================
     PAGE READY
     ======================================================= */

  html.classList.add("js-enabled");

  console.log(
    "KSA GUIDE — Premium JavaScript loaded successfully."
  );

})();
