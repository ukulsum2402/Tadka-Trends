# Tadka & Trends — Assets Directory

This directory stores local static assets for the **Tadka & Trends** frontend so the application works seamlessly both in Vite (`npm run dev` / `npm run build`) and when opened directly in VS Code (e.g. Live Server) without external CDN dependencies.

## Structure
- `assets/images/` — Curated food photography for the homepage hero banner and all 15 sample Indian Classic & Gen-Z recipes:
  - `hero_tadka_feast.jpg`
  - `shahi_paneer_tadka.jpg`
  - `paneer_smash_tacos.jpg`
  - `aloo_jeera_roast.jpg`
  - `parmesan_aloo_wedges.jpg`
  - `masala_anda_bhurji.jpg`
  - `chili_egg_bowl.jpg`
  - `dhaba_chicken_curry.jpg`
  - `harissa_chicken_flatbread.jpg`
  - `masala_cheese_toast.jpg`
  - `ricotta_honey_toast.jpg`
  - `makhani_penne_pasta.jpg`
  - `pesto_burrata_spaghetti.jpg`
  - `masala_oats_khichdi.jpg`
  - `espresso_oats_parfait.jpg`
  - `kesar_shahi_tukda.jpg`

## Image Resilience
Every `<img>` tag in `js/app.js` includes an `onerror` handler that swaps in a clean culinary inline SVG fallback data URI (`getRecipeFallbackSvg`) so newly added recipes with invalid URLs never display broken image icons.
