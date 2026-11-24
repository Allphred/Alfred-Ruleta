/* ════════════════════════════════════════════════════════════════════
   SONIDO (100 % sintetizado, sin archivos ni internet)
   ────────────────────────────────────────────────────────────────────
   Se generan ondas con la Web Audio API:

   · tic()       → el toque corto de cada clavija que cruza la flecha.
                   NO es un clac metálico realista: es un "tak" suave
                   y redondo. La gracia no es el realismo, es el RITMO:
                   el tic-tac enriquecido de la ruleta como feedback del
                   giro (cuanto más lento va, más espaciado suena… y más
                   tensión). Las clavijas ya no se DIBUJAN, pero el
                   sonido sigue igual: cruza por cada frontera.
   · crujido()   → chirrido grave (herramienta libre de tensión)
   · victoria()  → arpegio alegre al anunciar al ganador
   · chasquido() → el snap de la animación 8
   · reverso()   → zumbido descendente (herramienta libre)
   · suspenseo() → dron grave de tensión mientras la rueda se arrastra
   · gong()      → golpe solemne para la animación 8
   · golpe()     → "tok" apagado: la flecha botando en su caída… y el
                   CHOQUE de la rueda contra el tope (animación 3)

   SONIDOS DE CASINO (animación 9 — la rueda se transforma en casino):
   · transformacion() → el "shing" al vestirse de casino
   · rodilloIniciar / rodilloSet / rodilloParar → el rodar continuo de
      la bola por la pista (ruido filtrado cuya fuerza y tono siguen
      la velocidad REAL de la bola, fotograma a fotograma)
   · clack()    → el choque contra un deflector (diamante) del apron
   · toca()     → el tick fino de la bola saltando frets
   · captura()  → el "toc" de la bola presa en el bolsillo

   SONIDOS DE LA VOLADORA (animación 10 — a toda velocidad):
   · turboIniciar / turboAjustar / turboParar → EL SONIDO DE ALTA
      VELOCIDAD nuevo (mejor y un poco más alto, como se pidió): un
      chorro de AIRE (ruido filtrado) sobre un RUGIDO DE MOTOR (sierra
      grave), cuya fuerza y tono siguen la velocidad REAL de la rueda
      fotograma a fotograma — a más vueltas, más aire y más motor —
      y se apagan solos al frenar.
   · subida()   → el whir ascendente del arranque turbo (ahora más
      presente, para que se note sobre el turbo)
   · whoosh()   → el barrido de aire de cada segmento que sale volando
      (también un poco más alto)

   SONIDOS NUEVOS (animaciones 11-19):
   · pop()      → el "pop" juguetón de cada bolita que nace (anim. 15)
   · kaching()  → la caja registradora del anuncio Premium (anim. 12:
      la broma suena a dinero desde el primer segundo)
   · motorAcelerado() → EL SONIDO DE ACELERACIÓN del motor dañado
      (anim. 11): un motor que sube de vueltas CON SUS CAMBIOS DE
      MARCHA (rugido que cae y vuelve a subir, como un auto de verdad).
   · motorBajaMarcha() → EL APAGADO del motor dañado (anim. 11, al
      tocar la bolita): ya NO hay frenazo de auto (se pidió quitarlo) —
      el motor BAJA LA MARCHA una a una hasta quedarse quieto.
   · frenazoCarro()   → EL FRENAZO DRAMÁTICO DE AUTO (anim. 18 — los
      frenos dañados): el chirrido agudo de los neumáticos derrapando…
      y el "¡CLONK!" del auto ya parado, con su meneo de suspensión.
   · frenoSuave()     → LA VERSIÓN TRANQUILA (herramienta libre): el freno
      se aplica SIN drama — aire que escapa y un chirrido amable, corto.
   · pieza(k)    → el crac de CADA pedazo que se desprende en el
      desarme (anim. 16): "háptica" — cada uno suena, un pelín más
      agudo que el anterior (carraca ascendente).
   · aterrizar(k, fuerza) → EL TOC DEL SUELO (anim. 16): cada pedazo
      suena cuando LLEGA AL SUELO de verdad — el golpe sordo del
      impacto, con su matiz (se OYE que tocan el piso, uno a uno).
   · clicSeco()  → EL TOQUE SECO de los dos primeros clics sobre la
      rueda que no gira (anim. 22): la "háptica" de algo que no
      responde.
   · motorRoto()  → EL MOTOR ROMPIÉNDOSE de golpe (anim. 22, a la
      tercera): el motor tose, escupe… y muere con su CLAC.
   · bolitaSuelo() → EL TOC de una BOLITA tocando el suelo (anim. 15,
      se pidió): cada bote de las bolitas suena a bolita de verdad.
   · pernos(fuerza) → EL CHOQUE DEL SELECTOR NUEVO con los pernos
      invisibles: cada frontera que cruza bajo la BOLITA suena a
      perno metálico — un clink corto de tornillo (herramienta libre).

   EL ABANICO AVERIADO (animación 19 — "ayúdala a girar", como se
   hace en el país con los abanicos dañados):
   · cortoCircuito()  → EL CORTO ELÉCTRICO que abre la animación:
      zumbido de 50 Hz que se traba, crepitaciones de chispazos… y
      el ¡clac! del térmico que se dispara.
   · abanicoDanadoIniciar() / abanicoAjustar(v01) / abanicoParar() →
      EL ABANICO DAÑADO (suena a MÁQUINA DE RECORTARSE, tal como se
      pidió): sierras graves trabadas con un vaivén irregular de tono
      y un AM desparejo — el eje penando — sobre un soplo rasposo.
      La fuerza y el tono siguen la velocidad REAL de la rueda (frame
      a frame): se le oye penar más duro cuanto más la empujan.
   · abanicoTransicionNormal() → LA CURACIÓN: el abanico dañado pasa
      a sonar como un ABANICO SANO (aire limpio y un zumbido suave
      y constante) cuando el motor por fin agarra.

   MÚSICA DE CASINO (animación 9 — hoy APAGADA por completo: se pidió
   QUITARLE la música al casino; CONFIG.casino.musica = false):
   · casinoMusicaIniciar() / casinoMusicaParar() → el nocturno de
      salón (dormido mientras CONFIG.casino.musica sea false — si
      algún día se vuelve a pedir, con true vuelve a sonar).
   · victoriaCasino() → la fanfarria "¡GANADOOOR!" — CÁLIDA:
      metales mullidos y una ola suave, sin agudos de platillo.
   · clavarDardo() → el "¡tock!" del dardo clavándose en la diana
      (animación 17).

   Puedes ajustar el volumen general en js/config.js (CONFIG.volumen).
   ════════════════════════════════════════════════════════════════════ */

const Sonido = (() => {
  let audio = null; // el AudioContext se crea perezosamente, con el primer clic
  let ultimoTic = 0;     // instante del último tic (para no saturar a alta velocidad)
  let ticAcumulado = 0;  // intensidad "ahorrada" cuando se saltan tics

  // El rodar continuo de la bola de casino (animación 9): un lazo de
  // ruido filtrado cuya ganancia y tono siguen la velocidad de la bola.
  let rodilloSrc = null, rodilloG = null, rodilloF = null;

  // El TURBO de la voladora (animación 10): el sonido de alta velocidad
  // — aire (ruido filtrado) + motor (sierra grave) — siguiendo la
  // velocidad REAL de la rueda, frame a frame.
  let turboSrc = null, turboF = null, turboG = null;
  let turboOsc = null, turboOscG = null;

  // El temporizador de la MÚSICA DE CASINO (animación 9).
  let casinoTemporizador = null;

  // EL ABANICO AVERIADO (animación 19): las DOS voces del abanico — la
  // dañada (máquina de recortarse) y la sana (aire suave y zumbido
  // limpio) — conviven desde el arranque; la transición las cruza.
  let abanicoNodos = null;

  function ctx() {
    // Si el sonido está apagado en Opciones, no se crea nada.
    // (Estado se define en js/ui.js, que se carga después; se consulta
    //  en el momento de la llamada, cuando ya existe.)
    if (typeof Estado !== 'undefined' && !Estado.ajustes.sonido) return null;
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = new AC();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  // Nota simple con caída exponencial (bloque básico de toda la app).
  // "retraso" es relativo a ahora; para clavar notas al tempo de las
  // músicas se usa tonoEn() (abajo), que recibe un instante ABSOLUTO
  // del reloj del AudioContext.
  function tono(frecuencia, duracion, tipo = 'triangle', vol = 0.15, retraso = 0) {
    const a = ctx(); if (!a) return;
    tonoEn(a.currentTime + retraso, frecuencia, duracion, tipo, vol);
  }

  // La misma nota, pero agendada a un instante ABSOLUTO (la usan los
  // arreglistas de las músicas del casino: todo sale clavado al tempo).
  function tonoEn(tAbs, frecuencia, duracion, tipo = 'triangle', vol = 0.15) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = tipo;
    o.frequency.value = frecuencia;
    g.gain.setValueAtTime(vol * CONFIG.volumen, tAbs);
    g.gain.exponentialRampToValueAtTime(0.0001, tAbs + duracion);
    o.connect(g); g.connect(a.destination);
    o.start(tAbs); o.stop(tAbs + duracion + 0.02);
  }

  // Ráfaga de ruido blanco con desvanecimiento (materia prima de los golpes)
  function ruido(duracion, vol) {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * duracion);
    const b = a.createBuffer(1, n, a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource();
    s.buffer = b;
    const g = a.createGain();
    g.gain.value = vol * CONFIG.volumen;
    s.connect(g); g.connect(a.destination);
    s.start();
  }

  // ── MÚSICA DE CASINO (animación 9): los instrumentos del salón ──
  // Un "tick" de platillo de ride AGENDADO para un instante absoluto del
  // reloj del AudioContext (para que la música salga clavada al tempo).
  function rideEn(tAbs, vol) {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * 0.07);
    const b = a.createBuffer(1, n, a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const src = a.createBufferSource();
    src.buffer = b;
    const f = a.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 5200;
    const g = a.createGain();
    g.gain.value = vol * CONFIG.volumen;
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(tAbs);
  }

  // Un acorde de METALES agendado (sierra + filtro cálido: la sección de
  // vientos del salón), con su pequeño ataque y su caída.
  function metalesEn(tAbs, frecs, dur, vol) {
    const a = ctx(); if (!a) return;
    for (const fr of frecs) {
      const o = a.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = fr;
      const fl = a.createBiquadFilter();
      fl.type = 'lowpass'; fl.frequency.value = 2100;
      fl.Q.value = 0.6;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, tAbs);
      g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
      o.connect(fl); fl.connect(g); g.connect(a.destination);
      o.start(tAbs); o.stop(tAbs + dur + 0.05);
    }
  }

  // ── Los instrumentos de los demás temas del casino ──────────────

  // EL PIANO ELÉCTRICO del Nocturno de salón (el nuevo tema de casino):
  // mullido y cálido — triángulo + una octava arriba bajita, ataque
  // suavecito (0.03 s) y un filtro que corta todo lo brillante. Nada
  // que canse el oído: esto es fondo de hotel, no salón de feria.
  function rhodesEn(tAbs, frecs, dur, vol) {
    const a = ctx(); if (!a) return;
    for (const fr of frecs) {
      const o = a.createOscillator();
      o.type = 'triangle';
      o.frequency.value = fr;
      const o2 = a.createOscillator();          // la octava, bajita
      o2.type = 'sine';
      o2.frequency.value = fr * 2;
      const gOct = a.createGain();
      gOct.gain.value = 0.45;                  // la octava entra suave
      const fl = a.createBiquadFilter();
      fl.type = 'lowpass'; fl.frequency.value = 1150; fl.Q.value = 0.5;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, tAbs);
      g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.03);
      g.gain.exponentialRampToValueAtTime(vol * 0.55 * CONFIG.volumen, tAbs + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
      o.connect(fl);
      o2.connect(gOct); gOct.connect(fl);
      fl.connect(g); g.connect(a.destination);
      o.start(tAbs); o.stop(tAbs + dur + 0.05);
      o2.start(tAbs); o2.stop(tAbs + dur + 0.05);
    }
  }

  // EL VIBRAPHONE del Nocturno: una sola nota metálica con su
  // temblor de motor (un LFO en la ganancia) y su caída lenta —
  // escaso y brillante a su manera, pero bajito.
  function vibesEn(tAbs, fr, dur, vol) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator();
    o.type = 'sine';
    o.frequency.value = fr;
    const o2 = a.createOscillator();            // el parcial metálico
    o2.type = 'sine';
    o2.frequency.value = fr * 3.01;
    const lfo = a.createOscillator();           // el motor del vibrato
    lfo.type = 'sine';
    lfo.frequency.value = 5.1;
    const lfoG = a.createGain();
    lfoG.gain.value = vol * 0.42 * CONFIG.volumen;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, tAbs);
    g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
    const g2 = a.createGain();
    g2.gain.value = 0.16;                      // el parcial, muy bajito
    o.connect(g); o2.connect(g2); g2.connect(g);
    lfo.connect(lfoG); lfoG.connect(g.gain);
    g.connect(a.destination);
    o.start(tAbs); o.stop(tAbs + dur + 0.05);
    o2.start(tAbs); o2.stop(tAbs + dur + 0.05);
    lfo.start(tAbs); lfo.stop(tAbs + dur + 0.05);
  }

  // LAS ESCOBILLAS del Nocturno: una caricia de ruido filtrado —
  // suave, grave, sin el brillo de platillo ninguno.
  function escobillaEn(tAbs, vol, tono = 1) {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * 0.10);
    const b = a.createBuffer(1, n, a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const src = a.createBufferSource();
    src.buffer = b;
    const f = a.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 2400 * tono; f.Q.value = 0.6;
    const g = a.createGain();
    g.gain.value = vol * CONFIG.volumen;
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(tAbs);
  }

  // El PIANO de cantina (ragtime, boogie, vals): acorde plucked con
  // caída rápida — martilleado, con carácter.
  function pianoEn(tAbs, frecs, dur, vol) {
    const a = ctx(); if (!a) return;
    for (const fr of frecs) {
      const o = a.createOscillator();
      o.type = 'triangle';
      o.frequency.value = fr;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, tAbs);
      g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
      o.connect(g); g.connect(a.destination);
      o.start(tAbs); o.stop(tAbs + dur + 0.05);
    }
  }

  // El BANDONEÓN (tango): sierras DESAFINADAS por pares, con el temblor
  // del fuelle (un LFO) y un filtro cálido. Es su voz, nada se le parece.
  function bandoneonEn(tAbs, frecs, dur, vol) {
    const a = ctx(); if (!a) return;
    for (const fr of frecs) {
      for (const det of [-1.7, 1.7]) {
        const o = a.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = fr + det;
        const lfo = a.createOscillator();
        lfo.frequency.value = 5.2;
        const lfoG = a.createGain();
        lfoG.gain.value = fr * 0.0042;    // el temblor del fuelle
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        const fl = a.createBiquadFilter();
        fl.type = 'lowpass'; fl.frequency.value = 1650; fl.Q.value = 0.8;
        const g = a.createGain();
        g.gain.setValueAtTime(0.0001, tAbs);
        g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
        o.connect(fl); fl.connect(g); g.connect(a.destination);
        o.start(tAbs); o.stop(tAbs + dur + 0.05);
        lfo.start(tAbs); lfo.stop(tAbs + dur + 0.05);
      }
    }
  }

  // La CUERDA de violín del vals (sierra suave con vibrato y ataque
  // lento, la voz de los valses de salón).
  function cuerdaEn(tAbs, fr, dur, vol) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = fr;
    const lfo = a.createOscillator();
    lfo.frequency.value = 6;
    const lfoG = a.createGain();
    lfoG.gain.value = fr * 0.007;      // un vibrato de concertista
    lfo.connect(lfoG); lfoG.connect(o.frequency);
    const fl = a.createBiquadFilter();
    fl.type = 'lowpass'; fl.frequency.value = 2600; fl.Q.value = 0.7;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, tAbs);
    g.gain.exponentialRampToValueAtTime(vol * CONFIG.volumen, tAbs + 0.09);
    g.gain.setValueAtTime(vol * CONFIG.volumen, tAbs + Math.max(0.09, dur * 0.7));
    g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
    o.connect(fl); fl.connect(g); g.connect(a.destination);
    o.start(tAbs); o.stop(tAbs + dur + 0.05);
    lfo.start(tAbs); lfo.stop(tAbs + dur + 0.05);
  }

  // El redoblante seco del boogie (ruido filtrado con su golpe).
  function tamborEn(tAbs, vol, tono = 1) {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * 0.09);
    const b = a.createBuffer(1, n, a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const src = a.createBufferSource();
    src.buffer = b;
    const f = a.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1500 * tono; f.Q.value = 0.9;
    const g = a.createGain();
    g.gain.value = vol * CONFIG.volumen;
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(tAbs);
  }

  // El WOODBLOCK del ragtime (el palillo de madera del vapor).
  function maderaEn(tAbs, vol) {
    tonoEn(tAbs, 940 * (0.96 + Math.random() * 0.08), 0.05, 'sine', vol);
    tonoEn(tAbs, 1760, 0.028, 'sine', vol * 0.55);
  }

  /* ══ LAS MÚSICAS DEL CASINO ══════════════════════════════════════
     Cada tema es un pequeño "arreglista": crear(AudioContext) arranca su
     lazo (todo agendado a instantes ABSOLUTOS del reloj del audio, así
     el tempo sale clavado) y devuelve la función que lo corta.
     EL TEMA 1 es el que suena siempre (el swing anterior seguía sin
     gustar y se REHIZO entero: ahora es un nocturno de salón cálido y
     bajito); los demás quedaron dormidos de la vieja prueba de temas. */
  const CASINO_MUSICAS = [

    // 1 · EL NOCTURNO DE SALÓN — el nuevo tema de siempre: jazz lento y
    // cálido de hotel. Piano eléctrico mullido, contrabajo caminando
    // bajito, escobillas suaves y un vibraphone escaso. Dm9 · G9 ·
    // Cmaj9 · Am11 (ii–V–I–vi de verdad). NADA de platillos brillantes
    // ni glockenspiel: el swing anterior canse el oído y se jubiló.
    {
      nombre: 'Nocturno de salón',
      crear(a) {
        const BPM = 88, beat = 60 / BPM;
        const bajos = [
          [73.42, 82.41, 87.31, 110.00],    // Dm9:   re… mi… fa… la
          [123.47, 110.00, 98.00, 87.31],   // G9:    si… la… sol… fa
          [82.41, 98.00, 123.47, 130.81],   // Cmaj9: mi… sol… si… do
          [110.00, 98.00, 82.41, 69.30],    // Am11:  la… sol… mi… do# (vuelve al re)
        ];
        const acordes = [
          [174.61, 220.00, 261.63, 329.63],   // Dm9:   fa–la–do–mi
          [246.94, 293.66, 349.23, 440.00],   // G9:    si–re–fa–la
          [329.63, 392.00, 493.88, 587.33],   // Cmaj9: mi–sol–si–re
          [261.63, 329.63, 392.00, 493.88],   // Am11:  do–mi–sol–si
        ];
        const campanitas = [659.25, 440.00, 587.33, 493.88];  // una por compás
        let compas = 0, pulso = 0;
        let tProx = a.currentTime + 0.06;
        const programar = () => {
          while (tProx < a.currentTime + 0.5) {
            const c = compas % 4;
            const retraso = Math.max(0, tProx - a.currentTime);
            // el contrabajo camina bajito, de negra a negra
            tono(bajos[c][pulso], 0.30, 'triangle', 0.052, retraso);
            // escobillas: una caricia por pulso (el 2 y el 4, un pelo más)
            escobillaEn(tProx, pulso === 1 || pulso === 3 ? 0.020 : 0.012);
            // el piano eléctrico compone en el 2 y el 4…
            if (pulso === 1 || pulso === 3) rhodesEn(tProx, acordes[c], beat * 0.85, 0.026);
            // …y de tanto en tanto, un empujoncito anticipado
            if (pulso === 3 && Math.random() < 0.30) {
              rhodesEn(tProx + beat * 0.5, acordes[c], beat * 0.5, 0.018);
            }
            // una campanita de vibraphone por compás (escaso: a veces calla)
            if (pulso === 2 && Math.random() < 0.72) {
              vibesEn(tProx, campanitas[c], beat * 1.9, 0.022);
            }
            tProx += beat;
            pulso++;
            if (pulso === 4) { pulso = 0; compas++; }
          }
        };
        const id = setInterval(programar, 130);
        programar();
        return () => clearInterval(id);
      },
    },

    // 2 · EL TANGO DE BUENOS AIRES — bandoneón con temblor, bajo con
    // su síncopa y una melodía de "por una cabeza". Am · Dm · Am · E7.
    {
      nombre: 'Tango de Buenos Aires',
      crear(a) {
        const BPM = 104, beat = 60 / BPM;
        const raices =    [55.00, 73.42, 55.00, 82.41];   // la… re… la… mi
        const quintas =   [82.41, 110.00, 82.41, 123.47];
        const acordeones = [
          [220.00, 261.63, 329.63],   // Am: la-do-mi
          [174.61, 220.00, 261.63],   // Dm: re-fa-la
          [220.00, 261.63, 329.63],   // Am
          [164.81, 207.65, 246.94],   // E7: mi-sol#-si
        ];
        const melodia = [
          [[0, 440.00, .55], [1, 523.25, .55], [1.5, 587.33, .3], [2.5, 523.25, .9]],
          [[0, 587.33, .55], [1, 523.25, .3], [2, 440.00, .55], [3, 392.00, .9]],
          [[0, 440.00, .3], [.5, 523.25, .3], [1.5, 659.25, .55], [2.5, 587.33, .55]],
          [[0, 415.30, .3], [1, 493.88, .55], [2, 415.30, .3], [2.5, 329.63, .9]],
        ];
        let compas = 0;
        let tCompas = a.currentTime + 0.06;
        const programar = () => {
          while (tCompas < a.currentTime + 0.5) {
            const c = compas % 4;
            const t = off => tCompas + off * beat;
            // el bajo marcando el tango (con su síncopa)
            tonoEn(t(0), raices[c], 0.30, 'triangle', 0.085);
            tonoEn(t(1.75), quintas[c], 0.14, 'triangle', 0.06);
            tonoEn(t(2), raices[c] * 2, 0.16, 'triangle', 0.055);
            tonoEn(t(3.5), quintas[c] * 2, 0.10, 'triangle', 0.045);
            // el bandoneón a contratiempo: seco, con rechinado de fuelle
            bandoneonEn(t(1.5), acordeones[c], 0.24, 0.020);
            bandoneonEn(t(3), acordeones[c], 0.20, 0.016);
            // la melodía
            for (const [p, fr, dur] of melodia[c]) {
              bandoneonEn(t(p), [fr], dur * beat, 0.028);
            }
            compas++;
            tCompas += 4 * beat;
          }
        };
        const id = setInterval(programar, 130);
        programar();
        return () => clearInterval(id);
      },
    },

    // 3 · EL VALS VIENÉS DE SALÓN — 3/4 de verdad (un-dos-tres): bajo en
    // el uno, acordes en el dos y el tres… y una cuerda que canta.
    // C · G7 · C · F · C · F · G7 · C.
    {
      nombre: 'Vals vienés de salón',
      crear(a) {
        const BPM = 152, beat = 60 / BPM;
        const compases = [
          { bajo: 65.41, ac: [261.63, 329.63, 392.00] },   // C
          { bajo: 98.00, ac: [246.94, 293.66, 392.00] },   // G7
          { bajo: 65.41, ac: [261.63, 329.63, 392.00] },   // C
          { bajo: 87.31, ac: [261.63, 349.23, 440.00] },   // F
          { bajo: 65.41, ac: [261.63, 329.63, 392.00] },   // C
          { bajo: 87.31, ac: [261.63, 349.23, 440.00] },   // F
          { bajo: 98.00, ac: [246.94, 293.66, 392.00] },   // G7
          { bajo: 65.41, ac: [261.63, 329.63, 392.00] },   // C
        ];
        // la cuerda canta el acorde, una nota por pulso, dando vueltas
        // (arriba, medio, abajo — el vaivén de un vals de verdad)
        let compas = 0;
        let tCompas = a.currentTime + 0.06;
        const programar = () => {
          while (tCompas < a.currentTime + 0.5) {
            const cs = compases[compas % 8];
            const giro = compas % 2;
            const canto = giro === 0
              ? [cs.ac[2], cs.ac[1], cs.ac[0]]
              : [cs.ac[1], cs.ac[0], cs.ac[2]];
            tonoEn(tCompas, cs.bajo, 0.30, 'triangle', 0.09);        // el UN-dos-tres
            pianoEn(tCompas + beat, cs.ac, 0.11, 0.028);             //  dos
            pianoEn(tCompas + beat * 2, cs.ac, 0.11, 0.024);         //  tres
            for (let p = 0; p < 3; p++) {
              cuerdaEn(tCompas + p * beat, canto[p] * 2, beat * 1.05, 0.024);
            }
            compas++;
            tCompas += 3 * beat;
          }
        };
        const id = setInterval(programar, 130);
        programar();
        return () => clearInterval(id);
      },
    },

    // 4 · EL RAGTIME DEL MISSISSIPPI — piano sincopado de vapor, tuba en
    // el uno y el tres, y su woodblock. C · G7 · C · F · C · G7 · F · G7.
    {
      nombre: 'Ragtime del Mississippi',
      crear(a) {
        const BPM = 126, beat = 60 / BPM;
        const compases = [
          { r: 65.41, q: 98.00, ac: [261.63, 329.63, 392.00] },   // C
          { r: 98.00, q: 146.83, ac: [246.94, 293.66, 392.00] },   // G7
          { r: 65.41, q: 98.00, ac: [261.63, 329.63, 392.00] },   // C
          { r: 87.31, q: 130.81, ac: [261.63, 349.23, 440.00] },   // F
          { r: 65.41, q: 98.00, ac: [261.63, 329.63, 392.00] },   // C
          { r: 98.00, q: 146.83, ac: [246.94, 293.66, 392.00] },   // G7
          { r: 87.31, q: 130.81, ac: [261.63, 349.23, 440.00] },   // F
          { r: 98.00, q: 146.83, ac: [246.94, 293.66, 392.00] },   // G7
        ];
        let compas = 0;
        let tCompas = a.currentTime + 0.06;
        const programar = () => {
          while (tCompas < a.currentTime + 0.5) {
            const cs = compases[compas % 8];
            const t = off => tCompas + off * beat;
            // la tuba: el uno y el tres (como empujando el vapor)
            tonoEn(t(0), cs.r, 0.28, 'sine', 0.10);
            tonoEn(t(2), cs.q, 0.26, 'sine', 0.085);
            // el piano: acordes SINCOPADOS a contratiempo (ragtime puro)
            for (const off of [0.5, 1.5, 2.5, 3.5]) pianoEn(t(off), cs.ac, 0.16, 0.038);
            pianoEn(t(1), cs.ac, 0.12, 0.024);
            pianoEn(t(3), cs.ac, 0.12, 0.024);
            // y la mano derecha canturrea (notas sueltas síncopa)
            const mano = compas % 2 === 0
              ? [[0.75, 0], [1.25, 2], [2.75, 1], [3.25, 0]]
              : [[0.75, 2], [1.25, 1], [2.75, 2], [3.25, 1]];
            for (const [off, k] of mano) {
              tonoEn(t(off), cs.ac[k] * 2, 0.20, 'triangle', 0.05);
            }
            // el woodblock del vapor
            maderaEn(t(1), 0.045);
            maderaEn(t(3), 0.045);
            compas++;
            tCompas += 4 * beat;
          }
        };
        const id = setInterval(programar, 130);
        programar();
        return () => clearInterval(id);
      },
    },

    // 5 · EL BOOGIE DE JUKEBOX — doce compases de blues con el bajo
    // caminante en swing, redoblante al dos y al cuatro y el piano
    // martilleando. C C C C · F F · C C · G F C G.
    {
      nombre: 'Boogie de jukebox',
      crear(a) {
        const BPM = 138, beat = 60 / BPM;
        // el bajo boogie-woogie de cada acorde: 1·3m·5·6·5·3m·1·3m
        const linea = r => [r, r * 1.26, r * 1.5, r * 1.68, r * 1.5, r * 1.26, r, r * 1.26];
        const acordes = [ // 12 compases: (raíz del bajo, acorde)
          [130.81, [261.63, 329.63, 392.00]],   // C
          [130.81, [261.63, 329.63, 392.00]],
          [130.81, [261.63, 329.63, 392.00]],
          [130.81, [261.63, 329.63, 392.00]],
          [174.61, [261.63, 349.23, 440.00]],   // F
          [174.61, [261.63, 349.23, 440.00]],
          [130.81, [261.63, 329.63, 392.00]],   // C
          [130.81, [261.63, 329.63, 392.00]],
          [196.00, [246.94, 293.66, 392.00]],   // G
          [174.61, [261.63, 349.23, 440.00]],   // F
          [130.81, [261.63, 329.63, 392.00]],   // C
          [196.00, [246.94, 293.66, 392.00]],   // G
        ];
        let compas = 0;
        let tCompas = a.currentTime + 0.06;
        const programar = () => {
          while (tCompas < a.currentTime + 0.5) {
            const [raiz, ac] = acordes[compas % 12];
            const octava = compas % 12 < 8 ? 1 : 2;   // el final, más agudo
            const notas = linea(raiz * (octava === 1 ? 1 : 1.5));
            // el bajo caminante en SWING (corcheas largas y cortas)
            const offs = [0, 0.55, 1, 1.55, 2, 2.55, 3, 3.55];
            notas.forEach((fr, k) => {
              tonoEn(tCompas + offs[k] * beat, fr, beat * 0.34, 'triangle', 0.07);
            });
            // el redoblante y el piano al dos y al cuatro
            tamborEn(tCompas + beat, 0.05);
            tamborEn(tCompas + beat * 3, 0.05);
            pianoEn(tCompas + beat, ac, 0.15, 0.032);
            pianoEn(tCompas + beat * 3, ac, 0.15, 0.028);
            // el piano martillea el tiempo fuerte de tanto en cuando
            if (compas % 2 === 0) pianoEn(tCompas, ac.map(f => f * 2), 0.13, 0.024);
            compas++;
            tCompas += 4 * beat;
          }
        };
        const id = setInterval(programar, 130);
        programar();
        return () => clearInterval(id);
      },
    },
  ];

  return {

    /* ── EL TIC CLÁSICO (rediseñado: suave) ─────────────────────
       Un toque corto y redondo, nada estridente: lo que importa es el
       RITMO — el tic-tac que marca el giro como feedback (cada clavija
       que pasa se oye; cuanto más lento va la rueda, más espaciado
       suena… y más tensión). A alta velocidad se agrupan los tics (no
       más de uno cada 30 ms) sumando su intensidad: carraca apagada. */
    tic() {
      const a = ctx(); if (!a) return;
      const ahora = a.currentTime;
      const INTERVALO = 0.03; // segundos mínimos entre tics audibles
      let fuerza = 1;         // 1 = tic normal
      if (ahora - ultimoTic < INTERVALO) {
        ticAcumulado += 0.55;         // se acumula y suena el siguiente más fuerte
        return;
      }
      fuerza = Math.min(1.5, 1 + ticAcumulado);
      ticAcumulado = 0;
      ultimoTic = ahora;

      const azarF = 0.92 + Math.random() * 0.16; // un pelín de vida
      tono(640 * azarF, 0.05, 'triangle', 0.10 * fuerza); // el "tak"
      tono(185 * azarF, 0.06, 'sine', 0.07 * fuerza);     // poquito grave
    },

    /* ── CRUJIDO (flecha apoyada en la clavija, animación 3) ────────
       Un chirrido grave y SUAVE que sube de intensidad mientras la
       flecha se inclina. Devuelve una función para cortarlo antes. */
    crujido(duracionSeg, intensidad = 1) {
      const a = ctx();
      if (!a) return () => {};
      const t = a.currentTime;
      const o = a.createOscillator();
      const lfo = a.createOscillator();       // la vibración del chirrido
      const lfoG = a.createGain();
      const f = a.createBiquadFilter();
      const g = a.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 96 * intensidad;    // tono base, grave y amable
      lfo.type = 'sine';
      lfo.frequency.value = 8 + intensidad * 3; // va acelerando con la tensión
      lfoG.gain.value = 16;
      lfo.connect(lfoG); lfoG.connect(o.frequency);
      f.type = 'lowpass';
      f.frequency.value = 470;                 // sin agudos: no cansa
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045 * intensidad * CONFIG.volumen, t + duracionSeg * 0.85);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duracionSeg);
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t); lfo.start(t);
      const parar = () => { try { o.stop(); lfo.stop(); } catch (e) { /* ya parado */ } };
      setTimeout(parar, duracionSeg * 1000 + 120);
      return parar;
    },

    // Arpegio de victoria (Do mayor ascendente)
    victoria() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono(f, 0.22, 'triangle', 0.16, i * 0.09));
    },

    // El snap: dos golpes secos + un poco de aire
    chasquido() {
      tono(2600, 0.03, 'square', 0.22);
      tono(1700, 0.05, 'square', 0.12, 0.05);
      ruido(0.06, 0.18);
    },

    // "Tok" apagado de la flecha botando contra el borde de la rueda
    // durante su caída (animación 8). fuerza: 0–1.
    golpe(fuerza = 1) {
      const azarF = 0.85 + Math.random() * 0.3;
      tono(150 * azarF, 0.09, 'sine', 0.09 * fuerza);
      tono(92 * azarF, 0.13, 'sine', 0.06 * fuerza, 0.012);
    },

    /* ── EL TOQUE SECO (animación 22 — "A la tercera se desarma") ────
       El feedback de los DOS primeros clics sobre una rueda muerta
       (la que no gira): un toque secote y apagado — como tocar algo
       que no responde. La "háptica" sonora que se pidió. */
    clicSeco() {
      tono(185, 0.045, 'sine', 0.17);
      tono(96, 0.07, 'sine', 0.11, 0.01);
      ruido(0.028, 0.05);
    },

    /* ── EL MOTOR ROMPIÉNDOSE (animación 22 — a la tercera) ────────
       El "¡se daño!" de verdad: el motor tose dos veces (sierra grave
       trabándose, cada vez más ahogada)… y muere con su CLAC. Como el
       sonido del motor dañado de la 11, pero de golpe. */
    motorRoto() {
      // dos-tres tudos del motor trabándose (cada uno más grave y
      // más flojo: se está ahogando)
      tono(130, 0.09, 'sawtooth', 0.11);
      tono(74, 0.12, 'sawtooth', 0.085, 0.10);
      tono(48, 0.16, 'sawtooth', 0.06, 0.24);
      ruido(0.05, 0.06);
      ruido(0.09, 0.045);
      // …y el CLAC seco de la muerte del motor
      tono(76, 0.16, 'sine', 0.22, 0.38);
      tono(150, 0.07, 'triangle', 0.10, 0.39);
    },

    /* ── UNA BOLITA TOCANDO EL SUELO (animación 15 — los vasos) ────
       El "toc" seco y agudo de una bolita contra la mesa de madera,
       con su matiz de rebote. fuerza: 0–1 (según cómo de fuerte
       bote). Se pidió: el sonido de las bolas tocando el suelo. */
    bolitaSuelo(fuerza = 1) {
      const azarF = 0.9 + Math.random() * 0.2;
      tono(720 * azarF, 0.05, 'triangle', 0.10 * fuerza);
      tono(1460 * azarF, 0.03, 'sine', 0.05 * fuerza);
      tono(215 * azarF, 0.05, 'sine', 0.05 * fuerza, 0.008);
    },

    // Zumbido descendente del giro anómalo (animación 3)
    reverso() {
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(65, t + 0.45);
      g.gain.setValueAtTime(0.10 * CONFIG.volumen, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g); g.connect(a.destination);
      o.start(t); o.stop(t + 0.55);
    },

    // Dron grave de tensión. Devuelve una función para cortarlo antes
    // si la animación lo pide. duracionSeg está en segundos.
    suspenseo(duracionSeg) {
      const a = ctx();
      if (!a) return () => {};
      const t = a.currentTime;
      const o1 = a.createOscillator();
      const o2 = a.createOscillator();
      const g = a.createGain();
      o1.type = 'sine'; o1.frequency.value = 78;
      o2.type = 'sine'; o2.frequency.value = 79.5; // el batido genera inquietud
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09 * CONFIG.volumen, t + duracionSeg * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duracionSeg);
      o1.connect(g); o2.connect(g); g.connect(a.destination);
      o1.start(t); o2.start(t);
      const parar = () => { try { o1.stop(); o2.stop(); } catch (e) { /* ya parado */ } };
      setTimeout(parar, duracionSeg * 1000 + 100);
      return parar;
    },

    // Golpe solemne para el anuncio de la animación 8
    gong() {
      tono(98, 1.4, 'sine', 0.35);
      tono(49, 1.6, 'sine', 0.25, 0.02);
    },

    /* ═══ SONIDOS DE CASINO (animación 9) ═══ */

    // El "shing" suave con el que la rueda se viste de casino
    // (transformación) + el golpe sordo de la madera al asentarse.
    transformacion() {
      ruido(0.35, 0.05);
      [950, 1420, 1890].forEach((f, i) => tono(f, 0.15, 'sine', 0.045, i * 0.055));
      tono(172, 0.09, 'sine', 0.10, 0.3);
    },

    // Arranca el rodar de la bola (un lazo de ruido filtrado, gain 0).
    rodilloIniciar() {
      const a = ctx();
      if (!a || rodilloSrc) return;
      const n = Math.floor(a.sampleRate * 1.2);
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      rodilloSrc = a.createBufferSource();
      rodilloSrc.buffer = b;
      rodilloSrc.loop = true;
      rodilloF = a.createBiquadFilter();
      rodilloF.type = 'bandpass';
      rodilloF.Q.value = 1.3;
      rodilloF.frequency.value = 700;
      rodilloG = a.createGain();
      rodilloG.gain.value = 0;
      rodilloSrc.connect(rodilloF);
      rodilloF.connect(rodilloG);
      rodilloG.connect(a.destination);
      rodilloSrc.start();
    },

    // La fuerza del rodar (0..1 = lo rápido que va la bola ahora).
    // El tono sube con la velocidad: la bola suena "viva".
    rodilloSet(v01) {
      if (!rodilloG) return;
      const v = Math.max(0, Math.min(1, v01));
      rodilloG.gain.value = v * 0.07 * CONFIG.volumen;
      rodilloF.frequency.value = 480 + v * 950;
    },

    // Corta el rodar (lo llaman el final normal y el de emergencia).
    rodilloParar() {
      if (!rodilloSrc) return;
      try { rodilloSrc.stop(); } catch (e) { /* ya parado */ }
      rodilloSrc = null; rodilloG = null; rodilloF = null;
    },

    // El choque de la bola contra un DEFLECTOR (diamante del apron):
    // un clac seco y corto — golpecito, nada estridente.
    clack(fuerza = 1) {
      tono(1980 * (0.9 + Math.random() * 0.2), 0.03, 'square', 0.08 * fuerza);
      tono(640, 0.05, 'triangle', 0.05 * fuerza, 0.008);
      ruido(0.03, 0.04 * fuerza);
    },

    // El tick fino de la bola saltando por encima de un fret
    // (más agudo y más suave que el tic de las clavijas).
    toca() {
      tono(1650 * (0.92 + Math.random() * 0.16), 0.025, 'triangle', 0.04);
    },

    // La bola queda presa en el bolsillo: golpe sordo + casquete.
    captura() {
      tono(300, 0.09, 'sine', 0.13);
      tono(150, 0.13, 'sine', 0.09, 0.012);
      tono(1900, 0.02, 'square', 0.04, 0.01);
    },

    /* ═══ SONIDOS DE LA VOLADORA (animación 10) ═══ */

    /* ── EL TURBO: el sonido de alta velocidad (nuevo) ──────────
       Dos capas que siguen la VELOCIDAD REAL de la rueda:
         · AIRE: ruido blanco en lazo por un paso-banda cuyo tono sube
           con la velocidad (de un soplido a un aullido).
         · MOTOR: sierra grave por un paso-bajo que ruge más fuerte
           y más agudo cuanto más rápido va.
       Más presente que el rodar de la bola del casino (esto es un
       turbo, no una bolita) y "un poco más alto", como se pidió. */
    turboIniciar() {
      const a = ctx();
      if (!a || turboSrc) return;
      // — la capa de aire —
      const n = Math.floor(a.sampleRate * 2);
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      turboSrc = a.createBufferSource();
      turboSrc.buffer = b;
      turboSrc.loop = true;
      turboF = a.createBiquadFilter();
      turboF.type = 'bandpass';
      turboF.Q.value = 0.85;
      turboF.frequency.value = 240;
      turboG = a.createGain();
      turboG.gain.value = 0;
      turboSrc.connect(turboF);
      turboF.connect(turboG);
      turboG.connect(a.destination);
      // — la capa de motor —
      turboOsc = a.createOscillator();
      turboOsc.type = 'sawtooth';
      turboOsc.frequency.value = 36;
      const fBajo = a.createBiquadFilter();
      fBajo.type = 'lowpass';
      fBajo.frequency.value = 320;
      turboOscG = a.createGain();
      turboOscG.gain.value = 0;
      turboOsc.connect(fBajo);
      fBajo.connect(turboOscG);
      turboOscG.connect(a.destination);
      turboSrc.start();
      turboOsc.start();
    },

    // La llama el bucle del Motor en CADA frame con la velocidad
    // angular real (rad/s); sin turbo activo no hace nada.
    turboAjustar(velAng) {
      if (!turboG) return;
      const v = Math.max(0, Math.min(1, (velAng || 0) / 32));
      turboG.gain.value = v * 0.16 * CONFIG.volumen;    // el aire
      turboF.frequency.value = 240 + v * 1350;          // tono vivo
      turboOscG.gain.value = v * 0.055 * CONFIG.volumen; // el motor
      turboOsc.frequency.value = 36 + v * 175;
    },

    // Corta el turbo (la propia animación lo llama al frenar; también
    // el desmontaje de emergencia de js/ui.js, por si algo falla).
    turboParar() {
      if (!turboSrc) return;
      try { turboSrc.stop(); turboOsc.stop(); } catch (e) { /* ya parado */ }
      turboSrc = null; turboF = null; turboG = null;
      turboOsc = null; turboOscG = null;
    },

    // Whir ascendente del arranque turbo (coge velocidad la rueda).
    // Ahora MÁS PRESENTE para que se oiga sobre el turbo (se pidió un
    // sonido de alta velocidad "mejor y un poco más alto").
    subida(duracion = 1.4) {
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const o = a.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(70, t);
      o.frequency.exponentialRampToValueAtTime(300, t + duracion);
      const f = a.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 850;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.085 * CONFIG.volumen, t + duracion * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t); o.stop(t + duracion + 0.05);
    },

    // El barrido de aire de cada segmento que sale VOLANDO de la rueda
    // (un poco más alto: con el turbo de fondo, tiene que llegar).
    whoosh() {
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const n = Math.floor(a.sampleRate * 0.24);
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
      const src = a.createBufferSource();
      src.buffer = b;
      const f = a.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.1;
      const c0 = 500 + Math.random() * 900;
      f.frequency.setValueAtTime(c0 * 1.8, t);
      f.frequency.exponentialRampToValueAtTime(c0 * 0.5, t + 0.22);
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11 * CONFIG.volumen, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      src.connect(f); f.connect(g); g.connect(a.destination);
      src.start(t); src.stop(t + 0.26);
    },

    // El "pop" juguetón de las bolitas (animación 15: cada segmento
    // que se convierte en bolita suena al nacer; y la elegida al
    // revelarse). Corto, redondo y con un dejo de burbuja.
    pop() {
      const azarF = 0.9 + Math.random() * 0.2;
      tono(760 * azarF, 0.05, 'triangle', 0.13);
      tono(1140 * azarF, 0.05, 'sine', 0.09, 0.035);
    },

    // La "caja registradora" del anuncio Premium (animación 12 — la
    // broma): ding-ding + poquito de monedas. Suena a dinero de
    // anuncio desde el primer segundo: eso es justo lo CLICHÉ que se
    // pretendía.
    kaching() {
      tono(1244, 0.10, 'square', 0.06);
      tono(1661, 0.26, 'square', 0.06, 0.10);
      tono(2489, 0.20, 'sine', 0.05, 0.10);
      ruido(0.06, 0.045);
    },

    /* ── EL SONIDO DE ACELERACIÓN (animación 11 — el freno dañado) ──
       Un motor de auto que sube de vueltas CON SUS CAMBIOS DE MARCHA:
       el rugido crece… "clac" (cambia de marcha), vuelve a crecer,
       "clac", y sube hasta el aullido. Así se oye que la rueda no va
       a frenar: va cada vez MÁS RÁPIDA (con el turbo de aire y motor
       de siempre sonando debajo). */
    motorAcelerado(duracion = 1.5) {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + 0.02;
      const o = a.createOscillator();
      o.type = 'sawtooth';
      const f = a.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 780;
      f.Q.value = 1.1;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.11 * CONFIG.volumen, t0 + duracion * 0.12);
      g.gain.setValueAtTime(0.11 * CONFIG.volumen, t0 + duracion * 0.82);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
      // las marchas: el motor sube… y cae de golpe al cambiar (¡clac!)
      const d = duracion / 3;
      o.frequency.setValueAtTime(58, t0);
      o.frequency.linearRampToValueAtTime(185, t0 + d * 0.96);
      o.frequency.setValueAtTime(78, t0 + d);
      o.frequency.linearRampToValueAtTime(235, t0 + d * 1.96);
      o.frequency.setValueAtTime(105, t0 + d * 2);
      o.frequency.linearRampToValueAtTime(300, t0 + duracion);
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + duracion + 0.05);
      // los dos "clac" de las marchas cayendo
      ruido(0.05, 0.05);
      tono(210, 0.06, 'square', 0.05, d);
      tono(240, 0.06, 'square', 0.05, d * 2);
    },

    /* ── EL MOTOR APAGÁNDOSE (animación 11 — clic en la bolita) ────────
       Ya NO hay frenazo de auto con chirrido (se pidió quitarlo):
       apagar el motor se oye como lo que ES — UN MOTOR BAJANDO LA
       MARCHA: las revoluciones caen de marcha en marcha ("clac"…
       "clac"… "clac", cada vez más flojitos) hasta quedarse quieto
       y callado. Literalmente ya lo apagamos. */
    motorBajaMarcha(duracionSeg = 1.4) {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + 0.01;
      const d = Math.max(0.5, duracionSeg);
      // el motor en sí: sierra grave con filtro cálido, perdiendo
      // revoluciones de marcha en marcha (cada tramo arranca MÁS
      // BAJO: el golpe de bajar la marcha)
      const o = a.createOscillator();
      o.type = 'sawtooth';
      const f = a.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 620;
      f.Q.value = 1.2;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.13 * CONFIG.volumen, t0 + 0.05);
      g.gain.setValueAtTime(0.13 * CONFIG.volumen, t0 + d * 0.74);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      const paso = d / 4;
      o.frequency.setValueAtTime(235, t0);
      o.frequency.linearRampToValueAtTime(150, t0 + paso * 0.9);
      o.frequency.setValueAtTime(128, t0 + paso);
      o.frequency.linearRampToValueAtTime(88, t0 + paso * 1.9);
      o.frequency.setValueAtTime(76, t0 + paso * 2);
      o.frequency.linearRampToValueAtTime(52, t0 + paso * 2.9);
      o.frequency.setValueAtTime(44, t0 + paso * 3);
      o.frequency.linearRampToValueAtTime(26, t0 + d);   // se muere…
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + d + 0.05);
      // …y los tres "clac" de las marchas cayendo (cada vez más flojos)
      tono(190, 0.05, 'square', 0.05, paso);
      tono(150, 0.05, 'square', 0.04, paso * 2);
      tono(115, 0.05, 'square', 0.03, paso * 3);
    },

    /* ── EL FRENAZO DE AUTO (animación 11 — el freno dañado) ────────
       EL SONIDO DRAMÁTICO DE CARRO PARÁNDOSE: el chirrido agudo de los
       neumáticos derrapando sobre el asfalto (ruido de banda estrecha
       + dos silbidos desafinados con vibrato, que caen de tono al
       perder velocidad)… y al acabar, el "¡CLONK!" del auto ya parado
       con su meneíto de suspensión. duracionSeg = lo que dura el
       derrape (lo pone la coreografía, que sabe cuánto frena). */
    frenazoCarro(duracionSeg = 0.6) {
      const a = ctx(); if (!a) return;
      const dur = Math.max(0.25, duracionSeg);
      const t0 = a.currentTime + 0.01;
      const tFin = t0 + dur;

      // — el CHIRRIDO: ruido blanco por un paso-banda MUY estrecho,
      //    con el tono cayendo poquito a poco (la rueda pierde vueltas)
      const n = Math.floor(a.sampleRate * (dur + 0.1));
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const ruidoS = a.createBufferSource();
      ruidoS.buffer = b;
      const fB = a.createBiquadFilter();
      fB.type = 'bandpass';
      fB.Q.value = 13;
      fB.frequency.setValueAtTime(1560, t0);
      fB.frequency.exponentialRampToValueAtTime(1120, tFin);
      const gN = a.createGain();
      gN.gain.setValueAtTime(0.0001, t0);
      gN.gain.exponentialRampToValueAtTime(0.30 * CONFIG.volumen, t0 + 0.02);
      gN.gain.setValueAtTime(0.30 * CONFIG.volumen, tFin - Math.min(0.09, dur * 0.3));
      gN.gain.exponentialRampToValueAtTime(0.0001, tFin);
      ruidoS.connect(fB); fB.connect(gN); gN.connect(a.destination);
      ruidoS.start(t0); ruidoS.stop(tFin + 0.05);

      // — los SILBIDOS del caucho (dos agudos desafinados con vibrato,
      //    como dos neumáticos cada uno a lo suyo)
      for (const [fr, prof] of [[1420, 85], [1690, 120]]) {
        const o = a.createOscillator();
        o.type = 'square';
        o.frequency.setValueAtTime(fr, t0);
        o.frequency.exponentialRampToValueAtTime(fr * 0.78, tFin);
        const lfo = a.createOscillator();
        lfo.frequency.value = 6.8;
        const lfoG = a.createGain();
        lfoG.gain.value = prof;
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        const fl = a.createBiquadFilter();
        fl.type = 'bandpass';
        fl.frequency.value = fr; fl.Q.value = 3;
        const g = a.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.05 * CONFIG.volumen, t0 + 0.025);
        g.gain.setValueAtTime(0.05 * CONFIG.volumen, tFin - Math.min(0.09, dur * 0.3));
        g.gain.exponentialRampToValueAtTime(0.0001, tFin);
        o.connect(fl); fl.connect(g); g.connect(a.destination);
        o.start(t0); o.stop(tFin + 0.05);
        lfo.start(t0); lfo.stop(tFin + 0.05);
      }

      // — y el AUTO YA PARADO: el "¡clonk!" grave de la suspensión
      //    asentándose, con su meneo seco y un último chirrido corto
      tono(74, 0.22, 'sine', 0.30, dur);
      tono(130, 0.10, 'sine', 0.13, dur + 0.015);
      tono(310, 0.05, 'triangle', 0.05, dur + 0.13);
      ruido(0.08, 0.14);
    },

    /* ══ MÚSICA DE CASINO (animación 9 — EL TEMA DE SIEMPRE) ═══════
       EL NOCTURNO DE SALÓN: el nuevo tema de siempre (el swing de Las
       Vegas que sonaba antes SEGUÍA SIN GUSTAR y se rehizo entero —
       más cálido, más bajito, sin platillos brillantes). Sin selector
       alguno: la ruleta de casino suena SIEMPRE al nocturno. */
    casinoMusicaIniciar() {
      const a = ctx();
      if (!a || casinoTemporizador) return;
      if (CONFIG.casino && CONFIG.casino.musica === false) return;
      const tema = CASINO_MUSICAS[0];   // el nocturno de siempre — SIEMPRE
      casinoTemporizador = tema.crear(a);
    },

    // Corta la música del casino (lo llama finCasino, el desmontaje de
    // emergencia de js/ui.js… y la muestra de Opciones cuando se acaba).
    casinoMusicaParar() {
      if (casinoTemporizador) {
        try { casinoTemporizador(); } catch (e) { /* ya parada */ }
      }
      casinoTemporizador = null;
    },

    // La fanfarria de VICTORIA de casino (cuando la bola ya cayó en el
    // bolsillo): ahora CÁLIDA — metales mullidos subiendo (G mayor, sin
    // agudos de platillo) y una ola suave de aire que felicita. Sigue
    // siendo el "¡GANADOOOR!" de Las Vegas, pero sin cansar el oído.
    victoriaCasino() {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + 0.02;
      metalesEn(t0, [392.00, 493.88, 587.33], 0.45, 0.045);
      metalesEn(t0 + 0.18, [392.00, 493.88, 587.33, 783.99], 0.85, 0.06);
      // la ola suave de felicitación (ruido que crece y se rinde)
      const n = Math.floor(a.sampleRate * 0.9);
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) {
        const x = i / n;
        d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, x * 1.15)) * 0.5;
      }
      const s = a.createBufferSource();
      s.buffer = b;
      const f = a.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.5;
      const g = a.createGain();
      g.gain.value = 0.022 * CONFIG.volumen;
      s.connect(f); f.connect(g); g.connect(a.destination);
      s.start(t0 + 0.18);
      // y un toque de escobilla, bajito, como quien aplaude con plumas
      escobillaEn(t0 + 0.18, 0.03);
      escobillaEn(t0 + 0.55, 0.022);
    },

    // El dardo CLAVÁNDOSE en la diana (animación 17): "¡tock!" seco de
    // madera + el matiz metálico de la punta.
    clavarDardo() {
      tono(950, 0.035, 'square', 0.14);
      tono(300, 0.11, 'sine', 0.18);
      tono(150, 0.15, 'sine', 0.10, 0.015);
      ruido(0.05, 0.09);
    },

    /* ── EL DESARME (animación 16): un sonido por CADA pedazo que cae ──
       "Háptica" del desarme: cada segmento que se desprende suena con su
       PROPIO crac — y cada uno un pelín más agudo que el anterior, así
       se OYE que van cayendo de uno en uno (carraca ascendente). */
    pieza(k = 0) {
      const paso = 1 + 0.045 * ((k || 0) % 12);   // cada pedazo, su tono
      tono(330 * paso, 0.045, 'square', 0.16);    // el crac del desprendimiento
      tono(148 * paso, 0.10, 'sine', 0.15, 0.012); // y su golpe sordo
      tono(2300 * (0.96 + Math.random() * 0.08), 0.02, 'triangle', 0.05);
      ruido(0.04, 0.10);
    },

    /* ── LOS PERNOS (animación 18 — la bolita tomó el lugar) ─────────
       El selector ya no es la flecha: cada frontera que pasa bajo la
       BOLITA suena a perno metálico — EL CHOQUE DEL SELECTOR NUEVO
       con los pernos invisibles: un clink corto de tornillo, con su
       doble parcial y su poquito de azar (como un perno de verdad). */
    pernos(fuerza = 1) {
      const azarF = 0.92 + Math.random() * 0.16;
      tono(2380 * azarF, 0.028, 'square', 0.065 * fuerza);
      tono(3150 * azarF, 0.02, 'sine', 0.045 * fuerza, 0.004);
      tono(740 * azarF, 0.03, 'triangle', 0.05 * fuerza);
    },

    /* ── EL TOC DEL SUELO (animación 16 — el desarme) ────────────────
       LA "HÁPTICA" QUE SE PIDIÓ DE VERDAD: cada pedazo suena cuando
       LLEGA AL SUELO — un golpe sordo de cosa pesada cayendo al piso,
       con su pequeño rebote metálico dentro. La fuerza (0–1) sale de
       la velocidad REAL del impacto (los que caen desde arriba suenan
       más fuertes) y cada pedazo suena un pelín distinto (su "k"). */
    aterrizar(k = 0, fuerza = 1) {
      const f = Math.max(0.35, Math.min(1, fuerza || 1));
      const paso = 1 + 0.045 * ((k || 0) % 12);
      tono(64 * paso, 0.16, 'sine', 0.34 * f);         // ¡el golpe sordo del piso!
      tono(118 * paso, 0.09, 'triangle', 0.14 * f, 0.012);
      tono(230 * paso, 0.05, 'triangle', 0.07 * f, 0.03);  // el rebote interno
      tono(1900 * (0.95 + Math.random() * 0.1), 0.02, 'square', 0.05 * f);
      ruido(0.06, 0.16 * f);                          // el "puff" del impacto
    },

    /* ── EL FRENO SUAVE (la parada tranquila — herramienta libre) ───
       La parada SIN drama de la versión tranquila: el freno se aplica
       con suavidad — un chorro corto de aire que escapa (psss) y un
       chirrido amable y bajito que se apaga enseguida. Nada de
       neumáticos a lo bravo: esto es la calma misma. */
    frenoSuave(duracion = 1.1) {
      const a = ctx(); if (!a) return;
      const dur = Math.max(0.5, Math.min(1.8, duracion));
      const t0 = a.currentTime + 0.01;
      // — el aire que escapa del freno (psss, grave y corto) —
      const n = Math.floor(a.sampleRate * (dur + 0.1));
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource();
      s.buffer = b;
      const f = a.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1400, t0);
      f.frequency.exponentialRampToValueAtTime(300, t0 + dur);
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07 * CONFIG.volumen, t0 + 0.04);
      g.gain.setValueAtTime(0.07 * CONFIG.volumen, t0 + dur * 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(a.destination);
      s.start(t0); s.stop(t0 + dur + 0.05);
      // — y un chirrido amable, bajito, que se rinde pronto —
      tono(920, 0.16, 'sine', 0.028, 0.02);
      tono(680, 0.12, 'sine', 0.02, 0.1);
    },

    /* ══ EL CORTO ELÉCTRICO (animación 19 — el abanico averiado) ════
       EL QUE ABRE LA ANIMACIÓN: un zumbido de corriente que se TRABA
       (amplitud a tirones), crepitaciones de chispazos por detrás…
       y el "¡clac!" del térmico que corta todo. Como cuando a un
       abanico se le quema el arranque: primero truena, luego penan
       las aspas. */
    cortoCircuito() {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + 0.01;
      const dur = 0.85;

      // — el ZUMBIDO que se traba: sierra a 50 Hz por un filtro eléctrico,
      //    con la ganancia ABIÉNDOSE Y CERRÁNDOSE a tirones (bzzt… bzzt…) —
      const o = a.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(50, t0);
      o.frequency.setValueAtTime(55, t0 + dur * 0.55);
      const f = a.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 420; f.Q.value = 2.2;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      const tirones = [0.05, 0.16, 0.27, 0.38, 0.5, 0.62, 0.72, 0.8];
      tirones.forEach((tt, i) => {
        const v = (0.075 + i * 0.006) * CONFIG.volumen;
        g.gain.setValueAtTime(v, t0 + tt);
        g.gain.exponentialRampToValueAtTime(0.0012, t0 + tt + 0.075);
      });
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);

      // — las CREPITACIONES: chispazos cortos y secos (ruido de banda
      //    estrecha, cada uno a su sitio y con su tono distinto) —
      const chispa = (tAbs, fr, vol) => {
        const n = Math.floor(a.sampleRate * 0.045);
        const b = a.createBuffer(1, n, a.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        const src = a.createBufferSource();
        src.buffer = b;
        const fB = a.createBiquadFilter();
        fB.type = 'bandpass'; fB.frequency.value = fr; fB.Q.value = 9;
        const gN = a.createGain();
        gN.gain.value = vol * CONFIG.volumen;
        src.connect(fB); fB.connect(gN); gN.connect(a.destination);
        src.start(tAbs);
      };
      [0.03, 0.11, 0.19, 0.3, 0.43, 0.58, 0.68].forEach((tt, i) => {
        chispa(t0 + tt, 1900 + Math.random() * 2400, 0.11 - i * 0.008);
      });
      // — y el ¡CLAC! del térmico al final: la corriente se cortó —
      tono(168, 0.10, 'square', 0.11, dur * 0.97);
      tono(96, 0.16, 'sine', 0.14, dur * 0.97);
      ruido(0.05, 0.10);
    },

    /* ══ EL ABANICO DAÑADO (animación 19 — "ayúdala a girar") ══════
       EL LOOP COMPLETO, con sus DOS voces conviviendo desde el arranque:
         · la DAÑADA  (gDanado): suena a MÁQUINA DE RECORTARSE — dos
           sierras graves trabadas (55 y 110 Hz) por un paso-banda, con
           un AM desparejo (el eje penando) y un vaivén irregular de
           tono (la aspa rozando la jaula) + un soplo rasposo de motor
           sin aceite.
         · la SANA    (gNormal): un abanico de verdad — aire limpio y
           suave (ruido grave) y un zumbido hondo y constante.
       La transición (cuando el motor por fin AGARRA) cruza las ganancias:
       el abanico dañado se va CURANDO y queda sonando como un abanico.
       Todo el lazo sigue la VELOCIDAD REAL de la rueda con
       abanicoAjustar(v01) (lo llama el bucle maestro, frame a frame):
       penar más duro cuanto más la empujan; soplar más fuerte cuantas
       más vueltas da curada. */
    abanicoDanadoIniciar() {
      const a = ctx();
      if (!a || abanicoNodos) return;

      // — la voz DAÑADA: dos sierras desafinadas, trabadas —
      const o1 = a.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55;
      const o2 = a.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 110.7;
      // el vaivén irregular del tono: dos LFOs cruzados (la aspa rozando)
      const lfo1 = a.createOscillator(); lfo1.type = 'sine'; lfo1.frequency.value = 2.3;
      const lfo1G = a.createGain(); lfo1G.gain.value = 5.5;
      const lfo2 = a.createOscillator(); lfo2.type = 'sine'; lfo2.frequency.value = 0.9;
      const lfo2G = a.createGain(); lfo2G.gain.value = 3.2;
      lfo1.connect(lfo1G); lfo1G.connect(o1.frequency);
      lfo2.connect(lfo2G); lfo2G.connect(o2.frequency);
      const fDan = a.createBiquadFilter();
      fDan.type = 'bandpass'; fDan.frequency.value = 260; fDan.Q.value = 1.35;
      const gDanado = a.createGain(); gDanado.gain.value = 0;
      o1.connect(fDan); o2.connect(fDan);
      fDan.connect(gDanado); gDanado.connect(a.destination);

      // — el AM desparejo del eje penando: dos LFOs de ganancia, cada
      //    uno a lo suyo (nunca se juntan igual: suena TRABADO) —
      const am1 = a.createOscillator(); am1.type = 'sine'; am1.frequency.value = 7.6;
      const am1G = a.createGain(); am1G.gain.value = 0.32;
      const am2 = a.createOscillator(); am2.type = 'sine'; am2.frequency.value = 3.4;
      const am2G = a.createGain(); am2G.gain.value = 0.24;
      const gAM = a.createGain(); gAM.gain.value = 1;
      am1.connect(am1G); am2.connect(am2G);
      am1G.connect(gAM.gain); am2G.connect(gAM.gain);
      fDan.disconnect(); fDan.connect(gAM); gAM.connect(gDanado);

      // — el soplo rasposo del motor sin aceite (solo en la voz dañada) —
      const n = Math.floor(a.sampleRate * 1.2);
      const b = a.createBuffer(1, n, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const srcR = a.createBufferSource();
      srcR.buffer = b; srcR.loop = true;
      const fR = a.createBiquadFilter();
      fR.type = 'bandpass'; fR.frequency.value = 700; fR.Q.value = 1.1;
      const gR = a.createGain(); gR.gain.value = 0;
      srcR.connect(fR); fR.connect(gR); gR.connect(a.destination);

      // — la voz SANA: aire limpio (ruido grave) y zumbido hondo —
      const srcA = a.createBufferSource();
      srcA.buffer = b; srcA.loop = true;               // el mismo ruido, otro filtro
      const fA = a.createBiquadFilter();
      fA.type = 'lowpass'; fA.frequency.value = 430; fA.Q.value = 0.45;
      const gAire = a.createGain(); gAire.gain.value = 0;
      srcA.connect(fA); fA.connect(gAire); gAire.connect(a.destination);
      const hum = a.createOscillator(); hum.type = 'sine'; hum.frequency.value = 104;
      const gHum = a.createGain(); gHum.gain.value = 0;
      // el vaivén de las aspas sanas: un AM suave, regular, de verdad
      const amS = a.createOscillator(); amS.type = 'sine'; amS.frequency.value = 9.2;
      const amSG = a.createGain(); amSG.gain.value = 0.06;
      const gAMS = a.createGain(); gAMS.gain.value = 1;
      amS.connect(amSG); amSG.connect(gAMS.gain);
      hum.connect(gAMS); gAMS.connect(gHum); gHum.connect(a.destination);

      [o1, o2, lfo1, lfo2, am1, am2, amS].forEach(x => x.start());
      [srcR, srcA, hum].forEach(x => x.start());

      abanicoNodos = {
        o1, o2, lfo1, lfo2, am1, am2, amS, srcR, srcA, hum,
        gDanado, gNormal: gHum, gAire, gR, gAMS, fDan, fA,
        curada: false,
      };
    },

    // Sigue la VELOCIDAD REAL de la rueda (v01: 0..1, vueltas/s ÷ 2.2).
    // Sin abanico activo no hace nada (el bucle maestro la llama SIEMPRE).
    abanicoAjustar(velAng) {
      const nd = abanicoNodos;
      if (!nd) return;
      const v = Math.max(0, Math.min(1, velAng / (Math.PI * 2 * 2.2)));
      const a = ctx(); if (!a) return;
      const V = CONFIG.volumen;
      if (!nd.curada) {
        // dañada: penar más duro cuanto más la empujan (y el tono sube)
        const base = 0.05 + 0.16 * v;
        nd.gDanado.gain.setTargetAtTime(base * V, a.currentTime, 0.09);
        nd.gR.gain.setTargetAtTime(base * 0.45 * V, a.currentTime, 0.09);
        const tono = 1 + v * 0.9;
        nd.o1.frequency.setTargetAtTime(55 * tono, a.currentTime, 0.09);
        nd.o2.frequency.setTargetAtTime(110.7 * tono, a.currentTime, 0.09);
        nd.am1.frequency.setTargetAtTime(7.6 * tono, a.currentTime, 0.09);
      } else {
        // sana: más aire cuantas más vueltas, y el zumbido hondo sube
        nd.gAire.gain.setTargetAtTime((0.03 + 0.15 * v) * V, a.currentTime, 0.09);
        nd.gNormal.gain.setTargetAtTime((0.02 + 0.06 * v) * V, a.currentTime, 0.09);
        nd.gAMS.gain.value = 1;
        nd.amS.frequency.setTargetAtTime(8 + v * 16, a.currentTime, 0.09);
      }
    },

    // LA CURACIÓN: el motor por fin AGARRÓ — el abanico dañado pasa a
    // sonar como un abanico sano en "duracion" segundos (el cruce es
    // suave: se le oye curarse).
    abanicoTransicionNormal(duracion = 1.7) {
      const nd = abanicoNodos;
      if (!nd || nd.curada) return;
      nd.curada = true;
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const V = CONFIG.volumen;
      // la voz dañada se apaga despacito (y su vaivén se rinde)…
      nd.gDanado.gain.setTargetAtTime(0.0001, t, duracion / 3.4);
      nd.gR.gain.setTargetAtTime(0.0001, t, duracion / 3.4);
      nd.am1.frequency.setTargetAtTime(5.5, t, duracion / 3);
      nd.am2.frequency.setTargetAtTime(2.6, t, duracion / 3);
      // …mientras la sana coge su sitio de abanico de verdad
      nd.gAire.gain.setTargetAtTime(0.10 * V, t, duracion / 3);
      nd.gNormal.gain.setTargetAtTime(0.05 * V, t, duracion / 3);
      // y el relincho del motor agarrando por fin (¡bzzt-din!)
      tono(86, 0.14, 'sawtooth', 0.055);
      tono(172, 0.10, 'triangle', 0.045, 0.06);
    },

    // Apaga el abanico (rápido y suave: la ruleta ya paró).
    abanicoParar() {
      const nd = abanicoNodos;
      if (!nd) return;
      abanicoNodos = null;
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      // el aire muere despacito: las aspas se van deteniendo solas
      const fade = 0.4;
      try {
        nd.gDanado.gain.setTargetAtTime(0.0001, t, 0.08);
        nd.gR.gain.setTargetAtTime(0.0001, t, 0.08);
        nd.gAire.gain.setTargetAtTime(0.0001, t, fade);
        nd.gNormal.gain.setTargetAtTime(0.0001, t, fade);
        [nd.o1, nd.o2, nd.lfo1, nd.lfo2, nd.am1, nd.am2, nd.amS,
         nd.srcR, nd.srcA, nd.hum].forEach(x => x.stop(t + fade * 3 + 0.3));
      } catch (e) { /* ya parado */ }
    },
  };
})();
