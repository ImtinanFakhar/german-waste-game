import React, { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Recycle, AlertCircle, MapPin, Info, Play, Trophy, AlertTriangle, RotateCcw } from 'lucide-react';

const GermanWasteGame = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrashItem, setCurrentTrashItem] = useState(null);
  const [score, setScore] = useState(0);
  const [fines, setFines] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [gameStats, setGameStats] = useState({ correct: 0, wrong: 0 });
  const [isThrowingAnimation, setIsThrowingAnimation] = useState(false);
  const [thrownItem, setThrownItem] = useState(null);
  const [characterState, setCharacterState] = useState('idle'); // idle, throwing, celebrating, disappointed
  const [celebration, setCelebration] = useState(null);
  const [streak, setStreak] = useState(0);
  const [confetti, setConfetti] = useState([]);

  // City data structure
  const cityData = {
    berlin: {
      name: 'Berlin',
      authority: 'BSR (Berliner Stadtreinigung)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Wertstofftonne',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_packaging', 'plastic_bottles', 'plastic_containers', 'detergent_bottles', 'aluminum_materials', 'bottle_caps', 'candy_wrappers', 'toothpaste_tubes']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin', 
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_bags', 'envelopes', 'magazines', 'toilet_paper_rolls', 'egg_cartons', 'greeting_cards', 'notebooks', 'shoe_boxes']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤', 
          keywords: ['fruit_scraps', 'food_leftovers', 'coffee_grounds', 'garden_waste', 'kitchen_scraps', 'expired_food', 'fish_bones', 'nut_shells', 'bread_crusts', 'salad_leftovers']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_ceramics', 'cigarette_butts', 'vacuum_bags', 'cat_litter', 'bandages', 'cotton_swabs', 'makeup_wipes', 'light_bulbs', 'corks']
        },
        {
          id: 'glass',
          color: 'Glass',
          name: 'Glass Recycling',
          icon: '🫙',
          keywords: ['glass_jars', 'wine_bottles', 'food_containers_glass', 'perfume_bottles', 'olive_oil_bottles', 'food_jars']
        }
      ]
    },
    munich: {
      name: 'Munich',
      authority: 'AWM München',
      bins: [
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'office_paper']
        },
        {
          id: 'brown',
          color: 'Brown', 
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['vegetable_scraps', 'cooked_food', 'garden_waste', 'coffee_grounds']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'dirty_packaging']
        },
        {
          id: 'recycling_island',
          color: 'Yellow',
          name: 'Recycling Island',
          icon: '♻️',
          keywords: ['plastic_packaging', 'metal_cans', 'glass_jars', 'composite_materials']
        }
      ]
    },
    hamburg: {
      name: 'Hamburg',
      authority: 'SRH Hamburg', 
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Wertstofftonne',
          icon: '🟡',
          keywords: ['plastic_packaging', 'plastic_toys', 'metal_packaging', 'plastic_buckets', 'plastic_containers', 'frozen_food_bags', 'detergent_bottles', 'aluminum_materials', 'plastic_hangers', 'old_tupperware']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵', 
          keywords: ['newspapers', 'cardboard_packaging', 'office_paper', 'paper_bags', 'magazines', 'paper_towel_rolls', 'receipts_clean', 'greeting_cards', 'shoe_boxes', 'notebooks']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'expired_food', 'meat_scraps', 'fruit_pits', 'herb_stems', 'nut_shells', 'vegetable_scraps', 'organic_leftovers']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_ceramics', 'mixed_materials', 'cat_litter', 'dust_bags', 'feminine_products', 'contact_lenses', 'nail_clippings', 'dental_floss', 'hair_clippings']
        },
        {
          id: 'glass',
          color: 'Glass',
          name: 'Glass Collection',
          icon: '🫙',
          keywords: ['glass_containers', 'food_jars', 'wine_bottles', 'perfume_bottles', 'olive_oil_bottles']
        }
      ]
    },
    cologne: {
      name: 'Cologne (Köln)',
      authority: 'AWB (Abfallwirtschaftsbetriebe Köln)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_packaging', 'aluminum_containers']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_packaging', 'office_paper', 'paper_bags']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['food_scraps', 'garden_clippings', 'organic_waste', 'natural_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'mixed_materials', 'damaged_goods', 'non_recyclable_items']
        }
      ]
    },
    frankfurt: {
      name: 'Frankfurt am Main',
      authority: 'FES (FrankfurtEntsorgungs und Service GmbH)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bin/Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_packaging', 'styrofoam_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'books_catalogs']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'coffee_filters']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'rubber_items', 'broken_household', 'cold_ashes']
        }
      ]
    },
    stuttgart: {
      name: 'Stuttgart',
      authority: 'AWS (Abfallwirtschaft Stuttgart)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bin',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_cans', 'composite_packaging', 'styrofoam_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_flattened', 'paper_packaging', 'books_catalogs']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_leaves', 'food_leftovers', 'coffee_grounds']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_ceramics', 'rubber_items', 'mixed_materials']
        }
      ]
    },
    dusseldorf: {
      name: 'Düsseldorf',
      authority: 'AWISTA (Abfallwirtschaft Düsseldorf)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_materials', 'aluminum_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_packaging', 'office_paper', 'paper_bags']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['food_scraps', 'garden_waste', 'organic_materials', 'compostable_items']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'mixed_materials', 'broken_items', 'non_recyclable_items']
        }
      ]
    },
    leipzig: {
      name: 'Leipzig',
      authority: 'Stadtreinigung Leipzig',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bin',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_packaging', 'aluminum_containers']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'office_paper']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'organic_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'mixed_materials', 'non_recyclable_waste']
        }
      ]
    },
    dortmund: {
      name: 'Dortmund',
      authority: 'EDG (Entsorgung Dortmund GmbH)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_materials', 'styrofoam_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_packaging', 'paper_bags', 'books_catalogs']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['food_scraps', 'garden_clippings', 'organic_leftovers', 'compostable_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_ceramics', 'mixed_materials', 'non_recyclable_items']
        }
      ]
    },
    essen: {
      name: 'Essen',
      authority: 'EBE (Entsorgungsbetriebe Essen)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_cans', 'composite_packaging', 'aluminum_materials']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'office_paper']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'organic_waste']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'mixed_materials', 'non_recyclable_items']
        }
      ]
    },
    dresden: {
      name: 'Dresden',
      authority: 'SRD (Stadtreinigung Dresden)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bin',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_materials', 'aluminum_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_packaging', 'paper_bags', 'books']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['food_scraps', 'garden_waste', 'organic_leftovers', 'natural_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'mixed_materials', 'non_recyclable_waste']
        }
      ]
    },
    hannover: {
      name: 'Hannover',
      authority: 'aha (Zweckverband Abfallwirtschaft Region Hannover)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_packaging', 'aluminum_containers']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'office_paper']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'compostable_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'mixed_materials', 'non_recyclable_waste']
        }
      ]
    },
    nuremberg: {
      name: 'Nuremberg (Nürnberg)',
      authority: 'ASN (Abfallwirtschafts- und Stadtreinigungsbetrieb Nürnberg)',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bag',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_packaging', 'composite_materials', 'styrofoam_packaging']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard_packaging', 'paper_bags', 'books_catalogs']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['food_scraps', 'garden_clippings', 'organic_leftovers', 'natural_materials']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_ceramics', 'mixed_materials', 'non_recyclable_items']
        }
      ]
    },
    bremen: {
      name: 'Bremen',
      authority: 'Die Bremer Stadtreinigung',
      bins: [
        {
          id: 'yellow',
          color: 'Yellow',
          name: 'Yellow Bin',
          icon: '🟡',
          keywords: ['plastic_packaging', 'metal_cans', 'composite_packaging', 'aluminum_materials']
        },
        {
          id: 'blue',
          color: 'Blue',
          name: 'Paper Bin',
          icon: '🔵',
          keywords: ['newspapers', 'cardboard', 'paper_packaging', 'office_paper']
        },
        {
          id: 'brown',
          color: 'Brown',
          name: 'Organic Bin',
          icon: '🟤',
          keywords: ['kitchen_scraps', 'garden_waste', 'food_leftovers', 'compostable_items']
        },
        {
          id: 'grey',
          color: 'Grey',
          name: 'Residual Waste',
          icon: '⚫',
          keywords: ['hygiene_products', 'broken_items', 'mixed_materials', 'non_recyclable_items']
        }
      ]
    }
  };

  // Trash items with massive everyday expansion
  const trashItems = {
    // Yellow bin items (Packaging)
    plastic_packaging: { name: 'Yogurt Cup', emoji: '🥛', correctBin: 'yellow', description: 'Plastic food container' },
    metal_packaging: { name: 'Tin Can', emoji: '🥫', correctBin: 'yellow', description: 'Metal food can' },
    composite_packaging: { name: 'Tetra Pak', emoji: '🧃', correctBin: 'yellow', description: 'Milk/juice carton' },
    plastic_bottles: { name: 'Shampoo Bottle', emoji: '🧴', correctBin: 'yellow', description: 'Plastic bottle (no Pfand)' },
    aluminum_containers: { name: 'Aluminum Tray', emoji: '🍱', correctBin: 'yellow', description: 'Ready meal container' },
    aluminum_packaging: { name: 'Aluminum Foil', emoji: '🌯', correctBin: 'yellow', description: 'Kitchen foil wrap' },
    styrofoam_packaging: { name: 'Takeaway Box', emoji: '🍟', correctBin: 'yellow', description: 'Fast food container' },
    aluminum_materials: { name: 'Drink Can', emoji: '🥤', correctBin: 'yellow', description: 'Soda can (no Pfand)' },
    composite_materials: { name: 'Chip Bag', emoji: '🍟', correctBin: 'yellow', description: 'Snack packaging' },
    metal_cans: { name: 'Soup Can', emoji: '🍲', correctBin: 'yellow', description: 'Canned food container' },
    
    // More Yellow bin everyday items
    plastic_containers: { name: 'Butter Tub', emoji: '🧈', correctBin: 'yellow', description: 'Plastic food container' },
    bottle_caps: { name: 'Bottle Cap', emoji: '🔴', correctBin: 'yellow', description: 'Plastic bottle lid' },
    plastic_wrap: { name: 'Cling Film', emoji: '📦', correctBin: 'yellow', description: 'Food wrapping plastic' },
    detergent_bottles: { name: 'Detergent Bottle', emoji: '🧽', correctBin: 'yellow', description: 'Cleaning product bottle' },
    yogurt_lids: { name: 'Yogurt Lid', emoji: '🥛', correctBin: 'yellow', description: 'Aluminum foil lid' },
    candy_wrappers: { name: 'Candy Wrapper', emoji: '🍬', correctBin: 'yellow', description: 'Plastic/foil sweet wrapper' },
    frozen_food_bags: { name: 'Frozen Food Bag', emoji: '🧊', correctBin: 'yellow', description: 'Plastic freezer bag' },
    toothpaste_tubes: { name: 'Toothpaste Tube', emoji: '🦷', correctBin: 'yellow', description: 'Plastic/composite tube' },
    
    // Blue bin items (Paper)
    newspapers: { name: 'Newspaper', emoji: '📰', correctBin: 'blue', description: 'Daily news paper' },
    cardboard: { name: 'Amazon Box', emoji: '📦', correctBin: 'blue', description: 'Delivery cardboard' },
    paper_bags: { name: 'Paper Bag', emoji: '🛍️', correctBin: 'blue', description: 'Shopping bag' },
    envelopes: { name: 'Mail Envelope', emoji: '✉️', correctBin: 'blue', description: 'Letter envelope' },
    cardboard_packaging: { name: 'Cereal Box', emoji: '🥣', correctBin: 'blue', description: 'Food packaging' },
    office_paper: { name: 'Printer Paper', emoji: '📄', correctBin: 'blue', description: 'Office documents' },
    paper_packaging: { name: 'Gift Wrap', emoji: '🎁', correctBin: 'blue', description: 'Wrapping paper' },
    books_catalogs: { name: 'Old Book', emoji: '📚', correctBin: 'blue', description: 'Used book' },
    cardboard_flattened: { name: 'Pizza Box', emoji: '🍕', correctBin: 'blue', description: 'Clean pizza box' },
    
    // More Blue bin everyday items
    magazines: { name: 'Fashion Magazine', emoji: '💄', correctBin: 'blue', description: 'Glossy magazine' },
    toilet_paper_rolls: { name: 'TP Roll', emoji: '🧻', correctBin: 'blue', description: 'Cardboard tube' },
    egg_cartons: { name: 'Egg Carton', emoji: '🥚', correctBin: 'blue', description: 'Paper egg packaging' },
    paper_towel_rolls: { name: 'Paper Towel Roll', emoji: '🧻', correctBin: 'blue', description: 'Kitchen roll tube' },
    greeting_cards: { name: 'Birthday Card', emoji: '🎂', correctBin: 'blue', description: 'Paper greeting card' },
    receipts_clean: { name: 'Shopping Receipt', emoji: '🧾', correctBin: 'blue', description: 'Store receipt (non-thermal)' },
    notebooks: { name: 'School Notebook', emoji: '📓', correctBin: 'blue', description: 'Used notebook' },
    shoe_boxes: { name: 'Shoe Box', emoji: '👟', correctBin: 'blue', description: 'Cardboard shoe packaging' },
    
    // Brown bin items (Organic)
    fruit_scraps: { name: 'Apple Core', emoji: '🍎', correctBin: 'brown', description: 'Fruit waste' },
    food_leftovers: { name: 'Stale Bread', emoji: '🍞', correctBin: 'brown', description: 'Old bakery items' },
    coffee_grounds: { name: 'Coffee Grounds', emoji: '☕', correctBin: 'brown', description: 'Used coffee' },
    garden_waste: { name: 'Dead Roses', emoji: '🥀', correctBin: 'brown', description: 'Wilted flowers' },
    kitchen_scraps: { name: 'Potato Peels', emoji: '🥔', correctBin: 'brown', description: 'Vegetable waste' },
    garden_clippings: { name: 'Grass Clippings', emoji: '🌱', correctBin: 'brown', description: 'Lawn mowing waste' },
    organic_waste: { name: 'Banana Peel', emoji: '🍌', correctBin: 'brown', description: 'Fruit skin' },
    natural_materials: { name: 'Eggshells', emoji: '🥚', correctBin: 'brown', description: 'Broken eggshells' },
    compostable_items: { name: 'Tea Bag', emoji: '🫖', correctBin: 'brown', description: 'Used tea bag' },
    organic_materials: { name: 'Orange Peel', emoji: '🍊', correctBin: 'brown', description: 'Citrus waste' },
    coffee_filters: { name: 'Coffee Filter', emoji: '☕', correctBin: 'brown', description: 'Paper filter' },
    garden_leaves: { name: 'Autumn Leaves', emoji: '🍂', correctBin: 'brown', description: 'Fallen leaves' },
    organic_leftovers: { name: 'Spaghetti Leftovers', emoji: '🍝', correctBin: 'brown', description: 'Leftover pasta' },
    vegetable_scraps: { name: 'Onion Skins', emoji: '🧅', correctBin: 'brown', description: 'Vegetable peels' },
    cooked_food: { name: 'Old Rice', emoji: '🍚', correctBin: 'brown', description: 'Leftover grains' },
    
    // More Brown bin everyday items
    expired_food: { name: 'Moldy Cheese', emoji: '🧀', correctBin: 'brown', description: 'Spoiled food' },
    fish_bones: { name: 'Fish Bones', emoji: '🐟', correctBin: 'brown', description: 'Food remains' },
    meat_scraps: { name: 'Chicken Bones', emoji: '🍗', correctBin: 'brown', description: 'Meat waste' },
    nut_shells: { name: 'Walnut Shells', emoji: '🌰', correctBin: 'brown', description: 'Nut casings' },
    fruit_pits: { name: 'Cherry Pits', emoji: '🍒', correctBin: 'brown', description: 'Fruit stones' },
    herb_stems: { name: 'Herb Stems', emoji: '🌿', correctBin: 'brown', description: 'Cooking herbs' },
    salad_leftovers: { name: 'Wilted Lettuce', emoji: '🥬', correctBin: 'brown', description: 'Old salad' },
    bread_crusts: { name: 'Bread Crusts', emoji: '🍞', correctBin: 'brown', description: 'Leftover crusts' },
    
    // Grey bin items (Residual waste)
    hygiene_products: { name: 'Used Tissue', emoji: '🤧', correctBin: 'grey', description: 'Dirty tissue' },
    broken_ceramics: { name: 'Broken Mug', emoji: '☕', correctBin: 'grey', description: 'Shattered ceramic' },
    cigarette_butts: { name: 'Cigarette Butt', emoji: '🚬', correctBin: 'grey', description: 'Tobacco waste' },
    vacuum_bags: { name: 'Vacuum Bag', emoji: '🧹', correctBin: 'grey', description: 'Used cleaner bag' },
    mixed_materials: { name: 'Broken Pen', emoji: '🖊️', correctBin: 'grey', description: 'Mixed plastic/metal' },
    broken_items: { name: 'Cracked Phone Case', emoji: '📱', correctBin: 'grey', description: 'Damaged plastic' },
    non_recyclable_items: { name: 'Chewing Gum', emoji: '🫧', correctBin: 'grey', description: 'Sticky waste' },
    damaged_goods: { name: 'Torn Sock', emoji: '🧦', correctBin: 'grey', description: 'Damaged textile' },
    rubber_items: { name: 'Rubber Gloves', emoji: '🧤', correctBin: 'grey', description: 'Cleaning gloves' },
    broken_household: { name: 'Broken Glass', emoji: '🔍', correctBin: 'grey', description: 'Window glass' },
    cold_ashes: { name: 'Fireplace Ashes', emoji: '🔥', correctBin: 'grey', description: 'Cold ash' },
    non_recyclable_waste: { name: 'Dirty Diaper', emoji: '👶', correctBin: 'grey', description: 'Baby waste' },
    
    // More Grey bin everyday items
    cat_litter: { name: 'Cat Litter', emoji: '🐱', correctBin: 'grey', description: 'Pet waste' },
    dust_bags: { name: 'Dust from Vacuum', emoji: '💨', correctBin: 'grey', description: 'Household dust' },
    bandages: { name: 'Used Bandage', emoji: '🩹', correctBin: 'grey', description: 'Medical waste' },
    cotton_swabs: { name: 'Cotton Swabs', emoji: '👂', correctBin: 'grey', description: 'Personal care' },
    dental_floss: { name: 'Dental Floss', emoji: '🦷', correctBin: 'grey', description: 'Oral hygiene' },
    makeup_wipes: { name: 'Makeup Wipes', emoji: '💄', correctBin: 'grey', description: 'Cosmetic waste' },
    hair_clippings: { name: 'Hair Clippings', emoji: '💇', correctBin: 'grey', description: 'Cut hair' },
    nail_clippings: { name: 'Nail Clippings', emoji: '💅', correctBin: 'grey', description: 'Trimmed nails' },
    contact_lenses: { name: 'Contact Lens', emoji: '👁️', correctBin: 'grey', description: 'Used contacts' },
    feminine_products: { name: 'Sanitary Pad', emoji: '🩸', correctBin: 'grey', description: 'Hygiene product' },
    
    // Special everyday items
    light_bulbs: { name: 'LED Bulb', emoji: '💡', correctBin: 'grey', description: 'Old light bulb' },
    batteries_small: { name: 'AA Battery', emoji: '🔋', correctBin: 'grey', description: 'Dead battery (should go to collection point)' },
    old_medicine: { name: 'Expired Pills', emoji: '💊', correctBin: 'grey', description: 'Old medication (should go to pharmacy)' },
    corks: { name: 'Wine Cork', emoji: '🍷', correctBin: 'grey', description: 'Natural cork' },
    candle_wax: { name: 'Old Candle', emoji: '🕯️', correctBin: 'grey', description: 'Burnt candle' },
    
    // Glass items (Glass containers)
    glass_jars: { name: 'Jam Jar', emoji: '🍯', correctBin: 'glass', description: 'Empty food jar' },
    wine_bottles: { name: 'Wine Bottle', emoji: '🍷', correctBin: 'glass', description: 'Empty wine bottle' },
    food_containers_glass: { name: 'Pickle Jar', emoji: '🥒', correctBin: 'glass', description: 'Glass food container' },
    glass_containers: { name: 'Sauce Jar', emoji: '🫙', correctBin: 'glass', description: 'Condiment jar' },
    food_jars: { name: 'Baby Food Jar', emoji: '🍼', correctBin: 'glass', description: 'Small glass jar' },
    perfume_bottles: { name: 'Perfume Bottle', emoji: '💐', correctBin: 'glass', description: 'Glass cosmetic bottle' },
    olive_oil_bottles: { name: 'Oil Bottle', emoji: '🫒', correctBin: 'glass', description: 'Cooking oil bottle' },
    
    // Special items for Hamburg (non-packaging allowed in yellow)
    plastic_toys: { name: 'Broken Toy', emoji: '🧸', correctBin: 'yellow', description: 'Plastic toy (Hamburg only)' },
    plastic_buckets: { name: 'Old Bucket', emoji: '🪣', correctBin: 'yellow', description: 'Plastic container (Hamburg only)' },
    plastic_hangers: { name: 'Clothes Hanger', emoji: '👔', correctBin: 'yellow', description: 'Plastic hanger (Hamburg only)' },
    old_tupperware: { name: 'Tupperware', emoji: '📦', correctBin: 'yellow', description: 'Plastic storage (Hamburg only)' }
  };

  // Get available trash items for selected city
  const getAvailableTrashItems = () => {
    if (!selectedCity || !cityData[selectedCity]) return [];
    
    const cityBins = cityData[selectedCity].bins;
    const availableItems = [];
    
    cityBins.forEach(bin => {
      bin.keywords.forEach(keyword => {
        if (trashItems[keyword]) {
          availableItems.push({
            ...trashItems[keyword],
            id: keyword,
            correctBin: bin.id === 'recycling_island' ? 'yellow' : bin.id
          });
        }
      });
    });
    
    return availableItems;
  };

  // Generate random trash item
  const generateTrashItem = () => {
    const availableItems = getAvailableTrashItems();
    if (availableItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    return availableItems[randomIndex];
  };

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setFines(0);
    setRound(1);
    setGameStats({ correct: 0, wrong: 0 });
    setFeedback(null);
    setCharacterState('idle');
    setStreak(0);
    setCelebration(null);
    setConfetti([]);
    setCurrentTrashItem(generateTrashItem());
  };

  // Create confetti particles
  const createConfetti = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)],
        speed: 2 + Math.random() * 3
      });
    }
    setConfetti(particles);
    
    // Remove confetti after animation
    setTimeout(() => setConfetti([]), 3000);
  };

  // Create celebration effects
  const createCelebration = (points, isStreak = false) => {
    setCelebration({
      points,
      isStreak,
      id: Date.now(),
      soundEffect: ['🎵', '🎶', '🔊', '🎺', '🎯'][Math.floor(Math.random() * 5)]
    });
    
    // Remove celebration after animation
    setTimeout(() => setCelebration(null), 2000);
  };

  // Handle bin selection with throwing animation and celebrations
  const handleBinSelection = (binId) => {
    if (!currentTrashItem || isThrowingAnimation) return;
    
    setIsThrowingAnimation(true);
    setCharacterState('throwing');
    setThrownItem({
      ...currentTrashItem,
      targetBin: binId,
      isCorrect: currentTrashItem.correctBin === binId
    });

    // Simulate throwing animation
    setTimeout(() => {
      const isCorrect = currentTrashItem.correctBin === binId;
      
      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        
        // Calculate points with streak bonus
        let points = 10;
        let bonusPoints = 0;
        
        if (newStreak >= 5) {
          bonusPoints = Math.floor(newStreak / 5) * 5; // Bonus every 5 streak
          points += bonusPoints;
        }
        
        setScore(score + points);
        setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        setCharacterState('celebrating');
        
        // Create celebration effects
        createCelebration(points, newStreak >= 5);
        if (newStreak >= 3) {
          createConfetti();
        }
        
        // Enhanced feedback messages
        let message = `Perfect throw! ${currentTrashItem.name} belongs in ${getBinName(binId)}!`;
        let celebrationEmoji = '🎯';
        
        if (newStreak >= 10) {
          message = `🔥 AMAZING! ${newStreak}-streak master! That's +${points} points!`;
          celebrationEmoji = '👑';
        } else if (newStreak >= 5) {
          message = `🌟 Fantastic ${newStreak}-streak! Bonus points earned!`;
          celebrationEmoji = '⭐';
        } else if (newStreak >= 3) {
          message = `🎉 Great ${newStreak}-streak going! Keep it up!`;
          celebrationEmoji = '🎊';
        }
        
        setFeedback({
          type: 'success',
          message: message,
          points: `+${points} points`,
          emoji: celebrationEmoji,
          streak: newStreak
        });
      } else {
        setStreak(0); // Reset streak on wrong answer
        setFines(fines + 100);
        setGameStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        setCharacterState('disappointed');
        
        setFeedback({
          type: 'error',
          message: `❌ Oops! ${currentTrashItem.name} should go to ${getBinName(currentTrashItem.correctBin)}!`,
          fine: '+100€ fine',
          emoji: '😞'
        });
      }

      // Reset for next round
      setTimeout(() => {
        setIsThrowingAnimation(false);
        setThrownItem(null);
        setCharacterState('idle');
        setRound(round + 1);
        setCurrentTrashItem(generateTrashItem());
        setFeedback(null);
      }, 3000); // Longer delay to show celebrations
    }, 1000);
  };

  // Get bin name by ID
  const getBinName = (binId) => {
    if (!selectedCity || !cityData[selectedCity]) return '';
    const bin = cityData[selectedCity].bins.find(b => b.id === binId);
    return bin ? bin.name : '';
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setCurrentTrashItem(null);
    setFeedback(null);
    setCharacterState('idle');
    setThrownItem(null);
    setIsThrowingAnimation(false);
    setStreak(0);
    setCelebration(null);
    setConfetti([]);
  };

  // Character component with enhanced animations
  const Character = () => {
    const getCharacterEmoji = () => {
      switch(characterState) {
        case 'throwing': return '🤾‍♂️';
        case 'celebrating': 
          if (streak >= 10) return '👑'; // Crown for big streaks
          if (streak >= 5) return '🤩'; // Star eyes for good streaks
          return '🙌'; // Regular celebration
        case 'disappointed': return '😞';
        default: return '🧍‍♂️';
      }
    };

    const getCharacterAnimation = () => {
      switch(characterState) {
        case 'throwing': return 'scale-110 rotate-12';
        case 'celebrating': 
          if (streak >= 10) return 'animate-pulse scale-125'; // Epic celebration
          if (streak >= 5) return 'animate-bounce scale-110'; // Great celebration
          return 'animate-bounce'; // Normal celebration
        case 'disappointed': return 'animate-pulse opacity-70';
        default: return '';
      }
    };

    return (
      <div className={`text-8xl transition-all duration-500 ${getCharacterAnimation()}`}>
        {getCharacterEmoji()}
        {/* Celebration effects around character */}
        {characterState === 'celebrating' && streak >= 3 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl animate-ping">✨</div>
          </div>
        )}
      </div>
    );
  };

  // Floating celebration component
  const FloatingCelebration = () => {
    if (!celebration) return null;

    return (
      <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="animate-bounce">
          <div className="text-6xl mb-2">{celebration.soundEffect}</div>
          <div className={`text-2xl font-bold ${celebration.isStreak ? 'text-yellow-600' : 'text-green-600'} 
                         animate-pulse text-center`}>
            {celebration.points > 10 ? `BONUS! +${celebration.points}` : `+${celebration.points}`}
          </div>
          {celebration.isStreak && (
            <div className="text-yellow-500 text-center text-sm font-bold animate-bounce delay-100">
              🔥 STREAK BONUS! 🔥
            </div>
          )}
        </div>
      </div>
    );
  };

  // Confetti component
  const ConfettiRain = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `rotate(${particle.rotation}deg)`,
              animationDuration: `${particle.speed}s`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          >
            {particle.color}
          </div>
        ))}
      </div>
    );
  };

  // Thrown item animation component
  const ThrownItem = () => {
    if (!thrownItem) return null;

    return (
      <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl transition-all duration-1000 ease-out ${
        isThrowingAnimation ? 'transform translate-x-32 -translate-y-16 scale-75 opacity-0' : ''
      }`}>
        {thrownItem.emoji}
      </div>
    );
  };

  const cities = Object.keys(cityData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 p-2 rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              German Waste Separation Game
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Help our character sort waste correctly! Get fined 100€ for each mistake.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!gameStarted ? (
          // Game Setup Screen
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Choose Your German City</h2>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  {cities.length} Cities Available!
                </span>
              </div>
              
              <div className="relative mb-6">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full md:w-64 p-3 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium appearance-none cursor-pointer hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Choose a city...</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {cityData[city].name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {selectedCity && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🏙️ Playing in {cityData[selectedCity].name}</h3>
                    <p className="text-green-700 text-sm mb-2">Authority: {cityData[selectedCity].authority}</p>
                    <p className="text-green-600 text-sm">Each German city has unique waste separation rules. Learn the specific regulations for your city!</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🎯 How to Play:</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Our character will hold a trash item</li>
                      <li>• Click the correct bin to make him throw it</li>
                      <li>• Watch the throwing animation!</li>
                      <li>• Get 10 points for correct sorting</li>
                      <li>• Pay 100€ fine for each mistake</li>
                      <li>• Master the city-specific rules!</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">🚨 Real Consequences in Germany:</h3>
                    <ul className="text-amber-700 text-sm space-y-1">
                      <li>• Fines range from €10-€1,500 for incorrect separation</li>
                      <li>• Your landlord can issue warnings or even terminate your lease</li>
                      <li>• Contaminated bins won't be collected</li>
                      <li>• Incorrect separation increases costs for all residents</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={startGame}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Playing in {cityData[selectedCity].name}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Game Screen
          <div className="space-y-4">
            {/* Game Stats */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-5 gap-4 flex-1">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{score}</div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{fines}€</div>
                    <div className="text-xs text-gray-600">Fines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{round}</div>
                    <div className="text-xs text-gray-600">Round</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${streak >= 5 ? 'text-yellow-600' : 'text-purple-600'} 
                                   ${streak >= 3 ? 'animate-pulse' : ''}`}>
                      {streak}🔥
                    </div>
                    <div className="text-xs text-gray-600">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-indigo-600">
                      {gameStats.correct + gameStats.wrong > 0 ? 
                        Math.round((gameStats.correct / (gameStats.correct + gameStats.wrong)) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
                
                <button
                  onClick={resetGame}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </button>
              </div>
              
              {/* Streak achievements */}
              {streak >= 5 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-center">
                    <span className="text-yellow-800 font-bold text-sm">
                      {streak >= 10 ? '👑 WASTE SORTING MASTER!' : 
                       streak >= 8 ? '⭐ SORTING CHAMPION!' : 
                       '🌟 ON FIRE! Streak Bonus Active!'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Game Arena */}
            <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-xl shadow-lg p-6 min-h-96 relative overflow-hidden">
              {/* Confetti Rain */}
              <ConfettiRain />
              
              {/* Floating Celebration */}
              <FloatingCelebration />
              
              {/* Character and Current Item */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <Character />
                  <ThrownItem />
                </div>
                
                {currentTrashItem && (
                  <div className="text-center bg-white bg-opacity-90 rounded-lg p-4 shadow-md max-w-xs">
                    <div className="text-4xl mb-2">{currentTrashItem.emoji}</div>
                    <div className="font-bold text-gray-800">{currentTrashItem.name}</div>
                    <div className="text-sm text-gray-600">{currentTrashItem.description}</div>
                    {streak >= 3 && (
                      <div className="text-xs text-yellow-600 font-bold mt-1">
                        🔥 {streak}-Streak Active!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Feedback */}
              {feedback && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-10 max-w-sm ${
                  feedback.type === 'success' 
                    ? 'bg-green-100 border-2 border-green-400' 
                    : 'bg-red-100 border-2 border-red-400'
                }`}>
                  <div className={`flex items-center gap-2 ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <span className="text-2xl">{feedback.emoji}</span>
                    <div>
                      <span className="font-medium text-sm">{feedback.message}</span>
                      <div className={`text-sm mt-1 font-bold ${
                        feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {feedback.points || feedback.fine}
                      </div>
                      {feedback.streak >= 5 && (
                        <div className="text-yellow-600 text-xs font-bold">
                          🎉 {feedback.streak}-Streak Bonus!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bins (Targets) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
                {cityData[selectedCity].bins.map((bin) => (
                  <button
                    key={bin.id}
                    onClick={() => handleBinSelection(bin.id)}
                    disabled={isThrowingAnimation}
                    className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-200 ${
                      isThrowingAnimation ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer active:scale-95'
                    } ${thrownItem && thrownItem.targetBin === bin.id ? 'ring-4 ring-blue-400 animate-pulse' : ''}`}
                  >
                    <div className="text-3xl mb-2">{bin.icon}</div>
                    <div className="text-xs font-semibold text-gray-800 mb-1">
                      {bin.color}
                    </div>
                    <div className="text-xs text-gray-600">
                      {bin.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* City Info */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    Playing in {cityData[selectedCity].name}
                  </h3>
                  <p className="text-sm opacity-90">
                    Authority: {cityData[selectedCity].authority}
                  </p>
                </div>
                <div className="text-right text-sm opacity-90">
                  <div>Master the local rules!</div>
                  <div>Each city is different 🏙️</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GermanWasteGame;
