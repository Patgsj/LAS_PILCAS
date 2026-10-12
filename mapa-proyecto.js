// Plano de lotes sobre mapa satelital real.
// El SVG de #capa-lotes no cambia: queda encima de un mapa de Leaflet que ocupa el
// mismo recuadro, así el tooltip y el clic de script.js siguen funcionando igual.
// Si Leaflet no carga, el plano queda como estaba (SVG con la foto de fondo).
(function () {
    const contenedor = document.getElementById('mapa-lotes');
    const plano = document.getElementById('plano-lotes');
    if (!contenedor || !plano) return;

    // Límites geográficos del viewBox del SVG (ajuste con los lotes del levantamiento:
    // error medio 1,5 m; el plano está orientado al norte).
    const LIMITES = [[-36.603345, -71.499101], [-36.598206, -71.489938]];
    const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/';
    const TESELAS = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const ZOOM_NATIVO = 18;
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mapa = null;
    let cargando = null;
    // 'lejos': vista de partida, parcelas ocultas · 'volando' · 'cerca': encuadre final.
    let estado = 'cerca';
    let vuelo = 0;

    function cargarLeaflet() {
        if (window.L) return Promise.resolve();
        if (cargando) return cargando;
        cargando = new Promise((resolve, reject) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = LEAFLET + 'leaflet.css';
            document.head.appendChild(css);
            const js = document.createElement('script');
            js.src = LEAFLET + 'leaflet.js';
            js.onload = resolve;
            js.onerror = reject;
            document.head.appendChild(js);
        });
        return cargando;
    }

    function teselasListas(capa, espera) {
        return new Promise((resolve) => {
            if (!capa.isLoading()) { resolve(); return; }
            const fin = () => { capa.off('load', fin); resolve(); };
            capa.on('load', fin);
            setTimeout(fin, espera);
        });
    }

    function centro() { return window.L.latLngBounds(LIMITES).getCenter(); }
    function zoomLejos() {
        return mapa.getBoundsZoom(LIMITES) - (window.innerWidth < 768 ? 8 : 11.5);
    }

    // Deja en la caché del navegador las teselas del recorrido (centro del loteo en cada
    // nivel de zoom), para que durante el vuelo aparezcan al instante y no se vea vacío.
    function precalentar() {
        const c = centro();
        const hasta = Math.min(ZOOM_NATIVO, Math.ceil(mapa.getBoundsZoom(LIMITES)));
        for (let z = Math.max(0, Math.floor(zoomLejos())); z <= hasta; z++) {
            const n = Math.pow(2, z);
            const x = Math.floor((c.lng + 180) / 360 * n);
            const lat = c.lat * Math.PI / 180;
            const y = Math.floor((1 - Math.asinh(Math.tan(lat)) / Math.PI) / 2 * n);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const img = new Image();
                    img.src = TESELAS.replace('{z}', z).replace('{y}', y + dy).replace('{x}', x + dx);
                }
            }
        }
    }

    // Vuelve a la vista de partida, con las parcelas ocultas, lista para el próximo vuelo.
    function alInicio() {
        if (!mapa || sinMovimiento) return;
        vuelo++;
        mapa.stop();
        estado = 'lejos';
        contenedor.classList.add('mapa-lotes--volando');
        mapa.setView(centro(), zoomLejos(), { animate: false });
    }

    function montar() {
        if (mapa) return Promise.resolve(mapa);
        return cargarLeaflet().then(() => {
            if (mapa) return mapa;
            const L = window.L;
            contenedor.classList.add('mapa-lotes--vivo');
            const lienzo = document.createElement('div');
            lienzo.className = 'mapa-lotes__lienzo';
            contenedor.appendChild(lienzo);

            mapa = L.map(lienzo, {
                zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
                touchZoom: false, boxZoom: false, keyboard: false, tap: false,
                zoomSnap: 0, attributionControl: true
            });
            mapa.attributionControl.setPrefix(false);
            mapa.capaSatelital = L.tileLayer(TESELAS, {
                maxNativeZoom: ZOOM_NATIVO, maxZoom: 20, keepBuffer: 4, attribution: 'Imagen: Esri, Maxar'
            }).addTo(mapa);

            // El SVG se queda donde está, encima del mapa: en el encuadre final calza con
            // LIMITES, y durante el vuelo va oculto. Solo se le quita la foto de fondo.
            const fondo = plano.querySelector('#satelital-bg');
            if (fondo) fondo.remove();

            mapa.fitBounds(LIMITES, { animate: false });
            if (!sinMovimiento) { precalentar(); alInicio(); }

            window.addEventListener('resize', () => {
                if (estado === 'volando') return;
                mapa.invalidateSize();
                if (estado === 'lejos') mapa.setView(centro(), zoomLejos(), { animate: false });
                else mapa.fitBounds(LIMITES, { animate: false });
            });
            return mapa;
        });
    }

    // Vuelo completo: desde la vista de partida hasta el loteo. Las parcelas aparecen al llegar.
    function volar() {
        if (estado === 'volando') return;
        montar().then(() => {
            if (sinMovimiento || estado === 'volando') return;
            if (estado !== 'lejos') alInicio();
            estado = 'volando';
            const este = ++vuelo;
            teselasListas(mapa.capaSatelital, 1500).then(() => {
                if (este !== vuelo) return;
                mapa.once('moveend', () => {
                    if (este !== vuelo) return;
                    estado = 'cerca';
                    contenedor.classList.remove('mapa-lotes--volando');
                });
                mapa.flyToBounds(LIMITES, { duration: 3.5, easeLinearity: 0.18 });
            });
        }).catch(() => { /* sin Leaflet: queda el plano con la foto */ });
    }

    if ('IntersectionObserver' in window) {
        // Leaflet se carga recién cuando la sección está por entrar en pantalla.
        const cerca = new IntersectionObserver((entradas) => {
            if (entradas.some((e) => e.isIntersecting)) { cerca.disconnect(); montar().catch(() => {}); }
        }, { rootMargin: '900px 0px' });
        cerca.observe(contenedor);

        // El vuelo corre una sola vez, la primera que el plano entra en pantalla. Al volver
        // a la sección el mapa ya está en el encuadre final: repetirlo en cada visita
        // resultaba molesto.
        const enPantalla = new IntersectionObserver((entradas) => {
            if (entradas.some((e) => e.intersectionRatio >= 0.4)) { enPantalla.disconnect(); volar(); }
        }, { threshold: 0.4 });
        enPantalla.observe(contenedor);
    } else {
        montar().then(volar).catch(() => {});
    }
})();
