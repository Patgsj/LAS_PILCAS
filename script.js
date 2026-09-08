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
function renderGalleryItem(index) {
    const items = Array.from(galleryItems);
    const item = items[index];
    if (!item) return;

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
}

function openGalleryItem(index) {
    if (!galleryLightbox) return;
    if (galleryTransitionTimeout) {
        clearTimeout(galleryTransitionTimeout);
        galleryTransitionTimeout = null;
    }
    currentGalleryIndex = index;
    renderGalleryItem(index);

    galleryLightbox.classList.remove('hidden');
    galleryLightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Doble rAF: asegura que el navegador aplique display:flex antes de animar la opacidad.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            galleryLightbox.classList.add('lightbox-visible');
        });
    });
}

// Cambia de imagen/video con un fundido leve en vez de un corte brusco.
let galleryTransitionTimeout = null;

function transitionToGalleryItem(index) {
    if (!galleryLightbox) return;

    // Actualiza el índice de inmediato (no al terminar el fundido): si el usuario
    // hace varios clics seguidos en siguiente/anterior antes de que termine la
    // transición anterior, cada clic debe avanzar desde el destino ya solicitado,
    // no desde el último índice renderizado, o los clics rápidos se pierden.
    currentGalleryIndex = index;

    lightboxImage.classList.add('lightbox-fading');
    if (lightboxVideo) lightboxVideo.classList.add('lightbox-fading');

    if (galleryTransitionTimeout) clearTimeout(galleryTransitionTimeout);
    galleryTransitionTimeout = setTimeout(() => {
        renderGalleryItem(index);
        requestAnimationFrame(() => {
            lightboxImage.classList.remove('lightbox-fading');
            if (lightboxVideo) lightboxVideo.classList.remove('lightbox-fading');
        });
        galleryTransitionTimeout = null;
    }, 280); // debe coincidir con la duración del transition en CSS (0.28s), si no la foto anterior alcanza a reaparecer a medio fundido
}

function closeGallery() {
    if (!galleryLightbox) return;
    if (galleryTransitionTimeout) {
        clearTimeout(galleryTransitionTimeout);
        galleryTransitionTimeout = null;
    }
    galleryLightbox.classList.remove('lightbox-visible');
    document.body.style.overflow = '';

    setTimeout(() => {
        galleryLightbox.classList.add('hidden');
        galleryLightbox.classList.remove('flex');
        if (lightboxVideo) {
            lightboxVideo.src = '';
        }
    }, 300);
}

function showNextGalleryItem(direction) {
    const items = Array.from(galleryItems);
    if (!items.length) return;
    const nextIndex = (currentGalleryIndex + direction + items.length) % items.length;
    transitionToGalleryItem(nextIndex);
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

function showTooltip(e, id, estadoText, precioHTML, accionHTML) {
    accionHTML = accionHTML || '';
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
            </div>
            ${accionHTML}`;
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
                ${accionHTML}
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

// Precio de las parcelas. Única fuente de verdad de este archivo: antes el tooltip
// decía "Desde $45.000.000" para todas y el mensaje de WhatsApp cobraba $65.000.000 a
// todas salvo la 2 y la 33 — dos cifras distintas y ninguna correcta.
// Valores confirmados por el dueño el 04-09-2026: las parcelas disponibles valen
// $45.000.000, salvo las parcelas 5 a 10, que valen $55.000.000. Las que no están
// disponibles no llevan precio porque no están a la venta.
const PARCELAS_55_MILLONES = [5, 6, 7, 8, 9, 10];
const formatoCLP = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
});

// Los ids del SVG son "LOTE-2" y también "LOTE_14": se toma el número, no el separador.
function numeroDeParcela(lote) {
    const match = (lote.getAttribute('id') || '').match(/(\d+)/);
    return match ? Number(match[1]) : null;
}

function precioDeParcela(lote) {
    if (!lote.classList.contains('disponible')) return null;
    const numero = numeroDeParcela(lote);
    return PARCELAS_55_MILLONES.includes(numero) ? 55000000 : 45000000;
}

// El plano ya no salta a WhatsApp: abre el asistente, que responde al instante con la
// ficha de esa parcela (valor, estado, fase 2 y descarga en Word) y recién al final
// deriva a un humano, ya con el interesado precalificado.
function accionParcela(lote) {
    if (lote.classList.contains('disponible')) {
        return { texto: 'Consultar esta parcela', pista: 'Clic para consultar esta parcela' };
    }
    // Reservadas y en trámite todavía se pueden liberar: si no ofrecen ninguna acción,
    // el interesado se queda sin nada que hacer.
    if (lote.classList.contains('reservado') || lote.classList.contains('tramite')) {
        return { texto: 'Ver esta parcela', pista: 'Clic para consultar esta parcela' };
    }
    return null;
}

// El widget expone window.chatAsistente al cargar. Si todavía no está (script defer
// que no llegó, o worker caído), el clic no queda muerto: cae al formulario. Sin este
// respaldo, quitar los botones de WhatsApp dejaría la página sin ningún canal.
function abrirAsistente(opciones, medicion) {
    if (window.chatAsistente && window.chatAsistente.abrir) {
        window.chatAsistente.abrir(opciones);
        if (window.registrarLead && medicion) {
            window.registrarLead('asistente_abierto', medicion);
        }
        return true;
    }
    window.location.hash = 'contacto';
    return false;
}

// Antes la única forma de consultar por una parcela era hacer clic en el polígono,
// y ese clic estaba desactivado en dispositivos táctiles: en móvil el mapa no
// llevaba a ningún contacto.
//
// En táctil se pinta un botón real dentro del tooltip. En escritorio no sirve un
// botón: el tooltip persigue al cursor (se reposiciona en cada mousemove), así que
// nunca se podría alcanzar. Ahí va una pista, y el clic sobre la parcela hace el
// trabajo.
function accionDeParcela(lote, esTactil) {
    const accion = accionParcela(lote);
    if (!accion) return '';

    if (!esTactil) {
        return '<div class="lote-tooltip__pista">' + accion.pista + '</div>';
    }

    return '<button type="button" class="lote-tooltip__cta" data-parcela="' + numeroDeParcela(lote) + '">'
         + accion.texto + '</button>';
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
            estadoText = '<span class="font-bold text-[9px]" style="color:#a7f3d0;">DISPONIBLE</span>';
            precioHTML = '<div class="precio-lote mt-4 text-white font-light tracking-tighter italic border-t border-white/10 pt-2">' + formatoCLP.format(precioDeParcela(lote)) + '</div>';
        }

        showTooltip(e, id, estadoText, precioHTML, accionDeParcela(lote, e.type.startsWith('touch')));
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
        // En táctiles el tap solo muestra el tooltip; ahí está el botón de consulta.
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice) return;

        if (!accionParcela(lote)) return;

        const numero = numeroDeParcela(lote);
        abrirAsistente({ parcela: numero }, { seccion: 'mapa-lotes', cta: 'parcela-' + numero });
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

// --- NAV: transparente en el tope (hero), fondo aparece al hacer scroll ---
const mainNav = document.getElementById('main-nav');
const NAV_SCROLL_THRESHOLD = 80;

function updateNavVisibility() {
    if (!mainNav) return;
    if (window.scrollY <= NAV_SCROLL_THRESHOLD) {
        mainNav.classList.remove('nav--scrolled');
    } else {
        mainNav.classList.add('nav--scrolled');
    }
}

window.addEventListener('scroll', updateNavVisibility, { passive: true });
updateNavVisibility();

// --- FAQ: apertura/cierre fluido con CSS grid-template-rows (sin reflow por frame) ---
// La estructura (details[open] + .faq-answer) está en el HTML; el JS solo togglea la clase.
document.querySelectorAll('#faq details.faq-item').forEach(function (detail) {
    const summary = detail.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', function (e) {
        e.preventDefault();
        detail.classList.toggle('faq-open');
    });
});

// --- CTA QUE ABREN EL ASISTENTE ---
// Mismo patrón que arriagadaconsultores.cl: un atributo en el markup y un handler
// delegado, así los botones que arma el JS (el del tooltip del plano) también quedan
// cubiertos sin instrumentarlos uno por uno.
document.addEventListener('click', (e) => {
    if (!e.target.closest) return;

    const botonParcela = e.target.closest('[data-parcela]');
    if (botonParcela) {
        e.preventDefault();
        const numero = Number(botonParcela.getAttribute('data-parcela'));
        abrirAsistente({ parcela: numero }, { seccion: 'mapa-lotes', cta: 'parcela-' + numero });
        hideTooltip();
        return;
    }

    const boton = e.target.closest('[data-abrir-asistente]');
    if (!boton) return;

    e.preventDefault();
    const seccion = boton.closest('header, nav, section[id], #mobile-menu');
    abrirAsistente(null, {
        seccion: (seccion && (seccion.id || seccion.tagName.toLowerCase())) || 'sin-seccion',
        cta: (boton.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    });
});
