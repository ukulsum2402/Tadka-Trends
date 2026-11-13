/**
 * Tadka & Trends — Realistic Sample Dataset (Indian Classics & Gen-Z Trends)
 * Covers all 7 Hero Ingredients (Paneer, Potato, Egg, Chicken, Bread, Pasta, Oats)
 * and all 5 Meal Times (Breakfast, Lunch, Dinner, Snacks, Desserts).
 */

export const HERO_INGREDIENTS = [
  { id: 'Paneer', label: 'Paneer', subtitle: 'Curries & Tacos' },
  { id: 'Potato', label: 'Potato', subtitle: 'Aloo & Wedges' },
  { id: 'Egg', label: 'Egg', subtitle: 'Bhurji & Bowls' },
  { id: 'Chicken', label: 'Chicken', subtitle: 'Dhaba & Flatbread' },
  { id: 'Bread', label: 'Bread', subtitle: 'Toast & Desserts' },
  { id: 'Pasta', label: 'Pasta', subtitle: 'Makhani & Pesto' },
  { id: 'Oats', label: 'Oats', subtitle: 'Khichdi & Parfait' }
];

export const MEAL_CATEGORIES = [
  { id: 'Breakfast', label: 'Breakfast', description: 'Quick morning fuel from masala toast to savory oats' },
  { id: 'Lunch', label: 'Lunch', description: 'Satisfying midday bowls, roasts, and flatbreads' },
  { id: 'Dinner', label: 'Dinner', description: 'Comforting family curries and velvety pastas' },
  { id: 'Snacks', label: 'Snacks', description: 'Evening chai-time bites and crispy party plates' },
  { id: 'Desserts', label: 'Desserts', description: 'Festive mithai and modern chilled jars' }
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DEFAULT_RECIPES = [
  {
    id: 1,
    name: 'Shahi Paneer Tadka',
    description: 'Velvety cashew-tomato gravy simmered with aromatic whole spices, saffron strands, and pillowy paneer cubes finished with a fragrant ghee tadka.',
    image: './assets/images/shahi_paneer_tadka.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Paneer',
    mealTime: 'Dinner',
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    difficulty: 'Medium',
    spiceLevel: 'Medium',
    featured: true,
    createdAt: '2026-10-01',
    ingredients: [
      { qty: 250, unit: 'g', item: 'Fresh Paneer cubes' },
      { qty: 3, unit: 'medium', item: 'Ripe tomatoes, roughly chopped' },
      { qty: 2, unit: 'tbsp', item: 'Raw cashews, soaked in warm water' },
      { qty: 1, unit: 'large', item: 'Red onion, sliced' },
      { qty: 2, unit: 'tbsp', item: 'Desi ghee or butter' },
      { qty: 1, unit: 'tsp', item: 'Ginger-garlic paste' },
      { qty: 1, unit: 'tsp', item: 'Kashmiri red chili powder' },
      { qty: 0.5, unit: 'tsp', item: 'Garam masala' },
      { qty: 1, unit: 'tbsp', item: 'Kasuri methi (dried fenugreek leaves)' },
      { qty: 3, unit: 'tbsp', item: 'Fresh heavy cream' },
      { qty: 1, unit: 'pinch', item: 'Saffron strands soaked in warm milk' }
    ],
    instructions: [
      'Saute sliced onions, tomatoes, soaked cashews, and ginger-garlic paste in 1 tbsp ghee until soft, then cool slightly and blend into a silky puree.',
      'Heat remaining ghee in a heavy kadhai, add Kashmiri red chili powder on low flame for rich color, and pour in the strained puree.',
      'Simmer for 8 minutes until the gravy thickens and releases gentle oil around the edges.',
      'Fold in fresh paneer cubes, garam masala, crushed kasuri methi, and saffron milk.',
      'Swirl in fresh cream, rest for 2 minutes, and serve hot with flaky garlic naan.'
    ]
  },
  {
    id: 2,
    name: 'Peri-Peri Paneer Smash Tacos',
    description: 'Crispy pan-seared peri-peri spiced paneer tucked inside charred corn tortillas with pickled red onions and creamy avocado-coriander drizzle.',
    image: './assets/images/paneer_smash_tacos.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Veg',
    heroIngredient: 'Paneer',
    mealTime: 'Snacks',
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Spicy',
    featured: true,
    createdAt: '2026-10-03',
    ingredients: [
      { qty: 200, unit: 'g', item: 'Paneer slabs, patted dry' },
      { qty: 4, unit: 'pcs', item: 'Soft corn or flour tortillas' },
      { qty: 1.5, unit: 'tbsp', item: 'Peri-peri spice rub' },
      { qty: 1, unit: 'tbsp', item: 'Olive oil' },
      { qty: 1, unit: 'ripe', item: 'Avocado, mashed with lime juice' },
      { qty: 0.5, unit: 'cup', item: 'Quick-pickled red onion rings' },
      { qty: 2, unit: 'tbsp', item: 'Greek yogurt or sour cream' },
      { qty: 1, unit: 'handful', item: 'Fresh microgreens or cilantro' }
    ],
    instructions: [
      'Toss paneer slabs in olive oil, peri-peri spice rub, and a pinch of salt until evenly coated.',
      'Sear paneer in a screaming-hot cast iron skillet for 2 minutes per side until charred and crisp.',
      'Blend mashed avocado with Greek yogurt, lime juice, and salt to make a smooth green crema.',
      'Warm tortillas directly over an open flame or dry skillet until lightly blistered.',
      'Assemble tacos with crispy paneer, avocado crema, pickled onions, and fresh microgreens.'
    ]
  },
  {
    id: 3,
    name: 'Aloo Jeera & Hing Roast',
    description: 'Everyday comfort Indian potatoes roasted golden with crackling cumin seeds, aromatic asafoetida, turmeric, and bright fresh coriander.',
    image: './assets/images/aloo_jeera_roast.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Potato',
    mealTime: 'Lunch',
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    difficulty: 'Easy',
    spiceLevel: 'Mild',
    featured: false,
    createdAt: '2026-10-04',
    ingredients: [
      { qty: 4, unit: 'medium', item: 'Boiled potatoes, cubed' },
      { qty: 1.5, unit: 'tsp', item: 'Whole cumin seeds (jeera)' },
      { qty: 0.25, unit: 'tsp', item: 'Asafoetida (hing)' },
      { qty: 2, unit: 'tbsp', item: 'Mustard oil or ghee' },
      { qty: 0.5, unit: 'tsp', item: 'Turmeric powder' },
      { qty: 1, unit: 'tsp', item: 'Roasted coriander powder' },
      { qty: 0.5, unit: 'tsp', item: 'Amchur (dry mango powder)' },
      { qty: 2, unit: 'tbsp', item: 'Fresh chopped coriander leaves' }
    ],
    instructions: [
      'Heat mustard oil in a wide pan until shimmering, then lower the flame and add cumin seeds and hing.',
      'Once cumin crackles and turns fragrant, add cubed boiled potatoes in a single layer.',
      'Sprinkle turmeric, coriander powder, and salt, tossing gently so edges crisp up.',
      'Roast undisturbed for 4 minutes on medium heat, flip, and finish with amchur and fresh coriander.'
    ]
  },
  {
    id: 4,
    name: 'Truffle Parmesan Crispy Aloo Wedges',
    description: 'Oven-baked extra-crispy potato wedges tossed in garlic herb oil and aged parmesan snow, served alongside chilled roasted garlic aioli.',
    image: './assets/images/parmesan_aloo_wedges.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Veg',
    heroIngredient: 'Potato',
    mealTime: 'Snacks',
    prepTime: 10,
    cookTime: 18,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Mild',
    featured: false,
    createdAt: '2026-10-05',
    ingredients: [
      { qty: 3, unit: 'large', item: 'Russet or Pahadi potatoes, cut into wedges' },
      { qty: 2, unit: 'tbsp', item: 'Extra-virgin olive oil' },
      { qty: 0.25, unit: 'cup', item: 'Grated parmesan cheese' },
      { qty: 1, unit: 'tsp', item: 'Garlic powder & dried rosemary' },
      { qty: 3, unit: 'tbsp', item: 'Mayonnaise or thick yogurt for aioli' },
      { qty: 1, unit: 'clove', item: 'Grated fresh garlic' },
      { qty: 1, unit: 'tsp', item: 'Lemon juice & chopped chives' }
    ],
    instructions: [
      'Parboil potato wedges for 5 minutes in salted water, drain, and steam dry for extra crunch.',
      'Toss wedges with olive oil, garlic powder, rosemary, salt, and black pepper.',
      'Air-fry or roast at 220°C for 16-18 minutes until deeply golden and blistered.',
      'Whisk mayonnaise, grated garlic, lemon juice, and chives into a dipping aioli.',
      'Dust hot wedges with parmesan cheese and serve immediately with aioli.'
    ]
  },
  {
    id: 5,
    name: 'Mumbai Masala Anda Bhurji',
    description: 'Street-style spiced scrambled eggs cooked fast with caramelized onions, juicy tomatoes, green chilies, and butter-toasted ladi pav.',
    image: './assets/images/masala_anda_bhurji.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Non-Veg',
    heroIngredient: 'Egg',
    mealTime: 'Breakfast',
    prepTime: 5,
    cookTime: 7,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Medium',
    featured: true,
    createdAt: '2026-10-06',
    ingredients: [
      { qty: 4, unit: 'large', item: 'Farm fresh eggs' },
      { qty: 1, unit: 'medium', item: 'Red onion, finely diced' },
      { qty: 1, unit: 'medium', item: 'Tomato, finely chopped' },
      { qty: 2, unit: 'pcs', item: 'Green chilies, slit' },
      { qty: 1, unit: 'tbsp', item: 'Salted butter' },
      { qty: 0.5, unit: 'tsp', item: 'Pav bhaji masala' },
      { qty: 0.25, unit: 'tsp', item: 'Turmeric powder' },
      { qty: 4, unit: 'pcs', item: 'Soft pav buns' },
      { qty: 2, unit: 'tbsp', item: 'Fresh coriander, chopped' }
    ],
    instructions: [
      'Melt butter on a flat tawa and saute onions with green chilies until translucent and golden.',
      'Add chopped tomatoes, turmeric, pav bhaji masala, and salt; cook until tomatoes soften.',
      'Crack eggs directly over the masala and gently fold continuously until soft, fluffy curds form.',
      'Toast halved pav buns in a knob of butter on the same tawa.',
      'Top bhurji with fresh coriander and a squeeze of lime; serve piping hot with pav.'
    ]
  },
  {
    id: 6,
    name: 'Chili Oil Crispy Egg Rice Bowl',
    description: 'Trending 15-minute Gen-Z comfort bowl featuring a lacy-edged chili crisp fried egg over warm steamed rice, creamy avocado, and scallions.',
    image: './assets/images/chili_egg_bowl.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Non-Veg',
    heroIngredient: 'Egg',
    mealTime: 'Lunch',
    prepTime: 5,
    cookTime: 9,
    servings: 1,
    difficulty: 'Easy',
    spiceLevel: 'Spicy',
    featured: true,
    createdAt: '2026-10-08',
    ingredients: [
      { qty: 2, unit: 'large', item: 'Eggs' },
      { qty: 1.5, unit: 'tbsp', item: 'Crunchy chili oil (chili crisp)' },
      { qty: 1, unit: 'cup', item: 'Warm steamed jasmine or sona masoori rice' },
      { qty: 0.5, unit: 'ripe', item: 'Avocado, sliced' },
      { qty: 1, unit: 'tbsp', item: 'Light soy sauce' },
      { qty: 1, unit: 'tsp', item: 'Toasted white & black sesame seeds' },
      { qty: 2, unit: 'stalks', item: 'Spring onion greens, sliced' }
    ],
    instructions: [
      'Spoon chili crisp oil into a small non-stick skillet over medium-high heat until sizzling.',
      'Crack eggs directly onto the chili oil and fry until whites turn lacy and crisp while yolks remain jammy.',
      'Spoon warm rice into a deep bowl and drizzle lightly with soy sauce.',
      'Slide crispy chili eggs over the rice and arrange sliced avocado alongside.',
      'Finish with toasted sesame seeds, sliced scallions, and an extra spoonful of chili crunch.'
    ]
  },
  {
    id: 7,
    name: 'Homestyle Dhaba Chicken Curry',
    description: 'Slow-simmered bone-in chicken in a robust roasted onion-tomato masala infused with black cardamom, ginger juliennes, and fresh coriander.',
    image: './assets/images/dhaba_chicken_curry.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Non-Veg',
    heroIngredient: 'Chicken',
    mealTime: 'Dinner',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    spiceLevel: 'Spicy',
    featured: true,
    createdAt: '2026-10-10',
    ingredients: [
      { qty: 600, unit: 'g', item: 'Chicken curry cut, skinless' },
      { qty: 3, unit: 'medium', item: 'Onions, finely chopped' },
      { qty: 3, unit: 'medium', item: 'Tomatoes, pureed' },
      { qty: 3, unit: 'tbsp', item: 'Mustard oil or ghee' },
      { qty: 2, unit: 'tbsp', item: 'Ginger-garlic paste' },
      { qty: 2, unit: 'pods', item: 'Black cardamom & 1 bay leaf' },
      { qty: 1.5, unit: 'tsp', item: 'Red chili powder' },
      { qty: 1, unit: 'tsp', item: 'Garam masala' },
      { qty: 0.5, unit: 'cup', item: 'Whisked plain curd (yogurt)' }
    ],
    instructions: [
      'Heat mustard oil in a thick-bottomed handi; temper bay leaf, black cardamom, and cloves.',
      'Cook finely chopped onions slowly for 10 minutes until deeply caramelized brown.',
      'Stir in ginger-garlic paste and tomato puree with chili powder, turmeric, and salt until masala glistens.',
      'Add chicken pieces and sear on high heat for 5 minutes before folding in whisked yogurt.',
      'Cover and simmer 18 minutes until chicken is tender; garnish with ginger juliennes and coriander.'
    ]
  },
  {
    id: 8,
    name: 'Hot Honey Harissa Chicken Flatbread',
    description: 'Blistered artisan flatbread layered with smoky harissa pulled chicken, whipped feta, peppery arugula, and a sweet-heat chili honey drizzle.',
    image: './assets/images/harissa_chicken_flatbread.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Non-Veg',
    heroIngredient: 'Chicken',
    mealTime: 'Lunch',
    prepTime: 12,
    cookTime: 18,
    servings: 2,
    difficulty: 'Medium',
    spiceLevel: 'Spicy',
    featured: false,
    createdAt: '2026-10-12',
    ingredients: [
      { qty: 250, unit: 'g', item: 'Shredded cooked chicken breast' },
      { qty: 2, unit: 'pcs', item: 'Artisan flatbread or sourdough naan bases' },
      { qty: 2, unit: 'tbsp', item: 'Rose harissa paste' },
      { qty: 60, unit: 'g', item: 'Crumbled feta cheese' },
      { qty: 1, unit: 'cup', item: 'Fresh baby arugula (rocket leaves)' },
      { qty: 1.5, unit: 'tbsp', item: 'Hot chili honey' },
      { qty: 1, unit: 'tbsp', item: 'Olive oil' }
    ],
    instructions: [
      'Toss shredded chicken with rose harissa paste and 1 tbsp olive oil until glossy.',
      'Brush flatbread bases lightly with oil and top evenly with harissa chicken and crumbled feta.',
      'Bake in a preheated 230°C oven for 8-10 minutes until edges blister and turn golden.',
      'Top hot flatbread with fresh baby arugula and drizzle generously with hot honey before slicing.'
    ]
  },
  {
    id: 9,
    name: 'Bombay Masala Cheese Toast',
    description: 'Iconic Mumbai street-style grilled sandwich packed with spiced potato masala, bright mint-coriander chutney, crunchy onions, and molten cheddar.',
    image: './assets/images/masala_cheese_toast.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Bread',
    mealTime: 'Breakfast',
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Medium',
    featured: false,
    createdAt: '2026-10-14',
    ingredients: [
      { qty: 4, unit: 'slices', item: 'Thick sandwich bread' },
      { qty: 2, unit: 'medium', item: 'Boiled potatoes, mashed with mustard-curry leaf tadka' },
      { qty: 2, unit: 'tbsp', item: 'Green mint-coriander chutney' },
      { qty: 0.5, unit: 'cup', item: 'Grated cheddar-mozzarella blend' },
      { qty: 0.25, unit: 'cup', item: 'Finely diced red onion & bell pepper' },
      { qty: 1, unit: 'tsp', item: 'Chaat masala' },
      { qty: 2, unit: 'tbsp', item: 'Softened butter' }
    ],
    instructions: [
      'Spread butter and green mint-coriander chutney generously on all bread slices.',
      'Layer spiced potato filling, diced onions, bell pepper, chaat masala, and grated cheese.',
      'Close sandwiches, butter the outside, and toast in a cast-iron skillet or sandwich press for 4 minutes until crisp and golden.',
      'Slice diagonally and serve with extra chutney and crispy sev.'
    ]
  },
  {
    id: 10,
    name: 'Whipped Ricotta & Hot Honey Sourdough',
    description: 'Cafe-worthy artisan sourdough toast crowned with airy whipped ricotta, crushed roasted pistachios, flaky sea salt, and golden hot honey.',
    image: './assets/images/ricotta_honey_toast.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Veg',
    heroIngredient: 'Bread',
    mealTime: 'Breakfast',
    prepTime: 7,
    cookTime: 5,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Mild',
    featured: false,
    createdAt: '2026-10-16',
    ingredients: [
      { qty: 2, unit: 'thick slices', item: 'Artisan country sourdough bread' },
      { qty: 0.75, unit: 'cup', item: 'Whole-milk ricotta cheese' },
      { qty: 1, unit: 'tbsp', item: 'Extra-virgin olive oil' },
      { qty: 2, unit: 'tbsp', item: 'Crushed roasted pistachios' },
      { qty: 1.5, unit: 'tbsp', item: 'Hot chili-infused honey' },
      { qty: 0.5, unit: 'tsp', item: 'Flaky sea salt & lemon zest' }
    ],
    instructions: [
      'Whip ricotta with olive oil, lemon zest, and a pinch of salt for 1 minute until cloud-light.',
      'Brush sourdough slices lightly with olive oil and toast in a skillet or toaster until crisp.',
      'Spread whipped ricotta thickly over warm toast with swooshes of a spoon.',
      'Scatter crushed pistachios, flaky sea salt, and finish with a glossy drizzle of hot honey.'
    ]
  },
  {
    id: 11,
    name: 'Desi Makhani Penne Pasta',
    description: 'The ultimate Indo-Italian crossover: al dente penne folded into silky spiced tomato-butter makhani sauce with kasuri methi and melted mozzarella.',
    image: './assets/images/makhani_penne_pasta.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Pasta',
    mealTime: 'Dinner',
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    difficulty: 'Easy',
    spiceLevel: 'Medium',
    featured: true,
    createdAt: '2026-10-18',
    ingredients: [
      { qty: 250, unit: 'g', item: 'Penne rigate pasta' },
      { qty: 4, unit: 'medium', item: 'Ripe tomatoes, blanched & pureed' },
      { qty: 2, unit: 'tbsp', item: 'Salted butter' },
      { qty: 1, unit: 'tbsp', item: 'Ginger-garlic paste' },
      { qty: 1, unit: 'tsp', item: 'Kashmiri red chili powder' },
      { qty: 1, unit: 'tsp', item: 'Crushed kasuri methi' },
      { qty: 0.25, unit: 'cup', item: 'Fresh cream' },
      { qty: 0.5, unit: 'cup', item: 'Shredded mozzarella & fresh basil' }
    ],
    instructions: [
      'Boil penne pasta in salted water until al dente; reserve 1/2 cup pasta cooking water.',
      'Melt butter in a pan, saute ginger-garlic paste briefly, and pour in tomato puree with Kashmiri chili.',
      'Simmer for 6 minutes until rich and glossy, then stir in fresh cream and crushed kasuri methi.',
      'Toss cooked penne with a splash of pasta water until every ridge is coated, top with mozzarella and basil, and serve hot.'
    ]
  },
  {
    id: 12,
    name: 'Creamy Pesto Burrata Spaghetti',
    description: 'Vibrant fresh basil-pine nut pesto tossed with al dente spaghetti and topped with a cold creamy burrata cheese orb and cracked black pepper.',
    image: './assets/images/pesto_burrata_spaghetti.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Veg',
    heroIngredient: 'Pasta',
    mealTime: 'Dinner',
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Mild',
    featured: false,
    createdAt: '2026-10-20',
    ingredients: [
      { qty: 220, unit: 'g', item: 'Spaghetti' },
      { qty: 2, unit: 'cups', item: 'Fresh sweet basil leaves' },
      { qty: 3, unit: 'tbsp', item: 'Toasted pine nuts or walnuts' },
      { qty: 0.3, unit: 'cup', item: 'Extra-virgin olive oil' },
      { qty: 0.25, unit: 'cup', item: 'Grated parmesan cheese' },
      { qty: 1, unit: 'whole', item: 'Fresh burrata ball (125g)' },
      { qty: 1, unit: 'clove', item: 'Garlic' }
    ],
    instructions: [
      'Pulse basil leaves, garlic, toasted pine nuts, parmesan, and olive oil into a vibrant emerald pesto.',
      'Cook spaghetti in well-salted water until al dente, reserving 1/3 cup starchy pasta water.',
      'Off the heat, toss hot spaghetti with pesto and splashes of pasta water until glossy and emulsified.',
      'Twirl onto plates, tear open a fresh burrata ball on top, and finish with cracked black pepper and pine nuts.'
    ]
  },
  {
    id: 13,
    name: 'Savory Masala Oats Khichdi',
    description: 'Nourishing 14-minute Indian breakfast bowl of rolled oats simmered with green peas, diced carrots, cumin-mustard tadka, and golden ghee.',
    image: './assets/images/masala_oats_khichdi.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Oats',
    mealTime: 'Breakfast',
    prepTime: 5,
    cookTime: 9,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Mild',
    featured: false,
    createdAt: '2026-10-22',
    ingredients: [
      { qty: 1, unit: 'cup', item: 'Rolled oats' },
      { qty: 0.5, unit: 'cup', item: 'Mixed green peas & finely diced carrots' },
      { qty: 1, unit: 'tbsp', item: 'Pure cow ghee' },
      { qty: 0.5, unit: 'tsp', item: 'Mustard seeds & cumin seeds' },
      { qty: 6, unit: 'leaves', item: 'Fresh curry leaves' },
      { qty: 0.25, unit: 'tsp', item: 'Turmeric powder' },
      { qty: 0.5, unit: 'tsp', item: 'Garam masala' },
      { qty: 2.5, unit: 'cups', item: 'Warm water' }
    ],
    instructions: [
      'Heat ghee in a saucepan and temper mustard seeds, cumin seeds, and curry leaves until aromatic.',
      'Add chopped onions, carrots, green peas, turmeric, and salt; saute for 2 minutes.',
      'Dry toast rolled oats in the same pan for 1 minute, then pour in warm water.',
      'Simmer for 5 minutes until creamy; finish with garam masala, fresh coriander, and a tiny dollop of ghee.'
    ]
  },
  {
    id: 14,
    name: 'Biscoff Espresso Overnight Oats Parfait',
    description: 'Chilled tiramisu-inspired dessert jar layering espresso-infused overnight oats, spiced speculoos butter, whipped Greek yogurt, and cocoa.',
    image: './assets/images/espresso_oats_parfait.jpg',
    cuisineStyle: 'Gen-Z / Continental',
    diet: 'Veg',
    heroIngredient: 'Oats',
    mealTime: 'Desserts',
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'Easy',
    spiceLevel: 'Sweet / No Spice',
    featured: false,
    createdAt: '2026-10-24',
    ingredients: [
      { qty: 1, unit: 'cup', item: 'Rolled oats' },
      { qty: 1, unit: 'cup', item: 'Milk or oat milk' },
      { qty: 1, unit: 'shot', item: 'Brewed espresso (cooled)' },
      { qty: 2, unit: 'tbsp', item: 'Lotus Biscoff spread, melted' },
      { qty: 0.5, unit: 'cup', item: 'Thick vanilla Greek yogurt' },
      { qty: 1, unit: 'tbsp', item: 'Chia seeds & maple syrup' },
      { qty: 2, unit: 'pcs', item: 'Crushed Biscoff biscuits & cocoa powder' }
    ],
    instructions: [
      'Whisk milk, cooled espresso, chia seeds, maple syrup, and oats together; chill at least 4 hours or overnight.',
      'Layer soaked espresso oats into fluted glasses alternating with ribbons of melted Biscoff spread.',
      'Spoon whipped Greek yogurt on top, dust generously with unsweetened cocoa powder, and crown with crushed biscuit crumble.'
    ]
  },
  {
    id: 15,
    name: 'Kesar Badam Bread Shahi Tukda',
    description: 'Royal Hyderabadi bread pudding featuring crisp ghee-fried bread triangles soaked in saffron-cardamom rabri and showered with pistachios and rose petals.',
    image: './assets/images/kesar_shahi_tukda.jpg',
    cuisineStyle: 'Indian Classic',
    diet: 'Veg',
    heroIngredient: 'Bread',
    mealTime: 'Desserts',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: 'Medium',
    spiceLevel: 'Sweet / No Spice',
    featured: true,
    createdAt: '2026-10-26',
    ingredients: [
      { qty: 6, unit: 'slices', item: 'White sandwich bread, halved into triangles' },
      { qty: 500, unit: 'ml', item: 'Full-cream whole milk' },
      { qty: 3, unit: 'tbsp', item: 'Desi ghee for pan-frying' },
      { qty: 0.3, unit: 'cup', item: 'Sugar or condensed milk' },
      { qty: 1, unit: 'pinch', item: 'Saffron strands (kesar)' },
      { qty: 0.5, unit: 'tsp', item: 'Green cardamom powder' },
      { qty: 3, unit: 'tbsp', item: 'Slivered pistachios, almonds & dried rose petals' }
    ],
    instructions: [
      'Simmer whole milk in a wide pan until reduced by half, stirring in sugar, saffron strands, and cardamom powder to make rich kesar rabri.',
      'Pan-fry bread triangles in desi ghee on medium heat until deeply crisp and golden brown on both sides.',
      'Arrange warm crisp bread triangles on a serving platter and ladle thickened saffron rabri generously over them.',
      'Garnish with slivered almonds, pistachios, and dried rose petals; serve warm or chilled.'
    ]
  }
];
