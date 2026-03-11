# 🌐 EchoDupe | Games Hub

The central terminal for all EchoDupe simulations and game environments.

**Live Site:** [https://echodupe.github.io/hub/](https://echodupe.github.io/Games/)

---

## 📂 Project Structure

To ensure all internal links and assets function correctly, the repository follows this strict architecture:

* `index.html` - The main navigation interface (The Hub).
* `assets/` - Contains branding and UI elements like `title.png`.
* `Games/` - Directory for standalone game files.
    * `TreeSimulator.html` - Atmospheric 3D fog-harvesting simulation.

---

## 🎮 Current Simulations

### 🌲 Tree Simulator
An experimental 3D environment built with **Three.js**. 
* **Objective:** Harvest fog-energy from trees to generate capital.
* **Automation:** Purchase worker NPCs to scale production.
* **Progression:** Features a Rebirth system with permanent multipliers.
* **Visuals:** Utilizes `FogExp2` and custom neon shaders for a "cyber-forest" aesthetic.

---

## 🛠️ Development Setup

If you are cloning this repository to work on it locally:

1.  **Cloning:** `git clone https://github.com/echodupe/hub.git`
2.  **Relative Paths:** All game files in the `/Games/` folder use `../` to access the root `assets/` and `index.html`. Ensure this structure is maintained to avoid 404 errors.
3.  **Engine:** Powered by the Three.js WebGL library via CDN.

---

## ✍️ Credits

**Designed, Developed, and Maintained by SKITXOE.**
*EchoDupe Evolution Framework V6.5*
