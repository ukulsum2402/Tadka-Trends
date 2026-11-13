/**
 * Tadka & Trends — Main Frontend Controller (ES Module)
 * Handles hash routing across all 9 screens, multi-criteria filtering,
 * serving size scaling, implicit Taste DNA detection, smart meal planning,
 * combined grocery list generation, CRUD management, and simulated auth.
 */

import { HERO_INGREDIENTS, MEAL_CATEGORIES, DAYS_OF_WEEK } from './data.js';
import * as api from './api.js';

const state = {
  route: 'home',
  routeParam: null,
  recipes: [],
  favorites: [],
  user: null,
  tasteProfile: null,
  mealPlan: null,
  groceryScope: 'daily',
  groceryGenerated: false,
  groceryChecks: {},
  profileTab: 'history',
  authTab: 'login',
  detailScale: 1,
  lastCookedBannerRecipeId: null,
  exploreFilters: {
    q: '',
    heroIngredient: 'All',
    mealTime: 'All',
    cuisineStyle: 'All',
    diet: 'All',
    maxTime: 'All'
  },
  manageFilters: {
    q: '',
    heroIngredient: 'All',
    mealTime: 'All'
  },
  pickerContext: null
};

const appMain = document.getElementById('app-main');
const modalEl = document.getElementById('app-modal');
const modalTitleEl = document.getElementById('modal-title');
const modalBodyEl = document.getElementById('modal-body');
const modalFooterEl = document.getElementById('modal-footer');

/* ==========================================================================
   Utilities & Safe Helpers
   ========================================================================== */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFallbackSvgUri(title = 'Tadka & Trends', cuisineStyle = 'Indian Classic') {
  const accent = cuisineStyle === 'Indian Classic' ? '#E85D04' : '#2D6A4F';
  const safeTitle = String(title).slice(0, 32).replace(/[<>&"']/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F7F3EB"/>
          <stop offset="100%" stop-color="#EAE3D5"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <circle cx="300" cy="195" r="58" fill="${accent}" fill-opacity="0.12"/>
      <path d="M265 205h70a35 35 0 0 1-70 0Z" fill="${accent}" fill-opacity="0.85"/>
      <path d="M278 175c0-10 8-16 8-24M300 171c0-10 8-16 8-24M322 175c0-10 8-16 8-24" stroke="${accent}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <text x="300" y="292" text-anchor="middle" font-family="Poppins, sans-serif" font-size="20" font-weight="600" fill="#1B2621">${safeTitle}</text>
      <text x="300" y="320" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" fill="#48544D">Tadka &amp; Trends Kitchen</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

window.__handleImgError = function (imgEl, title, cuisine) {
  imgEl.onerror = null;
  imgEl.src = getFallbackSvgUri(title, cuisine);
};

function formatScaledQty(qty, scale) {
  const num = Number(qty);
  if (!Number.isFinite(num) || num <= 0) return '';
  const total = num * scale;
  const rounded = Math.round(total * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.?0+$/, '');
}

function showToast(message, variant = 'success') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const item = document.createElement('div');
  item.className = `toast-item ${variant}`;
  item.innerHTML = `<span>${escapeHtml(message)}</span>`;
  stack.appendChild(item);
  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(8px)';
    item.style.transition = 'all 180ms ease';
    setTimeout(() => item.remove(), 200);
  }, 3400);
}

function openModal({ title, bodyHtml, footerHtml }) {
  modalTitleEl.textContent = title;
  modalBodyEl.innerHTML = bodyHtml;
  modalFooterEl.innerHTML = footerHtml || '';
  modalEl.classList.add('open');
}

function closeModal() {
  modalEl.classList.remove('open');
  state.pickerContext = null;
}

function getHeroIconSvg(heroId) {
  const icons = {
    Paneer: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M5 12h14M12 5v14"/>',
    Potato: '<ellipse cx="12" cy="12" rx="7" ry="5.5"/><circle cx="10" cy="11" r="0.8"/><circle cx="14.5" cy="13" r="0.8"/>',
    Egg: '<path d="M12 3C8.5 3 6 9 6 13.5a6 6 0 0 0 12 0C18 9 15.5 3 12 3Z"/>',
    Chicken: '<path d="M15.5 4.5a4.5 4.5 0 0 1 4 6.5l-6.8 6.8a2.5 2.5 0 0 1-3.5-3.5l6.3-9.8Z"/><path d="M8.5 15.5 5 19"/><circle cx="4.5" cy="19.5" r="1.5"/>',
    Bread: '<path d="M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Z"/>',
    Pasta: '<path d="M4 15h16M6 15a6 6 0 0 0 12 0M8 10c1-3 3-3 4 0s3 3 4 0"/>',
    Oats: '<path d="M5 12a7 7 0 0 0 14 0H5Z"/><path d="M9 8c0-2 1.5-3 3-3s3 1 3 3"/>'
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[heroId] || icons.Paneer}</svg>`;
}

/* ==========================================================================
   Data Refresh & Navigation Shell
   ========================================================================== */

async function syncGlobalState() {
  api.ensureInitialData();
  state.recipes = await api.fetchAllRecipes();
  state.favorites = api.getFavorites();
  state.user = api.getUserSession();
  state.mealPlan = api.getMealPlan();
  state.groceryChecks = api.getGroceryChecks();
  state.tasteProfile = await api.fetchTasteProfile(state.user.id);
  updateNavbarChrome();
}

function updateNavbarChrome() {
  const favCountEl = document.getElementById('nav-fav-count');
  if (favCountEl) favCountEl.textContent = String(state.favorites.length);

  const pillBtn = document.getElementById('nav-taste-pill');
  const pillText = document.getElementById('nav-taste-pill-text');
  if (pillBtn && pillText && state.tasteProfile) {
    pillText.textContent = state.tasteProfile.statusLabel;
    pillBtn.classList.toggle('detected', state.tasteProfile.totalCooked > 0);
  }

  const navLinks = document.querySelectorAll('[data-nav]');
  navLinks.forEach((el) => {
    const target = el.getAttribute('data-nav');
    const isActive =
      state.route === target ||
      (state.route === 'recipe' && target === 'explore') ||
      (state.route === 'edit-recipe' && target === 'manage');
    el.classList.toggle('active', isActive);
  });

  const desktopAuth = document.getElementById('nav-auth-slot');
  const mobileAuth = document.getElementById('mobile-auth-slot');
  const authHtml = state.user?.isLoggedIn
    ? `<div style="display:flex;align-items:center;gap:8px;">
         <a href="#profile" class="btn btn-outline btn-sm">${escapeHtml(state.user.name.split(' ')[0])}</a>
         <button type="button" class="btn btn-ghost btn-sm" data-action="logout">Sign Out</button>
       </div>`
    : `<a href="#auth" class="btn btn-primary btn-sm">Login / Register</a>`;

  if (desktopAuth) desktopAuth.innerHTML = authHtml;
  if (mobileAuth) mobileAuth.innerHTML = authHtml;
}

function navigateTo(hashPath) {
  const normalized = hashPath.startsWith('#') ? hashPath : `#${hashPath}`;
  if (window.location.hash === normalized) {
    handleRouteChange();
  } else {
    window.location.hash = normalized;
  }
  const drawer = document.getElementById('mobile-drawer');
  const toggle = document.getElementById('mobile-menu-toggle');
  if (drawer && drawer.classList.contains('open')) {
    drawer.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
}

function parseHash() {
  const raw = (window.location.hash || '#home').replace(/^#/, '');
  const [routePart, paramPart] = raw.split('/');
  const validRoutes = [
    'home',
    'explore',
    'recipe',
    'add-recipe',
    'edit-recipe',
    'favorites',
    'meal-planner',
    'profile',
    'manage',
    'auth'
  ];
  state.route = validRoutes.includes(routePart) ? routePart : 'home';
  state.routeParam = paramPart ? decodeURIComponent(paramPart) : null;
}

async function handleRouteChange() {
  parseHash();
  await syncGlobalState();
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ==========================================================================
   Smart Taste-Based Recommendation Engine
   ========================================================================== */

function scoreRecipeForTaste(recipe, tasteProfile, user) {
  let score = 0;
  const preferredDiet = user?.dietPreference || tasteProfile?.dietPreference || 'All';

  if (preferredDiet === 'Veg' && recipe.diet !== 'Veg') return -999;
  if (preferredDiet === 'Non-Veg' && recipe.diet === 'Non-Veg') score += 25;

  if (tasteProfile && tasteProfile.totalCooked > 0) {
    if (tasteProfile.dominantCuisine === recipe.cuisineStyle) score += 35;
    else if (tasteProfile.dominantCuisine === 'Balanced Fusion') score += 18;

    if (recipe.heroIngredient === tasteProfile.favoriteHeroIngredient) score += 25;

    const spiceMap = { 'Sweet / No Spice': 15, Mild: 35, Medium: 65, Spicy: 95 };
    const dishSpice = spiceMap[recipe.spiceLevel] ?? 55;
    const diff = Math.abs(dishSpice - tasteProfile.spiceScore);
    score += Math.max(0, 30 - Math.round(diff * 0.4));
  } else {
    if (recipe.featured) score += 10;
  }

  return score;
}

function pickBestRecipeForSlot(recipes, slot, tasteProfile, user, excludeIds = new Set()) {
  const slotMatches = recipes.filter((r) => r.mealTime === slot && !excludeIds.has(Number(r.id)));
  const pool = slotMatches.length > 0
    ? slotMatches
    : recipes.filter((r) => !excludeIds.has(Number(r.id)));

  const sorted = [...pool].sort(
    (a, b) => scoreRecipeForTaste(b, tasteProfile, user) - scoreRecipeForTaste(a, tasteProfile, user)
  );
  const valid = sorted.filter((r) => scoreRecipeForTaste(r, tasteProfile, user) > -500);
  const chosen = valid[0] || sorted[0] || recipes[0] || null;
  return chosen ? Number(chosen.id) : null;
}

async function autoGenerateDailyPlan({ includeWeekly = false } = {}) {
  const recipes = state.recipes;
  if (!recipes.length) return;

  const usedDaily = new Set();
  const daily = {};
  ['Breakfast', 'Lunch', 'Dinner'].forEach((slot) => {
    const id = pickBestRecipeForSlot(recipes, slot, state.tasteProfile, state.user, usedDaily);
    daily[slot] = id;
    if (id) usedDaily.add(id);
  });

  const nextPlan = {
    ...state.mealPlan,
    daily,
    lastAutoGeneratedAt: new Date().toISOString()
  };

  if (includeWeekly) {
    const weekly = {};
    DAYS_OF_WEEK.forEach((day, idx) => {
      weekly[day] = {};
      ['Breakfast', 'Lunch', 'Dinner'].forEach((slot) => {
        const candidates = recipes
          .filter((r) => {
            const pref = state.user?.dietPreference || 'All';
            if (pref === 'Veg' && r.diet !== 'Veg') return false;
            return r.mealTime === slot;
          })
          .sort(
            (a, b) =>
              scoreRecipeForTaste(b, state.tasteProfile, state.user) -
              scoreRecipeForTaste(a, state.tasteProfile, state.user)
          );
        const fallbackPool = candidates.length > 0 ? candidates : recipes;
        const picked = fallbackPool[idx % fallbackPool.length];
        weekly[day][slot] = picked ? Number(picked.id) : null;
      });
    });
    nextPlan.weekly = weekly;
  }

  state.mealPlan = await api.saveMealPlan(nextPlan, state.user?.id);
}

async function handleMarkAsCooked(recipeId, { fromDetails = false } = {}) {
  const recipe = state.recipes.find((r) => Number(r.id) === Number(recipeId));
  if (!recipe) return;

  api.recordCookedDish(recipeId);
  state.tasteProfile = await api.fetchTasteProfile(state.user?.id);
  await autoGenerateDailyPlan({ includeWeekly: false });
  updateNavbarChrome();

  if (fromDetails) {
    state.lastCookedBannerRecipeId = Number(recipeId);
    renderCurrentView();
  }
  showToast(`Cooked "${recipe.name}"! Taste DNA & 3-Meal Plan updated.`, 'accent');
}

/* ==========================================================================
   Reusable Recipe Card Component
   ========================================================================== */

function renderRecipeCard(recipe, { isFavoriteView = false } = {}) {
  const isFav = state.favorites.includes(Number(recipe.id));
  const totalTime = Number(recipe.prepTime) + Number(recipe.cookTime);
  const dietClass = recipe.diet === 'Veg' ? 'veg' : 'nonveg';
  const cuisineClass = recipe.cuisineStyle === 'Indian Classic' ? 'indian' : 'genz';
  const safeName = escapeHtml(recipe.name);
  const safeCuisine = escapeHtml(recipe.cuisineStyle);

  return `
    <article class="recipe-card">
      <div class="recipe-card-media" data-action="view-recipe" data-id="${recipe.id}">
        <img
          src="${escapeHtml(recipe.image)}"
          alt="${safeName}"
          class="recipe-card-img"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="window.__handleImgError(this, '${safeName.replace(/'/g, '')}', '${safeCuisine.replace(/'/g, '')}')"
        />
        <div class="recipe-card-fav-overlay">
          <button
            type="button"
            class="icon-btn ${isFav ? 'favorited' : ''}"
            data-action="toggle-favorite"
            data-id="${recipe.id}"
            aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            title="${isFav ? 'Remove from Favorites' : 'Save to Favorites'}"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="recipe-card-body">
        <div class="recipe-card-topline">
          <span class="diet-and-cuisine">
            <span class="diet-symbol ${dietClass}" title="${escapeHtml(recipe.diet)}" aria-label="${escapeHtml(recipe.diet)}"></span>
            <span>${escapeHtml(recipe.diet)}</span>
          </span>
          <span class="cuisine-tag ${cuisineClass}">${safeCuisine}</span>
        </div>

        <h3 class="recipe-card-title" data-action="view-recipe" data-id="${recipe.id}">${safeName}</h3>
        <p class="recipe-card-desc">${escapeHtml(recipe.description)}</p>

        <div class="recipe-card-meta tabular-nums">
          <span>${escapeHtml(recipe.heroIngredient)}</span>
          <span class="meta-sep">·</span>
          <span>${escapeHtml(recipe.mealTime)}</span>
          <span class="meta-sep">·</span>
          <span>${totalTime} mins</span>
          <span class="meta-sep">·</span>
          <span>${escapeHtml(recipe.spiceLevel)}</span>
          <span class="meta-sep">·</span>
          <span>${escapeHtml(recipe.difficulty)}</span>
        </div>

        <div class="recipe-card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-action="view-recipe" data-id="${recipe.id}">
            View Recipe
          </button>
          ${
            isFavoriteView
              ? `<button type="button" class="btn btn-outline btn-sm" data-action="toggle-favorite" data-id="${recipe.id}">Remove</button>`
              : `<button type="button" class="btn btn-outline btn-sm" data-action="mark-cooked" data-id="${recipe.id}">Mark as Cooked</button>`
          }
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   1. HOME PAGE
   ========================================================================== */

function renderHomeView() {
  const featured = state.recipes.filter((r) => r.featured).slice(0, 6);
  const latest = [...state.recipes].slice(0, 3);

  const heroCounts = {};
  const categoryCounts = {};
  state.recipes.forEach((r) => {
    heroCounts[r.heroIngredient] = (heroCounts[r.heroIngredient] || 0) + 1;
    categoryCounts[r.mealTime] = (categoryCounts[r.mealTime] || 0) + 1;
  });

  appMain.innerHTML = `
    <section class="hero-section">
      <div class="container">
        <div class="hero-banner">
          <img
            src="./assets/images/hero_tadka_feast.jpg"
            alt="Traditional Indian family tadka bowls alongside modern sourdough and pasta"
            class="hero-bg-img"
            referrerpolicy="no-referrer"
            onerror="window.__handleImgError(this, 'Tadka & Trends Feast', 'Indian Classic')"
          />
          <div class="hero-scrim" aria-hidden="true"></div>
          <div class="hero-content">
            <span class="hero-eyebrow">Smart Taste-Based Recipe &amp; Meal Planner</span>
            <h1 class="hero-title">
              Discover Delicious Recipes for Every Day — Traditional Family Tadka Meets Modern Gen-Z Cravings
            </h1>
            <p class="hero-lead">
              Cook with what is already in your kitchen, discover your personal Taste DNA from every dish you prepare, and turn cravings into effortless daily meal plans.
            </p>
            <form class="hero-search-bar" id="hero-search-form">
              <div class="hero-search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  id="hero-search-input"
                  class="hero-search-input"
                  placeholder="Search by dish or ingredient (e.g. Paneer, Pasta, Bhurji, Oats)..."
                  aria-label="Search recipes by dish name or ingredient"
                />
              </div>
              <button type="submit" class="btn btn-saffron">Search Recipes</button>
            </form>
            <div class="hero-actions-row">
              <a href="#explore" class="btn btn-primary">Explore Recipes</a>
              <a href="#meal-planner" class="btn btn-outline" style="background: rgba(255,255,255,0.92);">Open Meal Planner</a>
              ${
                state.user?.isLoggedIn
                  ? `<a href="#profile" class="btn btn-outline" style="background: rgba(255,255,255,0.92);">My Profile (${escapeHtml(state.user.name.split(' ')[0])})</a>`
                  : `<a href="#auth" class="btn btn-saffron">Login or Register</a>`
              }
              <span class="hero-meta-note tabular-nums">${state.recipes.length} curated Indian &amp; Gen-Z recipes ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block-tight">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-kicker">Pantry First Discovery</span>
            <h2 class="section-title">Cook by Hero Ingredient</h2>
          </div>
          <a href="#explore" class="btn btn-ghost btn-sm">View all ingredients →</a>
        </div>
        <div class="hero-ingredient-strip">
          ${HERO_INGREDIENTS.map(
            (hero) => `
              <button type="button" class="ingredient-tile" data-action="filter-hero" data-hero="${hero.id}">
                <span class="ingredient-tile-icon">${getHeroIconSvg(hero.id)}</span>
                <span class="ingredient-tile-name">${hero.label}</span>
                <span class="ingredient-tile-meta tabular-nums">${heroCounts[hero.id] || 0} recipes · ${hero.subtitle}</span>
              </button>
            `
          ).join('')}
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-kicker">Best of Both Kitchens</span>
            <h2 class="section-title">Featured Indian Classics &amp; Gen-Z Trends</h2>
            <p class="section-subtitle">Handpicked homestyle comfort curries alongside crisp cafe-style plates and 15-minute rice bowls.</p>
          </div>
          <a href="#explore" class="btn btn-outline btn-sm">Explore Full Catalog</a>
        </div>
        <div class="recipe-grid">
          ${featured.map((r) => renderRecipeCard(r)).join('')}
        </div>
      </div>
    </section>

    <section class="section-block-tight" style="background-color: var(--bg-subtle); border-block: 1px solid var(--border-hairline);">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-kicker">Browse by Time of Day</span>
            <h2 class="section-title">Popular Food Categories</h2>
          </div>
        </div>
        <div class="category-grid">
          ${MEAL_CATEGORIES.map(
            (cat) => `
              <button type="button" class="category-card" data-action="filter-category" data-category="${cat.id}">
                <div>
                  <h3 class="category-card-title">${cat.label}</h3>
                  <p class="category-card-desc">${cat.description}</p>
                </div>
                <span class="category-card-count tabular-nums">${categoryCounts[cat.id] || 0} dishes →</span>
              </button>
            `
          ).join('')}
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-kicker">Fresh from the Kitchen</span>
            <h2 class="section-title">Latest Recipes</h2>
          </div>
          <a href="#add-recipe" class="btn btn-saffron btn-sm">+ Add Your Recipe</a>
        </div>
        <div class="recipe-grid">
          ${latest.map((r) => renderRecipeCard(r)).join('')}
        </div>
      </div>
    </section>
  `;

  document.getElementById('hero-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('hero-search-input')?.value.trim() || '';
    state.exploreFilters.q = q;
    navigateTo('explore');
  });
}

/* ==========================================================================
   2. EXPLORE RECIPES PAGE (Multi-Criteria Simultaneous Filters)
   ========================================================================== */

async function renderExploreView() {
  const f = state.exploreFilters;
  const filtered = await api.searchRecipes(f);

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container">
        <h1>Explore Recipes</h1>
        <p>Filter simultaneously by hero ingredient, meal time, Indian Classic vs. Gen-Z style, dietary type, and cooking time.</p>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container">
        <div class="explore-filters-panel">
          <div class="filters-grid">
            <div class="filter-field">
              <label for="exp-search">Search Dish or Ingredient</label>
              <input
                type="text"
                id="exp-search"
                class="form-control"
                placeholder="e.g. Paneer, Pasta, Garlic..."
                value="${escapeHtml(f.q)}"
              />
            </div>

            <div class="filter-field">
              <label for="exp-hero">Hero Ingredient</label>
              <select id="exp-hero" class="form-select">
                <option value="All">All Ingredients</option>
                ${HERO_INGREDIENTS.map(
                  (h) => `<option value="${h.id}" ${f.heroIngredient === h.id ? 'selected' : ''}>${h.label}</option>`
                ).join('')}
              </select>
            </div>

            <div class="filter-field">
              <label for="exp-meal">Meal Time</label>
              <select id="exp-meal" class="form-select">
                <option value="All">All Meals</option>
                ${MEAL_CATEGORIES.map(
                  (c) => `<option value="${c.id}" ${f.mealTime === c.id ? 'selected' : ''}>${c.label}</option>`
                ).join('')}
              </select>
            </div>

            <div class="filter-field">
              <label for="exp-cuisine">Cuisine Style</label>
              <select id="exp-cuisine" class="form-select">
                <option value="All" ${f.cuisineStyle === 'All' ? 'selected' : ''}>All Styles</option>
                <option value="Indian Classic" ${f.cuisineStyle === 'Indian Classic' ? 'selected' : ''}>Indian Classic</option>
                <option value="Gen-Z / Continental" ${f.cuisineStyle === 'Gen-Z / Continental' ? 'selected' : ''}>Gen-Z / Continental</option>
              </select>
            </div>

            <div class="filter-field">
              <label for="exp-diet">Diet</label>
              <select id="exp-diet" class="form-select">
                <option value="All" ${f.diet === 'All' ? 'selected' : ''}>All (Veg &amp; Non-Veg)</option>
                <option value="Veg" ${f.diet === 'Veg' ? 'selected' : ''}>Veg Only</option>
                <option value="Non-Veg" ${f.diet === 'Non-Veg' ? 'selected' : ''}>Non-Veg Only</option>
              </select>
            </div>

            <div class="filter-field">
              <label for="exp-time">Cooking Time</label>
              <select id="exp-time" class="form-select">
                <option value="All" ${f.maxTime === 'All' ? 'selected' : ''}>Any Time</option>
                <option value="15" ${f.maxTime === '15' ? 'selected' : ''}>Under 15 mins</option>
                <option value="30" ${f.maxTime === '30' ? 'selected' : ''}>Under 30 mins</option>
                <option value="60" ${f.maxTime === '60' ? 'selected' : ''}>Under 60 mins</option>
              </select>
            </div>
          </div>
        </div>

        <div class="explore-toolbar">
          <div class="result-count tabular-nums" id="explore-result-count">
            Showing ${filtered.length} of ${state.recipes.length} recipes
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="clear-explore-filters">
            Reset All Filters
          </button>
        </div>

        <div id="explore-results-region">
          ${
            filtered.length > 0
              ? `<div class="recipe-grid">${filtered.map((r) => renderRecipeCard(r)).join('')}</div>`
              : `<div class="empty-state">
                   <h3>No matching recipes found</h3>
                   <p>Try widening your cooking time or clearing one of the active filters.</p>
                   <button type="button" class="btn btn-primary" id="empty-reset-filters">Show All Recipes</button>
                 </div>`
          }
        </div>
      </div>
    </section>
  `;

  const applyExploreUpdate = async () => {
    const results = await api.searchRecipes(state.exploreFilters);
    const countEl = document.getElementById('explore-result-count');
    const regionEl = document.getElementById('explore-results-region');
    if (countEl) {
      countEl.textContent = `Showing ${results.length} of ${state.recipes.length} recipes`;
    }
    if (regionEl) {
      regionEl.innerHTML =
        results.length > 0
          ? `<div class="recipe-grid">${results.map((r) => renderRecipeCard(r)).join('')}</div>`
          : `<div class="empty-state">
               <h3>No matching recipes found</h3>
               <p>Try widening your cooking time or clearing one of the active filters.</p>
               <button type="button" class="btn btn-primary" id="empty-reset-filters">Show All Recipes</button>
             </div>`;
      document.getElementById('empty-reset-filters')?.addEventListener('click', resetExploreFilters);
    }
  };

  const resetExploreFilters = () => {
    state.exploreFilters = {
      q: '',
      heroIngredient: 'All',
      mealTime: 'All',
      cuisineStyle: 'All',
      diet: 'All',
      maxTime: 'All'
    };
    renderExploreView();
  };

  document.getElementById('exp-search')?.addEventListener('input', (e) => {
    state.exploreFilters.q = e.target.value;
    applyExploreUpdate();
  });
  document.getElementById('exp-hero')?.addEventListener('change', (e) => {
    state.exploreFilters.heroIngredient = e.target.value;
    applyExploreUpdate();
  });
  document.getElementById('exp-meal')?.addEventListener('change', (e) => {
    state.exploreFilters.mealTime = e.target.value;
    applyExploreUpdate();
  });
  document.getElementById('exp-cuisine')?.addEventListener('change', (e) => {
    state.exploreFilters.cuisineStyle = e.target.value;
    applyExploreUpdate();
  });
  document.getElementById('exp-diet')?.addEventListener('change', (e) => {
    state.exploreFilters.diet = e.target.value;
    applyExploreUpdate();
  });
  document.getElementById('exp-time')?.addEventListener('change', (e) => {
    state.exploreFilters.maxTime = e.target.value;
    applyExploreUpdate();
  });

  document.getElementById('clear-explore-filters')?.addEventListener('click', resetExploreFilters);
  document.getElementById('empty-reset-filters')?.addEventListener('click', resetExploreFilters);
}

/* ==========================================================================
   3. RECIPE DETAILS PAGE (Serving Size Scaler + Mark as Cooked + Print)
   ========================================================================== */

async function renderRecipeDetailsView(id) {
  const recipe = await api.fetchRecipeById(id);
  if (!recipe) {
    appMain.innerHTML = `
      <div class="container section-block">
        <div class="empty-state">
          <h3>Recipe not found</h3>
          <p>This recipe may have been removed or the link is invalid.</p>
          <a href="#explore" class="btn btn-primary">Back to Explore Recipes</a>
        </div>
      </div>
    `;
    return;
  }

  const isFav = state.favorites.includes(Number(recipe.id));
  const totalTime = Number(recipe.prepTime) + Number(recipe.cookTime);
  const scale = state.detailScale || 1;
  const scaledServings = Math.max(1, Math.round(Number(recipe.servings) * scale));
  const dietClass = recipe.diet === 'Veg' ? 'veg' : 'nonveg';
  const cuisineClass = recipe.cuisineStyle === 'Indian Classic' ? 'indian' : 'genz';
  const safeName = escapeHtml(recipe.name);
  const safeCuisine = escapeHtml(recipe.cuisineStyle);

  const related = state.recipes
    .filter(
      (r) =>
        Number(r.id) !== Number(recipe.id) &&
        (r.heroIngredient === recipe.heroIngredient || r.cuisineStyle === recipe.cuisineStyle)
    )
    .slice(0, 3);

  const showCookedBanner = Number(state.lastCookedBannerRecipeId) === Number(recipe.id);

  appMain.innerHTML = `
    <div class="container section-block-tight">
      <div class="details-top-actions">
        <a href="#explore" class="btn btn-outline btn-sm">← Back to Explore</a>
        <div class="details-actions-group">
          <button type="button" class="btn btn-outline btn-sm" id="btn-print-recipe">
            Print Recipe
          </button>
          <button
            type="button"
            class="btn ${isFav ? 'btn-saffron' : 'btn-outline'} btn-sm"
            data-action="toggle-favorite"
            data-id="${recipe.id}"
          >
            ${isFav ? 'Saved in Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </div>

      <div class="details-hero-grid">
        <div class="details-image-frame">
          <img
            src="${escapeHtml(recipe.image)}"
            alt="${safeName}"
            referrerpolicy="no-referrer"
            onerror="window.__handleImgError(this, '${safeName.replace(/'/g, '')}', '${safeCuisine.replace(/'/g, '')}')"
          />
        </div>

        <div class="details-summary-panel">
          <div class="recipe-card-topline" style="margin-bottom: 4px;">
            <span class="diet-and-cuisine">
              <span class="diet-symbol ${dietClass}" title="${escapeHtml(recipe.diet)}"></span>
              <span>${escapeHtml(recipe.diet)} · ${escapeHtml(recipe.heroIngredient)} · ${escapeHtml(recipe.mealTime)}</span>
            </span>
            <span class="cuisine-tag ${cuisineClass}">${safeCuisine}</span>
          </div>

          <h1 class="details-title">${safeName}</h1>
          <p class="details-description">${escapeHtml(recipe.description)}</p>

          <div class="details-specs-grid tabular-nums">
            <div>
              <span class="spec-cell-label">Prep Time</span>
              <span class="spec-cell-value">${recipe.prepTime} mins</span>
            </div>
            <div>
              <span class="spec-cell-label">Cook Time</span>
              <span class="spec-cell-value">${recipe.cookTime} mins</span>
            </div>
            <div>
              <span class="spec-cell-label">Total Time</span>
              <span class="spec-cell-value">${totalTime} mins</span>
            </div>
            <div>
              <span class="spec-cell-label">Difficulty</span>
              <span class="spec-cell-value">${escapeHtml(recipe.difficulty)}</span>
            </div>
            <div>
              <span class="spec-cell-label">Spice Level</span>
              <span class="spec-cell-value">${escapeHtml(recipe.spiceLevel)}</span>
            </div>
            <div>
              <span class="spec-cell-label">Servings</span>
              <span class="spec-cell-value" id="details-servings-val">${scaledServings} servings</span>
            </div>
          </div>

          <div class="scaler-bar">
            <div>
              <strong style="font-size: 13.5px;">Serving Size Scaler</strong>
              <div style="font-size: 12px; color: var(--text-muted);">Recalculates ingredient quantities instantly</div>
            </div>
            <div class="segmented-control" role="group" aria-label="Serving multiplier">
              ${[1, 2, 4]
                .map(
                  (mult) => `
                    <button
                      type="button"
                      class="segment-btn ${scale === mult ? 'active' : ''}"
                      data-action="scale-servings"
                      data-scale="${mult}"
                    >${mult}x</button>
                  `
                )
                .join('')}
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-lg"
            style="width: 100%;"
            data-action="mark-cooked-details"
            data-id="${recipe.id}"
          >
            Mark as Cooked &amp; Detect My Taste
          </button>

          ${
            showCookedBanner
              ? `<div class="cooked-banner-inline">
                   <div>
                     <strong style="color: var(--brand-green-hover);">Taste Profile Updated!</strong>
                     <div style="font-size: 13px; color: var(--text-secondary);">
                       Detected: ${escapeHtml(state.tasteProfile.statusLabel)}. Your 3-Meal Plan has been tailored.
                     </div>
                   </div>
                   <div style="display:flex;gap:8px;">
                     <a href="#meal-planner" class="btn btn-primary btn-sm">View Meal Plan</a>
                     <a href="#profile" class="btn btn-outline btn-sm">Taste DNA</a>
                   </div>
                 </div>`
              : ''
          }
        </div>
      </div>

      <div class="details-columns">
        <div class="details-card">
          <h2>Ingredients <span class="tabular-nums" style="font-size:14px;font-weight:500;color:var(--text-muted);">(${scaledServings} servings)</span></h2>
          <ul class="ingredient-check-list" id="details-ingredient-list">
            ${(recipe.ingredients || [])
              .map(
                (ing, idx) => `
                  <li class="ingredient-check-item">
                    <input type="checkbox" id="ing-chk-${idx}" data-action="toggle-ing-check" />
                    <label for="ing-chk-${idx}" style="cursor:pointer;">
                      <strong class="tabular-nums">${escapeHtml(formatScaledQty(ing.qty, scale))} ${escapeHtml(ing.unit)}</strong>
                      <span>${escapeHtml(ing.item)}</span>
                    </label>
                  </li>
                `
              )
              .join('')}
          </ul>
        </div>

        <div class="details-card">
          <h2>Step-by-Step Cooking Instructions</h2>
          <ol class="instruction-steps">
            ${(recipe.instructions || [])
              .map(
                (step, idx) => `
                  <li class="instruction-step">
                    <span class="step-num tabular-nums">${idx + 1}</span>
                    <div>${escapeHtml(step)}</div>
                  </li>
                `
              )
              .join('')}
          </ol>
        </div>
      </div>

      ${
        related.length > 0
          ? `<section class="no-print">
               <div class="section-header">
                 <div>
                   <span class="section-kicker">Keep Cooking</span>
                   <h2 class="section-title">Related Recipes</h2>
                 </div>
               </div>
               <div class="recipe-grid">
                 ${related.map((r) => renderRecipeCard(r)).join('')}
               </div>
             </section>`
          : ''
      }
    </div>
  `;

  document.getElementById('btn-print-recipe')?.addEventListener('click', () => {
    window.print();
  });
}

/* ==========================================================================
   4. ADD / EDIT RECIPE PAGE
   ========================================================================== */

async function renderRecipeFormView(editId = null) {
  const editing = editId ? await api.fetchRecipeById(editId) : null;
  const ingredients = editing?.ingredients?.length
    ? editing.ingredients
    : [
        { qty: 200, unit: 'g', item: '' },
        { qty: 1, unit: 'tbsp', item: '' }
      ];
  const instructions = editing?.instructions?.length ? editing.instructions : ['', ''];

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container">
        <h1>${editing ? `Edit Recipe: ${escapeHtml(editing.name)}` : 'Add a New Recipe'}</h1>
        <p>${editing ? 'Update ingredients, timing, or instructions in your recipe catalog.' : 'Share a traditional family Tadka classic or a modern Gen-Z culinary creation.'}</p>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container" style="max-width: 900px;">
        <form class="form-card" id="recipe-form" novalidate>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="rf-name">Recipe Name *</label>
              <input type="text" id="rf-name" class="form-control" placeholder="e.g. Achari Paneer Wrap" value="${escapeHtml(editing?.name || '')}" />
              <span class="form-error" id="err-rf-name"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-image">Recipe Image URL</label>
              <input type="url" id="rf-image" class="form-control" placeholder="./assets/images/shahi_paneer_tadka.jpg or https://..." value="${escapeHtml(editing?.image || './assets/images/shahi_paneer_tadka.jpg')}" />
              <span class="form-error" id="err-rf-image"></span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="rf-desc">Short Description *</label>
            <textarea id="rf-desc" class="form-control" rows="2" placeholder="Describe the flavor profile, texture, and why people love this dish...">${escapeHtml(editing?.description || '')}</textarea>
            <span class="form-error" id="err-rf-desc"></span>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label" for="rf-cuisine">Cuisine Style *</label>
              <select id="rf-cuisine" class="form-select">
                <option value="Indian Classic" ${editing?.cuisineStyle === 'Indian Classic' ? 'selected' : ''}>Indian Classic</option>
                <option value="Gen-Z / Continental" ${editing?.cuisineStyle === 'Gen-Z / Continental' ? 'selected' : ''}>Gen-Z / Continental</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-diet">Dietary Type *</label>
              <select id="rf-diet" class="form-select">
                <option value="Veg" ${editing?.diet === 'Veg' ? 'selected' : ''}>Veg</option>
                <option value="Non-Veg" ${editing?.diet === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-hero">Hero Ingredient *</label>
              <select id="rf-hero" class="form-select">
                ${[...HERO_INGREDIENTS.map((h) => h.id), 'Other']
                  .map(
                    (h) => `<option value="${h}" ${editing?.heroIngredient === h ? 'selected' : ''}>${h}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label" for="rf-meal">Meal Time / Category *</label>
              <select id="rf-meal" class="form-select">
                ${MEAL_CATEGORIES.map(
                  (c) => `<option value="${c.id}" ${editing?.mealTime === c.id ? 'selected' : ''}>${c.label}</option>`
                ).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-difficulty">Difficulty Level *</label>
              <select id="rf-difficulty" class="form-select">
                <option value="Easy" ${editing?.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                <option value="Medium" ${editing?.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Hard" ${editing?.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-spice">Spice Level *</label>
              <select id="rf-spice" class="form-select">
                <option value="Sweet / No Spice" ${editing?.spiceLevel === 'Sweet / No Spice' ? 'selected' : ''}>Sweet / No Spice</option>
                <option value="Mild" ${editing?.spiceLevel === 'Mild' ? 'selected' : ''}>Mild</option>
                <option value="Medium" ${(!editing || editing?.spiceLevel === 'Medium') ? 'selected' : ''}>Medium</option>
                <option value="Spicy" ${editing?.spiceLevel === 'Spicy' ? 'selected' : ''}>Spicy</option>
              </select>
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label" for="rf-prep">Prep Time (mins) *</label>
              <input type="number" id="rf-prep" class="form-control tabular-nums" min="0" value="${editing?.prepTime ?? 10}" />
              <span class="form-error" id="err-rf-prep"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-cook">Cook Time (mins) *</label>
              <input type="number" id="rf-cook" class="form-control tabular-nums" min="0" value="${editing?.cookTime ?? 15}" />
              <span class="form-error" id="err-rf-cook"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="rf-servings">Servings *</label>
              <input type="number" id="rf-servings" class="form-control tabular-nums" min="1" value="${editing?.servings ?? 2}" />
              <span class="form-error" id="err-rf-servings"></span>
            </div>
          </div>

          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label class="form-label" style="margin:0;">Ingredients (with Qty &amp; Unit for Serving Scaler &amp; Grocery List) *</label>
              <button type="button" class="btn btn-outline btn-sm" id="add-ing-row">+ Add Ingredient</button>
            </div>
            <div class="dynamic-rows" id="rf-ingredients-list">
              ${ingredients.map((ing) => renderIngredientFormRow(ing)).join('')}
            </div>
            <span class="form-error" id="err-rf-ingredients"></span>
          </div>

          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label class="form-label" style="margin:0;">Step-by-Step Cooking Instructions *</label>
              <button type="button" class="btn btn-outline btn-sm" id="add-step-row">+ Add Step</button>
            </div>
            <div class="dynamic-rows" id="rf-steps-list">
              ${instructions.map((step, i) => renderStepFormRow(step, i + 1)).join('')}
            </div>
            <span class="form-error" id="err-rf-steps"></span>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px;padding-top:12px;border-top:1px solid var(--border-hairline);">
            <a href="${editing ? '#manage' : '#explore'}" class="btn btn-outline">Cancel</a>
            <button type="submit" class="btn btn-primary btn-lg">
              ${editing ? 'Save Recipe Changes' : 'Submit Recipe'}
            </button>
          </div>
        </form>
      </div>
    </section>
  `;

  const ingList = document.getElementById('rf-ingredients-list');
  const stepsList = document.getElementById('rf-steps-list');

  document.getElementById('add-ing-row')?.addEventListener('click', () => {
    ingList.insertAdjacentHTML('beforeend', renderIngredientFormRow({ qty: 1, unit: 'tbsp', item: '' }));
  });

  document.getElementById('add-step-row')?.addEventListener('click', () => {
    const nextIdx = stepsList.querySelectorAll('.step-row').length + 1;
    stepsList.insertAdjacentHTML('beforeend', renderStepFormRow('', nextIdx));
  });

  ingList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-row]');
    if (btn && ingList.querySelectorAll('.ingredient-row').length > 1) {
      btn.closest('.ingredient-row')?.remove();
    }
  });

  stepsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-row]');
    if (btn && stepsList.querySelectorAll('.step-row').length > 1) {
      btn.closest('.step-row')?.remove();
      stepsList.querySelectorAll('.step-row-badge').forEach((el, idx) => {
        el.textContent = String(idx + 1);
      });
    }
  });

  document.getElementById('recipe-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clearErrors = () => {
      document.querySelectorAll('#recipe-form .form-error').forEach((el) => (el.textContent = ''));
    };
    clearErrors();

    const name = document.getElementById('rf-name').value.trim();
    const image = document.getElementById('rf-image').value.trim() || './assets/images/shahi_paneer_tadka.jpg';
    const description = document.getElementById('rf-desc').value.trim();
    const cuisineStyle = document.getElementById('rf-cuisine').value;
    const diet = document.getElementById('rf-diet').value;
    const heroIngredient = document.getElementById('rf-hero').value;
    const mealTime = document.getElementById('rf-meal').value;
    const difficulty = document.getElementById('rf-difficulty').value;
    const spiceLevel = document.getElementById('rf-spice').value;
    const prepTime = Number(document.getElementById('rf-prep').value);
    const cookTime = Number(document.getElementById('rf-cook').value);
    const servings = Number(document.getElementById('rf-servings').value);

    const parsedIngredients = [...ingList.querySelectorAll('.ingredient-row')]
      .map((row) => ({
        qty: Number(row.querySelector('.ing-qty').value) || 1,
        unit: row.querySelector('.ing-unit').value.trim() || 'pcs',
        item: row.querySelector('.ing-item').value.trim()
      }))
      .filter((x) => x.item.length > 0);

    const parsedInstructions = [...stepsList.querySelectorAll('.step-row textarea')]
      .map((ta) => ta.value.trim())
      .filter((s) => s.length > 0);

    let hasError = false;
    if (name.length < 3) {
      document.getElementById('err-rf-name').textContent = 'Please enter a recipe name (at least 3 characters).';
      hasError = true;
    }
    if (description.length < 10) {
      document.getElementById('err-rf-desc').textContent = 'Please add a short description (at least 10 characters).';
      hasError = true;
    }
    if (!Number.isFinite(prepTime) || prepTime < 0) {
      document.getElementById('err-rf-prep').textContent = 'Enter a valid prep time.';
      hasError = true;
    }
    if (!Number.isFinite(cookTime) || cookTime < 0) {
      document.getElementById('err-rf-cook').textContent = 'Enter a valid cook time.';
      hasError = true;
    }
    if (!Number.isFinite(servings) || servings < 1) {
      document.getElementById('err-rf-servings').textContent = 'Servings must be at least 1.';
      hasError = true;
    }
    if (parsedIngredients.length === 0) {
      document.getElementById('err-rf-ingredients').textContent = 'Please provide at least one ingredient.';
      hasError = true;
    }
    if (parsedInstructions.length === 0) {
      document.getElementById('err-rf-steps').textContent = 'Please provide at least one cooking instruction step.';
      hasError = true;
    }

    if (hasError) {
      showToast('Please fix the highlighted form errors.', 'accent');
      return;
    }

    const payload = {
      name,
      image,
      description,
      cuisineStyle,
      diet,
      heroIngredient,
      mealTime,
      difficulty,
      spiceLevel,
      prepTime,
      cookTime,
      servings,
      ingredients: parsedIngredients,
      instructions: parsedInstructions
    };

    if (editing) {
      await api.updateRecipe(editing.id, payload);
      showToast(`Updated "${name}" successfully.`);
      navigateTo(`recipe/${editing.id}`);
    } else {
      const created = await api.createRecipe(payload);
      showToast(`Added "${name}" to the catalog.`);
      navigateTo(`recipe/${created.id}`);
    }
  });
}

function renderIngredientFormRow(ing) {
  return `
    <div class="ingredient-row">
      <input type="number" step="any" min="0" class="form-control ing-qty tabular-nums" placeholder="Qty" value="${escapeHtml(ing.qty)}" aria-label="Quantity" />
      <input type="text" class="form-control ing-unit" placeholder="Unit (g, cup)" value="${escapeHtml(ing.unit)}" aria-label="Unit" />
      <input type="text" class="form-control ing-item" placeholder="Ingredient name (e.g. Fresh Paneer)" value="${escapeHtml(ing.item)}" aria-label="Ingredient name" />
      <button type="button" class="btn btn-danger-soft btn-sm" data-remove-row title="Remove ingredient">×</button>
    </div>
  `;
}

function renderStepFormRow(text, num) {
  return `
    <div class="step-row">
      <span class="step-row-badge tabular-nums">${num}</span>
      <textarea class="form-control" rows="2" placeholder="Describe step ${num}...">${escapeHtml(text)}</textarea>
      <button type="button" class="btn btn-danger-soft btn-sm" data-remove-row title="Remove step">×</button>
    </div>
  `;
}

/* ==========================================================================
   5. FAVORITES PAGE
   ========================================================================== */

function renderFavoritesView() {
  const favRecipes = state.recipes.filter((r) => state.favorites.includes(Number(r.id)));

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container">
        <h1>Saved Favorites</h1>
        <p>Your personal cookbook of Indian family classics and Gen-Z dishes saved for quick weeknight cooking.</p>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container">
        ${
          favRecipes.length > 0
            ? `<div class="recipe-grid">${favRecipes.map((r) => renderRecipeCard(r, { isFavoriteView: true })).join('')}</div>`
            : `<div class="empty-state">
                 <h3>Your cookbook is empty</h3>
                 <p>Tap the heart icon on any recipe card or recipe details page to save your favorite dishes here.</p>
                 <a href="#explore" class="btn btn-primary">Explore Recipes</a>
               </div>`
        }
      </div>
    </section>
  `;
}

/* ==========================================================================
   6. SMART TASTE-ADAPTIVE MEAL PLANNER & COMBINED GROCERY LIST
   ========================================================================== */

function buildCombinedGroceryList(scope) {
  const recipeMap = new Map(state.recipes.map((r) => [Number(r.id), r]));
  const plannedIds = [];

  if (scope === 'daily') {
    ['Breakfast', 'Lunch', 'Dinner'].forEach((slot) => {
      if (state.mealPlan.daily[slot]) plannedIds.push(Number(state.mealPlan.daily[slot]));
    });
  } else {
    DAYS_OF_WEEK.forEach((day) => {
      ['Breakfast', 'Lunch', 'Dinner'].forEach((slot) => {
        const rid = state.mealPlan.weekly[day]?.[slot];
        if (rid) plannedIds.push(Number(rid));
      });
    });
  }

  const aggregated = new Map();
  plannedIds.forEach((rid) => {
    const recipe = recipeMap.get(rid);
    if (!recipe) return;
    (recipe.ingredients || []).forEach((ing) => {
      const cleanName = ing.item.trim();
      const cleanUnit = (ing.unit || '').trim().toLowerCase();
      const key = `${cleanName.toLowerCase()}__${cleanUnit}`;
      const prev = aggregated.get(key);
      const qtyNum = Number(ing.qty) || 0;
      if (prev) {
        prev.qty += qtyNum;
        if (!prev.sources.includes(recipe.name)) prev.sources.push(recipe.name);
      } else {
        aggregated.set(key, {
          key,
          item: cleanName,
          unit: ing.unit || '',
          qty: qtyNum,
          sources: [recipe.name]
        });
      }
    });
  });

  return [...aggregated.values()].sort((a, b) => a.item.localeCompare(b.item));
}

function renderMealPlannerView() {
  const recipeMap = new Map(state.recipes.map((r) => [Number(r.id), r]));
  const tp = state.tasteProfile;

  const groceryItems = state.groceryGenerated ? buildCombinedGroceryList(state.groceryScope) : [];

  const tasteSummary =
    tp.totalCooked > 0
      ? `Detected Taste DNA: ${tp.dominantCuisine} (${tp.indianPercent}% Indian / ${tp.genZPercent}% Gen-Z) · Preferred Spice: ${tp.preferredSpice} · Top Hero: ${tp.favoriteHeroIngredient}`
      : 'No cooked dishes logged yet. Click Auto-Generate anytime, or mark a dish as Cooked to personalize recommendations!';

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container">
        <h1>Smart Taste-Adaptive Meal Planner</h1>
        <p>Plan your 3 daily meals and full 7-day week, auto-fill slots from your Taste DNA, and compile one combined grocery list.</p>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container">
        <div class="taste-detection-banner">
          <div>
            <h2>Smart Taste Detection Engine</h2>
            <p>${escapeHtml(tasteSummary)}</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-saffron" id="btn-auto-generate-daily">
              Auto-Generate Plan Based on My Taste
            </button>
            <button type="button" class="btn btn-outline" style="background:rgba(255,255,255,0.12);color:#FFF;border-color:rgba(255,255,255,0.35);" id="btn-auto-generate-weekly">
              Auto-Fill Full Week
            </button>
          </div>
        </div>

        <div class="section-header" style="margin-bottom: 18px;">
          <div>
            <span class="section-kicker">Today's Focus</span>
            <h2 class="section-title">Daily 3-Meal Quick Planner</h2>
          </div>
        </div>

        <div class="daily-planner-grid">
          ${['Breakfast', 'Lunch', 'Dinner']
            .map((slot) => {
              const rid = state.mealPlan.daily[slot];
              const recipe = rid ? recipeMap.get(Number(rid)) : null;
              return `
                <div class="meal-slot-card">
                  <div class="meal-slot-header">
                    <span class="meal-slot-label">${slot}</span>
                    <div style="display:flex;gap:6px;">
                      <button type="button" class="btn btn-outline btn-sm" data-action="open-slot-picker" data-scope="daily" data-slot="${slot}">
                        ${recipe ? 'Swap' : '+ Select'}
                      </button>
                      ${
                        recipe
                          ? `<button type="button" class="btn btn-ghost btn-sm" data-action="clear-slot" data-scope="daily" data-slot="${slot}">Clear</button>`
                          : ''
                      }
                    </div>
                  </div>
                  ${
                    recipe
                      ? `<div class="planned-recipe-mini">
                           <img
                             src="${escapeHtml(recipe.image)}"
                             alt="${escapeHtml(recipe.name)}"
                             class="planned-recipe-thumb"
                             referrerpolicy="no-referrer"
                             onerror="window.__handleImgError(this, '${escapeHtml(recipe.name).replace(/'/g, '')}', '${escapeHtml(recipe.cuisineStyle).replace(/'/g, '')}')"
                           />
                           <div style="min-width:0;">
                             <a href="#recipe/${recipe.id}" style="font-family:var(--font-display);font-weight:700;font-size:15px;display:block;">${escapeHtml(recipe.name)}</a>
                             <div style="font-size:12.5px;color:var(--text-muted);margin-top:3px;">
                               ${escapeHtml(recipe.diet)} · ${escapeHtml(recipe.cuisineStyle)} · ${Number(recipe.prepTime) + Number(recipe.cookTime)} mins
                             </div>
                           </div>
                         </div>`
                      : `<div style="padding:18px 0;color:var(--text-muted);font-size:13.5px;">No ${slot.toLowerCase()} selected yet. Choose a dish or click Auto-Generate.</div>`
                  }
                </div>
              `;
            })
            .join('')}
        </div>

        <div class="section-header" style="margin-bottom: 18px;">
          <div>
            <span class="section-kicker">Monday to Sunday</span>
            <h2 class="section-title">Weekly Meal Planning Matrix</h2>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-clear-weekly">Clear Weekly Grid</button>
        </div>

        <div class="weekly-table-wrap">
          <table class="weekly-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
              </tr>
            </thead>
            <tbody>
              ${DAYS_OF_WEEK.map(
                (day) => `
                  <tr>
                    <td class="weekly-day-cell">${day}</td>
                    ${['Breakfast', 'Lunch', 'Dinner']
                      .map((slot) => {
                        const rid = state.mealPlan.weekly[day]?.[slot];
                        const recipe = rid ? recipeMap.get(Number(rid)) : null;
                        return `
                          <td>
                            <button
                              type="button"
                              class="weekly-slot-btn ${recipe ? 'filled' : ''}"
                              data-action="open-slot-picker"
                              data-scope="weekly"
                              data-day="${day}"
                              data-slot="${slot}"
                            >
                              ${
                                recipe
                                  ? `<strong style="font-size:13.5px;color:var(--text-primary);">${escapeHtml(recipe.name)}</strong>
                                     <span style="font-size:12px;color:var(--text-muted);">${escapeHtml(recipe.diet)} · ${escapeHtml(recipe.heroIngredient)} · ${Number(recipe.prepTime) + Number(recipe.cookTime)}m</span>`
                                  : `<span>+ Select ${slot}</span>`
                              }
                            </button>
                          </td>
                        `;
                      })
                      .join('')}
                  </tr>
                `
              ).join('')}
            </tbody>
          </table>
        </div>

        <div class="grocery-panel" id="grocery-list-panel">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
            <div>
              <h2 style="font-size:21px;">Smart Combined Grocery List Generator</h2>
              <p style="margin:4px 0 0;color:var(--text-secondary);font-size:14px;">
                Automatically aggregates overlapping ingredients and quantities across your planned meals.
              </p>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;" class="no-print">
              <div class="segmented-control">
                <button type="button" class="segment-btn ${state.groceryScope === 'daily' ? 'active' : ''}" data-action="set-grocery-scope" data-scope="daily">Daily 3-Meal Plan</button>
                <button type="button" class="segment-btn ${state.groceryScope === 'weekly' ? 'active' : ''}" data-action="set-grocery-scope" data-scope="weekly">Full Weekly Plan</button>
              </div>
              <button type="button" class="btn btn-primary" id="btn-generate-grocery">
                Generate Combined Grocery List
              </button>
            </div>
          </div>

          ${
            state.groceryGenerated
              ? groceryItems.length > 0
                ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-hairline);">
                     <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                       <strong class="tabular-nums">${groceryItems.length} combined ingredients (${state.groceryScope === 'daily' ? 'Daily Plan' : 'Weekly Plan'})</strong>
                       <div style="display:flex;gap:8px;" class="no-print">
                         <button type="button" class="btn btn-outline btn-sm" id="btn-copy-grocery">Copy List</button>
                         <button type="button" class="btn btn-outline btn-sm" id="btn-print-grocery">Print Grocery List</button>
                       </div>
                     </div>
                     <div class="grocery-grid">
                       ${groceryItems
                         .map((g) => {
                           const checked = Boolean(state.groceryChecks[g.key]);
                           const qtyStr = formatScaledQty(g.qty, 1);
                           return `
                             <label class="grocery-item ${checked ? 'checked' : ''}">
                               <input type="checkbox" ${checked ? 'checked' : ''} data-action="toggle-grocery-check" data-key="${escapeHtml(g.key)}" />
                               <div>
                                 <div style="font-size:14px;font-weight:600;">
                                   <span class="tabular-nums">${escapeHtml(qtyStr)} ${escapeHtml(g.unit)}</span> ${escapeHtml(g.item)}
                                 </div>
                                 <div style="font-size:11.5px;color:var(--text-muted);">${escapeHtml(g.sources.join(', '))}</div>
                               </div>
                             </label>
                           `;
                         })
                         .join('')}
                     </div>
                   </div>`
                : `<div style="margin-top:20px;padding:24px;border-radius:12px;background:var(--bg-subtle);text-align:center;color:var(--text-secondary);">
                     No meals are currently assigned in your ${state.groceryScope === 'daily' ? 'Daily 3-Meal Plan' : 'Weekly Plan'}. Select or auto-generate meals above first.
                   </div>`
              : ''
          }
        </div>
      </div>
    </section>
  `;

  document.getElementById('btn-auto-generate-daily')?.addEventListener('click', async () => {
    await autoGenerateDailyPlan({ includeWeekly: false });
    state.groceryScope = 'daily';
    state.groceryGenerated = true;
    renderMealPlannerView();
    showToast('Daily 3-Meal Plan tailored to your Taste DNA!');
  });

  document.getElementById('btn-auto-generate-weekly')?.addEventListener('click', async () => {
    await autoGenerateDailyPlan({ includeWeekly: true });
    state.groceryScope = 'weekly';
    state.groceryGenerated = true;
    renderMealPlannerView();
    showToast('Full 7-day Weekly Plan populated from your Taste DNA!');
  });

  document.getElementById('btn-clear-weekly')?.addEventListener('click', async () => {
    DAYS_OF_WEEK.forEach((day) => {
      state.mealPlan.weekly[day] = { Breakfast: null, Lunch: null, Dinner: null };
    });
    state.mealPlan = await api.saveMealPlan(state.mealPlan, state.user?.id);
    renderMealPlannerView();
    showToast('Weekly meal grid cleared.');
  });

  document.getElementById('btn-generate-grocery')?.addEventListener('click', () => {
    state.groceryGenerated = true;
    renderMealPlannerView();
  });

  document.getElementById('btn-print-grocery')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-copy-grocery')?.addEventListener('click', async () => {
    const lines = groceryItems.map(
      (g) => `- ${formatScaledQty(g.qty, 1)} ${g.unit} ${g.item}`.replace(/\s+/g, ' ').trim()
    );
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast('Grocery list copied to clipboard!');
    } catch {
      showToast('Unable to copy automatically — use Print Grocery List.', 'accent');
    }
  });
}

function openSlotPickerModal(scope, slot, day = null) {
  state.pickerContext = { scope, slot, day };
  const sorted = [...state.recipes].sort((a, b) => {
    const aMatch = a.mealTime === slot ? 1 : 0;
    const bMatch = b.mealTime === slot ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return scoreRecipeForTaste(b, state.tasteProfile, state.user) - scoreRecipeForTaste(a, state.tasteProfile, state.user);
  });

  const label = scope === 'daily' ? `Today's ${slot}` : `${day} — ${slot}`;
  openModal({
    title: `Select Recipe for ${label}`,
    bodyHtml: `
      <input type="text" id="picker-search" class="form-control" placeholder="Filter recipes by name or hero ingredient..." />
      <div class="picker-recipe-list" id="picker-list">
        ${sorted.map((r) => renderPickerOption(r)).join('')}
      </div>
    `,
    footerHtml: `
      ${
        scope === 'weekly' && state.mealPlan.weekly[day]?.[slot]
          ? `<button type="button" class="btn btn-danger-soft btn-sm" id="picker-clear-slot">Remove from Slot</button>`
          : ''
      }
      <button type="button" class="btn btn-outline btn-sm" id="picker-cancel">Cancel</button>
    `
  });

  document.getElementById('picker-cancel')?.addEventListener('click', closeModal);
  document.getElementById('picker-clear-slot')?.addEventListener('click', async () => {
    if (state.mealPlan.weekly[day]) {
      state.mealPlan.weekly[day][slot] = null;
      state.mealPlan = await api.saveMealPlan(state.mealPlan, state.user?.id);
    }
    closeModal();
    renderMealPlannerView();
  });

  document.getElementById('picker-search')?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = sorted.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.heroIngredient.toLowerCase().includes(q) ||
        r.cuisineStyle.toLowerCase().includes(q)
    );
    const listEl = document.getElementById('picker-list');
    if (listEl) listEl.innerHTML = filtered.map((r) => renderPickerOption(r)).join('');
  });

  document.getElementById('picker-list')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-pick-recipe-id]');
    if (!btn || !state.pickerContext) return;
    const chosenId = Number(btn.getAttribute('data-pick-recipe-id'));
    if (state.pickerContext.scope === 'daily') {
      state.mealPlan.daily[state.pickerContext.slot] = chosenId;
    } else {
      state.mealPlan.weekly[state.pickerContext.day][state.pickerContext.slot] = chosenId;
    }
    state.mealPlan = await api.saveMealPlan(state.mealPlan, state.user?.id);
    closeModal();
    renderMealPlannerView();
    showToast('Meal slot updated!');
  });
}

function renderPickerOption(r) {
  return `
    <button type="button" class="picker-recipe-option" data-pick-recipe-id="${r.id}">
      <img
        src="${escapeHtml(r.image)}"
        alt="${escapeHtml(r.name)}"
        style="width:52px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;"
        referrerpolicy="no-referrer"
        onerror="window.__handleImgError(this, '${escapeHtml(r.name).replace(/'/g, '')}', '${escapeHtml(r.cuisineStyle).replace(/'/g, '')}')"
      />
      <div style="min-width:0;flex:1;">
        <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${escapeHtml(r.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);">
          ${escapeHtml(r.diet)} · ${escapeHtml(r.cuisineStyle)} · ${escapeHtml(r.mealTime)} · ${Number(r.prepTime) + Number(r.cookTime)} mins
        </div>
      </div>
    </button>
  `;
}

/* ==========================================================================
   7. USER PROFILE & TASTE DNA DASHBOARD PAGE
   ========================================================================== */

function renderProfileView() {
  const user = state.user;
  const tp = state.tasteProfile;
  const favRecipes = state.recipes.filter((r) => state.favorites.includes(Number(r.id)));
  const initials = (user.name || 'GF')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container">
        <h1>My Profile &amp; Taste DNA Dashboard</h1>
        <p>Live culinary profile synthesized from the dishes you cook, your spice tolerance, and your dietary preferences.</p>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container">
        <div class="profile-grid">
          <aside class="profile-card">
            <div class="avatar-circle">${escapeHtml(initials)}</div>
            <h2 style="font-size:20px;margin-bottom:4px;">${escapeHtml(user.name)}</h2>
            <p style="margin:0 0 18px;font-size:13.5px;color:var(--text-muted);">${escapeHtml(user.email)}</p>

            <div style="margin-bottom:22px;">
              <span class="form-label">Dietary Preference</span>
              <div class="segmented-control" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);">
                ${['All', 'Veg', 'Non-Veg']
                  .map(
                    (pref) => `
                      <button
                        type="button"
                        class="segment-btn ${user.dietPreference === pref ? 'active' : ''}"
                        data-action="set-diet-pref"
                        data-pref="${pref}"
                      >${pref === 'All' ? 'Both' : pref}</button>
                    `
                  )
                  .join('')}
              </div>
            </div>

            <div style="padding-top:18px;border-top:1px solid var(--border-hairline);display:flex;flex-direction:column;gap:10px;">
              <button type="button" class="btn btn-danger-soft btn-sm" id="btn-reset-taste">
                Reset Taste Profile
              </button>
              ${
                user.isLoggedIn
                  ? `<button type="button" class="btn btn-outline btn-sm" data-action="logout">Sign Out</button>`
                  : `<a href="#auth" class="btn btn-primary btn-sm">Sign In / Create Account</a>`
              }
            </div>
          </aside>

          <div style="display:flex;flex-direction:column;gap:24px;">
            <div class="profile-card">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <div>
                  <span class="section-kicker" style="margin-bottom:2px;">Live Taste Analytics</span>
                  <h2 style="font-size:20px;">${escapeHtml(tp.statusLabel)}</h2>
                </div>
                <span class="tabular-nums" style="font-size:13.5px;font-weight:700;color:var(--brand-green);">
                  ${tp.totalCooked} ${tp.totalCooked === 1 ? 'dish' : 'dishes'} analyzed
                </span>
              </div>

              <div class="dna-meter-group">
                <div class="dna-meter-label">
                  <span>Indian Classic (${tp.indianPercent}%)</span>
                  <span>Gen-Z / Continental (${tp.genZPercent}%)</span>
                </div>
                <div class="dna-progress-track">
                  <div class="dna-bar-indian" style="width: ${tp.indianPercent}%;"></div>
                  <div class="dna-bar-genz" style="width: ${tp.genZPercent}%;"></div>
                </div>
              </div>

              <div class="dna-meter-group">
                <div class="dna-meter-label">
                  <span>Spice Tolerance Level</span>
                  <span class="tabular-nums">${escapeHtml(tp.preferredSpice)} (${tp.spiceScore}/100)</span>
                </div>
                <div class="dna-progress-track">
                  <div class="dna-bar-single" style="width: ${tp.spiceScore}%;"></div>
                </div>
              </div>

              <div class="dna-meter-group" style="margin-bottom:0;">
                <div class="dna-meter-label">
                  <span>Favorite Hero Ingredient Affinity</span>
                  <span>Top: ${escapeHtml(tp.favoriteHeroIngredient)}</span>
                </div>
                ${
                  tp.heroBreakdown.length > 0
                    ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:8px;">
                         ${tp.heroBreakdown
                           .slice(0, 4)
                           .map(
                             (h) => `
                               <div style="padding:10px 12px;border-radius:10px;background:var(--bg-subtle);">
                                 <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">
                                   <span>${escapeHtml(h.ingredient)}</span>
                                   <span class="tabular-nums">${h.percent}%</span>
                                 </div>
                                 <div class="dna-progress-track" style="height:7px;">
                                   <div class="dna-bar-genz" style="width:${h.percent}%;"></div>
                                 </div>
                               </div>
                             `
                           )
                           .join('')}
                       </div>`
                    : `<p style="margin:6px 0 0;font-size:13.5px;color:var(--text-muted);">Mark any dish as "Cooked" to see your hero ingredient breakdown appear here.</p>`
                }
              </div>
            </div>

            <div class="profile-card">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <div class="segmented-control">
                  <button type="button" class="segment-btn ${state.profileTab === 'history' ? 'active' : ''}" data-action="set-profile-tab" data-tab="history">
                    Cooking History (${tp.cookedEntries.length})
                  </button>
                  <button type="button" class="segment-btn ${state.profileTab === 'cookbook' ? 'active' : ''}" data-action="set-profile-tab" data-tab="cookbook">
                    Saved Cookbook (${favRecipes.length})
                  </button>
                </div>
                <a href="#meal-planner" class="btn btn-outline btn-sm">Open Tailored Meal Plan →</a>
              </div>

              ${
                state.profileTab === 'history'
                  ? tp.cookedEntries.length > 0
                    ? `<div style="display:flex;flex-direction:column;gap:12px;">
                         ${tp.cookedEntries
                           .map(
                             (item) => `
                               <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px;border:1px solid var(--border-hairline);border-radius:12px;">
                                 <div style="display:flex;align-items:center;gap:12px;min-width:0;">
                                   <img
                                     src="${escapeHtml(item.recipe.image)}"
                                     alt="${escapeHtml(item.recipe.name)}"
                                     style="width:56px;height:46px;border-radius:10px;object-fit:cover;"
                                     referrerpolicy="no-referrer"
                                     onerror="window.__handleImgError(this, '${escapeHtml(item.recipe.name).replace(/'/g, '')}', '${escapeHtml(item.recipe.cuisineStyle).replace(/'/g, '')}')"
                                   />
                                   <div style="min-width:0;">
                                     <a href="#recipe/${item.recipe.id}" style="font-weight:700;font-size:14.5px;display:block;">${escapeHtml(item.recipe.name)}</a>
                                     <div style="font-size:12px;color:var(--text-muted);">
                                       ${escapeHtml(item.recipe.cuisineStyle)} · ${escapeHtml(item.recipe.spiceLevel)} · Cooked ${new Date(item.cookedAt).toLocaleDateString()}
                                     </div>
                                   </div>
                                 </div>
                                 <a href="#recipe/${item.recipe.id}" class="btn btn-outline btn-sm">Cook Again</a>
                               </div>
                             `
                           )
                           .join('')}
                       </div>`
                    : `<div class="empty-state" style="margin:0;">
                         <h3>No cooking history yet</h3>
                         <p>Explore recipes and click "Mark as Cooked" on any dish to start building your Taste DNA.</p>
                         <a href="#explore" class="btn btn-primary btn-sm">Browse Recipes</a>
                       </div>`
                  : favRecipes.length > 0
                  ? `<div class="recipe-grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));">
                       ${favRecipes.map((r) => renderRecipeCard(r, { isFavoriteView: true })).join('')}
                     </div>`
                  : `<div class="empty-state" style="margin:0;">
                       <h3>No saved recipes yet</h3>
                       <p>Save recipes from Explore to build your personal cookbook.</p>
                       <a href="#explore" class="btn btn-primary btn-sm">Explore Recipes</a>
                     </div>`
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('btn-reset-taste')?.addEventListener('click', () => {
    openModal({
      title: 'Reset Taste Profile?',
      bodyHtml: `<p style="margin:0;color:var(--text-secondary);">This clears your cooked dish history and resets the Taste Status Pill back to "New Foodie" so you can demonstrate live taste learning from scratch.</p>`,
      footerHtml: `
        <button type="button" class="btn btn-outline btn-sm" id="modal-cancel-reset">Cancel</button>
        <button type="button" class="btn btn-danger btn-sm" id="modal-confirm-reset">Reset Taste DNA</button>
      `
    });
    document.getElementById('modal-cancel-reset')?.addEventListener('click', closeModal);
    document.getElementById('modal-confirm-reset')?.addEventListener('click', async () => {
      api.clearTasteHistory();
      state.lastCookedBannerRecipeId = null;
      state.tasteProfile = await api.fetchTasteProfile(state.user?.id);
      updateNavbarChrome();
      closeModal();
      renderProfileView();
      showToast('Taste DNA profile has been reset.');
    });
  });
}

/* ==========================================================================
   8. MANAGE RECIPES PAGE (CRUD Table + Filters + Confirmation Modal)
   ========================================================================== */

async function renderManageView() {
  const mf = state.manageFilters;
  const filtered = await api.searchRecipes(mf);

  appMain.innerHTML = `
    <div class="page-header-band">
      <div class="container" style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;">
        <div>
          <h1>Manage Recipes</h1>
          <p>Create, inspect, edit, or delete recipes in the catalog. All updates persist in localStorage and map to Spring Boot REST endpoints.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="btn btn-outline btn-sm" id="btn-reset-demo-recipes">Restore Default 15 Recipes</button>
          <a href="#add-recipe" class="btn btn-primary">+ Add New Recipe</a>
        </div>
      </div>
    </div>

    <section class="section-block-tight">
      <div class="container">
        <div class="explore-filters-panel" style="margin-bottom:20px;">
          <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr auto;gap:14px;align-items:end;">
            <div class="filter-field">
              <label for="mng-search">Search Catalog</label>
              <input type="text" id="mng-search" class="form-control" placeholder="Search recipe name or ingredient..." value="${escapeHtml(mf.q)}" />
            </div>
            <div class="filter-field">
              <label for="mng-hero">Hero Ingredient</label>
              <select id="mng-hero" class="form-select">
                <option value="All">All Ingredients</option>
                ${HERO_INGREDIENTS.map(
                  (h) => `<option value="${h.id}" ${mf.heroIngredient === h.id ? 'selected' : ''}>${h.label}</option>`
                ).join('')}
              </select>
            </div>
            <div class="filter-field">
              <label for="mng-meal">Category</label>
              <select id="mng-meal" class="form-select">
                <option value="All">All Categories</option>
                ${MEAL_CATEGORIES.map(
                  (c) => `<option value="${c.id}" ${mf.mealTime === c.id ? 'selected' : ''}>${c.label}</option>`
                ).join('')}
              </select>
            </div>
            <button type="button" class="btn btn-outline" id="mng-clear">Clear</button>
          </div>
        </div>

        <div class="manage-table-wrap">
          <table class="manage-table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Cuisine Style</th>
                <th>Diet</th>
                <th>Hero Ingredient</th>
                <th>Meal Time</th>
                <th>Total Time</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="manage-table-body">
              ${renderManageRows(filtered)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  const updateManageRows = async () => {
    const rows = await api.searchRecipes(state.manageFilters);
    const tbody = document.getElementById('manage-table-body');
    if (tbody) tbody.innerHTML = renderManageRows(rows);
  };

  document.getElementById('mng-search')?.addEventListener('input', (e) => {
    state.manageFilters.q = e.target.value;
    updateManageRows();
  });
  document.getElementById('mng-hero')?.addEventListener('change', (e) => {
    state.manageFilters.heroIngredient = e.target.value;
    updateManageRows();
  });
  document.getElementById('mng-meal')?.addEventListener('change', (e) => {
    state.manageFilters.mealTime = e.target.value;
    updateManageRows();
  });
  document.getElementById('mng-clear')?.addEventListener('click', () => {
    state.manageFilters = { q: '', heroIngredient: 'All', mealTime: 'All' };
    renderManageView();
  });

  document.getElementById('btn-reset-demo-recipes')?.addEventListener('click', async () => {
    await api.resetDemoRecipes();
    await syncGlobalState();
    renderManageView();
    showToast('Restored all 15 default Indian Classic & Gen-Z recipes.');
  });
}

function renderManageRows(recipes) {
  if (!recipes.length) {
    return `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted);">No recipes match your table filters.</td></tr>`;
  }
  return recipes
    .map((r) => {
      const dietClass = r.diet === 'Veg' ? 'veg' : 'nonveg';
      const totalTime = Number(r.prepTime) + Number(r.cookTime);
      return `
        <tr>
          <td>
            <div class="manage-recipe-cell">
              <img
                src="${escapeHtml(r.image)}"
                alt="${escapeHtml(r.name)}"
                class="manage-thumb"
                referrerpolicy="no-referrer"
                onerror="window.__handleImgError(this, '${escapeHtml(r.name).replace(/'/g, '')}', '${escapeHtml(r.cuisineStyle).replace(/'/g, '')}')"
              />
              <div>
                <div style="font-weight:700;">${escapeHtml(r.name)}</div>
                <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(r.difficulty)} · ${escapeHtml(r.spiceLevel)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(r.cuisineStyle)}</td>
          <td>
            <span class="diet-and-cuisine">
              <span class="diet-symbol ${dietClass}"></span>
              <span>${escapeHtml(r.diet)}</span>
            </span>
          </td>
          <td>${escapeHtml(r.heroIngredient)}</td>
          <td>${escapeHtml(r.mealTime)}</td>
          <td class="tabular-nums">${totalTime} mins</td>
          <td style="text-align:right;white-space:nowrap;">
            <a href="#recipe/${r.id}" class="btn btn-outline btn-sm">View</a>
            <a href="#edit-recipe/${r.id}" class="btn btn-outline btn-sm">Edit</a>
            <button type="button" class="btn btn-danger-soft btn-sm" data-action="delete-recipe" data-id="${r.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

/* ==========================================================================
   9. LOGIN & REGISTRATION PAGE
   ========================================================================== */

function renderHomeAuthCardInner() {
  if (state.user?.isLoggedIn) {
    const initials = (state.user.name || 'GF')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const tp = state.tasteProfile;
    return `
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div class="avatar-circle" style="width:48px;height:48px;font-size:17px;margin-bottom:0;border-radius:12px;">${escapeHtml(initials)}</div>
          <div style="min-width:0;">
            <div style="font-size:12px;font-weight:700;color:var(--brand-green);">Signed In</div>
            <h2 style="font-size:18px;line-height:1.2;">Welcome, ${escapeHtml(state.user.name)}</h2>
            <div style="font-size:12.5px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;">${escapeHtml(state.user.email)}</div>
          </div>
        </div>

        <div style="padding:12px 14px;border-radius:12px;background:var(--bg-subtle);margin-bottom:16px;font-size:13px;">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Your Live Taste Status</div>
          <div style="color:var(--text-secondary);">${escapeHtml(tp?.statusLabel || 'New Foodie')}</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <a href="#profile" class="btn btn-primary btn-sm">Taste DNA Profile</a>
          <a href="#meal-planner" class="btn btn-saffron btn-sm">Meal Planner</a>
        </div>
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;" data-action="logout">Sign Out</button>
      </div>
    `;
  }

  return renderAuthFormMarkup({ compact: true });
}

function renderAuthFormMarkup({ compact = false } = {}) {
  const tab = state.authTab;
  return `
    <div style="${compact ? 'margin-bottom:14px;' : 'text-align:center;margin-bottom:24px;'}">
      <span class="section-kicker" style="margin-bottom:2px;">${compact ? 'Kitchen Account' : 'Tadka &amp; Trends Account'}</span>
      <h${compact ? '2' : '1'} style="font-size:${compact ? '20px' : '26px'};">
        ${tab === 'login' ? 'Sign In to Your Kitchen' : 'Create Foodie Account'}
      </h${compact ? '2' : '1'}>
      ${
        compact
          ? ''
          : `<p style="margin:6px 0 0;color:var(--text-secondary);font-size:14px;">Simulated local session ready for Java Spring Security integration.</p>`
      }
    </div>

    <div class="segmented-control" style="width:100%;display:grid;grid-template-columns:1fr 1fr;margin-bottom:${compact ? '14px' : '24px'};">
      <button type="button" class="segment-btn ${tab === 'login' ? 'active' : ''}" data-action="set-auth-tab" data-tab="login">Sign In</button>
      <button type="button" class="segment-btn ${tab === 'register' ? 'active' : ''}" data-action="set-auth-tab" data-tab="register">Register</button>
    </div>

    ${
      tab === 'login'
        ? `<form id="login-form" novalidate>
             <div class="form-group">
               <label class="form-label" for="login-email">Email Address *</label>
               <input type="email" id="login-email" class="form-control" placeholder="arjun@tadkatrends.in" />
               <span class="form-error" id="err-login-email"></span>
             </div>
             <div class="form-group">
               <label class="form-label" for="login-password">Password *</label>
               <input type="password" id="login-password" class="form-control" placeholder="Enter at least 6 characters" />
               <span class="form-error" id="err-login-password"></span>
             </div>
             <button type="submit" class="btn btn-primary ${compact ? '' : 'btn-lg'}" style="width:100%;margin-bottom:8px;">Sign In</button>
             <button type="button" class="btn btn-outline ${compact ? 'btn-sm' : ''}" style="width:100%;" id="btn-demo-login">Quick Demo Student Sign In</button>
           </form>`
        : `<form id="register-form" novalidate>
             <div class="form-group">
               <label class="form-label" for="reg-name">Full Name *</label>
               <input type="text" id="reg-name" class="form-control" placeholder="e.g. Ananya Sharma" />
               <span class="form-error" id="err-reg-name"></span>
             </div>
             <div class="form-group">
               <label class="form-label" for="reg-email">Email Address *</label>
               <input type="email" id="reg-email" class="form-control" placeholder="ananya@example.com" />
               <span class="form-error" id="err-reg-email"></span>
             </div>
             <div class="form-group">
               <label class="form-label" for="reg-diet">Dietary Preference *</label>
               <select id="reg-diet" class="form-select">
                 <option value="All">Both (Veg &amp; Non-Veg)</option>
                 <option value="Veg">Veg Only</option>
                 <option value="Non-Veg">Non-Veg Preferred</option>
               </select>
             </div>
             <div class="form-group">
               <label class="form-label" for="reg-password">Password *</label>
               <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" />
               <span class="form-error" id="err-reg-password"></span>
             </div>
             <button type="submit" class="btn btn-saffron ${compact ? '' : 'btn-lg'}" style="width:100%;">Create Account</button>
           </form>`
    }
  `;
}

function bindAuthFormListeners({ stayOnHome = false } = {}) {
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    document.getElementById('err-login-email').textContent = '';
    document.getElementById('err-login-password').textContent = '';

    let invalid = false;
    if (!email.includes('@') || email.length < 5) {
      document.getElementById('err-login-email').textContent = 'Please enter a valid email address.';
      invalid = true;
    }
    if (password.length < 6) {
      document.getElementById('err-login-password').textContent = 'Password must be at least 6 characters.';
      invalid = true;
    }
    if (invalid) return;

    const derivedName = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    api.saveUserSession({
      id: 'user-1',
      name: derivedName || 'Foodie User',
      email,
      dietPreference: state.user?.dietPreference || 'All',
      isLoggedIn: true
    });
    await syncGlobalState();
    showToast(`Signed in as ${derivedName}!`);
    if (stayOnHome) {
      renderHomeView();
    } else {
      navigateTo('profile');
    }
  });

  document.getElementById('btn-demo-login')?.addEventListener('click', async () => {
    api.saveUserSession({
      id: 'demo-student',
      name: 'Riya Deshmukh',
      email: 'riya.deshmukh@college.edu',
      dietPreference: 'All',
      isLoggedIn: true
    });
    await syncGlobalState();
    showToast('Signed in with demo student account.');
    if (stayOnHome) {
      renderHomeView();
    } else {
      navigateTo('profile');
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const dietPreference = document.getElementById('reg-diet').value;
    const password = document.getElementById('reg-password').value;

    document.getElementById('err-reg-name').textContent = '';
    document.getElementById('err-reg-email').textContent = '';
    document.getElementById('err-reg-password').textContent = '';

    let invalid = false;
    if (name.length < 2) {
      document.getElementById('err-reg-name').textContent = 'Please enter your full name.';
      invalid = true;
    }
    if (!email.includes('@') || email.length < 5) {
      document.getElementById('err-reg-email').textContent = 'Please enter a valid email address.';
      invalid = true;
    }
    if (password.length < 6) {
      document.getElementById('err-reg-password').textContent = 'Password must be at least 6 characters.';
      invalid = true;
    }
    if (invalid) return;

    api.saveUserSession({
      id: `user-${Date.now()}`,
      name,
      email,
      dietPreference,
      isLoggedIn: true
    });
    await syncGlobalState();
    showToast(`Welcome to Tadka & Trends, ${name}!`);
    if (stayOnHome) {
      renderHomeView();
    } else {
      navigateTo('profile');
    }
  });
}

function renderAuthView() {
  appMain.innerHTML = `
    <div class="container">
      <div class="auth-wrapper">
        <div class="form-card">
          ${renderAuthFormMarkup({ compact: false })}
        </div>
      </div>
    </div>
  `;

  bindAuthFormListeners({ stayOnHome: false });
}

/* ==========================================================================
   View Dispatcher & Delegated Event Wiring
   ========================================================================== */

function renderCurrentView() {
  switch (state.route) {
    case 'home':
      renderHomeView();
      break;
    case 'explore':
      renderExploreView();
      break;
    case 'recipe':
      renderRecipeDetailsView(state.routeParam);
      break;
    case 'add-recipe':
      renderRecipeFormView(null);
      break;
    case 'edit-recipe':
      renderRecipeFormView(state.routeParam);
      break;
    case 'favorites':
      renderFavoritesView();
      break;
    case 'meal-planner':
      renderMealPlannerView();
      break;
    case 'profile':
      renderProfileView();
      break;
    case 'manage':
      renderManageView();
      break;
    case 'auth':
      renderAuthView();
      break;
    default:
      renderHomeView();
  }
}

function attachGlobalListeners() {
  document.getElementById('nav-taste-pill')?.addEventListener('click', () => {
    navigateTo('profile');
  });

  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    const drawer = document.getElementById('mobile-drawer');
    const toggle = document.getElementById('mobile-menu-toggle');
    const isOpen = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  modalEl?.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  document.addEventListener('click', async (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-action');
    const id = actionEl.getAttribute('data-id');

    switch (action) {
      case 'view-recipe':
        state.detailScale = 1;
        state.lastCookedBannerRecipeId = null;
        navigateTo(`recipe/${id}`);
        break;

      case 'toggle-favorite': {
        e.stopPropagation();
        const res = api.toggleFavoriteId(id);
        state.favorites = res.favorites;
        updateNavbarChrome();
        renderCurrentView();
        showToast(res.isFavorite ? 'Saved to Favorites!' : 'Removed from Favorites.');
        break;
      }

      case 'mark-cooked':
        await handleMarkAsCooked(id, { fromDetails: false });
        break;

      case 'mark-cooked-details':
        await handleMarkAsCooked(id, { fromDetails: true });
        break;

      case 'filter-hero':
        state.exploreFilters.heroIngredient = actionEl.getAttribute('data-hero') || 'All';
        navigateTo('explore');
        break;

      case 'filter-category':
        state.exploreFilters.mealTime = actionEl.getAttribute('data-category') || 'All';
        navigateTo('explore');
        break;

      case 'scale-servings':
        state.detailScale = Number(actionEl.getAttribute('data-scale')) || 1;
        renderCurrentView();
        break;

      case 'toggle-ing-check': {
        const li = actionEl.closest('.ingredient-check-item');
        li?.classList.toggle('checked', actionEl.checked);
        break;
      }

      case 'open-slot-picker': {
        const scope = actionEl.getAttribute('data-scope');
        const slot = actionEl.getAttribute('data-slot');
        const day = actionEl.getAttribute('data-day');
        openSlotPickerModal(scope, slot, day);
        break;
      }

      case 'clear-slot': {
        const scope = actionEl.getAttribute('data-scope');
        const slot = actionEl.getAttribute('data-slot');
        if (scope === 'daily') {
          state.mealPlan.daily[slot] = null;
          state.mealPlan = await api.saveMealPlan(state.mealPlan, state.user?.id);
          renderMealPlannerView();
          showToast(`Cleared ${slot} slot.`);
        }
        break;
      }

      case 'set-grocery-scope':
        state.groceryScope = actionEl.getAttribute('data-scope') || 'daily';
        state.groceryGenerated = true;
        renderMealPlannerView();
        break;

      case 'toggle-grocery-check': {
        const key = actionEl.getAttribute('data-key');
        state.groceryChecks[key] = actionEl.checked;
        api.saveGroceryChecks(state.groceryChecks);
        actionEl.closest('.grocery-item')?.classList.toggle('checked', actionEl.checked);
        break;
      }

      case 'set-diet-pref': {
        const pref = actionEl.getAttribute('data-pref') || 'All';
        state.user = api.saveUserSession({ ...state.user, dietPreference: pref });
        state.tasteProfile = await api.fetchTasteProfile(state.user?.id);
        renderProfileView();
        showToast(`Dietary preference set to ${pref === 'All' ? 'Veg & Non-Veg' : pref}.`);
        break;
      }

      case 'set-profile-tab':
        state.profileTab = actionEl.getAttribute('data-tab') || 'history';
        renderProfileView();
        break;

      case 'set-auth-tab':
        state.authTab = actionEl.getAttribute('data-tab') || 'login';
        renderCurrentView();
        break;

      case 'delete-recipe': {
        const recipe = state.recipes.find((r) => Number(r.id) === Number(id));
        if (!recipe) return;
        openModal({
          title: 'Delete Recipe?',
          bodyHtml: `<p style="margin:0;color:var(--text-secondary);">Are you sure you want to permanently remove <strong>${escapeHtml(recipe.name)}</strong> from your catalog?</p>`,
          footerHtml: `
            <button type="button" class="btn btn-outline btn-sm" id="modal-cancel-del">Cancel</button>
            <button type="button" class="btn btn-danger btn-sm" id="modal-confirm-del">Delete Recipe</button>
          `
        });
        document.getElementById('modal-cancel-del')?.addEventListener('click', closeModal);
        document.getElementById('modal-confirm-del')?.addEventListener('click', async () => {
          await api.deleteRecipe(id);
          await syncGlobalState();
          closeModal();
          renderManageView();
          showToast(`Deleted "${recipe.name}".`);
        });
        break;
      }

      case 'logout':
        api.saveUserSession({
          id: 'guest',
          name: 'Guest Foodie',
          email: 'guest@tadkatrends.in',
          dietPreference: 'All',
          isLoggedIn: false
        });
        await syncGlobalState();
        showToast('Signed out.');
        navigateTo('home');
        break;

      default:
        break;
    }
  });

  window.addEventListener('hashchange', handleRouteChange);
}

/* ==========================================================================
   Bootstrap Application
   ========================================================================== */

async function init() {
  attachGlobalListeners();
  await handleRouteChange();
}

init();
