# Abnormal Roulette

## What is this?

Abnormal Roulette is a playful, browser-based name picker built for classrooms, friends, and groups. It started as a simple roulette wheel but includes unusual, humorous animations inspired by comedy timing, surprises, and visual gags.

The project was created with AI assistance and is primarily intended to have fun with students and teachers. It works as a static website, so it does not require a server or backend.

## Live demo

You can publish the project with GitHub Pages:

```text
https://Allphred.github.io/YANR-Roulette/
```

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Web Audio API
- Local Storage
- GitHub Pages

No frameworks, external libraries, backend, multimedia files, or Internet connection are required.

## Features

- Interactive roulette wheel rendered with Canvas.
- Add one participant per line.
- Random participant selection.
- Sound effects and synthesized music.
- Completely synthesized audio through the Web Audio API.
- Light and dark themes.
- Responsive design for desktop, tablet, and mobile devices.
- Fullscreen mode.
- Touch, mouse, and keyboard controls.
- Automatic saving of names, settings, and history with Local Storage.
- Adjustable spin duration, speed, and acceleration.
- Configurable behavior after a participant is selected:
  - Ask whether to keep or remove them.
  - Remove them automatically.
  - Keep them automatically.
- Winner card displayed beside the roulette wheel.
- Winner history with an option to clear it.
- Direct spinning by touching or clicking the wheel.
- Spin with the main button or the Space key.
- URL parameters for testing and quick setup.
- Local execution by opening `index.html` directly.

## Spin modes

- **Normal:** Starts with the classic spin and progressively unlocks groups of surprise animations when participants are removed. This is the default mode.
- **Really Normal:** Always uses the classic spin, with no progression or surprises.
- **Random:** Uses a shuffled deck of all animations without repeating an animation until the deck is exhausted.
- **Choose Animation:** Forces a specific animation for testing or presentation.

Keeping a participant does not advance the surprise progression. Removing a participant advances it to the next group.

## Animations

The roulette includes 19 animations, including:

- Classic spin.
- False stop.
- Elastic stop and rebound.
- Rotating arrow.
- Infinity-style snap.
- Powder disintegration.
- Increased probability for one participant.
- Casino roulette.
- Damaged motor.
- Damaged brakes.
- Hand-powered damaged fan.
- Turbo spin with flying segments.
- Multiple arrows.
- Cups and balls game.
- Wheel dismantling.
- Dartboard and dart.
- SaaS-style premium prank.
- Sudden stop.
- Accelerating malfunction.

## Controls

- Touch or click the wheel to spin.
- Use the **Spin** button to spin.
- Press **Space** to spin or keep a selected name.
- Press **Esc** to keep the selected name.
- Use the options panel to change the spin settings.
- Use the moon or sun button to switch themes.
- Enable or disable sound from the options panel.
- Use fullscreen mode for presentations or projection.

## Project structure

```text
index.html
styles.css
js/
  config.js
  sound.js
  animations.js
  motor.js
  ui.js
```

### Files

- `index.html`: Page structure and interface elements.
- `styles.css`: Layout, themes, responsive styles, and visual effects.
- `js/config.js`: Default settings, palette, timing, and visual configuration.
- `js/sound.js`: Synthesized sound effects and casino music.
- `js/animations.js`: All 19 roulette animations and their choreography.
- `js/motor.js`: Canvas rendering, wheel physics, and user interactions.
- `js/ui.js`: Interface, state, settings, Local Storage, and application flow.

## Run locally

There is no build process or installation step.

1. Download or clone the repository.
2. Open `index.html` directly in a modern browser.

For local server usage:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload `index.html`, `styles.css`, and the complete `js/` folder to the repository root.
3. Open **Settings** → **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder.
6. Save the settings.

GitHub Pages will provide a URL similar to:

```text
https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
```

## Testing parameters

Append these parameters to the URL:

```text
?anim=11
```

Forces a specific animation. Supported values are `1` through `19`.

```text
?rapido=1
```

Speeds up every animation for quick testing.

```text
?nombres=A|B|C
```

Loads a list of names directly.

Parameters can be combined:

```text
?anim=19&rapido=1&nombres=A|B|C
```

## Useful animation IDs

- `9` — Casino roulette
- `11` — Damaged motor
- `12` — Premium prank
- `15` — Cups and balls game
- `16` — Wheel dismantling
- `17` — Dartboard and dart
- `18` — Damaged brakes
- `19` — Hand-powered damaged fan

## Customization

- Edit `js/config.js` to change colors, default duration, volume, speed, arrow size, particle settings, and behavior.
- Edit `js/animations.js` to change the timing and choreography of each animation.
- Edit `styles.css` to change the layout and appearance of both themes.
- Edit `index.html` to change interface labels and structure.

## Browser support

Works in modern browsers that support:

- HTML Canvas
- Web Audio API
- Local Storage
- Pointer Events
- ResizeObserver
- CSS custom properties

## Privacy

The application does not send participant names or settings to a server. Names and preferences are stored locally in the browser using Local Storage.

## Credits

Created by AI and Alfred P.J.