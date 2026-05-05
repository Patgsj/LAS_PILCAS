const tooltip = document.getElementById('info-lote');
const lotes = document.querySelectorAll('.lote');
const camino = document.getElementById('CAMINO');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');
const iconOpen = document.getElementById('menu-icon-open');
const iconClose = document.getElementById('menu-icon-close');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryLightbox = document.getElementById('gallery-lightbox');
const galleryClose = document.getElementById('gallery-close');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxCaption = document.getElementById('lightbox-caption');
let currentGalleryIndex = 0;
const contactForm = document.getElementById('contact-form');
const contactSuccessModal = document.getElementById('contact-success-modal');
const contactSuccessClose = document.getElementById('contact-success-close');
const mapaContainer = document.getElementById('mapa');
let touchTooltipVisible = false;
let touchTooltipScrollStart = 0;

// --- MENÚ MÓVIL: toggle clase active, bloqueo de scroll y cierre en enlaces ---
function setMobileMenuActive(active) {
    if (!mobileMenu) return;
    if (active) {
        mobileMenu.classList.add('active');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (iconOpen) iconOpen.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
    } else {
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
    }
}

function openMobileMenu() {
    setMobileMenuActive(true);
}

function closeMobileMenu() {
    setMobileMenuActive(false);
}

function toggleMobileMenu() {
    const isOpen = mobileMenu && mobileMenu.classList.contains('active');
    setMobileMenuActive(!isOpen);
}

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        closeMobileMenu();
    });
});

if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
        if (e.target === mobileMenu || e.target.classList.contains('mobile-menu__backdrop')) {
            closeMobileMenu();
        }
    });
}

// --- GALERÍA / LIGHTBOX ---
function openGalleryItem(index) {
    if (!galleryLightbox) return;
    const items = Array.from(galleryItems);
    const item = items[index];
    if (!item) return;
    currentGalleryIndex = index;

    const type = item.getAttribute('data-type');
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';

    if (type === 'video') {
        lightboxImage.classList.add('hidden');
        if (lightboxVideo) {
            lightboxVideo.classList.remove('hidden');
            lightboxVideo.src = src;
        }
    } else {
        if (lightboxImage) {
            lightboxImage.src = src;
            lightboxImage.classList.remove('hidden');
        }
        if (lightboxVideo) {
            lightboxVideo.classList.add('hidden');
            lightboxVideo.src = '';
        }
    }

    if (lightboxCaption) {
        lightboxCaption.textContent = caption;
    }

    galleryLightbox.classList.remove('hidden');
    galleryLightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeGallery() {
    if (!galleryLightbox) return;
    galleryLightbox.classList.add('hidden');
    galleryLightbox.classList.remove('flex');
    document.body.style.overflow = '';
    if (lightboxVideo) {
        lightboxVideo.src = '';
    }
}

function showNextGalleryItem(direction) {
    const items = Array.from(galleryItems);
    if (!items.length) return;
    currentGalleryIndex = (currentGalleryIndex + direction + items.length) % items.length;
    openGalleryItem(currentGalleryIndex);
}

if (galleryItems && galleryItems.length) {
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openGalleryItem(index));
    });
}

if (galleryClose) {
    galleryClose.addEventListener('click', closeGallery);
}

if (galleryPrev) {
    galleryPrev.addEventListener('click', () => showNextGalleryItem(-1));
}

if (galleryNext) {
    galleryNext.addEventListener('click', () => showNextGalleryItem(1));
}

if (galleryLightbox) {
    galleryLightbox.addEventListener('click', (e) => {
        if (e.target === galleryLightbox) {
            closeGallery();
        }
    });
}

// Navegación con teclado dentro de la galería (solo cuando el lightbox está visible)
document.addEventListener('keydown', (e) => {
    if (!galleryLightbox || galleryLightbox.classList.contains('hidden')) return;

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNextGalleryItem(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showNextGalleryItem(-1);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeGallery();
    }
});

// --- FORMULARIO CONTACTO: envío a enviar.php (redirección desde PHP) ---
// Si se vuelve con ?envio=exito, mostrar modal "Mensaje enviado"
(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('envio') === 'exito' && contactSuccessModal) {
        contactSuccessModal.classList.add('flex');
        contactSuccessModal.classList.remove('hidden');
        history.replaceState(null, '', window.location.pathname + '#contacto');
    }
})();

if (contactSuccessClose && contactSuccessModal) {
    contactSuccessClose.addEventListener('click', () => {
        contactSuccessModal.classList.add('hidden');
        contactSuccessModal.classList.remove('flex');
    });
    contactSuccessModal.addEventListener('click', (e) => {
        if (e.target === contactSuccessModal) {
            contactSuccessModal.classList.add('hidden');
            contactSuccessModal.classList.remove('flex');
        }
    });
}

// --- TOOLTIP LÓGICA ---
function hideTooltip() {
    if (!tooltip) return;
    tooltip.style.opacity = '0';
    tooltip.classList.remove('lote-tooltip--touch');
    touchTooltipVisible = false;
    tooltip.style.display = 'none';
}

function showTooltip(e, id, estadoText, precioHTML) {
    if (!tooltip) return;
    const isTouch = e.type.startsWith('touch');
    tooltip.style.display = 'block';

    if (isTouch) {
        tooltip.classList.add('lote-tooltip--touch');
        tooltip.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:10px;">
                <div style="flex:1;min-width:0;">
                    <div class="text-[7px] text-gray-300 mb-0.5 tracking-[0.3em]">Propiedad</div>
                    <div class="lote-tooltip__title text-white font-bold text-xs mb-1 truncate">${id}</div>
                    ${estadoText}
                </div>
                <div style="flex:0 0 auto;text-align:right;">
                    ${precioHTML}
                </div>
            </div>`;
        tooltip.style.left = '';
        tooltip.style.top = '';
        touchTooltipVisible = true;
        touchTooltipScrollStart = window.scrollY || window.pageYOffset || 0;
    } else {
        tooltip.classList.remove('lote-tooltip--touch');
        const parentRect = tooltip.parentElement ? tooltip.parentElement.getBoundingClientRect() : { left: 0, top: 0 };
        tooltip.innerHTML = `
            <div style="min-width:180px;position:relative;">
                <button type="button" class="lote-tooltip__close" aria-label="Cerrar información de lote" style="position:absolute;top:0;right:0;font-size:11px;color:#e5e5e5;background:transparent;border:none;cursor:pointer;">✕</button>
                <div class="text-[8px] text-gray-300 mb-1 pr-4 tracking-[0.4em]">Propiedad</div>
                <div class="text-white font-bold text-xl mb-3 pr-4">${id}</div>
                ${estadoText}
                ${precioHTML}
            </div>`;
        var x = e.clientX || 0;
        var y = e.clientY || 0;
        const offset = 20;
        tooltip.style.left = (x - parentRect.left + offset) + 'px';
        tooltip.style.top = (y - parentRect.top + offset) + 'px';
        tooltip.style.transform = '';
    }

    const closeBtn = tooltip.querySelector('.lote-tooltip__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            hideTooltip();
        });
    }

    // Forzar transición de opacidad
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
    });
}

// Eventos para lotes
lotes.forEach(lote => {
    const handleMove = (e) => {
        const id = lote.getAttribute('id').replace('-', ' ');
        let estadoText = "";
        let precioHTML = "";

        if (lote.classList.contains('vendido')) {
            estadoText = '<span class="font-bold text-[9px]" style="color:#fca5a5;">VENDIDA</span>';
        } else if (lote.classList.contains('reservado')) {
            estadoText = '<span class="font-bold text-[9px]" style="color:#fbbf77;">RESERVADA</span>';
        } else if (lote.classList.contains('tramite')) {
            estadoText = '<span class="font-bold text-[9px]" style="color:#7dd3fc;">EN TRÁMITE</span>';
        } else {
            estadoText = '<span class="font-bold text-[9px]" style="color:#a7f3d0;">ENTREGA INMEDIATA</span>';
            const isPromo = lote.getAttribute('id') === 'LOTE-2' || lote.getAttribute('id') === 'LOTE-33';
            if (isPromo) {
                precioHTML = '<div class="precio-lote mt-4 font-light tracking-tighter italic border-t border-white/10 pt-2"><span style="color:#9ca3af;text-decoration:line-through;font-size:0.8em;">$65.000.000</span><br><span style="color:#fbbf24;font-weight:700;font-size:1.1em;">$50.000.000</span>&nbsp;<span style="background:#fbbf24;color:#000;font-size:0.6em;font-weight:800;padding:1px 4px;vertical-align:middle;">OFERTA</span></div>';
            } else {
                precioHTML = '<div class="precio-lote mt-4 text-white font-light tracking-tighter italic border-t border-white/10 pt-2">$65.000.000</div>';
            }
        }

        showTooltip(e, id, estadoText, precioHTML);
    };

    lote.addEventListener('mousemove', handleMove);
    lote.addEventListener('mouseenter', handleMove);
    lote.addEventListener('touchstart', (e) => {
        handleMove(e);
        // Evitar que el primer toque abra WhatsApp si solo queremos ver el tooltip
    }, {passive: true});

    lote.addEventListener('mouseleave', () => {
        hideTooltip();
    });
    
    lote.addEventListener('click', (e) => {
        if (!lote.classList.contains('disponible')) return;

        // En dispositivos táctiles (móvil/tablet), no abrir WhatsApp al hacer tap
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice) return;

        const loteId = lote.getAttribute('id');
        const id = loteId.replace('-', ' ');
        const isPromo = loteId === 'LOTE-2' || loteId === 'LOTE-33';
        const precio = isPromo ? '$50.000.000 (oferta por tiempo limitado)' : '$65.000.000';
        const msg = `Me interesa recibir información técnica de la ${id} (Valor ${precio}) de Las Pilcas`;
        window.open(`https://wa.me/56966640562?text=${encodeURIComponent(msg)}`);
    });
});

// Tooltip para camino (Ruta N-31)
if (camino) {
    const handleCamino = (e) => {
        if (!tooltip) return;
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
            <div style="min-width:180px">
                <div class="text-[8px] text-gray-300 mb-1 tracking-[0.4em]">Vialidad</div>
                <div class="text-white font-bold text-xl mb-1">Ruta N-31</div>
                <div class="text-[10px] text-gray-400 tracking-[0.15em] uppercase">Camino de acceso principal</div>
            </div>`;
        
        let x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        let y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const offset = e.type.startsWith('touch') ? -100 : 52;
        
        tooltip.style.left = (x + (e.type.startsWith('touch') ? -90 : 52)) + 'px';
        tooltip.style.top = (y + offset) + 'px';
    };

    camino.addEventListener('mousemove', handleCamino);
    camino.addEventListener('touchstart', handleCamino, {passive: true});
    camino.addEventListener('mouseleave', () => {
        hideTooltip();
    });
}

// Cerrar tooltip táctil al tocar una zona del mapa que no sea un lote
if (mapaContainer) {
    mapaContainer.addEventListener('click', (e) => {
        if (!touchTooltipVisible || !tooltip) return;
        const target = e.target;
        const isLote = target.closest && target.closest('.lote');
        if (!isLote) {
            hideTooltip();
        }
    });
}

// --- SCROLLSPY ---
const sections = document.querySelectorAll('header[id], section[id]');
const navLinks = document.querySelectorAll('#main-nav a[href^="#"], .mobile-menu__link[href^="#"]');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('text-emerald-500');
                link.classList.remove('mobile-menu__link--active');
                if (link.getAttribute('href') === `#${id}`) {
                    // Desktop
                    if (link.closest('#main-nav')) {
                        link.classList.add('text-emerald-500');
                    }
                    // Móvil
                    if (link.classList.contains('mobile-menu__link')) {
                        link.classList.add('mobile-menu__link--active');
                    }
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));
