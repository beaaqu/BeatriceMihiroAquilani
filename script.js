/* =====================================================
   Contents:
   - Homepage image carousel
   - Portfolio project carousels
   - Dynamic project grid (JSON)
   - Lightboxes with carousels
   - Grid sorting
   - Contact form validation
   - Cursor game
   - Dynamic footer year
   ===================================================== */

// ======== HOMEPAGE IMAGE CAROUSEL ========
function initHeroCarousel() {
  const slides = document.querySelectorAll(".hero .slide");
  const dots = document.querySelectorAll(".hero .dot");
  let index = 0;
  let interval;

  function showSlide(i) {
    slides.forEach((slide, idx) => slide.classList.toggle("active", idx === i));
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === i));
    index = i;
  }

  function nextSlide() {
    showSlide((index + 1) % slides.length);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      resetInterval();
    });
  });

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 3000);
  }

  showSlide(0);
  interval = setInterval(nextSlide, 3000);
}

document.addEventListener("DOMContentLoaded", initHeroCarousel);



// ======== Portfolio Page: Dynamic Grid + Modal with Carousel + Category Filter ========

let allProjects = []; // store JSON projects globally for filtering

document.addEventListener("DOMContentLoaded", () => {
  loadProjectGrid();
  createCategoryButtons();
});

// -------------------- LOAD GRID --------------------
function loadProjectGrid(category = "all") {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  fetch("projects.json")
    .then(res => res.json())
    .then(data => {
      if (!data.projects || !Array.isArray(data.projects)) {
        console.error("Invalid JSON: missing 'projects' array");
        grid.innerHTML = "<p>Failed to load projects.</p>";
        return;
      }

      // store projects globally for filtering
      allProjects = data.projects;

      renderGrid(category);
    })
    .catch(err => {
      console.error("Error loading projects:", err);
      grid.innerHTML = "<p>Failed to load projects. Please try again later.</p>";
    });
}

// -------------------- RENDER GRID --------------------
function renderGrid(category) {
  const grid = document.querySelector(".grid");
  grid.innerHTML = "";

  const filtered = category === "all"
    ? allProjects
    : allProjects.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());

  filtered.forEach(proj => {
    const link = document.createElement("a");
    link.href = "#";
    link.innerHTML = `<img src="${proj.image}" alt="${proj.title}">`;

    link.addEventListener("click", e => {
      e.preventDefault();
      openProjectModal(proj);
    });

    grid.appendChild(link);
  });
}

// -------------------- CREATE CATEGORY FILTER BUTTONS --------------------
function createCategoryButtons() {
  const container = document.querySelector(".other-work");
  if (!container) return;

  const filterDiv = document.createElement("div");
  filterDiv.className = "grid-filters";

  const categories = [
    "ALL",
    "BRAND IDENTITY",
    "WEB DESIGN",
    "PUBLICATION LAYOUT",
    "INFOGRAPHIC",
    "ADVERT DESIGN"
  ];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.dataset.cat = cat.toLowerCase();
    if (cat === "All") btn.classList.add("active");

    btn.addEventListener("click", () => {
      document.querySelectorAll(".grid-filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderGrid(btn.dataset.cat);
    });

    filterDiv.appendChild(btn);
  });

  container.insertBefore(filterDiv, container.querySelector(".grid"));
}

// -------------------- OPEN LIGHTBOX MODAL --------------------
function openProjectModal(proj) {
  const modal = document.createElement("div");
  modal.className = "lightbox show";

  const images = proj.images && proj.images.length > 0 ? proj.images : [proj.image];

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>

      <!-- LEFT SIDE: TEXT -->
      <div class="lightbox-info">
        <h2>${proj.title}</h2>
        ${proj.subtitle ? `<h3>${proj.subtitle}</h3>` : ""}
        ${proj.description ? `<p>${proj.description}</p>` : ""}
      </div>

      <!-- RIGHT SIDE: IMAGE + THUMBS + ARROWS -->
      <div class="lightbox-image">
        <div class="arrow prev">‹</div>
        <img class="active-img" src="${images[0]}" alt="${proj.title}">
        <div class="arrow next">›</div>

        <div class="thumbnails">
          ${images
            .map(
              (img, i) =>
                `<img src="${img}" class="thumb ${i === 0 ? "active-thumb" : ""}" data-index="${i}">`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // -------------------- CLOSE MODAL --------------------
  modal.querySelector(".close").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

  const mainImg = modal.querySelector(".active-img");
  const thumbs = modal.querySelectorAll(".thumb");
  let currentIndex = 0;

  // -------------------- THUMBNAIL CLICK --------------------
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      currentIndex = parseInt(thumb.dataset.index);
      updateModalImage();
    });
  });

  // -------------------- ARROWS --------------------
  const prev = modal.querySelector(".prev");
  const next = modal.querySelector(".next");

  prev.addEventListener("click", e => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateModalImage();
  });

  next.addEventListener("click", e => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    updateModalImage();
  });

  function updateModalImage() {
    mainImg.src = images[currentIndex];
    thumbs.forEach(t => t.classList.remove("active-thumb"));
    thumbs[currentIndex].classList.add("active-thumb");
  }
}







// ======== CONTACT FORM VALIDATION + THANK YOU SCREEN ========
function initContactForm() {
  const form = document.querySelector("#contact-form");
  const thankYou = document.querySelector("#thank-you-message");
  if (!form) return;

  // Function to show thank-you message and clear form
  function showThankYou() {
    if (thankYou) thankYou.style.display = "block";
    form.reset();
    sessionStorage.removeItem("messageSent");
  }

  // Handle normal reload or back-button from Formspree redirect
  window.addEventListener("pageshow", (event) => {
    if (sessionStorage.getItem("messageSent") === "true") {
      showThankYou();
    }
  });

  form.addEventListener("submit", (e) => {
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const message = form.querySelector("#message").value.trim();

    // Validation
    if (!name || !email || !message) {
      e.preventDefault(); // prevent submission if invalid
      alert("Please fill in all fields before submitting.");
      return;
    }

    if (!email.includes("@")) {
      e.preventDefault();
      alert("Please enter a valid email address.");
      return;
    }

    // Set sessionStorage to show thank-you after user returns from Formspree
    sessionStorage.setItem("messageSent", "true");
    // Form will submit normally, redirecting to Formspree
  });
}

// Initialize the contact form when the page loads
document.addEventListener("DOMContentLoaded", initContactForm);











// ======== CURSOR GAME ========
const cursor = document.querySelector('.cursor');
const numDots = 12;
const dots = [];

let mouse = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };

// Create trailing dots
for (let i = 0; i < numDots; i++) {
  const dot = document.createElement('div');
  dot.classList.add('trail-dot');  // changed class name
  document.body.appendChild(dot);
  dots.push({ el: dot, x: 0, y: 0 });
}

// Track mouse
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Animation loop
function animate() {
  // Calculate cursor velocity
  velocity.x = mouse.x - lastMouse.x;
  velocity.y = mouse.y - lastMouse.y;
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;

  // Move main cursor
  cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;

  // Move trailing dots
  let prevX = mouse.x;
  let prevY = mouse.y;

  dots.forEach((dot, index) => {
    dot.x += (prevX + velocity.x * 0.3 - dot.x) * 0.2;
    dot.y += (prevY + velocity.y * 0.3 - dot.y) * 0.2;

    dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;

    prevX = dot.x;
    prevY = dot.y;
  });

  requestAnimationFrame(animate);
}

animate();



// ===== Inline Carousel for In-Depth Projects =====
function initInlineCarousels() {
  const carousels = document.querySelectorAll(".inline-carousel");

  carousels.forEach(carousel => {
    const mainImages = carousel.querySelectorAll(".main-image img");
    const thumbs = carousel.querySelectorAll(".thumb");

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        // change main image
        mainImages.forEach(img => img.classList.remove("active"));
        mainImages[index].classList.add("active");

        // update active thumb
        thumbs.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  });
}


// ======== DYNAMIC FOOTER YEAR ========
function updateFooterYear() {
  const footer = document.querySelector("footer span");
  if (footer) footer.innerHTML = `© beatrice mihiro aquilani ${new Date().getFullYear()}`;
}



// ======== INITIALIZE EVERYTHING ========
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".hero")) initHeroCarousel();
  if (document.querySelector(".grid")) loadProjectGrid();
  if (document.querySelector("form")) initContactForm();

  initInlineCarousels();

  updateFooterYear();
});


