// AUTO-GENERATED from data/menu.csv (full Kyu Chon menu for the POC).
// Real client dishes & AED prices; descriptions/calories/allergens are illustrative demo values.
// Baked in as a static module because Vercel only deploys the web/ folder. Regenerate when menu.csv changes.

export type Dish = {
  name: string;
  desc: string;
  price: number;
  veg: boolean;
  spice: string;
  cal: number;
  popular: boolean;
};
export type Category = { name: string; items: Dish[] };

export const CURRENCY = "AED";

export const MENU: Category[] = [
  {
    "name": "Fried Chicken",
    "items": [
      {
        "name": "10 Wings Double Meal",
        "desc": "10 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Enough for two.",
        "price": 55,
        "veg": false,
        "spice": "Medium",
        "cal": 1100,
        "popular": false
      },
      {
        "name": "12 Drumsticks Family Meal",
        "desc": "12 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Made for sharing.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 1620,
        "popular": false
      },
      {
        "name": "16 Drumsticks Wings Family Meal",
        "desc": "16 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Made for sharing.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 1820,
        "popular": false
      },
      {
        "name": "20 Wings Family Meal",
        "desc": "20 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Made for sharing.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 1900,
        "popular": true
      },
      {
        "name": "3 Drumsticks Individual Meal",
        "desc": "3 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 630,
        "popular": false
      },
      {
        "name": "4 Drumsticks Wings Individual Meal",
        "desc": "4 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 680,
        "popular": false
      },
      {
        "name": "5 Wings Individual Meal",
        "desc": "5 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 700,
        "popular": false
      },
      {
        "name": "6 Drumsticks Double Meal",
        "desc": "6 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 55,
        "veg": false,
        "spice": "Medium",
        "cal": 960,
        "popular": false
      },
      {
        "name": "7 Boneless Bites Individual Meal",
        "desc": "7 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 720,
        "popular": false
      },
      {
        "name": "8 Drumsticks Wings Double Meal",
        "desc": "8 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 55,
        "veg": false,
        "spice": "Medium",
        "cal": 1060,
        "popular": false
      },
      {
        "name": "Chicken Tenders",
        "desc": "Chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 12,
        "veg": false,
        "spice": "Medium",
        "cal": 400,
        "popular": true
      },
      {
        "name": "Chicken Tenders 20 Bundle",
        "desc": "20 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1800,
        "popular": true
      },
      {
        "name": "Chicken Tenders 40 Bundle",
        "desc": "40 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 199,
        "veg": false,
        "spice": "Medium",
        "cal": 3600,
        "popular": true
      },
      {
        "name": "Double 10 Chicken Tenders",
        "desc": "10 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Enough for two.",
        "price": 55,
        "veg": false,
        "spice": "Medium",
        "cal": 900,
        "popular": true
      },
      {
        "name": "Double 10 Pcs Chicken Tenders",
        "desc": "10 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Enough for two.",
        "price": 59,
        "veg": false,
        "spice": "Medium",
        "cal": 900,
        "popular": true
      },
      {
        "name": "Double 10 Pcs Wings",
        "desc": "10 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Enough for two.",
        "price": 59,
        "veg": false,
        "spice": "Medium",
        "cal": 800,
        "popular": false
      },
      {
        "name": "Double 14 Pcs Boneless Chicken Bites Meal",
        "desc": "14 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Enough for two.",
        "price": 55,
        "veg": false,
        "spice": "Medium",
        "cal": 1140,
        "popular": false
      },
      {
        "name": "Double 6 Pcs Drumsticks",
        "desc": "6 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Enough for two.",
        "price": 59,
        "veg": false,
        "spice": "Medium",
        "cal": 660,
        "popular": false
      },
      {
        "name": "Double 8 Pcs Drumsticks Wings",
        "desc": "8 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Enough for two.",
        "price": 59,
        "veg": false,
        "spice": "Medium",
        "cal": 760,
        "popular": false
      },
      {
        "name": "Double Honey Whole Chicken Bundle",
        "desc": "Whole chicken in a sweet honey glaze, double-fried until crunchy. Made for sharing.",
        "price": 199,
        "veg": false,
        "spice": "Mild",
        "cal": 3600,
        "popular": true
      },
      {
        "name": "Double Whole Chicken Meal",
        "desc": "Whole chicken tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Made for sharing.",
        "price": 189,
        "veg": false,
        "spice": "Medium",
        "cal": 3900,
        "popular": true
      },
      {
        "name": "Family 12 Pcs Drumsticks",
        "desc": "12 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1320,
        "popular": false
      },
      {
        "name": "Family 16 Pcs Drumsticks Wings",
        "desc": "16 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1520,
        "popular": false
      },
      {
        "name": "Family 20 Chicken Tenders",
        "desc": "20 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 1800,
        "popular": true
      },
      {
        "name": "Family 20 Pcs Chicken Tenders",
        "desc": "20 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1800,
        "popular": true
      },
      {
        "name": "Family 20 Pcs Wings",
        "desc": "20 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1600,
        "popular": false
      },
      {
        "name": "Family 28 Pcs Boneless Chicken Bites",
        "desc": "28 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Medium",
        "cal": 1680,
        "popular": false
      },
      {
        "name": "Family 28 Pcs Boneless Chicken Bites Meal",
        "desc": "28 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. Made for sharing.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 1980,
        "popular": false
      },
      {
        "name": "Feast Sampler",
        "desc": "Wings, tenders and boneless bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 79,
        "veg": false,
        "spice": "Medium",
        "cal": 4200,
        "popular": false
      },
      {
        "name": "Friends Sampler",
        "desc": "Wings, tenders and boneless bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 45,
        "veg": false,
        "spice": "Medium",
        "cal": 1600,
        "popular": false
      },
      {
        "name": "Honey Tender Bites",
        "desc": "Boneless chicken bites in a sweet honey glaze, double-fried until crunchy. A meal for one.",
        "price": 19,
        "veg": false,
        "spice": "Mild",
        "cal": 400,
        "popular": true
      },
      {
        "name": "Individual 3 Pcs Drumsticks",
        "desc": "3 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 30,
        "veg": false,
        "spice": "Medium",
        "cal": 330,
        "popular": false
      },
      {
        "name": "Individual 4 Pcs Drumsticks Wings",
        "desc": "4 drumsticks and wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 30,
        "veg": false,
        "spice": "Medium",
        "cal": 380,
        "popular": false
      },
      {
        "name": "Individual 5 Chicken Tenders",
        "desc": "5 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Individual 5 Pcs Chicken Tenders",
        "desc": "5 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 30,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Individual 5 Pcs Wings",
        "desc": "5 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 30,
        "veg": false,
        "spice": "Medium",
        "cal": 400,
        "popular": false
      },
      {
        "name": "Individual 7 Pcs Boneless Bites",
        "desc": "7 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A meal for one.",
        "price": 30,
        "veg": false,
        "spice": "Medium",
        "cal": 420,
        "popular": false
      },
      {
        "name": "Mega Box 2 Drumstick",
        "desc": "2 juicy drumsticks tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A generous box.",
        "price": 39,
        "veg": false,
        "spice": "Medium",
        "cal": 220,
        "popular": true
      },
      {
        "name": "Mega Box 3 Tenders",
        "desc": "3 chicken tenders tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A generous box.",
        "price": 39,
        "veg": false,
        "spice": "Medium",
        "cal": 270,
        "popular": true
      },
      {
        "name": "Mega Box 3 Wings",
        "desc": "3 wings tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A generous box.",
        "price": 39,
        "veg": false,
        "spice": "Medium",
        "cal": 240,
        "popular": true
      },
      {
        "name": "Mega Box 4 Boneless Bites",
        "desc": "4 boneless chicken bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. A generous box.",
        "price": 39,
        "veg": false,
        "spice": "Medium",
        "cal": 240,
        "popular": true
      },
      {
        "name": "Party Platter",
        "desc": "Wings, tenders and boneless bites tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy. Made for sharing.",
        "price": 199,
        "veg": false,
        "spice": "Medium",
        "cal": 4200,
        "popular": true
      },
      {
        "name": "Single Honey Whole Chicken Bundle",
        "desc": "Whole chicken in a sweet honey glaze, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Mild",
        "cal": 2050,
        "popular": true
      },
      {
        "name": "Single Yangnyeom Whole Chicken Bundle",
        "desc": "Whole chicken glazed in sweet-and-spicy yangnyeom, double-fried until crunchy. Made for sharing.",
        "price": 109,
        "veg": false,
        "spice": "Hot",
        "cal": 2050,
        "popular": true
      },
      {
        "name": "Whole Chicken Meal",
        "desc": "Whole chicken tossed in your choice of soy-garlic or yangnyeom glaze, double-fried until crunchy, served with a side and a drink. A meal for one.",
        "price": 99,
        "veg": false,
        "spice": "Medium",
        "cal": 2350,
        "popular": true
      }
    ]
  },
  {
    "name": "Kids Meal",
    "items": [
      {
        "name": "Kids Chicken Tenders Meal",
        "desc": "Two crispy tenders with fries and a drink, just right for little ones.",
        "price": 24,
        "veg": false,
        "spice": "Mild",
        "cal": 480,
        "popular": false
      },
      {
        "name": "Kids KyoCrunch Slider Meal",
        "desc": "A crunchy mini chicken slider with fries and a drink for kids.",
        "price": 24,
        "veg": false,
        "spice": "Mild",
        "cal": 490,
        "popular": false
      },
      {
        "name": "Kids Soy Garlic Drummer Meal",
        "desc": "Mild soy-garlic drumsticks with fries and a drink for kids.",
        "price": 24,
        "veg": false,
        "spice": "Mild",
        "cal": 520,
        "popular": false
      },
      {
        "name": "Kids Soy Garlic Wings Meal",
        "desc": "Mild soy-garlic wings with fries and a drink for kids.",
        "price": 24,
        "veg": false,
        "spice": "Mild",
        "cal": 500,
        "popular": false
      }
    ]
  },
  {
    "name": "Bowl",
    "items": [
      {
        "name": "KyoChon Rice Bowl",
        "desc": "Steamed rice topped with glazed KyoChon chicken, fresh vegetables and a drizzle of house sauce.",
        "price": 17,
        "veg": false,
        "spice": "Medium",
        "cal": 620,
        "popular": true
      },
      {
        "name": "KyoChon Salad Bowl",
        "desc": "Fresh greens with glazed chicken, crisp vegetables and a light dressing.",
        "price": 17,
        "veg": false,
        "spice": "Mild",
        "cal": 420,
        "popular": false
      }
    ]
  },
  {
    "name": "Wrap & Sandwich",
    "items": [
      {
        "name": "Honey Garlic KyoCrunch Sandwich",
        "desc": "A crunchy chicken fillet sandwich glazed in sweet honey-garlic sauce.",
        "price": 29,
        "veg": false,
        "spice": "Mild",
        "cal": 660,
        "popular": true
      },
      {
        "name": "KyoCrunch Sandwich",
        "desc": "A crunchy fried chicken fillet in a toasted bun with slaw and house sauce.",
        "price": 29,
        "veg": false,
        "spice": "Medium",
        "cal": 640,
        "popular": true
      },
      {
        "name": "KyoKimchi Sandwich",
        "desc": "A fried chicken fillet with tangy kimchi and slaw in a toasted bun.",
        "price": 29,
        "veg": false,
        "spice": "Hot",
        "cal": 630,
        "popular": false
      },
      {
        "name": "Soy Garlic Wrap",
        "desc": "Savoury soy-garlic chicken with vegetables in a soft tortilla.",
        "price": 19,
        "veg": false,
        "spice": "Mild",
        "cal": 470,
        "popular": false
      },
      {
        "name": "Soy Garlic Wrap with Side",
        "desc": "A soy-garlic chicken wrap served with a side.",
        "price": 19,
        "veg": false,
        "spice": "Mild",
        "cal": 720,
        "popular": false
      },
      {
        "name": "Veggie Sandwich",
        "desc": "A toasted sandwich of fresh vegetables, slaw and house sauce.",
        "price": 29,
        "veg": true,
        "spice": "Mild",
        "cal": 380,
        "popular": false
      },
      {
        "name": "Yangnyeom Sandwich",
        "desc": "A sweet-and-spicy yangnyeom chicken fillet sandwich with slaw.",
        "price": 29,
        "veg": false,
        "spice": "Hot",
        "cal": 650,
        "popular": true
      },
      {
        "name": "Yangnyeom Wrap",
        "desc": "Sweet-and-spicy yangnyeom chicken with vegetables, rolled in a soft tortilla.",
        "price": 19,
        "veg": false,
        "spice": "Hot",
        "cal": 480,
        "popular": true
      }
    ]
  },
  {
    "name": "Korean Special",
    "items": [
      {
        "name": "Garlic Fried Rice",
        "desc": "Wok-fried rice tossed with fragrant garlic and scallion.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 460,
        "popular": false
      },
      {
        "name": "Japchae Noodle",
        "desc": "Stir-fried Korean glass noodles with vegetables in a savoury soy-sesame sauce.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 410,
        "popular": false
      },
      {
        "name": "Kimchi Fried Rice",
        "desc": "Wok-fried rice with tangy kimchi, vegetables and a hint of gochujang.",
        "price": 15,
        "veg": true,
        "spice": "Medium",
        "cal": 480,
        "popular": false
      },
      {
        "name": "Kimchi Soup",
        "desc": "A warming, spicy broth of fermented kimchi, tofu and vegetables.",
        "price": 19,
        "veg": false,
        "spice": "Hot",
        "cal": 280,
        "popular": false
      },
      {
        "name": "Korean Cheese Balls",
        "desc": "Golden fried dough balls with a gooey mozzarella centre.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 360,
        "popular": true
      },
      {
        "name": "Tteokbokki",
        "desc": "Chewy Korean rice cakes simmered in a sweet-and-spicy gochujang sauce.",
        "price": 19,
        "veg": true,
        "spice": "Hot",
        "cal": 420,
        "popular": true
      },
      {
        "name": "Vegetable Spring Rolls",
        "desc": "Crispy spring rolls filled with seasoned vegetables.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 260,
        "popular": false
      }
    ]
  },
  {
    "name": "Side",
    "items": [
      {
        "name": "Coleslaw",
        "desc": "Creamy, crunchy cabbage and carrot slaw.",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 180,
        "popular": false
      },
      {
        "name": "Fries",
        "desc": "Crispy golden fries.",
        "price": 9,
        "veg": true,
        "spice": "Mild",
        "cal": 320,
        "popular": false
      },
      {
        "name": "Plain Rice",
        "desc": "A bowl of steamed white rice.",
        "price": 7,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Potato Wedges",
        "desc": "Chunky seasoned potato wedges.",
        "price": 9,
        "veg": true,
        "spice": "Mild",
        "cal": 360,
        "popular": false
      },
      {
        "name": "Spicy Fries",
        "desc": "Golden fries dusted with a spicy seasoning.",
        "price": 10,
        "veg": true,
        "spice": "Medium",
        "cal": 340,
        "popular": true
      },
      {
        "name": "Spicy Potato Wedges",
        "desc": "Chunky potato wedges with a spicy kick.",
        "price": 10,
        "veg": true,
        "spice": "Medium",
        "cal": 380,
        "popular": false
      }
    ]
  },
  {
    "name": "Bubble Tea",
    "items": [
      {
        "name": "Brown Sugar Bubble Tea",
        "desc": "Creamy milk tea with chewy tapioca pearls and rich brown sugar syrup.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 320,
        "popular": true
      },
      {
        "name": "Classic Bubble Tea",
        "desc": "Smooth classic milk tea with chewy tapioca pearls.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 280,
        "popular": true
      },
      {
        "name": "Creme Brulee Bubble Tea",
        "desc": "Milk tea crowned with a torched creme brulee foam and tapioca pearls.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 340,
        "popular": false
      },
      {
        "name": "Mango Bubble Tea",
        "desc": "Refreshing mango milk tea with chewy tapioca pearls.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 290,
        "popular": true
      },
      {
        "name": "Thai Bubble Tea",
        "desc": "Fragrant Thai-style milk tea with chewy tapioca pearls.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 300,
        "popular": false
      }
    ]
  },
  {
    "name": "Smoothie",
    "items": [
      {
        "name": "Berry Twister Smoothie",
        "desc": "A tangy blend of mixed berries.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 210,
        "popular": false
      },
      {
        "name": "Coconut Blue Dream Smoothie",
        "desc": "A creamy coconut smoothie with a vivid blue swirl.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 240,
        "popular": false
      },
      {
        "name": "Mango Exotic Fusion Smoothie",
        "desc": "A tropical blend of mango and exotic fruits.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 220,
        "popular": true
      }
    ]
  },
  {
    "name": "Shake",
    "items": [
      {
        "name": "Honey Peach Shake",
        "desc": "A thick, creamy peach milkshake with a drizzle of honey.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 380,
        "popular": false
      }
    ]
  },
  {
    "name": "Juice",
    "items": [
      {
        "name": "Fresh Orange Juice",
        "desc": "Freshly squeezed orange juice.",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 120,
        "popular": false
      },
      {
        "name": "Fruit Cocktail",
        "desc": "A refreshing mix of seasonal fruit juices.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 140,
        "popular": false
      },
      {
        "name": "Lemon Mint Juice",
        "desc": "A cooling fresh lemon and mint cooler.",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 90,
        "popular": true
      },
      {
        "name": "Mango Juice",
        "desc": "Thick, sweet mango juice.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": true
      },
      {
        "name": "Pomegranate Juice",
        "desc": "Tangy-sweet freshly pressed pomegranate juice.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 130,
        "popular": false
      },
      {
        "name": "Watermelon Juice",
        "desc": "Sweet, freshly blended watermelon juice.",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 90,
        "popular": false
      }
    ]
  },
  {
    "name": "Mocktail",
    "items": [
      {
        "name": "Classic Mojito",
        "desc": "A zingy non-alcoholic mojito with lime and mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 130,
        "popular": true
      },
      {
        "name": "Honey Ginger Mojito",
        "desc": "A warming honey-ginger mojito with lime and mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 140,
        "popular": false
      },
      {
        "name": "Mango Mojito",
        "desc": "A zingy mango mojito with lime and mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 140,
        "popular": true
      },
      {
        "name": "Passion Fruit Mojito",
        "desc": "A tangy passion-fruit mojito with lime and mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 140,
        "popular": false
      }
    ]
  },
  {
    "name": "Hot Drink",
    "items": [
      {
        "name": "Iced Lemon Tea",
        "desc": "Chilled black tea with a squeeze of lemon.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 80,
        "popular": false
      },
      {
        "name": "Karak Cardamom",
        "desc": "Emirati milk tea infused with fragrant cardamom.",
        "price": 5,
        "veg": true,
        "spice": "Mild",
        "cal": 110,
        "popular": false
      },
      {
        "name": "Karak Plain",
        "desc": "Spiced Emirati-style milk tea.",
        "price": 5,
        "veg": true,
        "spice": "Mild",
        "cal": 110,
        "popular": true
      },
      {
        "name": "Karak Zafran",
        "desc": "Emirati milk tea perfumed with saffron.",
        "price": 5,
        "veg": true,
        "spice": "Mild",
        "cal": 120,
        "popular": false
      },
      {
        "name": "Persian Tea",
        "desc": "A delicate, fragrant black tea.",
        "price": 5,
        "veg": true,
        "spice": "Mild",
        "cal": 40,
        "popular": false
      }
    ]
  },
  {
    "name": "Soft Drink",
    "items": [
      {
        "name": "7Up",
        "desc": "Chilled 7Up.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Diet Pepsi",
        "desc": "Chilled Diet Pepsi.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Mirinda",
        "desc": "Chilled Mirinda.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Mountain Dew",
        "desc": "Chilled Mountain Dew.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Pepsi",
        "desc": "Chilled Pepsi.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Pepsi Zero",
        "desc": "Chilled Pepsi Zero.",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Sparkling Water",
        "desc": "Chilled sparkling water.",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 0,
        "popular": false
      },
      {
        "name": "Water 500Ml",
        "desc": "Chilled bottled water.",
        "price": 5,
        "veg": true,
        "spice": "Mild",
        "cal": 0,
        "popular": false
      }
    ]
  },
  {
    "name": "Dessert",
    "items": [
      {
        "name": "Carrot Cake",
        "desc": "Moist spiced carrot cake with a creamy frosting.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 480,
        "popular": false
      },
      {
        "name": "Chocolate Fudge Cake",
        "desc": "A rich, moist chocolate fudge cake.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 520,
        "popular": true
      },
      {
        "name": "Honey Cake",
        "desc": "Layered honey sponge cake with a light cream.",
        "price": 19,
        "veg": true,
        "spice": "Mild",
        "cal": 460,
        "popular": false
      },
      {
        "name": "Korean Cheese Cake",
        "desc": "A light, creamy baked cheesecake.",
        "price": 25,
        "veg": true,
        "spice": "Mild",
        "cal": 450,
        "popular": true
      }
    ]
  }
];
