/* ════════════════════════════════════════════════════════════════════
   MOTOR DE LA RULETA (canvas + coreografía)
   ────────────────────────────────────────────────────────────────────
   Dibuja la rueda en el <canvas> y ejecuta las "fases" de rotación
   que piden las animaciones.

   QUÉ SE DIBUJA (de abajo a arriba):
     1. Los segmentos de colores, con los nombres en radial. Su
        contorno se pinta con el COLOR DEL FONDO (se pidió que la
        rueda, sus segmentos y el selector se fundan con la página:
        ver _bordeSegmentos()).
     2. (Solo si CONFIG.grosorAro > 0) el ARO de madera alrededor.
        Por defecto está a 0: rueda SIN contorno, limpia.
     3. Las CLAVIJAS ("pernos", "topes", "pines"): hoy NO se dibujan
        (CONFIG.mostrarClavijas = false, tal como se pidió: se
        ELIMINAN del dibujo). Pero el TIC al pasar sobre ellas se
        MANTIENE: el sonido cruza por cada frontera de segmento
        aunque el remache no se vea.
     4. La FLECHA / SELECTOR: un TRIÁNGULO INVERTIDO normal, ROJO,
        apoyado sobre el borde y con el contorno del color del fondo.
        Puede INCLINARSE (flexión) si una coreografía se lo pide
        (herramienta libre: la nueva animación 3 ya no la usa).

   EL POLVO (animación 8): la técnica "image → particles" de toda la
   vida (la de los efectos de desintegración que circulan por CodePen),
   adaptada a la rueda:
     · prepararPolvo() hace una FOTO de los píxeles de la rueda parada
       (getImageData) y trocea cada segmento perdedor en GRANOS sobre
       una malla que cubre TODO el segmento (solapamiento garantizado:
       no quedan "hoyitos"; el segmento desaparece ENTERO, como polvo).
     · iniciarPolvo() suelta los granos del borde exterior hacia el
       centro, en ola; al soltarse, cada grano se BORRA del canvas
       (destination-out) y nace una partícula de polvo con el COLOR
       REAL del píxel que ocupaba (nombres incluidos), que flota y se
       desvanece sobre un segundo canvas superpuesto.
     · Mientras dura el polvo el canvas está CONGELADO: no se redibuja
       nada, solo se borran granos. Así la desintegración es total y
       además barata (unos pocos círculos por frame).

   LA CAÍDA DE LA FLECHA (animación 8): en vez de desaparecer, la
   flecha se cae con física de verdad — gravedad, volteretas y rebotes
   contra el borde de la rueda — hasta salir del cuadro (caerFlecha /
   _pasoCuerpoTriangulo). Esa MISMA física la reusa la animación 14
   (los selectores múltiples se caen de uno en uno) y _vuelos sirve
   para la 10 (segmentos que vuelan) y la 16 (segmentos que se CAEN…
   hasta EL SUELO, donde suenan y se posan: un TOC por cada pedazo
   que llega al piso).

   LA MAZA CENTRAL se dibuja SIN contorno (se pidió): solo el disco
   oscuro, sin el filete dorado que llevaba. Cuando una animación espera
   que el profesor TOQUE LA BOLITA NEGRA (el motor dañado de la
   animación 11), el buje luce un anillo dorado latiendo: se ve dónde
   tocar.

   INTERVENCIONES DE USUARIO (motor dañado, frenos dañados, vasos):
   pedirClic() promete el próximo clic sobre el lienzo (en coordenadas
   del canvas); mientras haya un clic pendiente, js/ui.js NO interpreta
   el clic como "girar", sino que lo entrega aquí. Así una animación
   puede esperar a que el profesor toque la rueda o elija un vaso.
   pedirClic({ soloBolita: true }) solo acepta el clic sobre LA BOLITA
   NEGRA del centro (el MOTOR DAÑADO de la animación 11 se para así,
   tal como se pidió: "toca el motor, no la rueda entera").
   pedirClic({ soloFlecha: true }) solo acepta el clic sobre EL
   TRIÁNGULO selector (los FRENOS DAÑADOS de la animación 18 se pisan
   ahí: "presiona la flecha para frenarla manualmente") — y mientras
   se espera, la flecha LATE suavecita llamando al profesor.

   EL ARRANQUE MANUAL (animación 19 — el ABANICO AVERIADO, "ayúdala a
   girar") va más allá del clic: arranqueManual() deja la rueda penando
   MUY lento y AGARRABLE — el profesor la agarra con el puntero (ratón,
   dedo o tableta) y la GIRA A MANO; al soltarla con fuerza el motor
   "agarra" y la promesa se cumple con la velocidad y el sentido del
   gesto (si la suelta floja, la rueda vuelve a su marchita y puede
   reintentarse). El cursor promete la mano (grab/grabbing).

   GEOMETRÍA (importante si vas a tocar algo):
   · Ángulo 0 = derecha; los ángulos crecen en sentido HORARIO (canvas).
   · La flecha fija vive arriba:  ANGULO_FLECHA_TOPE = -π/2.
   · El segmento i ocupa los ángulos  [angulo + i·s, angulo + (i+1)·s)
     siendo  s = 2π / nº de segmentos.
   · Índice bajo la flecha = floor( normalizado(referencia - angulo) / s )
   · Para dejar al índice w bajo la flecha:
        anguloObjetivo = ANGULO_FLECHA_TOPE - (w + u) · s     (u = 0..1)
   · u = 0 deja la FRONTERA (y su clavija) exactamente bajo el EJE de
     la flecha: la punta EN EL MEDIO de dos nombres — la posición de
     la tensión decisiva (animación 3). u > 0 deja la clavija un poco a
     la IZQUIERDA de la flecha; contactoClavija() mide cuánto debe
     avanzar la rueda para que el perno llegue a rozar el FLANCO del
     triángulo (con eso se miden los empujones de la tensión).

   La promesa de cada fase se resuelve EXACTAMENTE en el ángulo pedido,
   por eso el ganador siempre cae de verdad donde tenía que caer.
   ════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;
const ANGULO_FLECHA_TOPE = -Math.PI / 2; // arriba

// Ángulo normalizado a [0, 2π)
function norm(a) { return ((a % TAU) + TAU) % TAU; }

// ── Azar justo (usa crypto cuando puede) ─────────────────────────────
function enteroAleatorio(limite) {
  if (!limite) return 0;
  if (window.crypto && crypto.getRandomValues) {
    // muestreo por rechazo para evitar el sesgo del módulo
    const lim = Math.floor(0xFFFFFFFF / limite) * limite;
    const buf = new Uint32Array(1);
    let r;
    do { crypto.getRandomValues(buf); r = buf[0]; } while (r >= lim);
    return r % limite;
  }
  return Math.floor(Math.random() * limite);
}

// Un número float al azar entre a y b (para tiempos y vueltas)
function azar(a, b) { return a + Math.random() * (b - a); }

// Un índice al azar distinto de "evitar" (mientras sea posible)
function indiceDistinto(limite, evitar) {
  if (limite < 2) return 0;
  let i;
  do { i = enteroAleatorio(limite); } while (i === evitar);
  return i;
}


const Motor = {

  /* ── Estado interno ─────────────────────────────────────────────── */
  estado: {
    lista: [],        // nombres que se dibujan (rueda ampliada o normal)
    colores: [],      // color de cada segmento (ya con el ajuste de bordes)
    anguloRueda: 0,   // rotación actual de la rueda (radianes)
    anguloFlecha: ANGULO_FLECHA_TOPE, // posición de la flecha (animación 4)
    flechaEnOrbita: false, // ¿la flecha está orbitando (animación 4)?
    flechaOculta: false,  // ¿la flecha está invisible (tras caer, anim. 8)?
    flechaCayendo: false, // ¿la flecha está en plena caída (animación 8)?
    patada: 0,        // 0..1 — salto de la flecha al cruzar una clavija
    dirPatada: 1,     // hacia qué lado salta (según el sentido del giro)
    flexion: 0,       // radianes: cuánto está INCLINADA la flecha por una clavija
    resaltadoIdx: null, // índice del segmento que destella
    tema: 'claro',    // 'claro' | 'oscuro' (colores del canvas)
    polvo: null,      // estado del deshacerse-en-polvo (animación 8)
    casino: null,     // estado de la ruleta de casino (animación 9)
    shell: null,      // estado del juego de los vasos (animación 15)
    diana: null,      // estado de la diana y el dardo (animación 17)
    humo: null,       // humo + chispas de la avería (anim. 11)
    arranque: null,   // el ARRANQUE MANUAL de la anim. 19 (abanico dañado):
                      // la rueda penando + agarrable con el puntero
    sonidoPernos: false, // herramienta libre: el selector suena a pernos
    resaltarBuje: false, // ¿se espera un clic en la BOLITA NEGRA? (anim. 11)
    flechaLlamando: false, // ¿se espera un clic en la FLECHA? (anim. 18)
    selectoresExtras: null, // los selectores multiplicados (animación 14)
    escalaFlecha: 1,  // 1 = normal; late cuando queda UN selector (anim. 14)
    velAng: 0,        // velocidad angular estimada (rad/s): desenfoque y texto
    flechaAlpha: 1,   // 0..1 — opacidad de la flecha (se funde en el casino)
    tam: 480, cx: 240, cy: 240, r: 206, // geometría del canvas
  },

  _canvas: null, _contenedor: null, _ctx: null,
  _canvasPolvo: null, _ctxPolvo: null,
  _particulas: [],   // partículas de polvo vivas
  _caida: null,      // estado de la caída de la flecha (animación 8)
  _caidasSel: [],    // selectores cayendo a la vez (animación 14)
  _clicPendiente: null, // resolver del clic que espera una animación (intervención)
  _clicFiltro: null,   // filtro del clic pendiente (null = cualquiera; {bolita} = solo la bolita negra)
  _vuelos: [],       // segmentos volando (animación 10) o cayendo (anim. 16)
  _excluidos: new Set(), // índices ya volados (no se dibujan en la rueda)
  _tBucle: null,     // instante del frame anterior del bucle maestro


  /* ── Arranque del motor ─────────────────────────────────────────── */
  iniciar(canvas, contenedor, canvasPolvo) {
    this._canvas = canvas;
    this._contenedor = contenedor;
    this._ctx = canvas.getContext('2d');
    if (canvasPolvo) {
      this._canvasPolvo = canvasPolvo;
      this._ctxPolvo = canvasPolvo.getContext('2d');
    }
    // Los PUNTEROS del dardo (animación 17 — intervención de usuario):
    // agarrarlo, arrastrarlo y lanzarlo con la velocidad del gesto
    // (ratón, dedo o tableta). Si no hay diana activa, no hacen nada.
    // LOS MISMOS PUNTEROS sirven al ARRANQUE MANUAL (animación 19 — el
    // abanico averiado): agarrar la RUEDA entera y girarla a mano,
    // empujando las aspas hasta que el motor agarre.
    canvas.addEventListener('pointerdown', e => { this._dianaPuntero(e, 'bajar'); this._arrastrePuntero(e, 'bajar'); });
    canvas.addEventListener('pointermove', e => { this._dianaPuntero(e, 'mover'); this._arrastrePuntero(e, 'mover'); });
    canvas.addEventListener('pointerup', e => { this._dianaPuntero(e, 'subir'); this._arrastrePuntero(e, 'subir'); });
    canvas.addEventListener('pointercancel', e => { this._dianaPuntero(e, 'subir'); this._arrastrePuntero(e, 'subir'); });
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.redimensionar()).observe(contenedor);
    } else {
      window.addEventListener('resize', () => this.redimensionar());
    }
    this.redimensionar();
    requestAnimationFrame(t => this._bucle(t));
  },

  // Bucle de dibujo continuo: la patada de la flecha decae sola y el
  // resaltado late. Barato incluso con 60 nombres.
  // OJO: mientras dura el polvo (animación 8) el canvas se CONGELA y
  // aquí no se redibuja nada — si no, se borraría la erosión que el
  // bucle del polvo va haciendo grano a grano sobre el canvas.
  // También estima la VELOCIDAD ANGULAR de la rueda (para el desenfoque
  // de la animación 10), corre la física de los segmentos que vuelan
  // (anim. 10) o se caen (anim. 16), la de los SELECTORES que van
  // cayendo (anim. 14), el NACIMIENTO escalonado de esos selectores, el
  // HUMO de la avería (anim. 11), la escena del DARDO (animación 17) y
  // mantiene el SONIDO TURBO sincronizado con esa velocidad real.
  _bucle(ahora) {
    const est = this.estado;
    est.patada *= 0.90;                    // decaimiento del saltito
    if (est.patada < 0.01) est.patada = 0;
    const dt = (this._tBucle == null)
      ? 0.016
      : Math.min(0.05, (ahora - this._tBucle) / 1000);
    this._tBucle = ahora;
    est.velAng *= 0.90;                   // decae si ninguna fase la refresca
    if (!isFinite(est.velAng)) est.velAng = 0;   // jamás envenenada (cinturón)
    if (est.velAng < 0.4) est.velAng = 0;
    this._pasoVuelos(dt);                // física de los segmentos volados
    this._pasoCaidasSel(dt);             // física de los selectores que caen
    this._pasoNacerSelectores(dt);       // el nacimiento de los clones (anim. 14)
    if (est.humo) this._pasoHumo(dt);    // humo y chispas de la avería (anim. 11)
    if ((est.humo || this._particulas.length) && !(est.polvo && est.polvo.activo)) {
      this._dibujarParticulas(dt);       // las partículas viven en el canvas del polvo
    }
    this._pasoDiana(dt);                 // la escena del dardo (animación 17)
    Sonido.turboAjustar(est.velAng);      // turbo (anim. 10) sigue la vel. real
    Sonido.abanicoAjustar(est.velAng);   // el abanico (anim. 19), lo mismo
    if (!(est.polvo && est.polvo.activo)) this.render();
    requestAnimationFrame(t => this._bucle(t));
  },

  // Ajusta el canvas al hueco disponible (con nitidez de pantallas retina)
  redimensionar() {
    const rect = this._contenedor.getBoundingClientRect();
    let css = Math.min(rect.width, rect.height || rect.width);
    if (!css || css < 40) css = 300;
    css = Math.round(css);
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    for (const cv of [this._canvas, this._canvasPolvo]) {
      if (!cv) continue;
      cv.style.width = css + 'px';
      cv.style.height = css + 'px';
      cv.width = Math.round(css * dpr);
      cv.height = Math.round(css * dpr);
    }
    const ctx = this._ctx;
    const est = this.estado;
    est.tam = css;
    est.cx = est.cy = css / 2;
    // margen holgado: deja sitio al triángulo de la flecha y a su pivote
    est.r = css / 2 - 46;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this._ctxPolvo) this._ctxPolvo.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  setTema(t) { this.estado.tema = t; },

  /* ══ INTERVENCIONES DE USUARIO ════════════════════════════════
     Herramienta común de las animaciones que ESPERAN un clic del
     profesor sobre la rueda (el motor dañado: "haz clic en el motor
     para apagarlo"; los frenos dañados: "presiona la flecha"; el juego
     de los vasos: "elige un vaso"). Mientras hay un clic pendiente,
     js/ui.js no arranca giros: entrega el clic aquí tal cual (en
     coordenadas del canvas, en px CSS).

     pedirClic({ soloBolita: true }) solo acepta un clic sobre LA
     BOLITA NEGRA del buje (con su margen generoso — el de siempre:
     tocar la rueda entera ya no la para). Mientras se espera, la
     bolita luce un ANILLO DORADO que late, para que se vea dónde
     tocar; un clic en otra parte suena bajito y no cuenta.
     pedirClic({ soloFlecha: true }) solo acepta un clic sobre EL
     TRIÁNGULO selector — el "freno manual" de la animación 18
     (frenos dañados): la flecha LATE suavecita mientras espera,
     llamando al dedo del profesor. */
  pedirClic(opciones) {
    const soloBolita = !!(opciones && opciones.soloBolita);
    const soloFlecha = !!(opciones && opciones.soloFlecha);
    this.estado.resaltarBuje = soloBolita;
    this.estado.flechaLlamando = soloFlecha;
    return new Promise(res => {
      this._clicPendiente = res;
      this._clicFiltro = soloBolita ? { bolita: true }
                     : soloFlecha ? { flecha: true }
                     : null;
    });
  },
  hayClicPendiente() { return !!this._clicPendiente; },
  entregarClic(x, y) {
    if (this._clicFiltro && this._clicFiltro.bolita) {
      const est = this.estado;
      const hub = Math.min(28, est.r * 0.14);   // la bolita negra del buje
      const R = Math.max(hub * 1.7, hub + 16);  // su zona de toque (generosa)
      if (Math.hypot(x - est.cx, y - est.cy) > R) {
        Sonido.golpe(0.16);   // no era la bolita: sigue esperando (y late)
        return;
      }
    }
    if (this._clicFiltro && this._clicFiltro.flecha) {
      const est = this.estado;
      const g = this._geoFlecha();
      // la zona de toque del TRIÁNGULO ENTERO (base arriba, punta
      // abajo), generosa como la de la bolita: el eje + su semi-ancho
      // con margen, y un pelo por encima de la base y bajo la punta.
      const ySup = est.cy - g.pivote - 16;
      const yInf = est.cy - g.tipRad + 16;
      const ancho = Math.max(g.H * 2.0, 36);
      if (x < est.cx - ancho || x > est.cx + ancho || y < ySup || y > yInf) {
        Sonido.golpe(0.16);   // no era la flecha: sigue esperando (y late)
        return;
      }
    }
    this.estado.resaltarBuje = false;
    if (this.estado.flechaLlamando) {
      this.estado.flechaLlamando = false;
      this.estado.escalaFlecha = 1;   // se aquieta del latidito de llamada
    }
    this._clicFiltro = null;
    const r = this._clicPendiente;
    this._clicPendiente = null;
    if (r) r({ x, y });
  },
  // Corta cualquier clic que hubiera quedado esperando (desmontaje de
  // emergencia: que ningún clic futuro se lo trague una promesa muerta).
  cancelarClic() {
    this._clicPendiente = null;
    this._clicFiltro = null;
    this.estado.resaltarBuje = false;
    if (this.estado.flechaLlamando) {
      this.estado.flechaLlamando = false;
      this.estado.escalaFlecha = 1;
    }
  },

  // ¿Qué sector está bajo la flecha AHORA MISMO — y a qué altura de su
  // sector? (lo usan el motor dañado y los frenos dañados: la rueda
  // para "donde iba" en el instante de tocar la bolita o la flecha).
  sectorBajoFlecha() {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return null;
    const s = TAU / n;
    const ref = est.flechaEnOrbita ? est.anguloFlecha : ANGULO_FLECHA_TOPE;
    const pos = norm(ref - est.anguloRueda);
    const i = Math.floor(pos / s) % n;
    let u = pos / s - i;
    u = Math.max(0.08, Math.min(0.92, u));      // sin rozar la frontera
    return { indice: i, u };
  },

  // El color con el que se trazan los contornos "negativos": si
  // CONFIG.colorBordeSegmentos vale null (por defecto), el contorno de
  // la rueda, de sus segmentos y del selector se pinta con el COLOR
  // DEL FONDO de la página — claro u oscuro según el tema —, tal como
  // se pidió: todo contorno se FUNDE con la página.
  _bordeSegmentos() {
    if (CONFIG.colorBordeSegmentos) return CONFIG.colorBordeSegmentos;
    return this.estado.tema === 'oscuro'
      ? CONFIG.colorFondoOscuro
      : CONFIG.colorFondoClaro;
  },


  /* ── Construcción de la rueda ────────────────────────────────── */
  // "colores" (opcional) fija el color de cada segmento TAL CUAL: lo
  // usa la animación 7 para que las réplicas de un participante salgan
  // con SU color (nunca de otros). Sin él, cada segmento toma el color
  // de la paleta según su posición (y se recolorea el último si
  // coincidiera con el primero al cerrar el círculo).
  construir(lista, colores) {
    const est = this.estado;
    est.lista = lista;
    // una rueda nueva no arrastra segmentos volados de la rueda
    // anterior… ni el anillo de "toca la bolita" o el latidito de
    // "toca la flecha" de una intervención que ya acabó.
    this._vuelos.length = 0;
    this._excluidos.clear();
    est.sonidoPernos = false;
    est.resaltarBuje = false;
    if (est.flechaLlamando) {
      est.flechaLlamando = false;
      est.escalaFlecha = 1;
    }
    if (colores && colores.length === lista.length) {
      est.colores = colores.slice();
    } else {
      const p = CONFIG.paleta.length;
      est.colores = lista.map((_, i) => CONFIG.paleta[i % p]);
      // Si el primer y el último segmento coincidieran en color (quedarían
      // "pegados" al cerrar el círculo), recolorea el último.
      if (lista.length > 1 && est.colores[0] === est.colores[lista.length - 1]) {
        est.colores[lista.length - 1] = CONFIG.paleta[lista.length % p];
      }
    }

    // ── LAS TIRAS (para la animación 20 — el GAJO GIGANTE) ────────
    // Ranuras SEGUIDAS con el MISMO nombre y color se FUSIONAN en el
    // dibujo: se pintan como UN SOLO segmento (borde y nombre
    // únicos, el nombre escrito UNA sola vez en el centro del gajo) y
    // las fronteras INTERNAS de una tira NO ticnean (no hay clavija
    // dentro del gajo gigante). En una rueda normal todas las tiras
    // miden 1 y todo se dibuja EXACTAMENTE como siempre.
    const runDe = new Array(lista.length);
    const runs = [];
    for (let i = 0; i < lista.length; i++) {
      if (i > 0 && runs.length > 0 &&
          lista[i] === lista[i - 1] && est.colores[i] === est.colores[i - 1]) {
        runDe[i] = runDe[i - 1];
        runs[runDe[i]].len++;
      } else {
        runDe[i] = runs.length;
        runs.push({ ini: i, len: 1 });
      }
    }
    est.runDe = runDe;
    est.runs = runs;
  },

  // El ángulo crece sin límite entre giro y giro: se renormaliza al final
  // para no perder precisión tras cientos de giros.
  normalizarAngulo() { this.estado.anguloRueda = norm(this.estado.anguloRueda); },

  // ¿Qué segmento está bajo la flecha ahora mismo?
  indiceBajoFlecha() {
    const est = this.estado;
    const n = est.lista.length;
    if (n === 0) return -1;
    const s = TAU / n;
    const ref = est.flechaEnOrbita ? est.anguloFlecha : ANGULO_FLECHA_TOPE;
    return Math.floor(norm(ref - est.anguloRueda) / s) % n;
  },

  // ¿La frontera entre las ranuras a y b es de VERDAD? (Las internas
  // de una TIRA fusionada — el gajo gigante de la animación 20 — no
  // existen: no hay clavija ahí y ningún tic debe sonar.)
  _fronteraReal(a, b) {
    const runDe = this.estado.runDe;
    if (!runDe) return true;   // rueda sin fusiones: todas son reales
    return runDe[a] !== runDe[b];
  },


  /* ── Fases de giro (todas devuelven promesas) ──────────────────── */

  // Giro "crudo": gira exactamente "delta" radianes desde donde esté.
  // "arranque" (0–0.5) = fracción inicial del giro en la que la rueda
  // coge velocidad desde parada (la curva de aceleración de Opciones).
  // Las animaciones lo piden con arranque: true y js/ui.js lo cambia
  // por la fracción real que diga el deslizador.
  girarAngulo({ delta, duracion = 1, suavizado = SUAV.salidaCubica, sinTics = false, arranque = 0 }) {
    const clave = 'anguloRueda';
    const desde = this.estado[clave];
    return this._animar({
      clave, desde, hasta: desde + delta,
      duracion: Math.max(0.05, duracion), suavizado, sinTics, arranque,
    });
  },

  // Gira y frena EXACTAMENTE con el índice "ganador" bajo la flecha.
  girarHasta({ ganador, u = null, vueltas = 1, sentido = 1, duracion = 1,
               suavizado = SUAV.salidaCubica, sinTics = false, arranque = 0 }) {
    return this.girarHastaIndice({ indice: ganador, u, vueltas, sentido, duracion, suavizado, sinTics, arranque });
  },

  // Gira y frena con el índice "indice" bajo la flecha, a la altura "u"
  // dentro de su sector (0 = borde inicial, 0.5 = centro, 1 = borde final).
  girarHastaIndice({ indice, u = null, vueltas = 1, sentido = 1, duracion = 1,
                     suavizado = SUAV.salidaCubica, sinTics = false, arranque = 0 }) {
    const est = this.estado;
    const n = est.lista.length;
    if (n === 0) return Promise.resolve();
    const s = TAU / n;
    if (u == null) u = 0.25 + Math.random() * 0.5; // al azar, sin rozar bordes
    // Ángulo exacto que deja (indice + u) bajo la flecha:
    const hasta = ANGULO_FLECHA_TOPE - (indice + u) * s;
    return this.girarAnguloAbsoluto({ hasta, vueltas, sentido, duracion, suavizado, sinTics, arranque });
  },

  // Gira hasta un ángulo ABSOLUTO concreto (lo usan las fases que "mienten":
  // arrimar una clavija a la flecha, parar sobre un aparente…).
  girarAnguloAbsoluto({ hasta, vueltas = 1, sentido = 1, duracion = 1,
                        suavizado = SUAV.salidaCubica, sinTics = false, arranque = 0 }) {
    const est = this.estado;
    const desde = est.anguloRueda;
    let base = norm(hasta - desde);      // fracción de vuelta pendiente (0..2π)
    if (base < 0.02) base += TAU;        // evita giros "casi cero" sin gracia
    // Las vueltas extra se REDONDEAN a enteros: solo múltiplos de 2π pueden
    // añadirse sin desviar el aterrizaje. "vueltas" es por tanto un número
    // APROXIMADO de vueltas; el destino exacto no se toca jamás.
    const extra = Math.max(0, Math.round(vueltas - 1));
    const delta = (sentido >= 1)
      ? base + TAU * extra                          // horario
      : (base - TAU) - TAU * extra;                  // antihorario (negativo)
    return this._animar({
      clave: 'anguloRueda', desde, hasta: desde + delta,
      duracion: Math.max(0.05, duracion), suavizado, sinTics, arranque,
    });
  },

  // COLOCAR SIN GIRAR (animación 6, "Sin girar"): posiciona la rueda
  // AL INSTANTE — ni un grado de animación, ni un solo frame de
  // movimiento — con (indice + u) bajo la flecha. La rueda amanece
  // ya parada sobre el ganador, como si "la animación no cargó".
  colocarRueda(indice, u = 0.5) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return;
    const s = TAU / n;
    est.anguloRueda = norm(ANGULO_FLECHA_TOPE - (indice + u) * s);
    est.velAng = 0;
  },

  // Anomalía de la animación 4: la FLECHA orbita alrededor de la rueda
  // quieta y se detiene sobre el índice pedido.
  girarFlechaHasta({ indice, u = null, vueltas = 1, sentido = 1, duracion = 1,
                     suavizado = SUAV.salidaCubica, arranque = 0 }) {
    const est = this.estado;
    const n = est.lista.length;
    if (n === 0) return Promise.resolve();
    const s = TAU / n;
    if (u == null) u = 0.25 + Math.random() * 0.5;
    const hasta = est.anguloRueda + (indice + u) * s;
    est.flechaEnOrbita = true;
    const desde = est.anguloFlecha;
    let base = norm(hasta - desde);
    if (base < 0.02) base += TAU;
    const extra = Math.max(0, Math.round(vueltas - 1)); // vueltas enteras: aterrizaje exacto
    const delta = (sentido >= 1)
      ? base + TAU * extra
      : (base - TAU) - TAU * extra;
    return this._animar({
      clave: 'anguloFlecha', desde, hasta: desde + delta,
      duracion: Math.max(0.05, duracion), suavizado, arranque,
    });
  },

  // Tras la animación 4, la flecha vuelve arriba con suavidad.
  async devolverFlecha() {
    const est = this.estado;
    const desde = est.anguloFlecha;
    const base = norm(ANGULO_FLECHA_TOPE - desde);
    await this._animar({
      clave: 'anguloFlecha', desde, hasta: desde + base,
      duracion: 0.6, suavizado: SUAV.entradaSalidaCubica, sinTics: true,
    });
    est.anguloFlecha = ANGULO_FLECHA_TOPE; // se recoloca al valor canónico
    est.flechaEnOrbita = false;
  },

  // Vibración amortiguada de frenazo brusco (animación 3).
  temblor(duracion = 0.45) {
    const est = this.estado;
    const centro = est.anguloRueda;
    const A = 0.014;   // amplitud inicial (radianes ≈ 0.8°)
    const k = 7;       // amortiguación (más alto = muere antes)
    const w = 36;      // frecuencia del meneo
    return this._animarT(duracion, t => {
      est.anguloRueda = centro + A * Math.exp(-k * t) * Math.sin(w * t);
    });
  },

  /* ══ ANIMACIÓN 11 · GIRO SIN FIN (el motor dañado) ══════════════
     La rueda NO para: gira a la velocidad que diga la coreografía —
     que hoy la SUBE PROGRESIVAMENTE (se pidió: nada de "de repente")
     hasta la velocidad de locura, y ahí se queda. La animación lo
     deja girar el rato que quiera, pone el AVISO en la pista de
     arriba (SIN alerta de navegador) y espera el TOQUE DE LA BOLITA
     NEGRA del profesor (intervención de usuario) para frenar.
     velFn(t) devuelve la velocidad angular (rad/s, horaria) en el
     instante t (s). opts (opcional):
       · tics: 'siempre' → el tic de las clavijas suena TAMBIÉN a alta
         velocidad (por defecto solo suena cuando aún se "lee": a
         velocidad de locura el TURBO ya cuenta la historia). Lo piden
         los FRENOS DAÑADOS (animación 18): su velocidad constante
         "de ruleta que no acaba" va mejor contada con tic-tac.
       · tironcitos: false → sin los golpecitos de la avería (los
         frenos dañados no los quieren: nada está roto, solo no hay
         frenos).
     El dt del bucle interno está LIMITADO: aunque la pestaña se
     congele un rato, al volver NO hay saltos. */
  girarRoto(velFn, opts) {
    const est = this.estado;
    const ticsSiempre = !!(opts && opts.tics === 'siempre');
    const conTironcitos = !(opts && opts.tironcitos === false);
    const ctrl = { t: 0, fin: false, proxGolpe: 0.6, idxPrevio: null };
    const detener = () => {
      if (ctrl.fin) return Promise.resolve();
      ctrl.fin = true;
      return Promise.resolve();
    };
    const paso = ahora => {
      if (ctrl.fin) return;
      if (ctrl.t0 == null) ctrl.t0 = ahora;
      const dt = Math.min(0.05, (ahora - ctrl.tPrev) / 1000) || 0.016;
      ctrl.tPrev = ahora;
      ctrl.t = (ahora - ctrl.t0) / 1000;
      const v = Math.max(0.05, velFn(ctrl.t) || 0);   // nunca del todo parada
      est.anguloRueda += v * dt;
      est.velAng = v;
      // tironcitos sonoros de la avería que agarra y resbala
      if (conTironcitos && ctrl.t >= ctrl.proxGolpe) {
        ctrl.proxGolpe = ctrl.t + azar(0.6, 1.15);
        Sonido.golpe(0.22);
      }
      // el tic de las clavijas: SOLO mientras la rueda todavía se
      // "lee" (a velocidad de locura el TURBO de aire y motor ya
      // cuenta la historia, y el tic sería un matraqueo sin sentido)…
      // salvo que la animación pida 'siempre' (los FRENOS DAÑADOS:
      // su velocidad constante no es dramática y el tic-tac rápido
      // le queda perfecto — es la gracia: una ruleta que no acaba).
      const idx = this.indiceBajoFlecha();
      // (y solo en fronteras de verdad: dentro del gajo gigante no hay
      //  clavija — la tira fusionada no suena al cruzarse a sí misma)
      if ((ticsSiempre || v < TAU * 1.05) && ctrl.idxPrevio != null &&
          idx !== ctrl.idxPrevio && this._fronteraReal(idx, ctrl.idxPrevio)) {
        Sonido.tic();
      }
      ctrl.idxPrevio = idx;
      requestAnimationFrame(paso);
    };
    ctrl.t0 = ctrl.tPrev = performance.now();
    requestAnimationFrame(paso);
    return { detener };
  },

  // Frenada MUERTA (animación 13 — se acelera en vez de frenar): de
  // toda velocidad a CERO en un instante, sin estelas de desenfoque.
  // Golpe seco + vibración de impacto. (Lo llama js/animations.js
  // justo después de la fase que llega al ganador a toda marcha.)
  async frenarEnSeco(temblorSeg = 0.5) {
    this.estado.velAng = 0;   // sin estelas: la parada es REAL, en seco
    Sonido.golpe(1);          // ¡el muro!
    await this.temblor(temblorSeg);
  },

  /* ══ EL FRENAZO DE AUTO (animación 11 — el motor dañado) ═══════
     Herramientas de la nueva parada: la rueda para JUSTO DONDE LA
     PERSONA HAGA EL CLIC. sectorBajoPunto() mira qué sector está bajo
     ese punto del lienzo EN ESE INSTANTE (el que estaba bajo el dedo);
     derraparHasta() lo lleva hasta la flecha derrapando como un auto
     con los neumáticos trabados (desaceleración constante: la curva
     cuadrática de un derrape de verdad) con su chirrido dramático. */
  sectorBajoPunto(x, y) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return null;
    const dx = x - est.cx, dy = y - est.cy;
    if (Math.hypot(dx, dy) < 1.5) return null;   // clic clavado en el buje: al azar
    const s = TAU / n;
    const pos = norm(Math.atan2(dy, dx) - est.anguloRueda);
    const i = Math.floor(pos / s) % n;
    let u = pos / s - i;
    u = Math.max(0.08, Math.min(0.92, u));      // sin rozar la frontera
    return { indice: i, u };
  },

  // El derrape: gira hasta dejar (indice + u) bajo la flecha, con un
  // patinazo de entre media vuelta y vuelta y media. "velocidad" es la
  // velocidad angular REAL en el instante del clic (para que la física
  // del derrape encaje con lo que venía corriendo). Devuelve las
  // vueltas que derrapó (por si la animación quiere saberlo).
  derraparHasta({ indice, u = 0.5, velocidad = null }) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return Promise.resolve(0);
    const s = TAU / n;
    const hasta = ANGULO_FLECHA_TOPE - (indice + u) * s;
    const desde = est.anguloRueda;
    let base = norm(hasta - desde);
    if (base < TAU * 0.52) base += TAU;   // mínimo: media vuelta de patinazo
    // la duración sale de la física del derrape (desaceleración
    // constante): t = 2·distancia / velocidad inicial
    const v0 = Math.max(TAU * 1.4, velocidad || est.velAng || TAU * 2);
    const dur = Math.max(0.38, Math.min(1.05, (2 * base) / v0));
    Sonido.frenazoCarro(dur);   // ¡el chirrido dramático del carro!
    return this._animar({
      clave: 'anguloRueda', desde, hasta: desde + base,
      duracion: dur,
      suavizado: salidaPotencia(2),   // frenada constante: patina y para
    }).then(() => base / TAU);
  },

  /* ══ LA PARADA TRANQUILA (herramienta libre — el freno SUAVE) ════
     La versión SIN drama del motor dañado: al tocar la bolita negra,
     la rueda frena como frenaría un giro normal — despacito, con sus
     tics espaciándose solos — y se detiene sobre el sector que estaba
     bajo la flecha en el instante del toque. Nada de derrapes: el
     airecito amable del freno y listo. */
  frenarSuaveHasta({ indice, u = 0.5 }) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return Promise.resolve(0);
    const s = TAU / n;
    const hasta = ANGULO_FLECHA_TOPE - (indice + u) * s;
    const desde = est.anguloRueda;
    let base = norm(hasta - desde);
    if (base < TAU * 0.55) base += TAU;   // mínimo: media vuelta de frenada
    Sonido.frenoSuave(1.1);   // el airecito del freno aplicándose, sin drama
    return this._animar({
      clave: 'anguloRueda', desde, hasta: desde + base,
      duracion: 1.75,                       // frena despacito, como un giro normal
      suavizado: SUAV.salidaCuartica,       // nada brusco: la calma misma
    }).then(() => base / TAU);
  },

  /* ══ EL HUMO DE LA AVERÍA (animación 11) ═══
     Mientras la rueda "gira y no para", salen volutas de humo y
     CHISPAS — así se VE de un vistazo que hubo una avería, tal como
     se pidió. Las partículas viven en el canvas superpuesto (el del
     polvo) con su propia gravedad y crecimiento, y mueren solas.
     EL ORIGEN:
       · 'buje'    (animación 11, el motor dañado): del CENTRO de la
                    rueda — el motor quemándose — y del roce de la
                    flecha contra el borde.
       · 'flecha'  (herramienta libre): del TRIÁNGULO selector — si
                    algún día la avería vive en el selector, ahí sale
                    el humo.
     Se puede apagar con CONFIG.freno.humo = false. */
  humoIniciar(origen) {
    this.estado.humo = { t: 0, proxHumo: 0, proxChispa: 0.35, origen: origen || 'buje' };
  },
  humoParar() { this.estado.humo = null; },   // la cola muere sola

  _pasoHumo(dt) {
    const est = this.estado;
    const h = est.humo;
    if (!h) return;
    h.t += dt;
    const dens = Math.min(1, h.t / 1.4);   // la avería "coge" poco a poco
    const enFlecha = h.origen === 'flecha';   // ¿la avería vive en el selector?
    // el foco del humo cuando vive en el selector: la PUNTA del triángulo
    const fx = est.cx, fy = est.cy - est.r * 0.90;

    // — volutas de humo (del buje: es el motor el que está dañado) —
    h.proxHumo -= dt;
    if (h.proxHumo <= 0) {
      h.proxHumo = azar(0.05, 0.13) / Math.max(0.25, dens);
      const ang = azar(0, TAU);
      const ox = enFlecha ? fx + azar(-7, 7) : est.cx + Math.cos(ang) * azar(0, 5);
      const oy = enFlecha ? fy + azar(-4, 3) : est.cy + Math.sin(ang) * azar(0, 5);
      this._particulas.push({
        x: ox, y: oy,
        color: Math.random() < 0.5 ? 'rgba(122, 122, 130, 0.55)' : 'rgba(88, 88, 96, 0.6)',
        vx: azar(-24, 26) + 16,      // una brizna de brisa hacia la derecha
        vy: azar(-50, -24),          // el humo caliente SUBE
        vida: azar(1.1, 1.9),
        edad: 0,
        r: azar(5, 9),
        alpha: azar(0.4, 0.6),
        g: -7,                       // gravedad propia: flotando (sube)
        crece: 2.4,                  // y se va haciendo bola
      });
    }

    // — chispas: del buje… y del roce de la flecha contra el borde —
    //   (si la avería vive en el selector —origen 'flecha'—, TODAS
    //   salen de la punta del triángulo, que es quien sufre el roce)
    h.proxChispa -= dt;
    if (h.proxChispa <= 0) {
      h.proxChispa = azar(0.26, 0.75) / Math.max(0.3, dens);
      const desdeFlecha = enFlecha ? true : Math.random() < 0.65;
      for (let k = 0; k < 3; k++) {
        const ang = desdeFlecha
          ? azar(-Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55)   // bajo la flecha
          : azar(0, TAU);                                    // alrededor del buje
        const v = azar(130, 320);
        const ox = desdeFlecha ? est.cx + Math.cos(ang) * est.r : est.cx + Math.cos(ang) * 5;
        const oy = desdeFlecha ? est.cy + Math.sin(ang) * est.r : est.cy + Math.sin(ang) * 5;
        this._particulas.push({
          x: ox, y: oy,
          color: Math.random() < 0.55 ? '#ffd166' : '#ff9a3c',
          vx: Math.cos(ang) * v,
          vy: Math.sin(ang) * v - 50,
          vida: azar(0.3, 0.6),
          edad: 0,
          r: azar(1.3, 2.3),
          alpha: 0.95,
          g: 950,                     // las chispas caen con gravedad
        });
      }
    }
  },

  /* ══ EL ARRANQUE MANUAL (animación 19 — el abanico averiado) ═════
     "Ayúdala a que arranque girándole las aspas": la rueda penando
     MUY lento (el motor dañado apenas la mueve, con su vaivén de
     eje trabado)… y AGARRABLE: el profesor la agarra con el ratón o
     el dedo y la GIRA A MANO — la rueda sigue el gesto al grado.
     Al soltarla:
       · con fuerza  (≥ umbral)  → el motor AGARRA: la promesa se
         cumple con { velocidad, sentido } y la coreografía sigue.
       · flojo        (< umbral)  → la rueda se va muriendo otra vez
         a su marchita (la velocidad de la mano se relaja hacia el
         crawl) y puede volver a intentarse cuantas veces quiera.
     Los TICS siguen sonando mientras la rueda se lee, el cursor
     promete la mano (grab/grabbing) y la velocidad real alimenta el
     SONIDO DEL ABANICO (lo toma el bucle maestro, como el turbo). */
  arranqueManual({ velocidad = Math.PI * 2 * 0.085, umbral = 2.1 } = {}) {
    const est = this.estado;
    if (est.arranque) return est.arranque.promesa;   // ya está activo
    const arr = {
      velObjetivo: velocidad,   // la marchita del motor dañado (rad/s)
      vel: 0,                   // velocidad angular ACTUAL (coge la marchita al empezar)
      umbral,
      fase: 'rastreando',       // 'rastreando' | 'agarrado'
      angPrevio: null,          // ángulo del puntero en el último evento
      tPrevio: null,
      velGesto: 0,              // EMA de la velocidad angular del gesto
      idxPrevio: null,
      promesa: null, resolver: null,
    };
    arr.promesa = new Promise(res => { arr.resolver = res; });
    est.arranque = arr;
    const paso = ahora => {
      const a = est.arranque;
      if (!a || a !== arr) return;              // se canceló o ya arrancó
      const dt = Math.min(0.05, (ahora - (a.tPrevioBucle ?? ahora)) / 1000) || 0.016;
      a.tPrevioBucle = ahora;
      if (a.fase !== 'agarrado') {
        // el motor dañado COGE su marchita poco a poco… y ahí se queda,
        // penando: con su vaivén irregular de eje trabado (el mismo
        // tembleque del abanico dañado de la casa).
        a.vel += (a.velObjetivo - a.vel) * Math.min(1, dt / 0.9);
        const t = ahora / 1000;
        const tembleque = 1 + 0.35 * Math.sin(t * 2.6) * Math.sin(t * 1.17 + 1.1);
        const v = a.vel * tembleque;
        est.anguloRueda += v * dt;
        est.velAng = v;
      }
      // el tic de las clavijas mientras la rueda se lee (a la marchita
      // suena espaciadito: da lástima — y mientras la giran a mano,
      // como el giro de siempre)
      const idx = this.indiceBajoFlecha();
      if (a.idxPrevio != null && idx !== a.idxPrevio && est.velAng < TAU * 1.05) {
        Sonido.tic();
      }
      a.idxPrevio = idx;
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    return arr.promesa;
  },

  // Corta el arranque manual (desmontaje de emergencia): ninguna
  // promesa queda colgada ni el cursor prometiendo una mano que ya no hay.
  arranqueCancelar() {
    const a = this.estado.arranque;
    if (!a) return;
    this.estado.arranque = null;
    if (a.resolver) a.resolver(null);   // la coreografía ya no está esperando
    this._canvas.style.cursor = '';
  },

  // El puntero del ARRANQUE MANUAL (los mismos listeners del dardo):
  // agarrar la rueda entera (las aspas), arrastrarla en redondo y
  // soltarla. La velocidad del gesto (EMA) decide si el motor agarra.
  _arrastrePuntero(e, tipo) {
    const a = this.estado.arranque;
    if (!a) return;
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const est = this.estado;
    const dentro = Math.hypot(x - est.cx, y - est.cy) <= est.r + 30;

    if (tipo === 'bajar') {
      if (dentro) {
        a.fase = 'agarrado';
        a.angPrevio = Math.atan2(y - est.cy, x - est.cx);
        a.tPrevio = performance.now();
        a.velGesto = 0;
        a.vel = 0;   // la marchita se rinde: la mano manda ahora
        try { this._canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        this._canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
      return;
    }

    if (tipo === 'mover') {
      if (a.fase === 'agarrado') {
        const ang = Math.atan2(y - est.cy, x - est.cx);
        let d = ang - a.angPrevio;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        const ahora = performance.now();
        const dt = Math.max(0.008, (ahora - a.tPrevio) / 1000);
        a.velGesto = a.velGesto * 0.72 + (d / dt) * 0.28;   // EMA del gesto
        est.anguloRueda += d;    // la rueda sigue a la mano, al grado
        est.velAng = Math.abs(a.velGesto);
        a.angPrevio = ang;
        a.tPrevio = ahora;
        if (e.cancelable) e.preventDefault();
      } else {
        // el cursor promete que se puede agarrar
        this._canvas.style.cursor = dentro ? 'grab' : '';
      }
      return;
    }

    if (tipo === 'subir' && a.fase === 'agarrado') {
      a.fase = 'rastreando';
      this._canvas.style.cursor = '';
      // ¿la tenía QUIETA al soltarla? (lleva un ratito sin mover el
      // ratón): soltar no lanza nada — la velocidad del gesto ya murió.
      const quieta = a.tPrevio != null && (performance.now() - a.tPrevio) > 260;
      const v = quieta ? 0 : a.velGesto;   // velocidad angular del gesto
      if (Math.abs(v) >= a.umbral) {
        // ¡EL MOTOR AGARRÓ! la promesa se cumple con la velocidad y el
        // sentido del gesto — la coreografía continúa desde ahí.
        est.arranque = null;
        est.velAng = Math.abs(v);
        a.resolver({ velocidad: Math.abs(v), sentido: v >= 0 ? 1 : -1 });
      } else {
        // flojo: la rueda se muere otra vez hacia su marchita (puede
        // volver a intentarlo: sigue agarrable). Un toque suave para
        // que se note que no agarró.
        Sonido.golpe(0.16);
        a.vel = Math.max(0, Math.abs(v) * 0.6);
        a.velGesto = 0;
      }
    }
  },

  // ── INCLINACIÓN DE LA FLECHA ──────────────────────────────────────
  // Inclina la flecha hasta "hasta" radianes en "duracion" segundos.
  // vibracion = temblor nervioso que crece con el empuje (tambaleo de
  // la lengüeta apoyada en la clavija: el corazón de la animación 3).
  flexionar({ hasta, duracion = 0.5, suavizado = SUAV.salidaCubica, vibracion = 0 }) {
    const est = this.estado;
    const desde = est.flexion;
    return this._animarT(duracion, t => {
      const base = desde + (hasta - desde) * suavizado(Math.min(1, t));
      est.flexion = base + vibracion * t * Math.sin(t * 46);
    });
  },

  // La flecha se suelta de la clavija: rebote elástico y vuelve a 0.
  soltarFlecha() {
    const est = this.estado;
    const excesiva = est.flexion;
    return this.flexionar({
      hasta: -excesiva * 0.55,   // rebasa al lado contrario (latigazo)
      duracion: 0.16,
      suavizado: SUAV.salidaQuintica,
    }).then(() => this.flexionar({
      hasta: 0,                  // y oscila hasta quedarse quieta
      duracion: 0.55,
      suavizado: SUAV.elastica,
    }));
  },

  // Hace destellar el segmento "indice" durante "duracion" segundos.
  async resaltar(indice, duracion = 1.1) {
    this.estado.resaltadoIdx = indice;
    await new Promise(r => setTimeout(r, duracion * 1000));
    if (this.estado.resaltadoIdx === indice) this.estado.resaltadoIdx = null;
  },

  // Resaltado fijo (lo mantiene la tarjeta del ganador).
  fijarResaltado(indice) { this.estado.resaltadoIdx = indice; },

  // Flecha invisible (tras caer, animación 8). mostrarFlecha() corta
  // también cualquier caída que hubiera quedado a medias.
  ocultarFlecha() { this.estado.flechaOculta = true; },
  mostrarFlecha() {
    this.estado.flechaOculta = false;
    this.estado.flechaCayendo = false;
    this._caida = null;
  },

  /* ══ ANIMACIÓN 14 · LOS SELECTORES MÚLTIPLES ══════════════════
     El selector se MULTIPLICA: uno por cada nombre, repartidos alrededor
     de la rueda (el de arriba es el de siempre; los demás son clones
     que apuntan igual). La rueda gira normal… y durante la frenada los
     clones SE VAN CAIYENDO DE UNO EN UNO con la física de la animación
     8 (gravedad, volteretas, rebotes contra el borde) hasta que SOLO
     queda el marcador del ganador, que LATE de alegría. */
  multiplicarSelectores() {
    const est = this.estado;
    const n = est.lista.length;
    if (n <= 1) { est.selectoresExtras = null; return null; }
    // N selectores en total: el de ARRIBA (el de siempre) + (n-1) clones
    // repartidos en el resto del borde, SIN solaparse con él. Los clones
    // NACEN uno a uno desde el buje (escalera de ~55 ms) — ya no
    // "estaban ahí" sin más: se les VE ENTRAR (se pidió así).
    const extra = [];
    for (let i = 1; i < n; i++) {
      extra.push({
        ang: norm(ANGULO_FLECHA_TOPE + i * (TAU / n)),
        cayo: false,
        nace: -i * 0.055,   // negativo = aún le toca esperar su turno
      });
    }
    est.selectoresExtras = extra;
    est.escalaFlecha = 1;
    return n;   // nº TOTAL de selectores (el de arriba + los clones)
  },

  // El nacimiento escalonado de los clones (animación 14): cada uno
  // tarda 0.30 s en salir del buje hacia su puesto (con un pequeño
  // rebote de llegada que dibuja render). El "pop" suena justo cuando
  // empieza a asomar. (Lo llama el bucle maestro.)
  _pasoNacerSelectores(dt) {
    const sel = this.estado.selectoresExtras;
    if (!sel) return;
    for (const s of sel) {
      if (s.nace == null || s.nace >= 1) continue;
      const antes = s.nace;
      s.nace += dt / 0.30;
      if (antes < 0 && s.nace >= 0) Sonido.pop();
    }
  },

  // El ángulo del borde en el que vive el selector k (k = 0 es el de
  // arriba, el de siempre; 1..n-1, los clones). Lo usa la animación 14
  // para aterrizar al ganador bajo el SUPERVIVIENTE — que hoy se sortea
  // al azar y puede ser CUALQUIERA de los n (hasta el de arriba cae).
  anguloSelector(k) {
    const n = Math.max(1, this.estado.lista.length);
    return norm(ANGULO_FLECHA_TOPE + k * (TAU / n));
  },

  // El selector k (de los clones) se desprende y se cae con física.
  // (El sonido del "despegue" lo pone la animación: pop + whoosh.)
  caerSelector(k) {
    const est = this.estado;
    const sel = est.selectoresExtras;
    if (!sel || !sel[k] || sel[k].cayo) return;
    sel[k].cayo = true;
    const g = this._geoFlecha();
    const ang = sel[k].ang;
    const lado = Math.random() < 0.5 ? -1 : 1;   // cae hacia un lado al azar
    this._caidasSel.push({
      x: est.cx + Math.cos(ang) * g.pivote,   // pivote (base del triángulo)
      y: est.cy + Math.sin(ang) * g.pivote,
      rot: ang + Math.PI / 2,
      vx: lado * azar(45, 95),                // el empujón que lo descuelga
      vy: azar(-30, -6),
      w: lado * azar(2.0, 3.4),               // volteretas: se tambalea YA
      rebotes: 0, total: 0, volMult: 0.4,     // golpes bajitos: caen en banda
    });
  },

  // El superviviente LATE (dos latidos de alegría al quedar solo).
  latidoFlecha() {
    const est = this.estado;
    return this._animarT(0.9, t => {
      // sin² sobre un ciclo y medio: latido… latido… y se aquieta
      est.escalaFlecha = 1 + 0.17 * Math.pow(Math.sin(t * Math.PI * 2.5), 2)
                              * (1 - t * 0.4);
    }).then(() => { est.escalaFlecha = 1; });
  },

  // Vuelta a la normalidad de la animación 14 (clones fuera).
  finSelectores() {
    this.estado.selectoresExtras = null;
    this._caidasSel.length = 0;
    this.estado.escalaFlecha = 1;
  },

  /* ═══ LA CAÍDA DE LA FLECHA (animación 8 — el chasquido) ═════════
     En vez de desaparecer, la flecha SE CAE con física de verdad. El
     sólido se simplifica a TRES puntos (la punta y las dos esquinas de
     la base) que chocan contra el círculo de la rueda: los impulsos
     descentrados generan las volteretas solas. Empieza apoyada arriba,
     se tambalea hacia un lado, cae acelerando por la gravedad, bota
     contra el borde y sale del cuadro dando tumbos. La trayectoria no
     es un deslizamiento recto: sale sola de la física. */
  caerFlecha(opts = null) {
    const est = this.estado;
    if (est.flechaOculta || est.flechaCayendo) return Promise.resolve();
    const g = this._geoFlecha();
    const ang = est.flechaEnOrbita ? est.anguloFlecha : ANGULO_FLECHA_TOPE;
    est.flechaEnOrbita = false;
    const lado = Math.random() < 0.5 ? -1 : 1;  // cae hacia un lado al azar
    const c = {
      x: est.cx + Math.cos(ang) * g.pivote,   // pivote (base del triángulo)
      y: est.cy + Math.sin(ang) * g.pivote,
      rot: ang + Math.PI / 2,                 // orientación inicial (punta adentro)
      vx: lado * azar(55, 110),               // el empujón que la descuelga
      vy: azar(-28, -8),                      // saltito al desprenderse
      w: lado * azar(2.2, 3.6),               // volteretas: se tambalea YA
      rebotes: 0,
    };
    // "opts" deja MANDAR el empujón inicial (la animación 18: la bolita
    // le da un PUÑETAZO caricaturesco y el triángulo sale VOLANDO de
    // verdad, disparado hacia fuera).
    if (opts) {
      if (opts.vx != null) c.vx = opts.vx;
      if (opts.vy != null) c.vy = opts.vy;
      if (opts.w != null) c.w = opts.w;
    }
    est.flechaCayendo = true;
    this._caida = c;
    return new Promise(resolver => {
      let tPrevio = null, total = 0;
      const paso = ahora => {
        if (tPrevio == null) tPrevio = ahora;
        const dt = Math.min(0.032, (ahora - tPrevio) / 1000);
        tPrevio = ahora;
        total += dt;
        this._pasoCaida(dt);
        // ¿Ya salió del cuadro (o se demora demasiado)? → se acabó.
        // (El "c.y < -140" es para los lanzamientos hacia ARRIBA — el
        //  puñetazo de la bolita, animación 18 —: sale por el techo.)
        const fuera = c.y > est.tam + 90 || c.y < -140 || c.x < -90 ||
                      c.x > est.tam + 90 || total > 2.6;
        if (fuera) {
          est.flechaCayendo = false;
          est.flechaOculta = true;      // a partir de aquí no se dibuja
          this._caida = null;
          resolver();
          return;
        }
        requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  },

  // Un paso de la física de la caída (lo llama el bucle de caerFlecha).
  _pasoCaida(dt) {
    if (this._caida) this._pasoCuerpoTriangulo(this._caida, dt);
  },

  // La MISMA física, pero para cualquier cuerpo-triángulo que caiga:
  // la flecha de la animación 8 y cada SELECTOR de la animación 14.
  // El sólido se simplifica a TRES puntos (la punta y las dos esquinas
  // de la base) que chocan contra el círculo de la rueda: los impulsos
  // descentrados generan las volteretas solas. "volMult" baja el
  // volumen de los golpes (los selectores caen EN BANDADA: a tope,
  // sordera).
  _pasoCuerpoTriangulo(c, dt) {
    const est = this.estado;
    const g = this._geoFlecha();
    const G = 1750;                       // gravedad (px/s²): un pelín exagerada
    c.vy += G * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.rot += c.w * dt;
    if (c.rebotes >= 5) return;           // tras 5 golpes ya vuela libre

    const co = Math.cos(c.rot), si = Math.sin(c.rot);
    // Los tres puntos del triángulo, en coordenadas del mundo:
    const puntos = [
      [c.x - g.L * si, c.y + g.L * co],   // la punta
      [c.x - g.H * co, c.y - g.H * si],   // esquina izquierda de la base
      [c.x + g.H * co, c.y + g.H * si],   // esquina derecha de la base
    ];
    for (const [px, py] of puntos) {
      const dx = px - est.cx, dyy = py - est.cy;
      const d = Math.hypot(dx, dyy) || 1;
      if (d >= est.r + 1) continue;       // este punto no toca el borde
      const nx = dx / d, ny = dyy / d;    // normal hacia fuera
      // Se saca el sólido del círculo poquito a poco (máx 8 px por
      // paso): el despegue se DESLIZA fuera, no teletransporta.
      const pen = Math.min(8, est.r + 1 - d);
      c.x += nx * pen;
      c.y += ny * pen;
      // Velocidad de ese punto (la del cuerpo + la de la rotación):
      const ax = px - c.x, ay = py - c.y;
      const vpx = c.vx - c.w * ay;
      const vpy = c.vy + c.w * ax;
      const vn = vpx * nx + vpy * ny;
      if (vn > 0) continue;               // ya se aleja: sin impulso
      const e = 0.32;                     // rebote: pierde el 68 %
      const Jx = -(1 + e) * vn * nx;      // impulso normal…
      const Jy = -(1 + e) * vn * ny;
      c.vx += Jx;
      c.vy += Jy;
      // Un poco de rozamiento: lo que choca pierde algo de velocidad.
      c.vx *= 0.94;
      c.vy *= 0.94;
      // El golpe es descentrado → voltereta (con tope, para no marear):
      const I = Math.max(300, g.L * g.L * 1.4);  // inercia "de mentira"
      let dw = (ax * Jy - ay * Jx) / I;
      if (dw > 6) dw = 6; else if (dw < -6) dw = -6;
      c.w = Math.max(-9, Math.min(9, c.w + dw));
      c.rebotes++;
      Sonido.golpe(Math.min(1, Math.abs(vn) / 600) * (c.volMult != null ? c.volMult : 1)); // "tok"
      break;                             // un solo golpe por paso
    }
  },

  // La física de TODOS los selectores que van cayendo a la vez
  // (animación 14): cada uno es un _pasoCuerpoTriangulo; cuando ya
  // salieron del cuadro (o se demoran demasiado) se retiran.
  // (Lo llama el bucle maestro _bucle.)
  _pasoCaidasSel(dt) {
    const v = this._caidasSel;
    if (!v.length) return;
    const est = this.estado;
    for (let k = v.length - 1; k >= 0; k--) {
      const c = v[k];
      c.total += dt;
      this._pasoCuerpoTriangulo(c, dt);
      const fuera = c.y > est.tam + 90 || c.x < -90 ||
                    c.x > est.tam + 90 || c.total > 2.6;
      if (fuera) v.splice(k, 1);
    }
  },


  /* ── Geometría de la flecha y las clavijas ───────────────────────── */

  // Geometría del TRIÁNGULO INVERTIDO (todo sale de js/config.js:
  // tamanoFlecha, anchoFlecha, profundidadFlecha). El multiplicador
  // extra est.escalaFlecha (animación 14) hace LATEC al superviviente.
  // Y cuando una intervención ESPERA el clic en la FLECHA (animación
  // 18, frenos dañados: "presiona la flecha"), la flecha LATE suavecita
  // por sí sola — como el anillo dorado del buje — para llamar al
  // dedo del profesor.
  _geoFlecha() {
    const est = this.estado;
    let m = CONFIG.tamanoFlecha * (est.escalaFlecha || 1);
    if (est.flechaLlamando) {
      m *= 1 + 0.09 * Math.abs(Math.sin(performance.now() / 280));
    }
    const pivote = est.r + 22 * m;             // centro de la base, sobre el borde
    const prof = CONFIG.profundidadFlecha * m; // cuánto entra la punta
    const tipRad = est.r - prof;
    return {
      pivote,
      tipRad,
      L: pivote - tipRad,                     // altura del triángulo
      H: CONFIG.anchoFlecha * m,               // semi-ancho de la base
    };
  },

  // Radio (desde el centro) donde viven las clavijas: EN el aro si hay
  // aro, o pegadas al borde de los segmentos si no lo hay (como ahora).
  _radioClavijas() {
    const est = this.estado;
    const n = Math.max(1, est.lista.length);
    const s = TAU / n;
    const radioClavija = Math.max(2.4, Math.min(4.4, s * est.r * 0.045));
    return CONFIG.grosorAro > 0
      ? est.r + CONFIG.grosorAro / 2
      : est.r - radioClavija - 1.5;
  },

  // Distancia angular (radianes) que la rueda avanza desde "la clavija
  // bajo el EJE de la flecha" (la punta EN EL MEDIO de dos nombres)
  // hasta que el perno llega a rozar el FLANCO del triángulo. La
  // animación 3 (tensión decisiva) aterriza justo en el MEDIO y sus
  // empujones se miden con esto: la clavija, como mucho, asoma por el
  // flanco… y jamás llega a cruzarlo.
  contactoClavija() {
    const est = this.estado;
    const n = Math.max(1, est.lista.length);
    const s = TAU / n;
    const rp = this._radioClavijas();
    const radioClavija = Math.max(2.4, Math.min(4.4, s * est.r * 0.045));
    const g = this._geoFlecha();
    if (rp <= g.tipRad + 2) return Math.min(s * 0.4, 0.03); // rueda minúscula
    // Semi-ancho del triángulo a la altura del perno:
    const semiAncho = g.H * (rp - g.tipRad) / g.L;
    // Contacto = perno pegado al flanco: su centro está a
    // (semiAncho + radio del perno) píxeles del eje, en tangente.
    return Math.min(s * 0.45, (semiAncho + radioClavija) / rp);
  },


  /* ══════════════════════════════════════════════════════════════════
     POLVO DE LA RUEDA (animación 8 — estilo Infinity War)
     Desintegración TOTAL: cada segmento perdedor se convierte en
     polvo de verdad, grano a grano, del borde al centro. La malla de
     granos cubre TODO el segmento (con solapamiento), así que no
     quedan "hoyitos": desaparece entero, salvo el del elegido.
     ══════════════════════════════════════════════════════════════════ */

  // Se llama ANTES de iniciarPolvo(): fotografía los píxeles de la
  // rueda parada y reparte los granos.
  prepararPolvo(ganador) {
    const est = this.estado;
    const n = est.lista.length;
    if (n === 0) { est.polvo = null; return; }
    const s = TAU / n;
    const r = est.r;
    // el eje central pequeño, del mismo tamaño que el que dibuja render()
    const hub = Math.min(28, r * 0.14);
    const cv = this._canvas;
    const dpr = cv.width / Math.max(1, est.tam);

    // FOTO de píxeles de la rueda (una sola lectura, con los nombres
    // y colores tal cual están). De aquí sale el color de cada grano.
    let foto = null;
    try { foto = this._ctx.getImageData(0, 0, cv.width, cv.height).data; }
    catch (e) { foto = null; }            // canvas protegido: colores planos

    const colorEn = (x, y, idx) => {
      if (!foto) return est.colores[idx] || '#cfc0ab';
      const gx = Math.min(cv.width - 1, Math.max(0, Math.round(x * dpr)));
      const gy = Math.min(cv.height - 1, Math.max(0, Math.round(y * dpr)));
      const i = (gy * cv.width + gx) * 4;
      return `rgb(${foto[i]}, ${foto[i + 1]}, ${foto[i + 2]})`;
    };

    // "Tamaño de grano": la malla se adapta al tamaño de la rueda.
    const paso = Math.max(3.5, Math.min(6, CONFIG.polvoPaso * (r / 206)));
    const granos = [];
    const perdedores = [];
    for (let i = 0; i < n; i++) if (i !== ganador) perdedores.push(i);

    // Radio de las clavijas: la malla se estira hasta ellas para que
    // los pernos entre dos perdedores también se hagan polvo.
    const rp = this._radioClavijas();
    const ext = (paso + 2) / rp;          // cuánto ángulo estirar al vecino

    for (const i of perdedores) {
      const a0 = est.anguloRueda + i * s;
      // La ola: cada segmento empieza un poquito después que el
      // anterior (así la desintegración recorre la rueda en círculo).
      const ret = (perdedores.indexOf(i) + 1) * (0.52 * CONFIG.duracionPolvo / n);
      const durSeg = Math.max(0.35, CONFIG.duracionPolvo - ret);

      // Extensión angular solo hacia vecinos que TAMBIÉN se deshacen:
      // al lado del ganador no se pisa ni un píxel (su terreno se
      // respeta, y con él sus clavijas).
      const izq = ((i - 1 + n) % n !== ganador) ? ext : 0;
      const der = ((i + 1) % n !== ganador) ? ext : 0;

      const seg = [];
      for (let R = hub + 4; R < r + 2; R += paso * 0.85) {
        const pasoAng = (paso * 0.85) / Math.max(24, R);
        for (let a = a0 - izq; a <= a0 + s + der; a += pasoAng) {
          const Rj = R + azar(-paso * 0.2, paso * 0.2);
          const aj = a + azar(-pasoAng * 0.25, pasoAng * 0.25);
          seg.push({
            x: est.cx + Math.cos(aj) * Rj,
            y: est.cy + Math.sin(aj) * Rj,
            rr: Rj,                          // radio (para ordenar)
            rad: paso * azar(0.95, 1.05),    // radio de borrado (≥ paso/2·√2 → cubre esquinas)
            seg: i,
          });
        }
      }
      // Orden: del BORDE EXTERIOR hacia el centro, como se deshace de verdad.
      seg.sort((p, q) => q.rr - p.rr);
      seg.forEach((g, k) => {
        g.t = ret + (k / seg.length) * durSeg + azar(0, 0.05);
        g.color = colorEn(g.x, g.y, i);
      });
      granos.push(...seg);
    }

    // Un solo montón ordenado por tiempo: borrar es avanzar un índice.
    granos.sort((a, b) => a.t - b.t);
    est.polvo = { ganador, granos, idx: 0, activo: false };
  },

  // Arranca la desintegración. Devuelve una promesa que se resuelve
  // cuando la rueda ya está del todo en polvo y no queda partícula
  // viva. Mientras dura, el canvas NO se redibuja (ver _bucle).
  iniciarPolvo(duracionSeg = CONFIG.duracionPolvo) {
    const est = this.estado;
    const polvo = est.polvo;
    if (!polvo) return Promise.resolve();
    polvo.activo = true;
    this._particulas = [];
    const c = this._ctx;
    const MAX_VIVAS = 450;   // techo de partículas vivas (rendimiento)

    return new Promise(resolver => {
      let tPrevio = null;
      const paso = ahora => {
        if (tPrevio == null) { tPrevio = ahora; }
        const t = (ahora - polvo.t0) / 1000;
        const dt = Math.min(0.05, (ahora - tPrevio) / 1000);
        tPrevio = ahora;

        // 1) Soltar todos los granos cuyo tiempo llegó: cada uno se
        //    BORRA del canvas (destination-out) y a veces parir una
        //    partícula con el color del píxel que acababa de ocupar.
        c.save();
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000';
        while (polvo.idx < polvo.granos.length && polvo.granos[polvo.idx].t <= t) {
          const g = polvo.granos[polvo.idx++];
          c.beginPath();
          c.arc(g.x, g.y, g.rad, 0, TAU);
          c.fill();
          if (polvo.idx % CONFIG.polvoParticulaCada === 0 &&
              this._particulas.length < MAX_VIVAS) {
            this._nacerParticula(g);
          }
        }
        c.restore();

        // 2) Física y pintado de las partículas (canvas superpuesto).
        this._dibujarParticulas(dt);

        // 3) ¿Todo deshecho y sin partículas vivas? → terminado.
        const ultimo = polvo.granos.length
          ? polvo.granos[polvo.granos.length - 1].t : 0;
        if (polvo.idx >= polvo.granos.length && this._particulas.length === 0) {
          resolver();
          return;
        }
        // cinturón de seguridad: nunca más de 6 s de cola
        if (t > ultimo + 6) { resolver(); return; }
        requestAnimationFrame(paso);
      };
      polvo.t0 = performance.now();
      requestAnimationFrame(paso);
    });
  },

  // Una partícula de polvo nace en el punto que un grano acaba de
  // dejar libre, con el color REAL de ese píxel (nombres incluidos).
  _nacerParticula(g) {
    this._particulas.push({
      x: g.x, y: g.y, color: g.color,
      vx: azar(-16, 42),            // deriva hacia arriba-derecha (viento)
      vy: azar(-72, -16),
      vida: azar(0.6, 1.3),
      edad: 0,
      r: azar(1.2, 3.2),
      alpha: azar(0.55, 0.95),
    });
  },

  // Actualiza y pinta las partículas en el canvas superpuesto.
  // Cada partícula puede llevar SU propia gravedad (g: el humo sube,
  // las chispas caen a plomo) y un factor de crecimiento (crece: las
  // volutas se hacen bola; el polvo se deshace).
  _dibujarParticulas(dt) {
    const c = this._ctxPolvo;
    if (!c) return;
    const est = this.estado;
    c.clearRect(0, 0, est.tam, est.tam);
    for (let i = this._particulas.length - 1; i >= 0; i--) {
      const p = this._particulas[i];
      p.edad += dt;
      if (p.edad >= p.vida) { this._particulas.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.g != null ? p.g : 30) * dt;   // gravedad propia del polvo
      p.vx *= 0.995;
      const frac = p.edad / p.vida;
      c.globalAlpha = p.alpha * (1 - frac) * (1 - frac);
      c.fillStyle = p.color;
      c.beginPath();
      const rr = p.crece != null
        ? p.r * (1 + frac * p.crece)                 // humo: cada vez más gordo
        : Math.max(0.4, p.r * (1 - frac * 0.6));     // polvo: se deshace
      c.arc(p.x, p.y, rr, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
  },

  // Al terminar la selección: borra todo rastro del polvo (la rueda se
  // recompone en el siguiente render).
  limpiarPolvo() {
    this.estado.polvo = null;
    this._particulas = [];
    if (this._ctxPolvo) this._ctxPolvo.clearRect(0, 0, this.estado.tam, this.estado.tam);
  },


  /* ── Núcleo de animación por frames ─────────────────────────────── */

  // Mueve estado[clave] de "desde" a "hasta" en "duracion" segundos con la
  // curva "suavizado". Si llega "arranque", la primera fracción del giro
  // coge velocidad desde parada (conArranque, de js/animations.js).
  // Suena el TIC y pega el saltito a la flecha cada vez que una clavija
  // cruza su posición.
  _animar({ clave, desde, hasta, duracion, suavizado, sinTics, arranque = 0 }) {
    const curva = (arranque > 0.02)
      ? conArranque(suavizado, arranque)
      : suavizado;
    const dur = Math.max(1, duracion * 1000);
    return new Promise(resolver => {
      const t0 = performance.now();
      let idxPrevio = null;
      // para estimar la VELOCIDAD angular real (desenfoque/texto, anim. 10)
      let tPrevio = t0, valorPrevio = desde;
      const paso = ahora => {
        // OJO: el reloj de los requestAnimationFrame puede quedar un pelo
        // POR DETRÁS del performance.now() con el que se tomó t0 — el primer
        // frame puede llegar con (ahora - t0) NEGATIVO. Sin el clamp, un t
        // negativo con potencias no enteras (t^2.2 de la voladora…) da NaN:
        // envenenaba velAng para SIEMPRE y la rueda perdía nombres, vuelos
        // y desenfoque (la "rueda invisible" que se reportó). Con el clamp
        // eso no puede pasar: t vive entre 0 y 1.
        const t = Math.max(0, Math.min(1, (ahora - t0) / dur));
        this.estado[clave] = desde + (hasta - desde) * curva(t);
        if (clave === 'anguloRueda') {
          const dtS = Math.max(0.001, (ahora - tPrevio) / 1000);
          let v = Math.abs((this.estado[clave] - valorPrevio) / dtS);
          if (!isFinite(v)) v = 0;              // jamás un NaN en la velocidad
          this.estado.velAng = this.estado.velAng * 0.65 + v * 0.35;
          tPrevio = ahora; valorPrevio = this.estado[clave];
        }
        if (!sinTics) {
          const idx = this.indiceBajoFlecha();
          // solo suena el tic si la frontera cruzada es de VERDAD (las
          // internas del gajo gigante fusionado no existen: no ticnean)
          if (idxPrevio !== null && idx !== idxPrevio && this._fronteraReal(idx, idxPrevio)) {
            this._tic(Math.sign(hasta - desde));
          }
          idxPrevio = idx;
        }
        if (t < 1) requestAnimationFrame(paso);
        else { this.estado[clave] = hasta; resolver(); }
      };
      requestAnimationFrame(paso);
    });
  },

  // Animación con función libre (temblor, flexión…)
  _animarT(duracion, fn) {
    const dur = Math.max(1, duracion * 1000);
    return new Promise(resolver => {
      const t0 = performance.now();
      const paso = ahora => {
        const t = (ahora - t0) / dur;
        if (t >= 1) { fn(1); resolver(); return; }
        fn(t);
        requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  },

  _tic(direccion) {
    const est = this.estado;
    // Herramienta libre: si una coreografía activa "sonidoPernos", el
    // choque del selector con los pernos invisibles suena a PERNO
    // metálico (el clink) en vez del tic de siempre. (Ninguna la
    // usa hoy — queda lista por si se pide.)
    if (est.sonidoPernos) {
      Sonido.pernos();
      return;
    }
    // Solo SUENA: la flecha ya no reacciona con las clavijas (es FIJA,
    // tal como se pidió — el tic es el feedback, no el movimiento).
    Sonido.tic();
  },


  /* ══════════════════════════════════════════════════════════════════
     DIBUJO
     ══════════════════════════════════════════════════════════════════ */
  render() {
    const c = this._ctx, est = this.estado;
    if (!c) return;
    c.clearRect(0, 0, est.tam, est.tam);

    // El juego de los vasos (animación 15) tiene su PROPIA escena —
    // bolitas, vasos y una mesa —: nada de rueda ni flecha aquí.
    if (est.shell) {
      this._dibujarShell(c, est);
      return;
    }

    // La diana y el dardo (animación 17) también: la rueda TRANSFORMADA
    // en una diana clásica al lado derecho, con el dardo encima.
    if (est.diana) {
      this._dibujarDiana(c, est);
      return;
    }

    c.save();
    c.translate(est.cx, est.cy);

    const n = est.lista.length;
    const r = est.r;
    const oscuro = est.tema === 'oscuro';

    if (est.casino) {
      // ── MODO CASINO (animación 9): la rueda transformada ────────
      this._dibujarCasino(c, est);
    } else if (n > 0) {
      const s = TAU / n;
      const ex = this._excluidos;         // segmentos ya volados (anim. 10)
      const difuso = est.velAng > 11;     // desenfoque de movimiento
      const ghosts = difuso ? [-0.82, -0.3, 0.3, 0.82] : [0];
      const desfase = est.velAng / 60;    // rad que corre la rueda por frame

      // LAS UNIDADES de dibujo: las TIRAS de construir() (para la
      // animación 20, el gajo gigante: ranuras contiguas iguales
      // fusionadas en UN segmento). En una rueda normal todas miden 1
      // y esto es EXACTAMENTE el dibujo de siempre.
      const unidades = [];
      for (const run of est.runs) {
        if (run.len > 1) {
          // (si algún pedazo de la tira ya voló —no pasa con la 20, pero
          //  por si acaso— se dibuja ranura a ranura, sin fusionar)
          let volada = false;
          for (let k = 0; k < run.len; k++) if (ex.has(run.ini + k)) { volada = true; break; }
          if (!volada) { unidades.push(run); continue; }
          for (let k = 0; k < run.len; k++) unidades.push({ ini: run.ini + k, len: 1 });
          continue;
        }
        unidades.push(run);
      }

      // Segmentos: a velocidad turbo se dibujan como ESTELAS (difuminado
      // de movimiento: 4 copias semitransparentes desplazadas lo que la
      // rueda avanza por fotograma — se ve MÁS rápido de lo que es).
      for (const u of unidades) {
        if (ex.has(u.ini)) continue;
        const a0 = est.anguloRueda + u.ini * s;
        for (const g of ghosts) {
          c.beginPath(); c.moveTo(0, 0);
          c.arc(0, 0, r, a0 + g * desfase, a0 + g * desfase + u.len * s);
          c.closePath();
          c.globalAlpha = difuso ? 0.4 : 1;
          c.fillStyle = est.colores[u.ini];
          c.fill();
        }
      }
      c.globalAlpha = 1;
      // EN TURBO (difuso): un aro sutil VISIBLE — es giratorio-invariante
      // (no estrobea) — para que la rueda SIGA pareciendo una rueda: sin
      // él, con los nombres desvanecidos y los contornos del color del
      // fondo, solo quedaban UNOS COLORES SUELTOS flotando (se pidió
      // arreglar la animación 10). La maza vuelve a llevar su filete.
      if (difuso) {
        c.beginPath(); c.arc(0, 0, r, 0, TAU);
        c.strokeStyle = oscuro ? 'rgba(232, 236, 245, 0.34)' : 'rgba(36, 43, 58, 0.28)';
        c.lineWidth = 2.4;
        c.stroke();
      }
      if (!difuso) {
        // bordes solo nítidos (con el difuminado estroboscopían):
        // color del FONDO — las separaciones son "negativas" (en el
        // gajo gigante SOLO hay dos bordes: los del gajo entero)
        for (const u of unidades) {
          if (ex.has(u.ini)) continue;
          const a0 = est.anguloRueda + u.ini * s;
          c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, a0, a0 + u.len * s); c.closePath();
          c.strokeStyle = this._bordeSegmentos();
          c.lineWidth = CONFIG.grosorBordeSegmentos;
          c.stroke();
        }
      }

      // Nombres (texto radial, como las ruletas de feria). A tope de
      // velocidad no se leen de todos modos: mejor desvanecerlos.
      if (n <= CONFIG.maxNombresTexto) {
        const alfaTexto = Math.max(0, Math.min(1, (12 - est.velAng) / 4));
        if (alfaTexto > 0.02) {
          const fs = Math.max(9, Math.min(26, s * r * 0.55));
          c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
          c.fillStyle = CONFIG.colorTextoSegmentos;
          c.textAlign = 'right';
          c.textBaseline = 'middle';
          c.globalAlpha = alfaTexto;
          const maxW = r * 0.52;
          // (por TIRAS: el del gajo gigante va UNA sola vez, en el
          //  centro del gajo — no repetido en cada ranura)
          for (const u of unidades) {
            if (ex.has(u.ini)) continue;
            c.save();
            c.rotate(est.anguloRueda + (u.ini + u.len / 2) * s);
            c.fillText(ajustarTexto(c, est.lista[u.ini], maxW), r - 12, 0);
            c.restore();
          }
          c.globalAlpha = 1;
        }
      }

      // Segmento resaltado (late) — si aún no salió volando (en el
      // gajo gigante late el GAJO ENTERO: la tira completa)
      if (est.resaltadoIdx != null && est.resaltadoIdx < n && !ex.has(est.resaltadoIdx)) {
        const runDe = est.runDe;
        const u = runDe ? est.runs[runDe[est.resaltadoIdx]] : { ini: est.resaltadoIdx, len: 1 };
        const a0 = est.anguloRueda + u.ini * s;
        const pulso = 0.30 + 0.25 * Math.sin(performance.now() / 1000 * Math.PI * 2 * 1.6);
        c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, a0, a0 + u.len * s); c.closePath();
        c.fillStyle = `rgba(255, 255, 255, ${Math.max(0, pulso).toFixed(3)})`;
        c.fill();
      }

      // ── ARO DE MADERA (solo si CONFIG.grosorAro > 0; por defecto
      // está desactivado: rueda sin contorno, como se pidió) ────────
      const gA = CONFIG.grosorAro;
      if (gA > 0) {
        // aro
        c.beginPath();
        c.arc(0, 0, r + gA, 0, TAU);
        c.arc(0, 0, r, 0, TAU, true);
        c.fillStyle = CONFIG.colorAro;
        c.fill('evenodd');
        // filete dorado arriba y abajo del aro
        c.lineWidth = 1.6;
        c.strokeStyle = CONFIG.colorAroBrillo;
        c.beginPath(); c.arc(0, 0, r + gA - 0.8, 0, TAU); c.stroke();
        c.beginPath(); c.arc(0, 0, r + 0.8, 0, TAU); c.stroke();
      }

      // ── CLAVIJAS: un remache en cada frontera ENTRE segmentos ───
      // (pegadas al borde de la rueda, o en el aro si lo hay). Durante
      // el polvo no hace falta ocultarlas: la malla de granos las cubre.
      // Ni a velocidad turbo (estropearían el difuminado) ni si su
      // segmento (o el vecino) ya salió volando (animación 10).
      // (En el gajo gigante SOLO hay clavijas en sus DOS bordes: las
      //  fronteras internas de la tira no existen.)
      if (CONFIG.mostrarClavijas && n <= CONFIG.maxClavijas && !difuso) {
        const rp = this._radioClavijas();          // viven junto al borde
        const radioClavija = Math.max(2.4, Math.min(4.4, s * r * 0.045));
        for (const u of unidades) {
          if (ex.has(u.ini) || ex.has((u.ini - 1 + n) % n)) continue;
          const ang = est.anguloRueda + u.ini * s;
          const px = Math.cos(ang) * rp, py = Math.sin(ang) * rp;
          // sombra de la cabeza del remache
          c.beginPath();
          c.arc(px + 0.8, py + 1.2, radioClavija, 0, TAU);
          c.fillStyle = 'rgba(0, 0, 0, 0.35)';
          c.fill();
          // cabeza metálica con brillo
          const grad = c.createRadialGradient(
            px - radioClavija * 0.4, py - radioClavija * 0.5, radioClavija * 0.15,
            px, py, radioClavija
          );
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.55, CONFIG.colorClavija);
          grad.addColorStop(1, CONFIG.colorClavijaBorde);
          c.beginPath();
          c.arc(px, py, radioClavija, 0, TAU);
          c.fillStyle = grad;
          c.fill();
        }
      }
    } else {
      // Rueda vacía (según el tema claro/oscuro)
      c.beginPath(); c.arc(0, 0, r, 0, TAU);
      c.fillStyle = oscuro ? 'rgba(255, 255, 255, 0.04)' : 'rgba(20, 30, 50, 0.04)';
      c.fill();
      c.strokeStyle = oscuro ? 'rgba(255, 255, 255, 0.14)' : 'rgba(20, 30, 50, 0.2)';
      c.lineWidth = 2;
      c.stroke();
    }

    // Maza central: un discreto eje (el botón Girar ya no vive en la
    // rueda — está en el panel de nombres, tal como se pidió).
    // En modo casino la dibuja _dibujarCasino (con su torreta dorada,
    // que sí necesita maza grande).
    // SIN CONTORNO (se pidió): solo el disco oscuro; el filete dorado
    // que llevaba ha desaparecido.
    // Cuando una animación ESPERA el toque de la bolita negra (el
    // MOTOR DAÑADO de la animación 11), la bolita luce un ANILLO
    // DORADO latiendo — se VE dónde hay que tocarla (el motor que
    // hay que apagar).
    if (!est.casino) {
      const hub = Math.min(28, r * 0.14);
      c.beginPath(); c.arc(0, 0, hub, 0, TAU);
      c.fillStyle = '#0e1525';
      c.fill();
      // En turbo, la maza recupera su filete dorado (giratorio-invariante:
      // no estrobea) — la rueda vuelve a tener presencia.
      if (est.velAng > 11) {
        c.strokeStyle = 'rgba(255, 209, 102, 0.9)';
        c.lineWidth = 2.5;
        c.stroke();
      }
      // El ANILLO que late: "toca la bolita negra para parar la rueda"
      if (est.resaltarBuje) {
        const p = 0.5 + 0.5 * Math.sin(performance.now() / 170);
        c.beginPath(); c.arc(0, 0, hub + 5 + 6 * p, 0, TAU);
        c.strokeStyle = `rgba(255, 209, 102, ${(0.30 + 0.50 * p).toFixed(3)})`;
        c.lineWidth = 2.6;
        c.stroke();
      }
    }

    c.restore();

    // Segmentos que van VOLANDO (animación 10): ya en coordenadas del
    // mundo, fuera de la rueda, girando sobre sí mismos mientras vuelan.
    this._dibujarVuelos(c);

    // ── FLECHA / SELECTOR (triángulo invertido; FIJA con las clavijas:
    // suena, pero no se mueve — solo la inclina la animación 3) ──────
    // Antes de ella, los SELECTORES CLON (animación 14): idénticos al
    // de siempre pero en su puesto del borde… y los que van cayendo
    // (la física corre en _bucle; aquí solo se dibujan donde estén).
    if (est.selectoresExtras && est.selectoresExtras.length) {
      const gSel = this._geoFlecha();
      for (const sSel of est.selectoresExtras) {
        if (sSel.cayo) continue;
        // NACEN del buje hacia su puesto del borde (animación 14): con un
        // pequeño rebote de llegada y su "pop" (el pop lo pone el bucle).
        // Así se les VE ENTRAR — ya no "estaban ahí" de golpe.
        const u = sSel.nace == null ? 1 : Math.max(0, Math.min(1, sSel.nace));
        if (u <= 0.02) continue;
        // easeOutBack: llega con un rebacito y se asienta
        const e = u >= 1 ? 1 : 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
        const piv = gSel.pivote * (0.14 + 0.86 * e);
        c.save();
        c.globalAlpha = Math.min(1, u * 2.5);
        this._dibujarTrianguloFlecha(c,
          est.cx + Math.cos(sSel.ang) * piv,
          est.cy + Math.sin(sSel.ang) * piv,
          sSel.ang + Math.PI / 2);
        c.restore();
      }
    }
    for (const cSel of this._caidasSel) {
      this._dibujarTrianguloFlecha(c, cSel.x, cSel.y, cSel.rot);
    }
    if (n > 0 && !est.flechaOculta && est.flechaAlpha > 0.02) {
      this._dibujarFlecha(c, est, r);
    }

  },


  // La flecha: un TRIÁNGULO INVERTIDO normal, ROJO, con la base en el
  // pivote (un poco por encima del borde de la rueda) y la punta
  // entrando en los segmentos. Es FIJA con las clavijas (suena, no se
  // mueve); la flexión es una herramienta libre para coreografías. Si
  // está CAYENDO (animación 8), se dibuja donde diga la física de la
  // caída. flechaAlpha la funde (casino).
  _dibujarFlecha(c, est, r) {
    if (est.flechaCayendo && this._caida) {
      this._dibujarTrianguloFlecha(c, this._caida.x, this._caida.y, this._caida.rot);
      return;
    }
    const g = this._geoFlecha();
    const ang = est.flechaEnOrbita ? est.anguloFlecha : ANGULO_FLECHA_TOPE;
    const px = est.cx + Math.cos(ang) * g.pivote;
    const py = est.cy + Math.sin(ang) * g.pivote;
    const rot = ang + Math.PI / 2
      + est.patada * est.dirPatada * CONFIG.patadaFlecha
      + est.flexion;
    c.globalAlpha = Math.max(0, Math.min(1, est.flechaAlpha));
    this._dibujarTrianguloFlecha(c, px, py, rot);
    c.globalAlpha = 1;
  },

  // El triángulo ROJO en sí (lo dibujan la flecha normal y la caída):
  // tres paradas de CONFIG.coloresFlecha (claro → medio → oscuro) para
  // que tenga volumen, y contorno del COLOR DEL FONDO — el selector
  // se funde con la página, como se pidió.
  _dibujarTrianguloFlecha(c, px, py, rot) {
    const g = this._geoFlecha();

    c.save();
    c.translate(px, py);
    c.rotate(rot);

    // sombra proyectada sobre la rueda
    c.shadowColor = 'rgba(0, 0, 0, 0.4)';
    c.shadowBlur = 7;
    c.shadowOffsetY = 3;

    const [c0, c1, c2] = CONFIG.coloresFlecha;
    const grad = c.createLinearGradient(0, 0, 0, g.L);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.45, c1);
    grad.addColorStop(1, c2);

    c.beginPath();
    c.moveTo(-g.H, 0);   // esquina izquierda de la base
    c.lineTo(g.H, 0);    // esquina derecha de la base
    c.lineTo(0, g.L);    // punta: entra en la rueda
    c.closePath();
    c.fillStyle = grad;
    c.fill();
    c.shadowColor = 'transparent';
    c.strokeStyle = this._bordeSegmentos();   // contorno = color del fondo
    c.lineWidth = 1.2;   // reducido a la MITAD (era 2.4), como se pidió
    c.lineJoin = 'round';
    c.stroke();

    c.restore();
  },


  /* ══════════════════════════════════════════════════════════════════
     ANIMACIÓN 9 · LA RULETA DE CASINO (la transformación + la bola)
     ──────────────────────────────────────────────────────────────────
     La rueda de nombres se TRANSFORMA (morph continuo, sin cortes: en
     progreso=0 es la rueda de siempre, en 1 es casino de verdad) en
     una ruleta de casino con TODOS sus órganos:
       · el BOL de madera exterior con sus filetes dorados,
       · la PISTA (backtrack) por donde corre la bola,
       · el APRON (la pendiente) con sus 8 DEFLECTORES dorados,
       · el WHEELHEAD giratorio: bolsillos rojo/negro con los nombres
         y separados por FRETS metálicos,
       · la TORRETA dorada con sus asas (gira con la rueda).
     Entonces la BOLITA — como en el casino de verdad:
       1) sale al REVÉS que la rueda por la pista (la bola siempre
          gira al contrario que la rueda),
       2) pierde fuerza, se cae de la pista y baja rodando el apron,
       3) CHOCA con un deflector (¡clack!) que la despista,
       4) traquetea sobre los frets… y cae EXACTA en el bolsillo del
          ganador, donde queda presa girando con la rueda.
     La rueda NO se para: sigue girando despacito (como las de verdad,
     que siguen girando tras la bola) mientras el profesor decide
     Conservar/Quitar; al decidir, finCasino() la frena, la bola se
     funde y la rueda se transforma de vuelta en la de nombres.
     Todo el sonido aquí es de casino: el rodar de la bola (un ruido
     filtrado que sigue su velocidad REAL), clacks, tics de frets y el
     golpe de la captura. Los tics de feria no suenan (esta fase no
     pasa por _animar: es su propio bucle).
     ══════════════════════════════════════════════════════════════════ */

  // Radios del casino según el progreso del morph (0..1). En p=0 todo
  // colapsa a la rueda normal; en p=1 la geometría completa del casino.
  _radiosCasino(p) {
    const est = this.estado;
    const r = est.r;
    const Rh = r + (r * 0.86 - r) * p;            // borde exterior de los bolsillos
    const Rbo = (r + 2) + (Math.min(est.tam / 2 - 3, r + 42) - (r + 2)) * p; // bol
    const RtrO = Rbo - 11 * p;                    // pista, borde exterior
    const RtrI = RtrO - 17 * p;                   // pista, borde interior
    const Rp = Math.max(Rh * 0.72, Rh - 15);      // el fondo del bolsillo
    return { Rh, Rbo, RtrO, RtrI, Rp, RbTrack: (RtrI + RtrO) / 2, Rt: Rh * 0.45 * p };
  },

  // La coreografía completa. Devuelve una promesa que se cumple cuando
  // la bola está ACOMODADA en el bolsillo del ganador (la rueda sigue
  // girando despacito hasta que llamen a finCasino()).
  jugarCasino({ ganador, duracion = 12, vel = 1 }) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n || ganador == null || ganador >= n) return Promise.resolve();
    const s = TAU / n;

    // Línea de tiempo (fracciones de la duración del giro)
    const tM = Math.max(0.9, duracion * 0.13);         // transformación
    const tB0 = tM * 0.85;                             // la bola arranca a rodar
    const tT = tM + duracion * 0.56;                   // se cae de la pista
    const tD = tT + Math.max(0.45, duracion * 0.07);   // deflector
    const tB = tD + Math.max(0.6, duracion * 0.13);    // ¡capturada!
    const tS = tB + Math.max(0.4, duracion * 0.06);    // acomodada

    // Velocidades angulares (rad/s): la rueda arranca fuerte y decae a
    // un crucero lento (las de verdad NUNCA se paran del todo).
    const Vmax = TAU * (2.4 + 0.5 * vel);
    const Vcr = TAU * 0.16;
    const Lb = TAU * azar(CONFIG.casino.vueltasBola[0], CONFIG.casino.vueltasBola[1]);

    const cz = est.casino = {
      progreso: 0, ganador, s,
      bola: { ang: -Math.PI / 2 + azar(-1.2, 1.2), rad: 0, alfa: 0, vAng: 0 },
      fin: false, teardown: 0,
      kick: azar(0.09, 0.2),        // el despiste del deflector (precalculado)
      dobleClack: Math.random() < 0.6,
      clackHecho: false, clack2: false,
      ticsFret: [tD + (tB - tD) * 0.22, tD + (tB - tD) * 0.46, tD + (tB - tD) * 0.7],
      ticHechos: 0,
      capturaSonado: false, clicksAcomodo: 0, resuelto: false,
    };
    est.flechaAlpha = 1;
    Sonido.transformacion();
    Sonido.rodilloIniciar();
    Sonido.casinoMusicaIniciar();   // el swing de salón de Las Vegas

    let resolverPrincipal = null;
    const promesaPrincipal = new Promise(res => { resolverPrincipal = res; });

    let tPrevio = null;
    cz.t0 = performance.now();
    const paso = ahora => {
      // limpiado por completo: fin del bucle
      if (!est.casino) return;
      if (tPrevio == null) tPrevio = ahora;
      let dt = Math.min(0.05, (ahora - tPrevio) / 1000);
      tPrevio = ahora;
      if (!isFinite(dt) || dt <= 0) dt = 0.016;   // cinturón de seguridad

      const t = (ahora - cz.t0) / 1000;
      const b = cz.bola;
      const RD = this._radiosCasino(Math.max(0, Math.min(1, cz.progreso)));

      // ── la transformación (de ida… o de vuelta, si pidieron el final) ──
      if (!cz.fin) {
        cz.progreso = t < tM ? suavizarPaso(t / tM) : 1;
      } else {
        cz.teardown += dt;
        cz.progreso = 1 - suavizarPaso(Math.min(1, cz.teardown / 0.9));
      }
      est.flechaAlpha = 1 - cz.progreso;   // la flecha se funde en el casino

      // ── el wheelhead: la rueda gira SIEMPRE (crucero incluido) ──
      let v;
      if (cz.fin) {
        v = Vcr * Math.pow(Math.max(0, 1 - cz.teardown / 0.55), 1.4);
      } else if (t < tM) {
        v = Vmax * Math.pow(t / tM, 1.2);
      } else if (t < tB) {
        const x = Math.min(1, (t - tM) / (tB - tM));
        v = Vcr + (Vmax - Vcr) * Math.pow(1 - x, 2.4);
      } else {
        v = Vcr;
      }
      if (!isFinite(v)) v = 0;
      est.anguloRueda += v * dt;
      if (!isFinite(est.anguloRueda)) est.anguloRueda = 0;  // jamás NaN
      est.velAng = est.velAng * 0.6 + Math.abs(v) * 0.4;
      if (!isFinite(est.velAng)) est.velAng = 0;

      // ── la bola, acto por acto ────────────────────────────────────
      if (t < tB0) {
        // aún no ha salido: esperando a que la pista termine de formarse
        b.alfa = 0;
        b.rad = RD.RbTrack;
      } else if (t < tM) {
        // nace en la pista mientras la rueda acaba de transformarse
        b.alfa = suavizarPaso((t - tB0) / (tM - tB0));
        b.rad = RD.RbTrack;
      } else if (t < tT) {
        // 1) a toda marcha por la pista, AL REVÉS que la rueda
        b.alfa = 1;
        const tau = (t - tB0) / (tT - tB0);
        b.vAng = -(Lb / (tT - tB0)) * (0.86 * 2.2 * Math.pow(1 - tau, 1.2) + 0.14);
        b.ang += b.vAng * dt;
        b.rad = RD.RbTrack;
        Sonido.rodilloSet(Math.min(1, Math.abs(b.vAng) / (TAU * 2.6)));
      } else if (t < tD) {
        // 2) pierde fuerza y SE CAE de la pista (rodando el apron)
        const x = (t - tT) / (tD - tT);
        b.rad = RD.RbTrack + (RD.Rp - RD.RbTrack) * Math.pow(x, 1.6);
        b.vAng *= Math.pow(0.45, dt / Math.max(0.01, tD - tT));
        b.ang += b.vAng * dt;
        Sonido.rodilloSet(Math.max(0, 1 - x) * 0.35);
        // 3) ¡DEFLECTOR! el diamante la despista de verdad
        if (!cz.clackHecho && b.rad <= (RD.RtrI + RD.Rh) / 2) {
          cz.clackHecho = true;
          Sonido.clack();
          b.ang += cz.kick;          // el rebote la desvía
          b.vAng = -b.vAng * 0.4;    // y la echa un poco hacia atrás
        }
        if (cz.clackHecho && cz.dobleClack && !cz.clack2 && t > tT + (tD - tT) * 0.55) {
          cz.clack2 = true;
          Sonido.clack(0.5);
        }
      } else if (t < tB) {
        // 4) traqueteo final: se desliza hacia el bolsillo del ganador.
        //    El último tramo MEZCLA su vuelo libre con el objetivo (que
        //    se mueve con la rueda), así la captura es EXACTA: en k=1
        //    bola y bolsillo coinciden al milímetro, sin salto alguno.
        const k = suavizarPaso((t - tD) / (tB - tD));
        b.alfa = 1;
        b.vAng *= Math.pow(0.35, dt / 0.25);
        const libre = b.ang + b.vAng * dt * (1 - k * 0.5);
        const lock = est.anguloRueda + (cz.ganador + 0.5) * s;
        const d = norm(lock - libre);
        const dd = d > Math.PI ? d - TAU : d;   // por el camino corto
        b.ang = libre + dd * k;
        b.rad = RD.Rp + 3 * Math.pow(1 - k, 2) * Math.sin(k * 18);
        if (cz.ticHechos < cz.ticsFret.length && t >= cz.ticsFret[cz.ticHechos]) {
          cz.ticHechos++;
          Sonido.toca();
        }
      } else if (t < tS) {
        // 5) acomodándose en el bolsillo: vibra y se quieta
        if (!cz.capturaSonado) {
          cz.capturaSonado = true;
          Sonido.captura();
          Sonido.rodilloParar();
        }
        const tau = (t - tB) / (tS - tB);
        b.ang = est.anguloRueda + (cz.ganador + 0.5) * s
              + 0.16 * s * Math.exp(-3.2 * tau) * Math.sin(tau * 19);
        b.rad = RD.Rp + 2.5 * Math.exp(-3 * tau) * Math.abs(Math.sin(tau * 19));
        if (cz.clicksAcomodo < 2 && tau > 0.16 + cz.clicksAcomodo * 0.24) {
          cz.clicksAcomodo++;
          Sonido.toca();
        }
      } else {
        // 6) capturada: gira pegada a la rueda (como las de verdad)
        //    hasta que llamen a finCasino()
        if (!cz.capturaSonado) {
          cz.capturaSonado = true;
          Sonido.captura();
          Sonido.rodilloParar();
        }
        b.ang = est.anguloRueda + (cz.ganador + 0.5) * s;
        b.rad = RD.Rp;
        if (!cz.resuelto) { cz.resuelto = true; resolverPrincipal(); }
      }

      // ── si pidieron el final: deshacer la transformación ──────────
      if (cz.fin) {
        b.alfa = Math.max(0, 1 - cz.teardown / 0.5);   // la bola se funde
        if (cz.teardown >= 0.9) {
          est.casino = null;
          est.flechaAlpha = 1;
          Sonido.rodilloParar();
          Sonido.casinoMusicaParar();   // la música del salón se despide
          if (cz.finResolver) cz.finResolver();
          return;   // fin del bucle: todo devuelto a la normalidad
        }
      }
      // cinturones de seguridad de la bola (jamás NaN, pase lo que pase)
      if (!isFinite(b.ang)) { b.ang = est.anguloRueda + (cz.ganador + 0.5) * s; b.vAng = 0; }
      if (!isFinite(b.rad)) b.rad = RD.Rp;
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    return promesaPrincipal;
  },

  // El final del casino: frena la rueda, funde la bola y transforma la
  // rueda de vuelta en la de nombres (lo llama js/ui.js → restaurar()).
  finCasino() {
    const est = this.estado;
    const cz = est.casino;
    if (!cz) return Promise.resolve();
    if (cz.fin) return cz.finPromesa || Promise.resolve();
    cz.fin = true;
    cz.finPromesa = new Promise(res => { cz.finResolver = res; });
    return cz.finPromesa;
  },

  // ── El dibujo completo de la rueda de casino (render llama aquí) ──
  _dibujarCasino(c, est) {
    const cz = est.casino;
    const n = est.lista.length;
    if (!n || !cz) return;
    const s = TAU / n;
    const r = est.r;
    const C = CONFIG.casino;
    const p = Math.max(0, Math.min(1, cz.progreso));
    const RD = this._radiosCasino(p);
    const hub = Math.min(58, r * 0.38);

    // 1) el BOL de madera (el aro exterior del casino)
    if (p > 0.02) {
      c.globalAlpha = Math.min(1, p * 1.15);
      c.beginPath();
      c.arc(0, 0, RD.Rbo, 0, TAU);
      c.arc(0, 0, RD.RtrO, 0, TAU, true);
      c.fillStyle = C.colorMadera;
      c.fill('evenodd');
      // filetes dorados del bol
      c.lineWidth = 1.4;
      c.strokeStyle = C.colorFilete;
      c.beginPath(); c.arc(0, 0, RD.Rbo - 0.8, 0, TAU); c.stroke();
      c.beginPath(); c.arc(0, 0, RD.RtrO + 0.8, 0, TAU); c.stroke();
      c.globalAlpha = 1;

      // 2) la PISTA: el canal pulido donde corre la bola
      c.globalAlpha = Math.min(1, p * 1.15);
      c.beginPath();
      c.arc(0, 0, RD.RtrO, 0, TAU);
      c.arc(0, 0, RD.RtrI, 0, TAU, true);
      c.fillStyle = C.colorPista;
      c.fill('evenodd');
      // sombra del labio interior (la bola corre encajonada)
      c.lineWidth = 2;
      c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      c.beginPath(); c.arc(0, 0, RD.RtrI + 1.2, 0, TAU); c.stroke();
      c.globalAlpha = 1;

      // 3) el APRON (la pendiente) y sus DEFLECTORES dorados (los 8
      //    diamantes FIJOS: no giran, son parte del bol)
      c.globalAlpha = Math.min(1, p * 1.15);
      c.beginPath();
      c.arc(0, 0, RD.RtrI, 0, TAU);
      c.arc(0, 0, RD.Rh, 0, TAU, true);
      c.fillStyle = C.colorApron;
      c.fill('evenodd');
      c.globalAlpha = 1;
      const Rd = (RD.RtrI + RD.Rh) / 2;
      const tam = (RD.RtrI - RD.Rh) * 0.30;
      for (let k = 0; k < C.deflectores; k++) {
        const a = k * Math.PI / (C.deflectores / 2);
        c.save();
        c.translate(Math.cos(a) * Rd, Math.sin(a) * Rd);
        c.rotate(a);   // el rombo alargado en radial (sigue la pendiente)
        c.globalAlpha = Math.min(1, p * 1.15);
        c.fillStyle = C.colorDeflector;
        c.beginPath();
        c.moveTo(-tam, 0); c.lineTo(0, -tam * 0.30); c.lineTo(tam, 0); c.lineTo(0, tam * 0.30);
        c.closePath();
        c.fill();
        // brillo lateral del diamante
        c.fillStyle = 'rgba(255, 255, 255, 0.30)';
        c.beginPath();
        c.moveTo(-tam * 0.45, 0); c.lineTo(0, -tam * 0.30 * 0.55); c.lineTo(tam * 0.45, 0); c.lineTo(0, tam * 0.30 * 0.55);
        c.closePath();
        c.fill();
        c.globalAlpha = 1;
        c.restore();
      }
    }

    // 4) los BOLSILLOS — el morph va en OLA alrededor de la rueda (cada
    //    bolsillo se transforma un poquito después que el anterior:
    //    se ve la transformación RECORRER la rueda) y el color se funde
    //    del original al rojo/negro de casino, alterno.
    for (let i = 0; i < n; i++) {
      const pi = Math.max(0, Math.min(1, p * 1.55 - (i / n) * 0.55));
      const a0 = est.anguloRueda + i * s;
      const destino = (i % 2 === 0) ? C.colorRojo : C.colorNegro;
      c.beginPath();
      c.arc(0, 0, RD.Rh, a0, a0 + s);
      c.arc(0, 0, RD.Rt, a0 + s, a0, true);
      c.closePath();
      c.fillStyle = mezclaColor(est.colores[i], destino, pi);
      c.fill();
      // el borde "negativo" de siempre se va fundiendo con los frets
      c.globalAlpha = Math.max(0, 1 - pi);
      c.strokeStyle = this._bordeSegmentos();
      c.lineWidth = CONFIG.grosorBordeSegmentos;
      c.stroke();
      c.globalAlpha = 1;
    }

    // 5) los FRETS: los separadores metálicos entre bolsillos
    for (let i = 0; i < n; i++) {
      const pi = Math.max(0, Math.min(1, p * 1.55 - (i / n) * 0.55));
      if (pi < 0.03) continue;
      const a = est.anguloRueda + i * s;
      c.globalAlpha = pi;
      c.strokeStyle = C.colorFilete;
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(Math.cos(a) * RD.Rt, Math.sin(a) * RD.Rt);
      c.lineTo(Math.cos(a) * (RD.Rh - 1), Math.sin(a) * (RD.Rh - 1));
      c.stroke();
      // botoncito dorado en la punta exterior del fret
      c.beginPath();
      c.arc(Math.cos(a) * (RD.Rh - 1), Math.sin(a) * (RD.Rh - 1), 2.4, 0, TAU);
      c.fillStyle = C.colorFilete;
      c.fill();
      c.globalAlpha = 1;
    }

    // 6) los NOMBRES, dentro de los bolsillos (desvanecidos a alta vel.)
    if (n <= CONFIG.maxNombresTexto) {
      const alfaTexto = Math.max(0, Math.min(1, (12 - est.velAng) / 4));
      if (alfaTexto > 0.02) {
        const fs = Math.max(9, Math.min(26, s * RD.Rh * 0.55));
        c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
        c.fillStyle = CONFIG.colorTextoSegmentos;
        c.textAlign = 'right';
        c.textBaseline = 'middle';
        c.globalAlpha = alfaTexto;
        const maxW = RD.Rh * 0.52;
        for (let i = 0; i < n; i++) {
          c.save();
          c.rotate(est.anguloRueda + (i + 0.5) * s);
          c.fillText(ajustarTexto(c, est.lista[i], maxW), RD.Rh - 10, 0);
          c.restore();
        }
        c.globalAlpha = 1;
      }
    }

    // 7) el bolsillo del ganador LATE (el resaltado de siempre)
    if (est.resaltadoIdx != null && est.resaltadoIdx < n) {
      const i = est.resaltadoIdx;
      const a0 = est.anguloRueda + i * s;
      const pulso = 0.30 + 0.25 * Math.sin(performance.now() / 1000 * Math.PI * 2 * 1.6);
      c.beginPath();
      c.arc(0, 0, RD.Rh, a0, a0 + s);
      c.arc(0, 0, RD.Rt, a0 + s, a0, true);
      c.closePath();
      c.fillStyle = `rgba(255, 255, 255, ${Math.max(0, pulso).toFixed(3)})`;
      c.fill();
    }

    // 8) las CLAVIJAS de siempre se funden (cabalgan el borde mientras
    //    la rueda encoge hacia el wheelhead — luego los frets las sustituyen)
    if (CONFIG.mostrarClavijas && n <= CONFIG.maxClavijas) {
      const alfa = 1 - p;
      if (alfa > 0.03) {
        const rp0 = this._radioClavijas();
        const rp = rp0 + (RD.Rh - 3 - rp0) * p;
        const radioClavija = Math.max(2.4, Math.min(4.4, s * r * 0.045));
        c.globalAlpha = alfa;
        for (let i = 0; i < n; i++) {
          const ang = est.anguloRueda + i * s;
          const px = Math.cos(ang) * rp, py = Math.sin(ang) * rp;
          const grad = c.createRadialGradient(
            px - radioClavija * 0.4, py - radioClavija * 0.5, radioClavija * 0.15,
            px, py, radioClavija
          );
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.55, CONFIG.colorClavija);
          grad.addColorStop(1, CONFIG.colorClavijaBorde);
          c.beginPath();
          c.arc(px, py, radioClavija, 0, TAU);
          c.fillStyle = grad;
          c.fill();
        }
        c.globalAlpha = 1;
      }
    }

    // 9) disco base del wheelhead + la MAZA + la TORRETA dorada (con sus
    //    asas: gira con la rueda — el crupier la gira por ahí)
    if (p > 0.02) {
      c.globalAlpha = Math.min(1, p * 1.15);
      c.beginPath(); c.arc(0, 0, RD.Rt, 0, TAU);
      c.fillStyle = C.colorBase;
      c.fill();
      c.globalAlpha = 1;
    }
    c.beginPath(); c.arc(0, 0, hub, 0, TAU);
    c.fillStyle = '#0e1525';
    c.fill();
    c.strokeStyle = 'rgba(255, 209, 102, 0.9)';
    c.lineWidth = 3;
    c.stroke();
    if (p > 0.02) {
      c.save();
      c.rotate(est.anguloRueda);
      c.globalAlpha = Math.min(1, p * 1.2);
      const R2 = hub * (0.55 + 0.5 * p);
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2;
        c.strokeStyle = C.colorFilete;
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(Math.cos(a) * hub * 0.4, Math.sin(a) * hub * 0.4);
        c.lineTo(Math.cos(a) * R2, Math.sin(a) * R2);
        c.stroke();
        c.beginPath();
        c.arc(Math.cos(a) * R2, Math.sin(a) * R2, 5, 0, TAU);
        c.fillStyle = C.colorFilete;
        c.fill();
      }
      // cúpula central de la torreta
      const grad = c.createRadialGradient(-hub * 0.2, -hub * 0.25, hub * 0.1, 0, 0, hub * 0.62);
      grad.addColorStop(0, '#ffe9b0');
      grad.addColorStop(0.5, C.colorFilete);
      grad.addColorStop(1, '#8a6a1c');
      c.beginPath(); c.arc(0, 0, hub * 0.62, 0, TAU);
      c.fillStyle = grad;
      c.fill();
      c.globalAlpha = 1;
      c.restore();
    }

    // 10) LA BOLA de marfil (lo último: por encima de todo)
    const b = cz.bola;
    if (b && b.alfa > 0.01) {
      const Rb = C.radioBola * (est.tam / 480);
      const bx = Math.cos(b.ang) * b.rad, by = Math.sin(b.ang) * b.rad;
      c.globalAlpha = Math.min(1, b.alfa);
      // sombra proyectada sobre la pista / el bolsillo
      c.beginPath();
      c.ellipse(bx + 2, by + 3, Rb * 0.95, Rb * 0.6, 0, 0, TAU);
      c.fillStyle = 'rgba(0, 0, 0, 0.30)';
      c.fill();
      // esfera de marfil con su brillo
      const g2 = c.createRadialGradient(bx - Rb * 0.35, by - Rb * 0.4, Rb * 0.15, bx, by, Rb);
      g2.addColorStop(0, '#ffffff');
      g2.addColorStop(0.55, '#f2ead8');
      g2.addColorStop(1, '#b9ac8e');
      c.beginPath(); c.arc(bx, by, Rb, 0, TAU);
      c.fillStyle = g2;
      c.fill();
      c.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      c.lineWidth = 1;
      c.stroke();
      c.globalAlpha = 1;
    }
  },


  /* ══════════════════════════════════════════════════════════════════
     ANIMACIÓN 15 · EL JUEGO DE LOS VASOS (shell game — el nuevo reto)
     ──────────────────────────────────────────────────────────────────
     "Intervenciones de usuario": la ruleta NO gira; se transforma:

       1. MORFOSIS — cada segmento se ENCOGE hacia su centroide
          mientras nace SU BOLITA —CON SU MISMO COLOR, tal como se pidió:
          el segmento se CONVIERTE literalmente en la bolita— (en ola
          alrededor de la rueda: la transformación RECORRE).
       2. CAÍDA — las bolitas caen con física (gravedad, botes) sobre
          una MESA de madera común y corriente, y se ordenan solas en
          una fila, cada una hacia SU hueco: nunca amontonadas.
       3. VASOS — un vaso (boca abajo) baja del cielo y tapa cada
          bolita, escalonados y con su "toc" al aterrizar.
       4. BARAJAR — SIN LEVANTARSE JAMÁS (se pidió así): los vasos solo
          se CRUZAN por delante y por detrás, a ras de la mesa, cada
          cruz más rápida. Las bolitas viajan con SUS vasos, escondidas
          (no hay ni un milímetro de hueco: jamás se ven).
       5. ELECCIÓN — SIN ALERTA (se pidió quitarla: es obvio qué hacer
          — los vasos latiendo y la pista de arriba lo dicen solos);
          el profesor hace clic en el lienzo: el clic lo entrega el
          sistema de intervenciones (pedirClic).
       6. REVELAR — el vaso elegido se LEVANTA y se cae con física
          (volteretas fuera del cuadro); su bolita queda al descubierto
          CON SU COLOR y un HALO DORADO latiendo, los demás vasos se
          ASOMAN… y segundos después sale el NOMBRE en la tarjeta.

     EL GANADOR ES LA BOLITA DEL VASO ELEGIDO: la elección del profesor
     decide (las bolitas conservan su color: al levantar el vaso se VE
     de qué nombre era — definirGanador avisa a js/ui.js).
     ══════════════════════════════════════════════════════════════════ */

  // La coreografía completa. "pedirEleccion(repetir)" la aporta js/ui.js
  // (pone la pista y espera el clic con Motor.pedirClic; la ALERTA se
  // QUITÓ — es evidente qué hay que hacer). "definirGanador(idx)" también
  // la aporta js/ui.js: el ganador pasa a ser LA BOLITA del vaso elegido.
  async jugarShell({ ganador, pedirEleccion, definirGanador }) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n || ganador == null || ganador >= n) return;
    const s = TAU / n;
    est.velAng = 0;                    // sin desenfoque: la rueda está quieta

    // — Geometría de la escena (coordenadas ABSOLUTAS del canvas) —
    // La MESA ocupa el pie del lienzo (un tablero de madera de verdad:
    // lo dibuja _dibujarShell); las bolitas reposan SOBRE ella.
    const sueloY = Math.round(est.tam * 0.84);           // el borde de la mesa
    const anchoUtil = est.tam * 0.86;
    const cupW = Math.max(20, Math.min(58, anchoUtil / Math.max(4, n + 0.6)));
    const ballR = Math.max(4.5, cupW * 0.28);
    const cupH = Math.max(cupW * 1.06, ballR * 2 + 8);
    const slotX = i => est.cx + (n === 1 ? 0 :
      (i / (n - 1) - 0.5) * (anchoUtil - cupW * 1.1));

    const sh = est.shell = {
      fase: 'morfar', alfa: 1, progreso: 0,
      ganador, n, sueloY, cupW, cupH, ballR,
      bolas: [], vasos: [],
    };

    // 1) MORFOSIS REAL (la ola la dibuja _dibujarShell con sh.progreso):
    //    cada segmento SE VUELVE de verdad su bolita (contorno a
    //    contorno, con su color). El "pop" suena cuando cada gajo HA
    //    TERMINADO de volverse bolita (nada de cruces de fundido).
    Sonido.transformacion();
    const nacidas = new Set();
    await this._animarT(1.05, t => {
      sh.progreso = t;
      for (let i = 0; i < n; i++) {
        const pi = Math.max(0, Math.min(1, t * 1.9 - (i / n) * 0.9));
        if (pi >= 1 && !nacidas.has(i)) { nacidas.add(i); Sonido.pop(); }
      }
    });

    // 2) NACEN las bolitas en el centroide de su segmento —CADA UNA CON
    //    EL COLOR DE SU SEGMENTO (se pidió: el segmento se CONVIERTE en
    //    la bolita y conserva su color)—, lanzadas hacia SU hueco.
    sh.fase = 'bolas';
    for (let i = 0; i < n; i++) {
      const angC = est.anguloRueda + (i + 0.5) * s;
      const Rc = est.r * 0.62;
      const x0 = est.cx + Math.cos(angC) * Rc;
      sh.bolas.push({
        x: x0,
        y: est.cy + Math.sin(angC) * Rc,
        vx: (slotX(i) - x0) * azar(1.3, 1.9),
        vy: azar(-240, -70),
        r: ballR, i, duerme: false, elegida: false,
        color: est.colores[i],   // SU color de segmento, conservado
      });
    }
    // Física de la caída: gravedad, botes contra la mesa, deslizamiento
    // hacia su hueco… hasta que todas duermen.
    {
      const G = 1600, e = 0.42;
      await new Promise(res => {
        let tPrev = null;
        const paso = ahora => {
          if (tPrev == null) tPrev = ahora;
          const dt = Math.min(0.05, (ahora - tPrev) / 1000);
          tPrev = ahora;
          let vivas = 0;
          for (const b of sh.bolas) {
            if (b.duerme) continue;
            b.vy += G * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.y >= sueloY - b.r) {
              b.y = sueloY - b.r;
              // SE PIDIÓ: el sonido de las BOLAS TOCANDO EL SUELO — cada
              // bote suena a bolita de verdad (el "toc" agudo de siempre
              // era genérico; este es de bolita)
              if (b.vy > 90) {
                Sonido.bolitaSuelo(Math.min(1, b.vy / 900));
                b.vy = -b.vy * e;
              } else b.vy = 0;
              b.vx *= 0.80;
              b.vx += (slotX(b.i) - b.x) * 2.6 * dt;   // se ordenan solas
            }
            if (b.vy === 0 && b.y >= sueloY - b.r - 0.5 && Math.abs(b.vx) < 9) {
              b.vx = 0;
              b.duerme = true;
            } else vivas++;
          }
          if (vivas === 0) { res(); return; }
          requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
      // Encaje final exacto en la fila (0.25 s de orden y simetría).
      const ini = sh.bolas.map(b => b.x);
      await this._animarT(0.25, t => {
        sh.bolas.forEach((b, i) => {
          b.x = ini[i] + (slotX(i) - ini[i]) * suavizarPaso(t);
          b.y = sueloY - b.r;
        });
      });
    }

    // 3) VASOS: bajan del cielo y tapan cada bolita (escalonados, con
    //    su "toc" al aterrizar).
    sh.fase = 'cubrir';
    for (let i = 0; i < n; i++) {
      sh.vasos.push({ i, x: slotX(i), yC: -cupH, cuerpo: null, levantar: 0, sonadow: false });
    }
    await new Promise(res => {
      const RET = Math.min(0.07, 1.4 / n), CAIDA = 0.34;
      const t0 = performance.now();
      const paso = ahora => {
        const t = (ahora - t0) / 1000;
        let listos = 0;
        sh.vasos.forEach((v, i) => {
          const u = Math.max(0, Math.min(1, (t - i * RET) / CAIDA));
          const destino = sueloY - cupH / 2;
          const arranque = -cupH;
          const ease = 1 - Math.pow(1 - u, 3);        // frenadita al llegar
          v.yC = arranque + (destino - arranque) * ease;
          if (u >= 1) {
            if (!v.sonadow) { v.sonadow = true; Sonido.toca(); }
            v.yC = destino;
            listos++;
          }
        });
        if (listos === n) { res(); return; }
        requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });

    // 4) BARAJAR: el clásico — pero los vasos NUNCA SE LEVANTAN (se
    //    pidió así): solo se CRUZAN por delante y por detrás, a ras de
    //    la mesa, cada cruz más rápida. Las bolitas viajan CON SUS
    //    vasos, escondidas debajo: no hay ni un milímetro de hueco —
    //    jamás se las ve. (Quién pasa por delante lo decide el cruce.)
    sh.fase = 'barajar';
    const cruzas = CONFIG.shell.cruzas > 0
      ? CONFIG.shell.cruzas
      : Math.max(10, Math.min(18, 7 + n));
    if (n > 1) {
      for (let k = 0; k < cruzas; k++) {
        const a = enteroAleatorio(n);
        let b = enteroAleatorio(n);
        let guard = 0;
        while (b === a && guard++ < 8) b = enteroAleatorio(n);
        if (b === a) continue;               // n=2 alternando ya vale
        const dur = Math.max(0.22, 0.5 - k * 0.016);
        const xa = sh.vasos[a].x, xb = sh.vasos[b].x;
        sh.delantero = (xb > xa) ? a : b;     // el que va a la derecha, delante
        await new Promise(res => {
          const t0 = performance.now();
          const paso = ahora => {
            const u = Math.min(1, (ahora - t0) / (dur * 1000));
            const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
            // puro DESLIZAMIENTO a ras de mesa (sin brinco: la bolita,
            // pegada al suelo bajo su vaso, jamás asoma)
            sh.vasos[a].x = xa + (xb - xa) * e;
            sh.vasos[b].x = xb + (xa - xb) * e;
            sh.bolas[a].x = sh.vasos[a].x;
            sh.bolas[b].x = sh.vasos[b].x;
            if (u >= 1) {
              sh.delantero = null;
              Sonido.toca();
              res();
              return;
            }
            requestAnimationFrame(paso);
          };
          requestAnimationFrame(paso);
        });
      }
    }

    // 5) INTERVENCIÓN DE USUARIO: el vaso que elija el profesor. (Ya NO
    //    hay alerta — se pidió quitarla: es OBVIO qué hacer; la pista de
    //    arriba y los vasos latiendo lo dicen solos. pedirEleccion la
    //    aporta js/ui.js.) Si el clic no cae en ningún vaso, se repite.
    sh.fase = 'elegir';
    let elegido = -1;
    let primera = true;
    while (elegido < 0) {
      const clic = await pedirEleccion(!primera);
      primera = false;
      // hit-test generoso: el vaso más cercano dentro de su ancho
      let mejorD = Infinity;
      sh.vasos.forEach(v => {
        if (v.cuerpo) return;
        const d = Math.abs(clic.x - v.x);
        if (d < cupW * 0.95 && d < mejorD &&
            clic.y > sueloY - cupH * 2.4 && clic.y < sueloY + 14) {
          elegido = v.i;
          mejorD = d;
        }
      });
    }

    // EL GANADOR ES LA BOLITA DEL VASO ELEGIDO (la elección del profesor
    // decide: su COLOR dirá el nombre). Se avisa a js/ui.js AHORA, para
    // que la tarjeta anuncie al nombre correcto.
    if (definirGanador) definirGanador(elegido);

    // 6) REVELAR: el vaso elegido se LEVANTA… y se cae con física
    //    (volteretas fuera del cuadro); su bolita queda al descubierto
    //    CON SU COLOR y un halo dorado latiendo; los demás vasos se
    //    ASOMAN (levantan un poquito la cabeza) para enseñar sus bolitas.
    //    La tarjeta con el NOMBRE sale segundos después (la dispara
    //    js/ui.js al resolverse esta promesa, con un último respiro).
    sh.fase = 'revelar';
    const vE = sh.vasos.find(v => v.i === elegido);
    const bE = sh.bolas[elegido];
    const lado = Math.random() < 0.5 ? -1 : 1;
    vE.cuerpo = {
      x: vE.x, y: vE.yC, rot: 0,
      vx: lado * azar(90, 190), vy: -azar(260, 380),
      w: lado * azar(4, 7),
    };
    bE.elegida = true;
    bE.duerme = false;
    bE.vy = -azar(120, 200);       // saltito al verse elegida
    bE.vx = 0;
    Sonido.pop();
    {
      const G = 1500;
      await new Promise(res => {
        let tPrev = null, tt = 0;
        const paso = ahora => {
          if (tPrev == null) tPrev = ahora;
          const dt = Math.min(0.05, (ahora - tPrev) / 1000);
          tPrev = ahora;
          tt += dt;
          // el vaso elegido vuela con gravedad y volteretas
          const cp = vE.cuerpo;
          cp.vy += G * dt;
          cp.x += cp.vx * dt;
          cp.y += cp.vy * dt;
          cp.rot += cp.w * dt;
          // la bolita elegida bota en la mesa hasta quedarse
          bE.vy += G * dt;
          bE.x += bE.vx * dt;
          bE.y += bE.vy * dt;
          if (bE.y >= sueloY - bE.r) {
            bE.y = sueloY - bE.r;
            if (bE.vy > 90) { Sonido.bolitaSuelo(0.5); bE.vy = -bE.vy * 0.4; }
            else bE.vy = 0;
          }
          // los demás vasos se asoman a los 0.7 s
          sh.vasos.forEach(v => {
            if (v.cuerpo || v.levantar >= 0.35) return;
            if (tt > 0.7) v.levantar = Math.min(0.35, v.levantar + dt * 1.4);
          });
          if (tt >= 1.5) { res(); return; }
          requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
    }
    await new Promise(r => setTimeout(r, 350));
  },

  // El final del juego: desvanece la escena entera (0.42 s) y devuelve
  // la rueda a la normalidad (lo llama restaurar(), en js/ui.js).
  async finShell() {
    const est = this.estado;
    if (!est.shell) return;
    const sh = est.shell;
    if (sh.fase !== 'fin') {
      sh.fase = 'fin';
      try {
        await this._animarT(0.42, t => { sh.alfa = 1 - t; });
      } catch (e) { /* interrumpido: se limpia igual */ }
    }
    est.shell = null;
  },

  // ── El dibujo de la escena (render() deriva aquí mientras haya
  //    est.shell). Todo en coordenadas ABSOLUTAS del canvas.
  _dibujarShell(c, est) {
    const sh = est.shell;
    if (!sh) return;
    const t = performance.now() / 1000;
    const alfa = sh.alfa != null ? sh.alfa : 1;

    // LA MESA (común y corriente): un tablero de madera de verdad —con
    // su canto iluminado y sus vetas— sobre el que ruedan los vasos
    // (se pidió así: el juego ocurre SOBRE una mesa).
    c.save();
    c.globalAlpha = alfa;
    const yM = sh.sueloY;
    const gMesa = c.createLinearGradient(0, yM, 0, est.tam);
    gMesa.addColorStop(0, CONFIG.shell.colorMesa1);
    gMesa.addColorStop(1, CONFIG.shell.colorMesa2);
    c.fillStyle = gMesa;
    c.fillRect(0, yM, est.tam, est.tam - yM + 2);
    // canto superior iluminado (la luz rozando el borde del tablero)
    c.fillStyle = CONFIG.shell.colorMesaCanto;
    c.fillRect(0, yM, est.tam, 3);
    // vetas: ondulaciones discretas, FIJAS por escena (no parpadean)
    if (!sh.vetas) {
      sh.vetas = [];
      const nVetas = Math.max(3, Math.round((est.tam - yM) / 24));
      for (let k = 0; k < nVetas; k++) {
        sh.vetas.push({
          y: yM + 9 + (k + 0.5) * (est.tam - yM - 14) / nVetas,
          a: azar(0.5, 1.7),   // amplitud
          f: azar(0.4, 1.1),  // frecuencia
          p: azar(0, TAU),    // fase
        });
      }
    }
    c.strokeStyle = CONFIG.shell.colorMesaVeta;
    c.lineWidth = 1.4;
    for (const v of sh.vetas) {
      c.beginPath();
      for (let x = 0; x <= est.tam; x += 14) {
        const y = v.y + Math.sin(x * 0.02 * v.f + v.p) * v.a;
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();

    if (sh.fase === 'morfar') {
      // — TRANSFORMACIÓN REAL (se pidió así): los segmentos NO se
      //    desvanecen y "aparecen" bolitas — CADA SEGMENTO SE VUELVE su
      //    bolita. El CONTORNO del gajo (centro → arco exterior →
      //    centro) viaja, punto a punto, hasta la circunferencia de SU
      //    bolita en el centroide, con SU COLOR de siempre: de gajo a
      //    esfera SIN cortes. En OLA (cada segmento un pelín después
      //    que el anterior: la transformación RECORRE la rueda). —
      const n = sh.n;
      const s = TAU / n;
      const Rc = est.r * 0.62;          // donde vive cada bolita (su centroide)
      const NP = Math.max(14, CONFIG.bolita ? (CONFIG.bolita.morfoPuntos || 26) : 26);
      for (let i = 0; i < n; i++) {
        const pi = Math.max(0, Math.min(1, sh.progreso * 1.9 - (i / n) * 0.9));
        const a0 = est.anguloRueda + i * s;
        const angC = a0 + s / 2;
        const bx = est.cx + Math.cos(angC) * Rc;
        const by = est.cy + Math.sin(angC) * Rc;
        if (pi <= 0) {
          // aún no le toca: el gajo tal cual (con su nombre)
          c.save();
          c.globalAlpha = alfa;
          c.beginPath();
          c.moveTo(est.cx, est.cy);
          c.arc(est.cx, est.cy, est.r, a0, a0 + s);
          c.closePath();
          c.fillStyle = est.colores[i];
          c.fill();
          c.strokeStyle = this._bordeSegmentos();
          c.lineWidth = CONFIG.grosorBordeSegmentos;
          c.stroke();
          if (n <= CONFIG.maxNombresTexto) {
            const fs = Math.max(9, Math.min(26, s * est.r * 0.55));
            c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
            c.fillStyle = CONFIG.colorTextoSegmentos;
            c.textAlign = 'right';
            c.textBaseline = 'middle';
            c.save();
            c.translate(est.cx, est.cy);
            c.rotate(est.anguloRueda + (i + 0.5) * s);
            c.fillText(ajustarTexto(c, est.lista[i], est.r * 0.52), est.r - 12, 0);
            c.restore();
          }
          c.restore();
          continue;
        }
        const e = suavizarPaso(pi);     // deformación suave (0 = gajo, 1 = bolita)
        // el CONTORNO del gajo, recorrido EN ORDEN por longitud de
        // camino: lado (centro→borde en a0), arco a0→a0+s, lado de vuelta.
        // Cada punto k va a SU punto de la circunferencia de la bolita:
        // el ángulo destino recorre la bolita completa en el mismo
        // orden — el gajo se "envuelve" volviéndose esfera.
        const L1 = est.r, L2 = est.r * s;    // longitudes de los tramos
        const L = L1 + L2 + L1;
        c.beginPath();
        for (let k = 0; k <= NP; k++) {
          const u = k / NP;
          let wx, wy;
          const d = u * L;
          if (d < L1) {                       // subiendo hacia el borde (a0)
            wx = est.cx + Math.cos(a0) * d;
            wy = est.cy + Math.sin(a0) * d;
          } else if (d < L1 + L2) {           // corriendo por el arco
            const a = a0 + (d - L1) / est.r;
            wx = est.cx + Math.cos(a) * est.r;
            wy = est.cy + Math.sin(a) * est.r;
          } else {                            // volviendo al centro (a0+s)
            const rem = est.r - (d - L1 - L2);
            wx = est.cx + Math.cos(a0 + s) * rem;
            wy = est.cy + Math.sin(a0 + s) * rem;
          }
          // su destino en la bolita (el ápice del gajo mira al CENTRO
          // de la rueda: los puntos no se cruzan al deformarse)
          const fa = angC + Math.PI + u * TAU;
          const qx = bx + Math.cos(fa) * sh.ballR;
          const qy = by + Math.sin(fa) * sh.ballR;
          const px = wx + (qx - wx) * e;
          const py = wy + (qy - wy) * e;
          if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.closePath();
        c.fillStyle = est.colores[i];    // SU color de siempre: continuidad total
        c.fill();
        // contorno negativo mientras se deforma (la esfera no lleva borde)
        if (e < 1) {
          c.globalAlpha = alfa * (1 - e);
          c.strokeStyle = this._bordeSegmentos();
          c.lineWidth = CONFIG.grosorBordeSegmentos;
          c.stroke();
          c.globalAlpha = alfa;
        }
        // el nombre viaja hacia el centroide y se empequeñece: la
        // bolita SE LO TRAGA (solo queda el color, que ya es suyo)
        if (n <= CONFIG.maxNombresTexto && e < 0.97) {
          const fs = Math.max(9, Math.min(26, s * est.r * 0.55))
                     * (1 - e * 0.82);
          if (fs > 2.5) {
            c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
            c.fillStyle = CONFIG.colorTextoSegmentos;
            c.textAlign = 'right';
            c.textBaseline = 'middle';
            c.globalAlpha = alfa * Math.max(0, 1 - e * 1.25);
            c.save();
            c.translate(est.cx, est.cy);
            const radTex = (est.r - 12) + (Rc * 0.55 - (est.r - 12)) * e;
            c.rotate(est.anguloRueda + (i + 0.5) * s);
            c.fillText(ajustarTexto(c, est.lista[i], est.r * 0.52), radTex, 0);
            c.restore();
            c.globalAlpha = alfa;
          }
        }
        // al final, el sombreado de esfera (para que ACABE siendo la
        // bolita de _bolitaShell, sin costura visible)
        if (e > 0.72) {
          const aEsfera = (e - 0.72) / 0.28;
          c.save();
          c.globalAlpha = alfa * aEsfera;
          this._bolitaShell(c, { x: bx, y: by, r: sh.ballR, elegida: false,
                                 color: est.colores[i] }, t);
          c.restore();
        }
      }
      // el eje se funde también…
      if (sh.progreso < 0.7) {
        c.globalAlpha = alfa * (1 - sh.progreso / 0.7);
        c.beginPath();
        c.arc(est.cx, est.cy, Math.min(28, est.r * 0.14), 0, TAU);
        c.fillStyle = '#0e1525';
        c.fill();
        c.globalAlpha = 1;
      }
      // …y la flecha desaparece pronto (nadie la necesita ya)
      const alfaF = 1 - Math.min(1, sh.progreso * 1.5);
      if (alfaF > 0.03 && !est.flechaOculta) {
        const g = this._geoFlecha();
        const px = est.cx + Math.cos(ANGULO_FLECHA_TOPE) * g.pivote;
        const py = est.cy + Math.sin(ANGULO_FLECHA_TOPE) * g.pivote;
        c.save();
        c.globalAlpha = alfa * alfaF;
        this._dibujarTrianguloFlecha(c, px, py, ANGULO_FLECHA_TOPE + Math.PI / 2);
        c.restore();
      }
      return;
    }

    // — a partir de "bolas": primero las bolitas… —
    for (const b of sh.bolas) {
      c.save();
      c.globalAlpha = alfa * (b.elegida ? 1 : 0.94);
      this._bolitaShell(c, b, t);
      c.restore();
    }
    // — …y ENCIMA los vasos (tapan su bolita: son opacos). El "bobo"
    //    de la fase de elegir es puro dibujo: la física no se toca.
    //    Mientras se CRUZAN (barajar), el que pasa POR DELANTE se dibuja
    //    el último: se ven cruzarse por delante y por detrás, a ras de mesa.
    const dibujarVaso = v => {
      if (v.cuerpo) {
        // el elegido: vuela dando volteretas (se abrió y se cayó)
        this._vasoShell(c, v.cuerpo.x, v.cuerpo.y, sh.cupW, sh.cupH, v.cuerpo.rot, alfa);
        return;
      }
      let y = v.yC - v.levantar * sh.cupH * 0.55;
      if (sh.fase === 'elegir') {
        y -= 1.6 * Math.sin(t * 2.4 + v.i * 1.7);   // invita a elegir
      }
      this._vasoShell(c, v.x, y, sh.cupW, sh.cupH, 0, alfa);
    };
    for (const v of sh.vasos) if (v.i !== sh.delantero) dibujarVaso(v);
    if (sh.delantero != null) dibujarVaso(sh.vasos[sh.delantero]);
    c.globalAlpha = 1;
  },

  // Una bolita del juego — cada una CONSERVA EL COLOR DE SU SEGMENTO
  // (se pidió así: al levantar el vaso se ve de qué nombre era), con su
  // brillo de esfera y su sombra en la mesa. "elegida" le pone encima un
  // HALO DORADO latiendo —¡el ganador!— sin tapar su color.
  _bolitaShell(c, b, t) {
    if (b.elegida) {
      const pulso = 0.5 + 0.5 * Math.sin(t * 6);
      c.beginPath();
      c.arc(b.x, b.y, b.r * (1.9 + 0.35 * pulso), 0, TAU);
      c.fillStyle = `rgba(255, 194, 0, ${(0.20 + 0.16 * pulso).toFixed(3)})`;
      c.fill();
    }
    // sombra proyectada en la mesa
    c.beginPath();
    c.ellipse(b.x + 1.5, b.y + b.r * 0.9, b.r * 0.9, b.r * 0.4, 0, 0, TAU);
    c.fillStyle = 'rgba(0, 0, 0, 0.22)';
    c.fill();
    // la esfera: brillo → SU color → sombra (esfera de su propio color)
    const col = b.color || '#f2ead8';
    const g = c.createRadialGradient(
      b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.15, b.x, b.y, b.r);
    g.addColorStop(0, mezclaColor(col, '#ffffff', 0.55));
    g.addColorStop(0.55, col);
    g.addColorStop(1, mezclaColor(col, '#000000', 0.32));
    c.beginPath();
    c.arc(b.x, b.y, b.r, 0, TAU);
    c.fillStyle = g;
    c.fill();
    // y si es la elegida, un aro dorado fino de ganadora
    if (b.elegida) {
      c.beginPath();
      c.arc(b.x, b.y, b.r + 2, 0, TAU);
      c.strokeStyle = 'rgba(255, 196, 0, 0.9)';
      c.lineWidth = 1.8;
      c.stroke();
    }
  },

  // Un VASO boca abajo (la boca, ancha, abajo; el fondo, estrecho,
  // arriba): trapecio de plástico rojo con brillo lateral y labio.
  // (x, y) es su CENTRO — así el vaso que vuela rota sobre sí mismo.
  _vasoShell(c, x, y, cupW, cupH, rot, alfa) {
    c.save();
    c.globalAlpha = alfa;
    c.translate(x, y);
    c.rotate(rot);
    const wB = cupW / 2;                 // semi-ancho de la boca (abajo)
    const wT = (cupW * 0.74) / 2;        // semi-ancho del fondo (arriba)
    const h = cupH;
    c.beginPath();
    c.moveTo(-wB, h / 2);
    c.lineTo(-wT, -h / 2 + 5);
    c.quadraticCurveTo(-wT, -h / 2, -wT + 5, -h / 2);
    c.lineTo(wT - 5, -h / 2);
    c.quadraticCurveTo(wT, -h / 2, wT, -h / 2 + 5);
    c.lineTo(wB, h / 2);
    c.closePath();
    const grad = c.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, CONFIG.shell.colorVaso2);
    grad.addColorStop(0.55, CONFIG.shell.colorVaso1);
    grad.addColorStop(1, CONFIG.shell.colorVasoLabio);
    c.fillStyle = grad;
    c.shadowColor = 'rgba(0, 0, 0, 0.35)';
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;
    c.fill();
    c.shadowColor = 'transparent';
    // brillo lateral del plástico
    c.globalAlpha = alfa * 0.26;
    c.beginPath();
    c.moveTo(-wB * 0.45, h / 2 - 2);
    c.lineTo(-wT * 0.45, -h / 2 + 6);
    c.lineTo(-wT * 0.22, -h / 2 + 6);
    c.lineTo(-wB * 0.22, h / 2 - 2);
    c.closePath();
    c.fillStyle = '#ffffff';
    c.fill();
    // labio de la boca (borde inferior más oscuro)
    c.globalAlpha = alfa;
    c.fillStyle = CONFIG.shell.colorVasoLabio;
    c.fillRect(-wB, h / 2 - 3.5, cupW, 3.5);
    c.restore();
  },


  /* ══════════════════════════════════════════════════════════════════
     ANIMACIÓN 17 · DIANA Y DARDO (la intervención de usuario)
     ──────────────────────────────────────────────────────────────────
     Como la ruleta se vuelve una ruleta de casino, la rueda se
     TRANSFORMA (con animación) en una DIANA de dardos de las de
     verdad: gajos NEGRO y CREMA alternos, anillos doble y triple ROJO
     y VERDE, toro verde con centro rojo, banda de números negra con
     sus cifras y su araña de alambre. Y se va al LADO DERECHO del
     lienzo (como se pidió para probar), con cada NOMBRE en su gajo.
     La diana GIRA UN POCO (lenta, como las de verdad)… los NOMBRES SE
     DESVANECEN (ya nadie sabe dónde está nadie)… y entonces el
     profesor agarra el DARDO y lo LANZA: vuela siguiendo SU gesto, se
     CLAVA… y los nombres VUELVEN para revelar que el gajo del dardo es
     el ganador. Al cerrar la tarjeta, la diana se transforma de vuelta
     en la rueda de siempre.
     ══════════════════════════════════════════════════════════════════ */

  // La coreografía completa. La aporta js/ui.js:
  //   · pedirLanzamiento() → la ALERTA DEL NAVEGADOR (y la pista).
  //   · alLanzarUI()      → apaga la pista cuando el dardo ya vuela.
  //   · definirGanador(i) → el ganador pasa a ser el gajo del dardo.
  async jugarDiana({ pedirLanzamiento, alLanzarUI, definirGanador }) {
    const est = this.estado;
    const n = est.lista.length;
    if (!n) return;
    est.velAng = 0;                       // la rueda está quieta: es una diana
    const D = CONFIG.dardos;
    // el dardo espera a la IZQUIERDA (la diana vive a la derecha)
    const reposo = { x: est.tam * 0.10, y: est.tam * 0.60 };

    const d = est.diana = {
      fase: 'transformar', alfa: 1, t: 0,
      m: 0,                 // la morfosis: 0 = rueda de siempre, 1 = diana
      vel: 0,               // lo que gira la diana ahora (rad/s)
      n,
      // el destino de la diana: al LADO DERECHO, como se pidió probar
      dx: est.tam * D.lado, dy: est.tam * D.altura,
      Rd: est.tam * D.radio,
      bx: est.cx, by: est.cy, R: est.r,   // (se recalculan con el morph)
      nombresAlfa: 1,       // los nombres se desvanecen (y vuelven)
      alfaFlecha: 1,        // la flecha de siempre se FUNDIÓ al transformarse
      dart: { x: 0, y: 0, rot: 0, esc: 0, modo: 'perfil' },
      reposo, historia: null,
      ganadorIdx: null, aterrizaje: null,
    };
    d.alLanzarUI = alLanzarUI || null;   // js/ui.js apaga la pista al lanzar
    // el dardo NACE donde está la flecha (es SU transformación)…
    const gF = this._geoFlecha();
    const naceX = d.dart.x = est.cx + Math.cos(ANGULO_FLECHA_TOPE) * gF.pivote;
    const naceY = d.dart.y = est.cy + Math.sin(ANGULO_FLECHA_TOPE) * gF.pivote;

    // 1) LA TRANSFORMACIÓN: la rueda se convierte en la DIANA (colores
    //    clásicos, anillos, toro, araña, números) mientras da unas
    //    vueltas… y la diana se desliza al LADO DERECHO; la flecha se
    //    convierte en DARDO, que baja flotando a su espera (izquierda).
    Sonido.transformacion();
    await this._animarT(1.35, t => {
      const e = suavizarPaso(t);
      d.m = e;
      d.alfaFlecha = 1 - Math.min(1, t * 1.8);   // la flecha se funde pronto
      // el dardo nace a partir del 30 % (cuando ya hay diana dibujada)
      const eD = suavizarPaso(Math.max(0, (t - 0.30) / 0.70));
      d.dart.esc = eD;
      d.dart.x = naceX + (reposo.x - naceX) * eD;
      d.dart.y = naceY + (reposo.y - naceY) * eD;
      d.dart.rot = Math.atan2(d.dy - reposo.y, d.dx - reposo.x) * eD;
    });

    // 2) La diana GIRA UN POCO con los nombres PUESTOS: todos ven dónde
    //    está cada cual… por ahora.
    d.fase = 'nombres';
    d.t = 0;
    await new Promise(r => setTimeout(r, 2300));

    // 3) …y los NOMBRES SE DESVANECEN (la diana sigue girando lenta):
    //    a partir de aquí nadie sabe dónde está nadie.
    d.fase = 'ocultando';
    await this._animarT(0.9, t => { d.nombresAlfa = 1 - t; });
    d.fase = 'listo';
    d.t = 0;

    // 4) LA ALERTA DEL NAVEGADOR: "te toca tirar el dardo".
    if (pedirLanzamiento) await pedirLanzamiento();

    // 5) El profesor agarra el dardo y lo lanza (la promesa la resuelve
    //    _dianaLanzar cuando el vuelo de verdad arranca; si lo suelta
    //    flojo, el dardo vuelve a su puesto y puede reintentarlo).
    await new Promise(res => { d.alLanzarDardo = res; });

    // 6) Vuelo, clavado y revelación (todo en _pasoDiana): aquí solo
    //    esperamos a que el dardo esté clavado, los nombres hayan
    //    vuelto y el gajo del ganador esté latiendo.
    await new Promise(res => { d.alFinDiana = res; });

    // 7) Donde cayó el dardo: ESE es el ganador.
    if (definirGanador && d.ganadorIdx != null) definirGanador(d.ganadorIdx);

    // Un respiro para saborear el dardo clavado antes de la tarjeta.
    await new Promise(r => setTimeout(r, 900));
  },

  // El final de la diana: el dardo se disuelve y la diana se TRANSFORMA
  // de vuelta en la rueda de siempre (morfosis inversa: los colores
  // vuelven a la paleta, los anillos se funden, la diana regresa al
  // centro… y la flecha reaparece). Lo llama restaurar(), en js/ui.js.
  async finDiana() {
    const est = this.estado;
    if (!est.diana) return;
    const d = est.diana;
    this._canvas.style.cursor = '';
    if (d.fase !== 'fin') {
      d.fase = 'fin';
      d.vel = 0;
      try {
        await this._animarT(0.85, t => {
          const e = suavizarPaso(t);
          d.m = 1 - e;                  // diana → rueda
          d.alfaFlecha = e;              // la flecha reaparece
          d.dart.esc = Math.max(0, 1 - e * 1.6);   // el dardo se disuelve pronto
        });
      } catch (e) { /* interrumpido: se limpia igual */ }
    }
    est.diana = null;
  },

  // Un paso de la escena del dardo (lo llama el bucle maestro).
  _pasoDiana(dt) {
    const est = this.estado;
    const d = est.diana;
    if (!d) return;
    d.t += dt;

    // — la geometría de la morfosis (centro y radio actuales) —
    d.bx = est.cx + (d.dx - est.cx) * d.m;
    d.by = est.cy + (d.dy - est.cy) * d.m;
    d.R = est.r + (d.Rd - est.r) * d.m;

    // — el GIRO: la diana "gira un poco" (lenta, como las de verdad) —
    const crucero = TAU * (CONFIG.dardos.vueltas || 0.22);
    switch (d.fase) {
      case 'transformar':
        // mientras se transforma, va frenando de su primer empujón
        d.vel = crucero + (TAU * 1.05 - crucero) * Math.exp(-d.t * 2.0);
        break;
      case 'nombres':
      case 'ocultando':
      case 'listo':
        d.vel = crucero;
        break;
      case 'agarrado':
        // el profesor agarra el dardo: la diana SE PARA (nadie acertaría
        // a una diana girando; su puntería se respeta)
        d.vel *= Math.exp(-dt * 11);
        if (d.vel < 0.05) d.vel = 0;
        break;
      default:
        d.vel = 0;
    }
    est.anguloRueda += d.vel * dt;
    est.velAng = d.vel;

    const dart = d.dart;
    if (d.fase === 'listo') {
      // flotando en su puesto, invitando a que lo agarren (si venía de
      // un soltón flojo, se RECOLOCA suavecito — sin teletransportes)
      const k = 1 - Math.pow(0.0015, dt);
      const ox = d.reposo.x + Math.sin(d.t * 1.8) * 6;
      const oy = d.reposo.y + Math.sin(d.t * 2.3) * 5;
      dart.x += (ox - dart.x) * k;
      dart.y += (oy - dart.y) * k;
      const rot0 = Math.atan2(d.by - dart.y, d.bx - dart.x) + Math.sin(d.t * 2.0) * 0.06;
      dart.rot += (rot0 - dart.rot) * k;
      dart.esc = 1;

    } else if (d.fase === 'agarrado') {
      // la posición la marca el puntero (la pone _dianaPuntero)

    } else if (d.fase === 'vuelo') {
      const v = d.vuelo;
      v.p += dt / v.dur;
      const p = Math.min(1, v.p);
      const q = 1 - p;
      // curva cuadrática: sale con el GESTO del profesor (su dirección)…
      dart.x = q * q * v.x0 + 2 * q * p * v.cx + p * p * v.x1;
      dart.y = q * q * v.y0 + 2 * q * p * v.cy + p * p * v.y1;
      // …y rota siguiendo la tangente de su propio vuelo
      const dx = 2 * q * (v.cx - v.x0) + 2 * p * (v.x1 - v.cx);
      const dy = 2 * q * (v.cy - v.y0) + 2 * p * (v.y1 - v.cy);
      if (Math.hypot(dx, dy) > 0.001) dart.rot = Math.atan2(dy, dx);
      dart.esc = 1 - 0.45 * p;         // se aleja: se hace pequeño
      if (p >= 1) {
        // ¡CLAVADO! El gajo es el que esté AHORA debajo de ese punto de
        // pantalla (se mira la rotación REAL en el instante del impacto:
        // aunque quedara un resto de giro, el gajo es el de verdad).
        const aPant = Math.atan2(v.y1 - d.by, v.x1 - d.bx);
        const Rr = Math.min(d.R * 0.93, Math.hypot(v.x1 - d.bx, v.y1 - d.by));
        const angRueda = norm(aPant - est.anguloRueda);   // ángulo EN la diana
        d.aterrizaje = { ang: angRueda, Rr };
        d.ganadorIdx = Math.floor(angRueda / (TAU / d.n)) % d.n;
        d.fase = 'clavado';
        d.flip = 0;
        d.vibra = 1;
        dart.modo = 'clavado';
        Sonido.clavarDardo();
      }

    } else if (d.fase === 'clavado') {
      // el dardo vibra… y los NOMBRES VUELVEN: todos ven de qué gajo
      // era el que acaba de ganar (la gran revelación).
      d.flip += dt / 0.75;
      d.nombresAlfa = Math.min(1, d.flip);
      d.vibra = Math.max(0, (d.vibra || 0) - dt * 1.8);
      if (d.flip >= 1) {
        d.nombresAlfa = 1;
        d.fase = 'final';
        Sonido.pop();          // el "plop" de la revelación
        if (d.alFinDiana) { d.alFinDiana(); d.alFinDiana = null; }
      }

    } else if (d.fase === 'final') {
      // el gajo del ganador LATE (lo dibuja _dibujarDiana)
      d.vibra = Math.max(0, (d.vibra || 0) - dt * 1.8);
    }
  },

  // Los punteros del dardo (ratón, dedo o tableta): agarrarlo,
  // arrastrarlo y soltarlo. Si lo suelta con fuerza de verdad, vuela;
  // si no, vuelve a su puesto (y puede reintentarlo cuantas veces quiera).
  _dianaPuntero(e, tipo) {
    const d = this.estado.diana;
    if (!d || (d.fase !== 'listo' && d.fase !== 'agarrado')) return;
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dart = d.dart;
    const est = this.estado;
    const rGrab = Math.max(30, est.tam * 0.06);

    if (tipo === 'bajar') {
      if (Math.hypot(x - dart.x, y - dart.y) <= rGrab) {
        d.fase = 'agarrado';
        d.historia = [{ x, y, t: performance.now() }];
        try { this._canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        this._canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
      return;
    }

    if (tipo === 'mover') {
      if (d.fase === 'agarrado') {
        dart.x = Math.max(-30, Math.min(est.tam + 30, x));
        dart.y = Math.max(10, Math.min(est.tam - 6, y));
        // mientras lo lleva, el dardo APUNTA a la diana
        dart.rot = Math.atan2(d.by - dart.y, d.bx - dart.x);
        d.historia.push({ x, y, t: performance.now() });
        if (d.historia.length > 8) d.historia.shift();
      } else if (d.fase === 'listo') {
        // el cursor promete que se puede agarrar
        const cerca = Math.hypot(x - dart.x, y - dart.y) <= rGrab;
        this._canvas.style.cursor = cerca ? 'grab' : '';
      }
      return;
    }

    if (tipo === 'subir' && d.fase === 'agarrado') {
      d.fase = 'listo';
      this._canvas.style.cursor = '';
      // la velocidad del GESTO (media de la historia reciente)
      let vx = 0, vy = 0;
      const h = d.historia;
      if (h && h.length >= 2) {
        const a = h[0], b = h[h.length - 1];
        const dtm = Math.max(0.016, (b.t - a.t) / 1000);
        vx = (b.x - a.x) / dtm;
        vy = (b.y - a.y) / dtm;
      }
      d.historia = null;
      if (Math.hypot(vx, vy) > 420) {
        this._dianaLanzar(d, vx, vy);   // ¡a volar!
      } else {
        Sonido.pop();                   // lo soltó flojo: vuelve flotando
      }
    }
  },

  // ¡El dardo vuela! El destino se sortea JUSTO dentro de la diana (un
  // gajo al azar, a una altura al azar: el sorteo sigue siendo justo);
  // la primera parte del vuelo SIGUE la dirección del gesto del profesor
  // (los primeros instantes van hacia donde él lo tiró: el lanzamiento
  // se siente SUYO). Al clavarse, el gajo será el que esté bajo ese
  // punto — y sus nombres ya se desvanecieron: la sorpresa es total.
  _dianaLanzar(d, vx, vy) {
    const est = this.estado;
    const n = est.lista.length;
    const s = TAU / n;
    const w = enteroAleatorio(n);            // el gajo del destino
    const u = 0.2 + Math.random() * 0.6;     // …y su altura dentro de él
    const ang = est.anguloRueda + (w + u) * s;   // ángulo de PANTALLA
    const Rr = d.R * azar(0.30, 0.92);       // lejos del toro siempre
    // el punto de PANTALLA de ese punto de la diana:
    const x1 = d.bx + Math.cos(ang) * Rr;
    const y1 = d.by + Math.sin(ang) * Rr;
    // el control inicial sigue el GESTO:
    const vel = Math.hypot(vx, vy) || 1;
    const ux = vx / vel, uy = vy / vel;
    const d0 = Math.hypot(x1 - d.dart.x, y1 - d.dart.y);
    const adelanto = Math.min(d0 * 0.45, 160);
    d.vuelo = {
      x0: d.dart.x, y0: d.dart.y,
      cx: d.dart.x + ux * adelanto,
      cy: d.dart.y + uy * adelanto - 26,   // …con su arquito de vuelo
      x1, y1,
      p: 0,
      dur: Math.max(0.42, Math.min(0.8, d0 / 760)),
    };
    d.fase = 'vuelo';
    Sonido.whoosh();
    if (d.alLanzarDardo) { d.alLanzarDardo(); d.alLanzarDardo = null; }
    if (d.alLanzarUI) d.alLanzarUI();       // js/ui.js apaga la pista
  },

  // La escena de la DIANA (render() deriva aquí mientras haya est.diana):
  // la rueda TRANSFORMADA en una diana clásica —gajos negro y crema,
  // anillos doble y triple rojo/verde, toro, araña de alambre, números
  // alrededor— al LADO DERECHO, con su sombra en el suelo… y el DARDO
  // encima de todo. La morfosis m (0→1) va de la rueda de siempre a la
  // diana completa (y al revés al despedirse): colores, centro y radio
  // se interpolan, así el viaje de ida y vuelta es una sola animación.
  _dibujarDiana(c, est) {
    const d = est.diana;
    if (!d) return;
    const t = performance.now() / 1000;
    const alfa = d.alfa != null ? d.alfa : 1;
    const m = d.m;
    const n = d.n;
    const s = TAU / n;
    const D = CONFIG.dardos;
    const bx = d.bx, by = d.by, R = d.R;

    // sombra en el "suelo": la diana asentada en la página
    c.save();
    c.globalAlpha = alfa * 0.17 * m;
    c.beginPath();
    c.ellipse(bx, by + R + 12, R * 0.85, R * 0.14, 0, 0, TAU);
    c.fillStyle = 'rgba(20, 25, 40, 1)';
    c.fill();
    c.restore();

    // — los GAJOS: la rueda de siempre, recolorida a negro/crema —
    c.save();
    c.globalAlpha = alfa;
    c.translate(bx, by);
    for (let i = 0; i < n; i++) {
      const negro = i % 2 === 0;              // alternos, como la de verdad
      const a0 = est.anguloRueda + i * s;
      c.beginPath(); c.moveTo(0, 0);
      c.arc(0, 0, R, a0, a0 + s);
      c.closePath();
      c.fillStyle = mezclaColor(est.colores[i],
        negro ? D.colorGajoNegro : D.colorGajoCrema, m);
      c.fill();
      c.strokeStyle = this._bordeSegmentos();
      c.lineWidth = CONFIG.grosorBordeSegmentos;
      c.stroke();
    }

    // — la BANDA DE NÚMEROS: el aro negro del borde, con cifras —
    if (m > 0.02) {
      c.save();
      c.globalAlpha = alfa * m;
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.arc(0, 0, R * 0.94, 0, TAU, true);
      c.fillStyle = D.colorBanda;
      c.fill('evenodd');
      c.font = `600 ${Math.max(8, R * 0.05)}px system-ui, 'Segoe UI', sans-serif`;
      c.fillStyle = D.colorNumeros;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        c.save();
        c.rotate(est.anguloRueda + (i + 0.5) * s);
        c.fillText(String(i + 1), R * 0.97, 0);
        c.restore();
      }
      c.restore();
    }

    // — los ANILLOS: doble y triple (rojo sobre gajo negro, verde sobre
    //    el crema — como las de verdad) —
    if (m > 0.02) {
      c.save();
      c.globalAlpha = alfa * m;
      for (const [ri, ra] of [[0.85, 0.94], [0.47, 0.55]]) {
        for (let i = 0; i < n; i++) {
          const negro = i % 2 === 0;
          const a0 = est.anguloRueda + i * s;
          c.beginPath();
          c.arc(0, 0, R * ra, a0, a0 + s);
          c.arc(0, 0, R * ri, a0 + s, a0, true);
          c.closePath();
          c.fillStyle = negro ? D.colorAnilloRojo : D.colorAnilloVerde;
          c.fill();
        }
      }
      // el TORO (verde) con su centro ROJO
      c.beginPath(); c.arc(0, 0, R * 0.13, 0, TAU);
      c.fillStyle = D.colorToro; c.fill();
      c.beginPath(); c.arc(0, 0, R * 0.055, 0, TAU);
      c.fillStyle = D.colorToroCentro; c.fill();
      c.restore();
    }

    // — la ARAÑA: el alambre que separa gajos y anillos —
    if (m > 0.02) {
      c.save();
      c.globalAlpha = alfa * m;
      c.strokeStyle = D.colorArania;
      c.lineWidth = 1.2;
      for (let i = 0; i < n; i++) {          // los radios del toro a la banda
        const a0 = est.anguloRueda + i * s;
        c.beginPath();
        c.moveTo(Math.cos(a0) * R * 0.055, Math.sin(a0) * R * 0.055);
        c.lineTo(Math.cos(a0) * R * 0.94, Math.sin(a0) * R * 0.94);
        c.stroke();
      }
      for (const rr of [0.94, 0.85, 0.55, 0.47, 0.13]) {   // los aros
        c.beginPath(); c.arc(0, 0, R * rr, 0, TAU); c.stroke();
      }
      c.restore();
    }

    // — la maza de la rueda se funde en el toro —
    const hub = Math.min(28, est.r * 0.14);
    c.beginPath();
    c.arc(0, 0, hub + (R * 0.13 - hub) * m, 0, TAU);
    c.fillStyle = mezclaColor('#0e1525', D.colorToro, m);
    c.fill();
    c.beginPath();
    c.arc(0, 0, (hub * 0.5) + (R * 0.055 - hub * 0.5) * m, 0, TAU);
    c.fillStyle = mezclaColor('#0e1525', D.colorToroCentro, m);
    c.fill();

    // — los NOMBRES, uno por gajo (radiales, como la rueda de siempre;
    //    se DESVANECEN para que nadie siga a nadie… y VUELVEN al final) —
    if (n <= CONFIG.maxNombresTexto) {
      const alfaN = alfa * d.nombresAlfa;
      if (alfaN > 0.02) {
        const fs = Math.max(9, Math.min(26 - 4 * m, s * R * 0.55));
        c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
        c.textAlign = 'right';
        c.textBaseline = 'middle';
        c.globalAlpha = alfaN;
        // el texto vive del borde de la rueda al gajo exterior de la
        // diana, y desde ahí hacia dentro (se pasa por encima de los
        // anillos: que se LEA, que es una rueda de nombres)
        const rTex = (est.r - 12) + (R * 0.86 - (est.r - 12)) * m;
        const maxW = est.r * 0.52 + (R * 0.52 - est.r * 0.52) * m;
        for (let i = 0; i < n; i++) {
          const negro = i % 2 === 0;
          c.fillStyle = mezclaColor(CONFIG.colorTextoSegmentos,
            negro ? '#ffffff' : '#26262b', m);
          c.save();
          c.rotate(est.anguloRueda + (i + 0.5) * s);
          c.fillText(ajustarTexto(c, est.lista[i], maxW), rTex, 0);
          c.restore();
        }
        c.globalAlpha = 1;
      }
    }

    // — el gajo del ganador LATE (una vez clavado el dardo) —
    if (d.fase === 'final' && d.ganadorIdx != null) {
      const i = d.ganadorIdx;
      const a0 = est.anguloRueda + i * s;
      const pulso = 0.30 + 0.25 * Math.sin(t * Math.PI * 2 * 1.6);
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a0, a0 + s); c.closePath();
      c.fillStyle = `rgba(255, 255, 255, ${Math.max(0, pulso).toFixed(3)})`;
      c.fill();
    }
    c.restore();

    // la flecha de siempre se FUNDIÓ al transformarse la rueda (alfaFlecha)
    if (d.alfaFlecha > 0.03) {
      c.save();
      c.globalAlpha = alfa * d.alfaFlecha;
      const g = this._geoFlecha();
      const px = est.cx + Math.cos(ANGULO_FLECHA_TOPE) * g.pivote;
      const py = est.cy + Math.sin(ANGULO_FLECHA_TOPE) * g.pivote;
      this._dibujarTrianguloFlecha(c, px, py, ANGULO_FLECHA_TOPE + Math.PI / 2);
      c.restore();
    }

    // …y el DARDO, encima de todo (esperando, agarrado, volando o clavado)
    this._dibujarDardo(c, est, d);
    c.globalAlpha = 1;
  },

  // El DARDO. Dos vistas:
  //   · PERFIL (esperando / agarrado / volando): punta metálica, cuerpo
  //     ROJO (el selector de siempre, alargado) y plumas en la cola.
  //   · CLAVADO (la diana ya de frente): las plumas en cruz y el cuerpo
  //     asomando hacia el espectador, vibrando al clavarse.
  _dibujarDardo(c, est, d) {
    const alfa = d.alfa != null ? d.alfa : 1;
    const dart = d.dart;
    const escBase = est.tam / 480;

    if (dart.modo === 'clavado' && d.aterrizaje) {
      // CLAVADO: la punta está en SU punto de la diana (el ángulo es DE
      // LA DIANA, así viaja con ella si le quedara giro), visto de frente.
      const { ang, Rr } = d.aterrizaje;
      const px = d.bx + Math.cos(ang + est.anguloRueda) * Rr;
      const py = d.by + Math.sin(ang + est.anguloRueda) * Rr;
      const rot = (d.vibra || 0) * Math.sin((d.t || 0) * 42) * 0.16;
      const esc = Math.max(0.4, dart.esc) * escBase;
      c.save();
      c.globalAlpha = alfa;
      c.translate(px, py);
      c.rotate(rot);
      c.scale(esc, esc);
      // sombrita sobre la diana
      c.beginPath();
      c.ellipse(3, 5, 13, 5, 0, 0, TAU);
      c.fillStyle = 'rgba(0, 0, 0, 0.28)';
      c.fill();
      // las plumas, en cruz (rojas y blancas)
      for (const a of [Math.PI / 4, -Math.PI / 4]) {
        c.save();
        c.rotate(a);
        for (const sgn of [1, -1]) {
          c.beginPath();
          c.moveTo(0, sgn * 3);
          c.lineTo(-15, sgn * 10);
          c.lineTo(-15, sgn * 16);
          c.lineTo(4, sgn * 7);
          c.closePath();
          c.fillStyle = sgn > 0 ? '#ff6b7a' : '#ffffff';
          c.fill();
          c.strokeStyle = 'rgba(60, 30, 30, 0.35)';
          c.lineWidth = 0.8;
          c.stroke();
        }
        c.restore();
      }
      // el cuerpo asomando hacia el frente (el cilindrito del mástil)
      c.beginPath();
      c.arc(0, 0, 4.6, 0, TAU);
      const g = c.createRadialGradient(-1.5, -1.5, 1, 0, 0, 5);
      g.addColorStop(0, '#ffb3bc');
      g.addColorStop(1, '#c9184a');
      c.fillStyle = g;
      c.fill();
      c.restore();
      return;
    }

    // PERFIL
    if (dart.esc <= 0.02) return;
    c.save();
    c.globalAlpha = alfa;
    const esc = dart.esc * escBase * 1.25;
    c.translate(dart.x, dart.y);
    c.rotate(dart.rot);
    c.scale(esc, esc);
    // halo suave mientras espera (invita a agarrarlo)
    if (d.fase === 'listo') {
      c.beginPath();
      c.arc(0, 0, 34, 0, TAU);
      c.fillStyle = 'rgba(255, 209, 102, 0.16)';
      c.fill();
    }
    // — la punta (a la derecha: el dardo apunta hacia +x) —
    c.beginPath();
    c.moveTo(26, 0);
    c.lineTo(12, -3.2);
    c.lineTo(12, 3.2);
    c.closePath();
    const gTip = c.createLinearGradient(26, 0, 12, 0);
    gTip.addColorStop(0, '#ffffff');
    gTip.addColorStop(0.5, '#c7d0de');
    gTip.addColorStop(1, '#8b96a8');
    c.fillStyle = gTip;
    c.fill();
    // — el cuerpo (el selector ROJO de siempre, alargado) —
    const [c0, c1, c2] = CONFIG.coloresFlecha;
    const gBody = c.createLinearGradient(0, -4, 0, 4);
    gBody.addColorStop(0, c0);
    gBody.addColorStop(0.45, c1);
    gBody.addColorStop(1, c2);
    c.beginPath();
    c.moveTo(12, -3.2);
    c.lineTo(-16, -2.2);
    c.lineTo(-16, 2.2);
    c.lineTo(12, 3.2);
    c.closePath();
    c.fillStyle = gBody;
    c.fill();
    // — las plumas (la cola) —
    c.beginPath();
    c.moveTo(-16, 0); c.lineTo(-26, -9); c.lineTo(-21, -1); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    c.beginPath();
    c.moveTo(-16, 0); c.lineTo(-26, 9); c.lineTo(-21, 1); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    c.beginPath();
    c.moveTo(-16, 0); c.lineTo(-24, -6); c.lineTo(-19, -1); c.closePath();
    c.fillStyle = '#ff6b7a'; c.fill();
    c.beginPath();
    c.moveTo(-16, 0); c.lineTo(-24, 6); c.lineTo(-19, 1); c.closePath();
    c.fillStyle = '#ff6b7a'; c.fill();
    c.restore();
  },


  /* ══════════════════════════════════════════════════════════════════
     ANIMACIONES 10 y 16 · LOS SEGMENTOS QUE SE VAN (volando o cayendo)
     ──────────────────────────────────────────────────────────────────
     · 10 — A TODA VELOCIDAD: la rueda gira tan ridículamente rápido
       que los segmentos salen VOLANDO de uno en uno —cada uno con su
       nombre— empujados por la fuerza centrífuga: velocidad
       tangencial + radial hacia fuera, gravedad y volteretas sobre su
       propio centroide, desvaneciéndose. El ganador nunca vuela.
     · 16 — LA RUEDA SE DESARMA: la rueda NI SE MOVIMIENTA; al pulsarla
       los segmentos perdedores se DESPRENDEN y se caen en cascada
       (gravedad + volteretas, sin impulso lateral — a plomo). Solo
       queda el ganador, clavado en la rueda, y la flecha RECORRE el
       borde hasta señalarlo. El desenfoque de movimiento lo lleva
       render() con la velocidad angular estimada (est.velAng).
     ══════════════════════════════════════════════════════════════════ */

  // Desprende el segmento i: sale volando con física (lo llama la
  // animación 10, una y otra vez, hasta dejar solo al ganador).
  volarSegmento(i) {
    const est = this.estado;
    const n = est.lista.length;
    if (i < 0 || i >= n || this._excluidos.has(i)) return;
    this._excluidos.add(i);
    const s = TAU / n;
    const ang0 = est.anguloRueda + i * s;      // frontera del sector (congelada)
    const angC = ang0 + s / 2;                 // ángulo medio del sector
    const Rc = est.r * 0.6;                     // radio de su centroide
    // El empujón: tangencial (continúa el giro, como el latigazo de una
    // honda) + radial hacia fuera (la centrífuga). Con tope: la idea
    // es que se VUELE el vuelo, no que desaparezca en dos frames.
    const vT = Math.min(1400, Math.max(600, est.velAng * est.r * 0.5));
    const vR = azar(260, 520);
    const tx = -Math.sin(angC), ty = Math.cos(angC);   // tangente horaria
    const rx = Math.cos(angC),  ry = Math.sin(angC);   // radial hacia fuera
    this._vuelos.push({
      i, ang0, Rc,
      x: est.cx + Math.cos(angC) * Rc,           // centroide en el mundo
      y: est.cy + Math.sin(angC) * Rc,
      vx: tx * vT + rx * vR,
      vy: ty * vT + ry * vR,
      rot: 0,
      w: azar(5, 12) * (Math.random() < 0.5 ? -1 : 1),  // volteretas
      t: 0, vida: azar(0.75, 1.0), alfa: 1,
    });
  },

  // Desprende el segmento i y se CAE A PLOMO… hasta EL SUELO (anim. 16).
  // La rueda está QUIETA (no hay centrífuga): el segmento se suelta,
  // tambalea con volteretas suaves y la gravedad se lo lleva — hasta
  // el BORDE INFERIOR del cuadro, que es el suelo de verdad. Ahí BOTA
  // un rebotico… se POSA… Y SUENA AL TOCAR EL SUELO (la "háptica"
  // que se pidió: un golpe sordo por CADA pedazo que llega al piso).
  // Los pedazos ya posados NO se desvanecen: quedan ahí, esparcidos
  // por el suelo — como la versión anterior que al profesor le gustaba
  // ("todos caen al suelo") — hasta que la rueda se recompone.
  // k = su número en la cascada (para que cada uno suene distinto).
  caerSegmento(i, k = 0) {
    const est = this.estado;
    const n = est.lista.length;
    if (i < 0 || i >= n || this._excluidos.has(i)) return;
    this._excluidos.add(i);
    const s = TAU / n;
    const ang0 = est.anguloRueda + i * s;      // frontera del sector (congelada)
    const angC = ang0 + s / 2;                 // ángulo medio del sector
    const Rc = est.r * 0.6;                    // radio de su centroide
    // Despegue tímido: apenas un deslizamiento hacia fuera y un temblor
    // de voltereta… y la gravedad se lo lleva.
    this._vuelos.push({
      i, k: k || 0, ang0, Rc, tipo: 'cae',
      x: est.cx + Math.cos(angC) * Rc,
      y: est.cy + Math.sin(angC) * Rc,
      vx: Math.cos(angC) * azar(25, 85) + azar(-30, 30),
      vy: azar(-25, 5),
      rot: 0,
      w: azar(1.2, 4.2) * (Math.random() < 0.5 ? -1 : 1),  // volteretas suaves
      t: 0, vida: 999, alfa: 1,        // no se desvanece: llega al suelo y se queda
      rad: Math.max(12, est.r * 0.40), // su "radio" efectivo (para tocar el suelo)
      botes: 1, toco: false, posado: false,
    });
  },

  // Vuelta a la normalidad (lo llama restaurar() al terminar el giro).
  finVuelos() {
    this._vuelos.length = 0;
    this._excluidos.clear();
  },

  // La física de los segmentos en vuelo (lo llama el bucle maestro).
  // Los que CAEN (animación 16) tienen SUELO: caen, botan un rebotico,
  // SE POSAN — y suenan al tocar el piso, uno a uno — y se quedan ahí
  // (no se desvanecen: al profesor le gustaba verlos caer TODOS al
  // suelo). Los que VUELAN (animación 10) se desvanecen como siempre.
  _pasoVuelos(dt) {
    const v = this._vuelos;
    if (!v.length) return;
    const g = CONFIG.voladora.gravedad;
    const tam = this.estado.tam;
    const suelo = tam - 10;             // EL SUELO: el borde inferior del cuadro
    for (let k = v.length - 1; k >= 0; k--) {
      const q = v[k];
      q.t += dt;
      if (q.tipo === 'cae') {
        if (q.posado) continue;        // ya está en el suelo, tranquilo
        q.vy += g * dt;                 // gravedad
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.rot += q.w * dt;
        // ¿tocó el suelo? — EL TOC: el sonido de LLEGAR al piso
        if (q.y + q.rad >= suelo && q.vy > 0) {
          q.y = suelo - q.rad;
          const fuerza = Math.min(1, 0.30 + q.vy / 700);
          if (!q.toco) {
            q.toco = true;
            Sonido.aterrizar(q.k, fuerza);   // ¡TOC! — este pedazo, al suelo
          } else {
            Sonido.golpe(0.14);              // el rebotico, más flojito
          }
          if (q.botes > 0 && q.vy > 240) {
            // bota un rebotico… y la gravedad lo vuelve a bajar
            q.vy = -q.vy * 0.30;
            q.vx *= 0.55;
            q.w *= 0.45;
            q.botes--;
          } else {
            // se POSA: quieto en el suelo (se queda hasta el final)
            q.vy = 0; q.vx = 0; q.w = 0;
            q.posado = true;
          }
        }
        continue;
      }
      // — los que VUELAN (animación 10): igual que siempre —
      q.vy += g * dt;                 // gravedad
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.rot += q.w * dt;
      if (q.t > q.vida * 0.55) {
        q.alfa = Math.max(0, 1 - (q.t - q.vida * 0.55) / (q.vida * 0.45));
      }
      if (q.t >= q.vida || q.y > tam + 140) v.splice(k, 1);
    }
  },

  // Los segmentos volando, dibujados como cuñas RÍGIDAS (con su nombre)
  // girando sobre su centroide mientras vuelan por el cuadro.
  _dibujarVuelos(c) {
    const est = this.estado;
    const v = this._vuelos;
    if (!v.length) return;
    const n = est.lista.length;
    if (!n) return;
    const s = TAU / n;
    for (const q of v) {
      c.save();
      c.globalAlpha = q.alfa;
      // transformación rígida: mundo ← trasladar(centroide) · rotar(spin)
      // · quitar(centroide original) — así la cuña gira sobre su panza
      c.translate(q.x, q.y);
      c.rotate(q.rot);
      c.translate(-Math.cos(q.ang0 + s / 2) * q.Rc, -Math.sin(q.ang0 + s / 2) * q.Rc);
      // la cuña congelada, en coordenadas de la rueda
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, est.r, q.ang0, q.ang0 + s);
      c.closePath();
      c.fillStyle = est.colores[q.i];
      c.fill();
      // contorno "negativo" también en vuelo (color del fondo)
      c.strokeStyle = this._bordeSegmentos();
      c.lineWidth = CONFIG.grosorBordeSegmentos;
      c.stroke();
      // y su nombre viaja con él (para siempre en la memoria de la clase)
      if (n <= CONFIG.maxNombresTexto) {
        const fs = Math.max(9, Math.min(26, s * est.r * 0.55));
        c.font = `600 ${fs}px system-ui, 'Segoe UI', sans-serif`;
        c.fillStyle = CONFIG.colorTextoSegmentos;
        c.textAlign = 'right';
        c.textBaseline = 'middle';
        c.save();
        c.rotate(q.ang0 + s / 2);
        c.fillText(ajustarTexto(c, est.lista[q.i], est.r * 0.52), est.r - 12, 0);
        c.restore();
      }
      c.restore();
    }
    c.globalAlpha = 1;
  },
};


// Recorta un texto para que quepa en maxW píxeles (con puntos suspensivos).
function ajustarTexto(c, texto, maxW) {
  if (c.measureText(texto).width <= maxW) return texto;
  let recortado = texto;
  while (recortado.length > 1 && c.measureText(recortado + '…').width > maxW) {
    recortado = recortado.slice(0, -1);
  }
  return recortado + '…';
}

// Suavizado de paso (smoothstep): el morph del casino entra/sale sin tirones.
function suavizarPaso(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// '#b3122e' → [179, 18, 46] (para mezclar colores durante el morph).
function hexARgb(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Mezcla el color a → b en proporción k (0..1): el morph de la animación 9
// funde los colores de la rueda de nombres en los rojo/negro del casino.
function mezclaColor(a, b, k) {
  const A = hexARgb(a), B = hexARgb(b);
  const k2 = Math.max(0, Math.min(1, k));
  return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * k2) + ', '
      + Math.round(A[1] + (B[1] - A[1]) * k2) + ', '
      + Math.round(A[2] + (B[2] - A[2]) * k2) + ')';
}
