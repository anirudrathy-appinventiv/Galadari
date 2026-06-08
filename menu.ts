// AUTO-GENERATED from data/menu.csv (dummy menu for the POC).
// Baked in as a static module because Vercel only deploys the web/ folder.
// Regenerate when the real Kyu Chon menu arrives.

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

export const CURRENCY = "Rs";

export const MENU: Category[] = [
  {
    "name": "Veg Starter",
    "items": [
      {
        "name": "Vegetable Chop",
        "desc": "A tasty street snacks of Kolkata's Babu culture made of beetroot, peanuts and coconut, covered with bread crumbs, deep fried and served with kasundi.",
        "price": 16,
        "veg": true,
        "spice": "Mild",
        "cal": 250,
        "popular": false
      },
      {
        "name": "Mochar Chop",
        "desc": "A cherished Bengali treat combined of banana flower with potato and homemade aromated spices, prepared without onion garlic.",
        "price": 18,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Much Muche Chal Kumro",
        "desc": "A very dynamic Bengali snack made of ash gourd (Chal Kumro), stuffed like a pillow with a filling of coconut, potato, mixed in exotic spices, herbs etc., coated and deep fried till crispy (much muche).",
        "price": 22,
        "veg": true,
        "spice": "Mild",
        "cal": 250,
        "popular": false
      }
    ]
  },
  {
    "name": "Non-veg Starter",
    "items": [
      {
        "name": "Deviled Egg (Chicken)",
        "desc": "A mouth watering snack of hard boiled egg, covered with minced chicken coated with bread crumbs and deep fried.",
        "price": 24,
        "veg": false,
        "spice": "Medium",
        "cal": 420,
        "popular": false
      },
      {
        "name": "Deviled Egg (Mutton)",
        "desc": "A mouth watering snack of hard boiled egg, covered with minced mutton coated with bread crumbs and deep fried.",
        "price": 26,
        "veg": false,
        "spice": "Medium",
        "cal": 420,
        "popular": false
      },
      {
        "name": "Chicken Cutlet",
        "desc": "Succulent crispy breaded chicken cutlets are thin sliced chicken breasts coated in bread crumbs and home made ground spices deepfried and served with kasundi.",
        "price": 18,
        "veg": false,
        "spice": "Medium",
        "cal": 400,
        "popular": false
      },
      {
        "name": "Calcutta Fish Fry",
        "desc": "Chefs special dish. A Homemade marinated Bhetki fillet crumb coated and deep fried, served with salad, Cabbage/Tartar Sauce.",
        "price": 27,
        "veg": false,
        "spice": "Medium",
        "cal": 370,
        "popular": true
      },
      {
        "name": "Prawn Cutlet",
        "desc": "A sumptuous Bengali appetizer marinated with exotic spices crumb coated with crumbs, fried and served with dips.",
        "price": 31,
        "veg": false,
        "spice": "Medium",
        "cal": 350,
        "popular": false
      },
      {
        "name": "Gondhoraj Chicken",
        "desc": "A Lip Smacking Appetizer from Bengal marinated with kaffir lime and other spices.",
        "price": 26,
        "veg": false,
        "spice": "Mild",
        "cal": 300,
        "popular": false
      },
      {
        "name": "Tangra Chilli Chicken",
        "desc": "Tangra, the place where first Indianized chinese was born in India. Taste the best, mixed with an Indian style of cooking added with a tangy and sweet touch.",
        "price": 32,
        "veg": false,
        "spice": "Medium",
        "cal": 350,
        "popular": false
      }
    ]
  },
  {
    "name": "Rice",
    "items": [
      {
        "name": "Plain Rice",
        "desc": "Steamed Stabbag Rice.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 50,
        "popular": true
      },
      {
        "name": "Basanti Pulao",
        "desc": "A traditional aromated Bengali Pulao made with cashew and raisins. This no onion garlic yellow Pulao, served with an aromatic aroma can be eaten with any rich vegetarian and non-vegetarian curry.",
        "price": 24,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Mangsho Pulao",
        "desc": "A flavourful one-pot meal made with tender marinated meat pieces & fragrant basmati rice.",
        "price": 52,
        "veg": false,
        "spice": "Medium",
        "cal": 550,
        "popular": false
      },
      {
        "name": "Ilish Bhapa Pulao",
        "desc": "It is a special dish prepared in a traditional way, mixed with tender rich pieces of Hilsa (Ilish) fish and fragrant rice.",
        "price": 60,
        "veg": false,
        "spice": "Medium",
        "cal": 400,
        "popular": false
      }
    ]
  },
  {
    "name": "Dal",
    "items": [
      {
        "name": "Bengali Mung Dal",
        "desc": "Bengali moong dal boiled and spluttered with ghee and whole spices.",
        "price": 21,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": true
      },
      {
        "name": "Lebu Musur Dal",
        "desc": "An aromatic Masoor Dal cooked with lime leaves.",
        "price": 23,
        "veg": true,
        "spice": "Mild",
        "cal": 50,
        "popular": false
      },
      {
        "name": "Thakur Barir Cholar Dal",
        "desc": "A slow cooked Bengali gram lentil seasoned with ghee, chopped coconut and asafoetida.",
        "price": 24,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Mudo Dal",
        "desc": "Kalia head fried and cooked with Moong Dal and aromated spices, finished with ghee and garam masala.",
        "price": 25,
        "veg": false,
        "spice": "Medium",
        "cal": 100,
        "popular": false
      }
    ]
  },
  {
    "name": "Fried Item",
    "items": [
      {
        "name": "Jhur Jhure Aloo Bhaja",
        "desc": "Deep fried grated potato, seasoned with special spices and fried peanuts.",
        "price": 14,
        "veg": true,
        "spice": "Mild",
        "cal": 170,
        "popular": true
      },
      {
        "name": "Begun Bhaja",
        "desc": "Long slices of eggplants marinated with salt and turmeric, fried till perfection.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 120,
        "popular": true
      },
      {
        "name": "Beguni",
        "desc": "Goes well with every occasion of Bengali cuisine. Thin long slice of eggplant dipped into a mild spicy runny chickpea batter deep fried till golden brown.",
        "price": 14,
        "veg": true,
        "spice": "Mild",
        "cal": 170,
        "popular": false
      },
      {
        "name": "Mach Bhaja Rui",
        "desc": "A seasoned Rui fish/Katla/Ilish Mach in turmeric and salt, later deep fried with mustard oil.",
        "price": 20,
        "veg": false,
        "spice": "Medium",
        "cal": 100,
        "popular": true
      },
      {
        "name": "Mach Bhaja Katla",
        "desc": "A seasoned Rui fish/Katla/Ilish Mach in turmeric and salt, later deep fried with mustard oil.",
        "price": 22,
        "veg": false,
        "spice": "Medium",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Mach Bhaja Ilish",
        "desc": "A seasoned Rui fish/Katla/Ilish Mach in turmeric and salt, later deep fried with mustard oil.",
        "price": 32,
        "veg": false,
        "spice": "Medium",
        "cal": 100,
        "popular": true
      },
      {
        "name": "Pomfret Special",
        "desc": "Whole Pomfret seasoned with in-house spices, yogurt marinade cooked in tandoor and served with tangy chutney.",
        "price": 45,
        "veg": false,
        "spice": "Medium",
        "cal": 100,
        "popular": false
      }
    ]
  },
  {
    "name": "Breads",
    "items": [
      {
        "name": "Luchi",
        "desc": "A deep fried fluffy bread made of white flour.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Dal Puri",
        "desc": "A deep fried fluffy bread stuffed with chana dal filling, aromated with ginger and home-made spices.",
        "price": 14,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Koraishutir Kochuri",
        "desc": "A deep fried fluffy bread stuffed with gree pea filling, flavored and spiced with asafoetida and home made spices.",
        "price": 14,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Mochar Kochuri (Seasonal)",
        "desc": "A flavourful special kochuri made with mocha stuffing.",
        "price": 16,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      }
    ]
  },
  {
    "name": "Mains Veg",
    "items": [
      {
        "name": "Shukto",
        "desc": "A traditional and renowned palate of Bengali cuisine. A little pungent and bitter in taste made of bitter gourd and other green vegetables seasoned with panch phoron and mustard paste.",
        "price": 23,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Bhaja Moshla Alu Dom",
        "desc": "A mild sweet, spicy, tangy baby potato's semi dry curry seasoned with aromatically slow roasted special spices commonly called as 'BHAJA MOSHLA' in Bengal.",
        "price": 24,
        "veg": true,
        "spice": "Medium",
        "cal": 150,
        "popular": true
      },
      {
        "name": "Potoler Dolma",
        "desc": "The whole parwal means stuffed. This classic dish is filled with coconut, dryfruits, in-house spices and cooked in thin gravy.",
        "price": 26,
        "veg": true,
        "spice": "Medium",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Dhokar Dalna",
        "desc": "The word dhoka means 'Cheated', so it often plays a joke with ones true life. Kids with these flavourful lentil cakes made with ground spices and nuts instead of meat.",
        "price": 25,
        "veg": true,
        "spice": "Medium",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Bahari Bati Chorchori",
        "desc": "A traditional Bengali dish prepared by mixing various seasonal vegetables, cooked together with home made spices.",
        "price": 36,
        "veg": true,
        "spice": "Medium",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Koshe Kosha Echor (Seasonal)",
        "desc": "A classic Bengali delicacy made of tender jackfruit and potato with other home made spices finished with ghee and garam masala.",
        "price": 32,
        "veg": true,
        "spice": "Medium",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Alu Phulkopi Paneer er Dalna",
        "desc": "A delicious Bengali dish of cauliflower (phulkopi) cooked with paneer, alu and blend of aromatic spices, creating a harmonious balance of warmth & sweetness.",
        "price": 40,
        "veg": true,
        "spice": "Medium",
        "cal": 250,
        "popular": false
      },
      {
        "name": "Mochar Ghonto",
        "desc": "A traditional Bengali vegetable's dish prepared with Banana blossom (mocha).",
        "price": 34,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      }
    ]
  },
  {
    "name": "Mains Non-veg (meat)",
    "items": [
      {
        "name": "Alu Murgir Jhol",
        "desc": "An all time favourite simple home style dish of chicken cooked in light soupy gravy with thin sliced potato chunks teamed with hot steamed Basmati Rice.",
        "price": 36,
        "veg": false,
        "spice": "Medium",
        "cal": 550,
        "popular": false
      },
      {
        "name": "Kancha Lonka Dhonepata Diye Murgi",
        "desc": "A signature dish from BabuMoshai. Soft tender chicken cooked in fresh coriander green paste and green chillis simmered to perfection.",
        "price": 35,
        "veg": false,
        "spice": "Hot",
        "cal": 500,
        "popular": true
      },
      {
        "name": "Chicken Kosha",
        "desc": "Chicken pieces marinated with in-house spices continuously braising the meat over a slow-fire gas to give the rich thick brownish thick rich mouthwatering gravy.",
        "price": 32,
        "veg": false,
        "spice": "Hot",
        "cal": 550,
        "popular": false
      },
      {
        "name": "Mutton Alu Jhol",
        "desc": "A classic weekend age old delicacy straight from Dadi's diary of mutton pieces cooked in thin spicy gravy with potato chunks teamed with hot steamed basmati rice.",
        "price": 41,
        "veg": false,
        "spice": "Medium",
        "cal": 650,
        "popular": true
      },
      {
        "name": "BabuMoshai Special Mutton Kosha",
        "desc": "Its not a dish but an emotion of Bengali cuisine. A rich, flavourful spicy semi dry tender meat curry made with home-fed special powder dry spices seasoned with garam masala.",
        "price": 42,
        "veg": false,
        "spice": "Hot",
        "cal": 600,
        "popular": false
      },
      {
        "name": "Bhuna Mutton",
        "desc": "A delicious, flavorful, slow-cooked mutton dish prepared with an aromatic spiced gravy and condiments where its tenderness and the flavors are well-developed.",
        "price": 44,
        "veg": false,
        "spice": "Medium",
        "cal": 550,
        "popular": false
      }
    ]
  },
  {
    "name": "Mains Non-veg (fish)",
    "items": [
      {
        "name": "Shorshe Dimer Kaliya",
        "desc": "A very popular dish, prepared with boiled eggs cooked in a rich aromatic mustard gravy.",
        "price": 27,
        "veg": false,
        "spice": "Medium",
        "cal": 400,
        "popular": false
      },
      {
        "name": "Rui Kaliya",
        "desc": "Rohu fried and cooked in mustard oil and sliced onion and home-made spices.",
        "price": 31,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Doi Katla",
        "desc": "Doi Katla, also called as Doi Mach, is a very traditional dish of Bengali cuisine. Katla fish prepared in mild gravy made with curd, cashew and home made spices.",
        "price": 35,
        "veg": false,
        "spice": "Mild",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Pabda Macher Jhal",
        "desc": "A flavourful Bengali fish curry lightly cooked with pabda fish and very minimal spices and oil.",
        "price": 42,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Aam Pabda Shorshe",
        "desc": "Signature mouthwatering dish from BabuMoshai. Pabda is fried in mustard oil and cooked with fine slices of raw mango, mustard paste and simmered to perfection.",
        "price": 42,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Shorshe Ilish",
        "desc": "All time classic recipe beyond Bengal where Hilsa fish is cooked with Nigella seeds cooked in mustard paste and green chillies.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Bhapa Ilish",
        "desc": "A delicious steamed preparation from Bengal, loved by all not just Bengalis. Sliced Ilish marinated with kasundi, mustard paste, green chillis steamed well and paired with hot steamed rice.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": true
      },
      {
        "name": "Ilish Aam Tel Jhol",
        "desc": "A traditional Bengali dish that combines the rich flavor of Hilsa fish and the tantalizing sweetness of raw mango in a light mustard oil-based curry.",
        "price": 46,
        "veg": false,
        "spice": "Mild",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Bhetki Paturi",
        "desc": "A delicious all time favourite Bengali dish. Bhetki fish fillet coated in paste and wrapped in banana leaves to steam.",
        "price": 39,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Morola Tomato Jhal",
        "desc": "A delicious Bengali dish with small Indian morola fish cooked with tomatoes and aromatic spices, bursting with freshness.",
        "price": 35,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Prawn Malaikari",
        "desc": "An authentic special preparation from Bengal. Prawn cooked in rich creamy coconut based curry.",
        "price": 52,
        "veg": false,
        "spice": "Mild",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Narkel Shorshe Chingri",
        "desc": "Prawns cooked in a mustard and coconut based creamy semi-dry curry that combines creamy texture and distinctive pungent flavour.",
        "price": 52,
        "veg": false,
        "spice": "Medium",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Daab Chingri",
        "desc": "A speciality item from BabuMoshai, tastes simply preparing. Prawns marinated in mustard paste and in-house spices stuffed in coconut and baked in charcoal.",
        "price": 52,
        "veg": false,
        "spice": "Medium",
        "cal": 250,
        "popular": false
      },
      {
        "name": "Echor Chingri",
        "desc": "A classic Bengali delicacy made of shrimps (chingri) and tender jackfruit (echor) and other home made spices, cooked in mustard oil and finished with ghee and garam masala.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Mocha Chingri",
        "desc": "A classic Bengali delicacy made of chopped banana blossom and shrimps (chingri) with coconut and other home made spices finished with ghee and garam masala.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 300,
        "popular": false
      },
      {
        "name": "Bhuna Chingri",
        "desc": "A delicious and flavorful Bengali-style dish made with prawns that are cooked in a rich, spiced gravy.",
        "price": 52,
        "veg": false,
        "spice": "Medium",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Chital Petir Jhal",
        "desc": "A classic Bengali delicacy is a spicy fish curry made with the inner part of chital, providing a rich and flavorful experience.",
        "price": 36,
        "veg": false,
        "spice": "Hot",
        "cal": 350,
        "popular": false
      },
      {
        "name": "Chital Macher Muitha",
        "desc": "A Traditional Bengali delicacy made with a grounded fish paste along with spices, herbs, onion, garlic deep fried, simmered and cooked in a flavourful in-house curry gravy.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 380,
        "popular": false
      },
      {
        "name": "Chital Petir Roast",
        "desc": "A Traditional Bengali delicacy made with chital fish along with herbs and a spiced gravy until it melts in your mouth.",
        "price": 38,
        "veg": false,
        "spice": "Medium",
        "cal": 380,
        "popular": false
      },
      {
        "name": "Kankra Jhal (As per availability)",
        "desc": "A Traditional Bengali delicacy that features crab cooked in a spicy and flavourful sauce.",
        "price": 45,
        "veg": false,
        "spice": "Hot",
        "cal": 400,
        "popular": false
      },
      {
        "name": "Potoler Dolma",
        "desc": "The word Dolma means stuffed. This classic dish is filled with coconut, dryfruits, in-house spices and cooked in thin gravy.",
        "price": 40,
        "veg": false,
        "spice": "Medium",
        "cal": 380,
        "popular": false
      }
    ]
  },
  {
    "name": "Chutney",
    "items": [
      {
        "name": "Aamsotto Khejurer Chutney (Seasonal)",
        "desc": "A sweet and tangy dryfruits chutney seasoned with panchphoran and whole red chilli cooked in sugar.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 370,
        "popular": false
      },
      {
        "name": "Pepe Chutney (Seasonal)",
        "desc": "A mouthwatering papaya chutney also known as plastic chutney made of sliced green papaya, seasoned with Nigella seeds and cooked in sugar and lime syrup.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 350,
        "popular": false
      },
      {
        "name": "Amer Chutney",
        "desc": "A traditional Bengali summer special thin runny raw mango chutney, flavoured with panch phoron and whole red chilli.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 600,
        "popular": false
      },
      {
        "name": "Tomato Chutney",
        "desc": "A sweet and tangy condiment commonly enjoyed in Bengali cuisine. It is made with ripe tomatoes, dryfruits, are cooked in sugar syrup, vinegar and often flavored with spices like mustard seeds, dried red chillies, and fennel seeds.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 700,
        "popular": true
      }
    ]
  },
  {
    "name": "Salad",
    "items": [
      {
        "name": "Kasundi Kachumber Salad",
        "desc": "Chopped veggies mixed with mustard sauce.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 450,
        "popular": false
      },
      {
        "name": "Garden Fresh Green Salad",
        "desc": "Assorted fresh cut green veggies.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 350,
        "popular": true
      }
    ]
  },
  {
    "name": "Beverage",
    "items": [
      {
        "name": "Natural Mineral Water | Small",
        "desc": "",
        "price": 6,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": true
      },
      {
        "name": "Non - Carbonated Natural Mineral Water | Big",
        "desc": "",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Sparkling Water",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 250,
        "popular": false
      },
      {
        "name": "Plain Soda",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Masala Thums Up",
        "desc": "A spiced beverage prepared by adding thumsup, spices, herbs and lemon curl flavours to enhance the taste, giving a unique zesty twist.",
        "price": 14,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Fresh Lime Soda",
        "desc": "All time favourite fresh lemon drink mixed with sugar, soda, and served with fresh mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": true
      },
      {
        "name": "Smoked Aam Panna",
        "desc": "A delightful smoky and tangy drink prepared with raw smoked mangoes, sugar and spices.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Gondhoraj Lebur Ghol",
        "desc": "A Bengali aromatic beverage, blend of Gondhoraj (kaffir lime) lemon and yoghurt. It gives a refreshing and citrusy summer cooler drink.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": true
      },
      {
        "name": "Mojito Breeze",
        "desc": "Fresh mint leaves are muddled with zesty lime and a touch of simple syrup, creating a vibrant fresh taste.",
        "price": 16,
        "veg": true,
        "spice": "Mild",
        "cal": 80,
        "popular": true
      },
      {
        "name": "Masala Chaach",
        "desc": "Masala Chaach is a refreshing spiced buttermilk made of yogurt, water, cumin, coriander or mint.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 120,
        "popular": false
      },
      {
        "name": "Thumsup",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 70,
        "popular": true
      },
      {
        "name": "Coke",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Sprite",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 250,
        "popular": true
      },
      {
        "name": "Zero Coke",
        "desc": "",
        "price": 10,
        "veg": true,
        "spice": "Mild",
        "cal": 60,
        "popular": false
      }
    ]
  },
  {
    "name": "Dessert",
    "items": [
      {
        "name": "Chaanar Payesh",
        "desc": "Cottage cheese cooked in evaporated milk finished with cardamom powder.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": false
      },
      {
        "name": "Mishti Doi",
        "desc": "Classic sweet dish from Bengali household where milk is boiled with sugar and formed into yogurt due to the caramelizing technique.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 100,
        "popular": false
      },
      {
        "name": "Nolen Gurer Sandesh",
        "desc": "Quite literally, a sweet ruling heart of everyone. A rich creamy cottage cheese mixed and cooked with dates and jaggery popularly known as 'Nolen Gur'.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 50,
        "popular": true
      },
      {
        "name": "Gajar ka Halwa (Seasonal)",
        "desc": "A very popular traditional quintessential traditional sweet treat prepared with liberal fresh red carrot in ghee, sugar finished with dash of green cardamom and garnished with dryfruits.",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      },
      {
        "name": "Nolen Gurer Rosogolla (Seasonal)",
        "desc": "A traditional Bengali dessert made with chana and flavoured with nolen gur (date palm jaggery).",
        "price": 15,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      }
    ]
  },
  {
    "name": "Ice Cream",
    "items": [
      {
        "name": "Vanilla",
        "desc": "A classic and timeless desert made with a base of cream, sugar and vanilla extract.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 300,
        "popular": false
      },
      {
        "name": "Chocolate",
        "desc": "A rich and indulgent frozen treat made with cocoa, sugar, cream and milk.",
        "price": 12,
        "veg": true,
        "spice": "Mild",
        "cal": 150,
        "popular": true
      },
      {
        "name": "BabuMoshai Special Nolen Gurer Ice-cream Floats (Seasonal)",
        "desc": "Authentic Ice Cream made with milk and milk fudge ice cream perfumed with the scent of nolen gur.",
        "price": 22,
        "veg": true,
        "spice": "Mild",
        "cal": 200,
        "popular": false
      }
    ]
  }
];