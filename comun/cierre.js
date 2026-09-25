/* ============================================================
   CIMBRA · Cierre de etapa
   Bloque compartido por todos los recursos. Muestra las dos casillas
   que marcan una etapa como terminada y, si se indica, los enlaces
   a la etapa anterior y siguiente.

   Uso, al final de cada recurso:
   <script src="../comun/cierre.js" defer
     data-recurso="planteamiento"                        (obligatorio, identifica la etapa)
     data-ancla="#btnWord"                               (el bloque va después de este botón)
     data-antes="footer.site-footer"                     (o antes de este elemento)
     data-despues="#cierreWrap"                          (o después de este elemento)
     data-casillas="no"                                  (solo enlaces, si el recurso ya tiene sus casillas)
     data-anterior="../1-idea/index.html|De la idea al problema"
     data-siguiente="../3-marco-teorico/marco-teorico.html|Marco teórico"></script>

   Criterio de término de la asignatura. La etapa queda terminada cuando el
   grupo descargó su documento y lo respaldó en una carpeta de Drive.
   - "Descargamos el documento" se marca sola al descargar, y se desmarca si
     el grupo vuelve a escribir, porque el archivo descargado ya no es el último.
   - "Lo subimos a una carpeta Drive de respaldo" la marca el grupo. No se puede
     verificar, así que es un registro para el grupo y no evidencia.

   Se guarda en localStorage, clave cimbra_cierre_v1, con la forma
   { "planteamiento": { descargado, respaldado, fechaDescarga, fechaRespaldo } }.
   La portada lee esa misma clave.
   ============================================================ */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var d = script.dataset;
  var RECURSO = d.recurso;
  if (!RECURSO) return;
  var CLAVE = 'cimbra_cierre_v1';
  /* data-casillas="no": el recurso ya tiene sus propias casillas de cierre
     (Idea y Discusión), así que aquí solo se agregan los enlaces entre etapas. */
  var CASILLAS = d.casillas !== 'no';

  /* ---------- estado ---------- */
  function leerTodo() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '{}') || {}; } catch (e) { return {}; }
  }
  function leer() { return leerTodo()[RECURSO] || { descargado: false, respaldado: false }; }
  function guardar(est) {
    try { var t = leerTodo(); t[RECURSO] = est; localStorage.setItem(CLAVE, JSON.stringify(t)); } catch (e) {}
    pintar();
  }
  function hoy() { return new Date().toISOString(); }

  function marcarDescarga() {
    var e = leer();
    e.descargado = true; e.fechaDescarga = hoy(); e.editadoDespues = false;
    guardar(e);
  }
  function desmarcarPorEdicion() {
    var e = leer();
    if (!e.descargado && !e.respaldado) return;
    e.descargado = false; e.respaldado = false; e.editadoDespues = true;
    guardar(e);
  }

  /* ---------- detectar descargas ----------
     Todos los recursos descargan creando un enlace con "download" y haciéndole clic.
     Se cuenta cualquier documento salvo los respaldos .json. */
  function esDescargaValida(a) {
    return a && a.download && !/\.json$/i.test(a.download);
  }
  if (CASILLAS) {
    var clicOriginal = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try { if (esDescargaValida(this)) marcarDescarga(); } catch (e) {}
      return clicOriginal.apply(this, arguments);
    };
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest && ev.target.closest('a[download]');
      if (esDescargaValida(a)) marcarDescarga();
    }, true);
  }

  /* ---------- detectar edición posterior ---------- */
  if (CASILLAS) document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (!t || (t.closest && t.closest('.cc-cierre'))) return;
    var escribe = t.tagName === 'TEXTAREA' || t.isContentEditable ||
      (t.tagName === 'INPUT' && /^(text|search|url|email|number|)$/i.test(t.type || ''));
    if (escribe) desmarcarPorEdicion();
  }, true);

  /* ---------- estilos ---------- */
  var css = '' +
    '.cc-cierre{margin:28px 0;border:1.5px solid #b9d9f0;border-radius:14px;background:#fbfdff;padding:20px 22px;font-family:inherit;color:#1a232b;text-align:left;line-height:1.55}' +
    '.cc-cierre h2{font-family:"Roboto Condensed","Arial Narrow",sans-serif;font-size:21px;line-height:1.2;margin:0 0 4px;color:#0d1b2a}' +
    '.cc-cierre .cc-lead{margin:0 0 14px;font-size:14.5px;color:#3a4551}' +
    '.cc-cierre .cc-item{display:grid;grid-template-columns:24px 1fr;gap:4px 12px;align-items:start;padding:10px 0;border-top:1px solid #e2e6ea}' +
    '.cc-cierre input[type=checkbox]{width:20px;height:20px;margin:2px 0 0;accent-color:#0055B7;cursor:pointer}' +
    '.cc-cierre input[type=checkbox]:disabled{cursor:not-allowed}' +
    '.cc-cierre label{font-weight:700;font-size:15px;cursor:pointer}' +
    '.cc-cierre .cc-nota{grid-column:2;font-size:13px;color:#55606b;margin:0}' +
    '.cc-cierre .cc-estado{margin:12px 0 0;padding:10px 14px;border-radius:9px;font-size:14px;font-weight:600}' +
    '.cc-cierre .cc-estado.ok{background:#eafbe6;color:#2E7D1F;border:1px solid #ACDA90}' +
    '.cc-cierre .cc-estado.falta{background:#f4f6f8;color:#3a4551;border:1px solid #e2e6ea}' +
    '.cc-cierre .cc-estado.aviso{background:#fff8e6;color:#5c4a14;border:1px solid #f0dca0}' +
    '.cc-cierre .cc-nav{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;margin-top:16px}' +
    '.cc-cierre .cc-nav a{display:inline-flex;align-items:center;min-height:44px;padding:10px 16px;border-radius:9px;font-weight:700;font-size:14px;text-decoration:none;border:1.5px solid #0055B7;color:#0055B7;background:#fff}' +
    '.cc-cierre .cc-nav a.cc-sig{background:#0055B7;color:#fff;margin-left:auto}' +
    '.cc-cierre .cc-nav a:hover{box-shadow:0 6px 16px rgba(13,27,42,.14)}' +
    '.cc-cierre :focus-visible{outline:3px solid #FFC845;outline-offset:2px}' +
    '.cc-cierre.cc-solo-nav{border:0;background:none;padding:0}' +
    '@media print{.cc-cierre{display:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---------- bloque ---------- */
  var n = 0;
  function enlace(valor, clase, flecha) {
    if (!valor) return '';
    var p = valor.split('|');
    var txt = (p[1] || '').replace(/[<>&"]/g, '');
    return '<a class="' + clase + '" href="' + p[0].replace(/"/g, '&quot;') + '">' +
      (flecha === 'izq' ? '← ' + txt : txt + ' →') + '</a>';
  }
  function crearBloque() {
    n++;
    var id = 'cc' + n;
    var el = document.createElement('section');
    el.className = 'cc-cierre';
    el.setAttribute('aria-labelledby', id + 't');
    var nav = (d.anterior || d.siguiente)
      ? '<div class="cc-nav">' + enlace(d.anterior, 'cc-ant', 'izq') + enlace(d.siguiente, 'cc-sig', 'der') + '</div>' : '';
    if (!CASILLAS) {
      el.className = 'cc-cierre cc-solo-nav';
      el.setAttribute('aria-label', 'Otras etapas');
      el.removeAttribute('aria-labelledby');
      el.innerHTML = nav;
      return el;
    }
    el.innerHTML =
      '<h2 id="' + id + 't">Para cerrar esta etapa</h2>' +
      '<p class="cc-lead">La etapa queda terminada cuando el grupo descargó su documento y lo respaldó en Drive.</p>' +
      '<div class="cc-item"><input type="checkbox" id="' + id + 'a" data-cc="descargado" disabled>' +
        '<label for="' + id + 'a">Descargamos el documento</label>' +
        '<p class="cc-nota">Se marca sola al usar el botón de descarga. Si vuelven a escribir, se desmarca, porque el archivo que tienen ya no es el último.</p></div>' +
      '<div class="cc-item"><input type="checkbox" id="' + id + 'b" data-cc="respaldado">' +
        '<label for="' + id + 'b">Lo subimos a una carpeta Drive de respaldo</label>' +
        '<p class="cc-nota">Esta la marcan ustedes. Es un registro para el grupo.</p></div>' +
      '<p class="cc-estado" role="status" aria-live="polite"></p>' + nav;
    el.querySelector('[data-cc="respaldado"]').addEventListener('change', function (ev) {
      var e = leer();
      e.respaldado = !!ev.target.checked && !!e.descargado;
      e.fechaRespaldo = e.respaldado ? hoy() : null;
      guardar(e);
    });
    return el;
  }

  function pintar() {
    var e = leer(), clase, texto;
    if (e.descargado && e.respaldado) { clase = 'ok'; texto = 'Etapa terminada. En la portada de Cimbra aparece como terminada.'; }
    else if (e.editadoDespues) { clase = 'aviso'; texto = 'Escribieron después de descargar. Descarguen el documento de nuevo y vuelvan a respaldarlo.'; }
    else if (e.descargado) { clase = 'falta'; texto = 'Falta respaldar el documento en Drive.'; }
    else { clase = 'falta'; texto = 'Todavía no descargan el documento de esta etapa.'; }
    document.querySelectorAll('.cc-cierre').forEach(function (el) {
      if (el.classList.contains('cc-solo-nav')) return;
      var a = el.querySelector('[data-cc="descargado"]');
      var b = el.querySelector('[data-cc="respaldado"]');
      a.checked = !!e.descargado;
      b.checked = !!e.respaldado;
      b.disabled = !e.descargado;
      var s = el.querySelector('.cc-estado');
      if (s.className !== 'cc-estado ' + clase) s.className = 'cc-estado ' + clase;
      if (s.textContent !== texto) s.textContent = texto;   /* sin cambios, no hay mutaciones */
    });
  }

  /* Ubica el bloque después del botón de descarga (o del elemento indicado).
     Si la página arma su contenido después, lo reintenta cuando aparece. */
  function ubicar() {
    var ok = false, nuevo = false;
    if (d.ancla) {
      document.querySelectorAll(d.ancla).forEach(function (btn) {
        var fila = btn.parentElement;
        if (!fila || (fila.nextElementSibling && fila.nextElementSibling.classList.contains('cc-cierre'))) { ok = ok || !!fila; return; }
        fila.insertAdjacentElement('afterend', crearBloque()); ok = true; nuevo = true;
      });
    }
    if (!ok && d.antes) {
      var sig = document.querySelector(d.antes);
      if (sig) {
        var prev = sig.previousElementSibling;
        if (!(prev && prev.classList.contains('cc-cierre-wrap'))) {
          var env = document.createElement('div');
          env.className = 'cc-cierre-wrap';
          env.style.cssText = 'max-width:1100px;margin:0 auto;padding:0 clamp(16px,4vw,32px)';
          env.appendChild(crearBloque());
          sig.insertAdjacentElement('beforebegin', env); nuevo = true;
        }
        ok = true;
      }
    }
    if (!ok && d.despues) {
      var ref = document.querySelector(d.despues);
      if (ref) {
        if (!(ref.nextElementSibling && ref.nextElementSibling.classList.contains('cc-cierre-wrap'))) {
          var envoltura = document.createElement('div');
          envoltura.className = 'cc-cierre-wrap';
          envoltura.style.cssText = CASILLAS ? 'max-width:1100px;margin:0 auto;padding:0 clamp(16px,4vw,32px)' : '';
          envoltura.appendChild(crearBloque());
          ref.insertAdjacentElement('afterend', envoltura); nuevo = true;
        }
        ok = true;
      }
    }
    if (nuevo) pintar();
    return ok;
  }

  /* Algunas páginas vuelven a dibujar su contenido. Si el bloque desaparece, se repone. */
  function iniciar() {
    ubicar();
    var pendiente = false;
    new MutationObserver(function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () { pendiente = false; ubicar(); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener('storage', function (ev) { if (ev.key === CLAVE) pintar(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
