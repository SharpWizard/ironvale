// Which models get baked, into which pack, at what size, with which animations.
// h = height, fit = footprint width, len = length (projectiles); max = triangle budget
// rx/ry = rotation fix before baking; split = file is a set of separate models
(() => {
  const W = { walk: ['Walk', 10], run: ['Run', 8], idle: [['Idle_Neutral', 'Idle'], 4], attack: ['Sword_Slash', 8], work: ['Sword_Slash', 8], death: ['Death', 8] };
  const WV = Object.assign({}, W, { attack: ['Punch_Right', 8] });           // villagers: chop/mine with a swing (no "interact" pose)
  const Q = { walk: ['Walk', 10], run: ['Gallop', 8], idle: [['|Idle', 'Idle'], 4], attack: ['Attack_Headbutt', 8], work: ['Eating', 8], death: ['Death', 8] };
  const D = { walk: ['_Walk', 10], run: ['_Run', 8], idle: ['_Idle', 4], attack: ['_Attack', 8], death: ['_Death', 8] };
  const P = { walk: ['Walk', 10], run: ['Run', 8], idle: ['Idle', 4], attack: [['Sword', 'Swo', 'Punch', 'Pun'], 8], death: [['Death', 'Dea'], 8] };
  const L = 'lib/';
  const M = [];
  const add = (pack, name, file, o) => M.push(Object.assign({ pack, name, file }, o));
  // ------------------------------------------------ CORE: people
  add('core', 'man', 'man.glb', { h: 0.92, max: 3960, clips: { walk: ['Man_Walk', 10], run: ['Man_Run', 8], idle: ['Man_Idle', 4], attack: ['Man_Punch', 8], work: ['Man_SwordSlash', 8], death: ['Man_Death', 8] } });
  for (const n of ['worker', 'punk', 'suit', 'sci_fi_character']) add('core', 'w_' + n, L + 'ultimatemodular/' + n + '.glb', { h: 0.9, max: 3960, clips: WV });
  add('core', 'w_soldier', L + 'ultimatemodular/soldier.glb', { h: 0.96, max: 4400, clips: W });
  add('core', 'w_adventurer', L + 'ultimatemodular/adventurer.glb', { h: 0.94, max: 3960, clips: W });
  add('core', 'w_hooded', L + 'ultimatemodular/hooded_adventurer.glb', { h: 0.94, max: 3960, clips: W });
  add('core', 'w_witch', L + 'ultimatemodular/witch.glb', { h: 0.95, max: 3960, clips: W });
  add('core', 'king', 'king.glb', { h: 1.0, max: 4840, clips: W });
  // ------------------------------------------------ CORE: animals of the vale
  for (const n of ['deer', 'stag', 'bull', 'cow']) add('core', n, n + '.glb', { h: { deer: 0.78, stag: 0.98, bull: 0.86, cow: 0.82 }[n], max: 3080, clips: Q });
  add('core', 'cow2', 'cow2.glb', { h: 0.8, max: 1980 });
  add('core', 'goat', 'goat.glb', { h: 0.6, max: 1980 });
  add('core', 'turkey', 'turkey.glb', { h: 0.42, ry: -Math.PI / 2, max: 1320 });
  add('core', 'hen', 'hen.glb', { h: 0.3, max: 1320 }); add('core', 'rooster', 'rooster.glb', { h: 0.36, max: 1760 });
  const A = { sheep: 0.55, horse: 1.0, rabbit: 0.26, fox: 0.4, wolf: 0.58, bear: 0.95, duck: 0.3, dog: 0.42, cat: 0.3, moose_antlers: 1.25, antelope: 0.85, buffalo_sunrise: 0.95, chicken: 0.3, bird: 0.2, butterfly: 0.16, coyote: 0.5, raccoon: 0.3, badger: 0.28, skunk: 0.26 };
  for (const n in A) add('core', 'a_' + n, L + 'animalsuleawmbsy/' + n + '.glb', { h: A[n], max: 1980 });
  // ------------------------------------------------ CORE: buildings
  const MV = L + 'medievalvillage/';
  add('core', 'house_1', MV + 'fantasy_house.glb', { fit: 1.9, max: 6600 });
  add('core', 'house_2', MV + 'fantasy_house_2.glb', { fit: 1.9, max: 6600 });
  add('core', 'house_3', MV + 'fantasy_house_3.glb', { fit: 1.9, max: 6600 });
  add('core', 'inn', MV + 'fantasy_inn.glb', { fit: 3.7, max: 8800 });
  add('core', 'f_barracks', MV + 'fantasy_barracks.glb', { fit: 2.9, max: 8800 });
  add('core', 'sawmill', MV + 'fantasy_sawmill.glb', { fit: 1.95, max: 6600 });
  add('core', 'f_stable', MV + 'fantasy_stable.glb', { fit: 2.9, max: 7700 });
  add('core', 'smithy', MV + 'blacksmith.glb', { fit: 2.9, max: 7700 });
  add('core', 'mill_m', MV + 'mill.glb', { fit: 1.95, max: 6600 });
  add('core', 'bell_tower', MV + 'bell_tower.glb', { fit: 1.9, max: 6600 });
  add('core', 'barracks', 'barracks.glb', { fit: 2.9, max: 7700 });
  add('core', 'archery_range', 'archery_range.glb', { fit: 2.9, max: 7700 });
  add('core', 'archery_towers', 'archery_towers.glb', { fit: 2.0, max: 7700 });
  add('core', 'castle', 'castle.glb', { fit: 3.95, max: 8800 });
  add('core', 'fortress', 'fortress.glb', { fit: 3.7, max: 6600 });
  add('core', 'chicken_coop', 'chicken_coop.glb', { fit: 2.0, max: 4400 });
  add('core', 'arrow', 'arrow.glb', { len: 0.55, rx: Math.PI / 2, max: 440 });
  // ------------------------------------------------ CORE: village & park decor
  for (const [n, f, fit] of [['m_well', 'well', 1.1], ['market_1', 'market_stand', 1.6], ['market_2', 'market_stand_2', 1.6], ['gazebo', 'gazebo', 2.4], ['bonfire', 'bonfire', 0.8], ['cart', 'cart', 1.3], ['m_barrel', 'barrel', 0.45], ['m_crate', 'crate', 0.5], ['hay', 'hay', 0.8], ['m_bench', 'bench', 1.0], ['cauldron', 'cauldron', 0.6], ['bell', 'bell', 0.9], ['m_fence', 'fence', 1.0], ['m_rocks', 'rocks', 1.0]])
    add('core', n, MV + f + '.glb', { fit, max: 3300 });
  const PK = L + 'prettypark/';
  for (const [n, f, fit] of [['fountain', 'fountain', 2.2], ['p_tree', 'tree', 1.5], ['p_tree_large', 'tree_large', 2.0], ['p_bush', 'bush', 0.7], ['p_bush_large', 'bush_large', 1.1], ['hedge', 'hedge_straight', 1.0], ['hedge_long', 'hedge_straight_long', 2.0], ['hedge_corner', 'hedge_corner', 1.0], ['lantern', 'street_lantern', 0.4], ['p_bench', 'bench', 1.0], ['p_flower_a', 'flower_a', 0.4], ['p_flower_b', 'flower_b', 0.4], ['p_grass_a', 'grass_a', 0.4], ['p_grass_b', 'grass_b', 0.4], ['cobble', 'cobble_stones', 1.0], ['cobble_large', 'cobble_stones_large', 2.0]])
    add('core', n, PK + f + '.glb', { fit, max: 3300 });
  add('core', 'well', 'well.glb', { fit: 1.1, max: 3300 });
  add('core', 'pond', 'pond.glb', { fit: 2.6, max: 5500 });
  add('core', 'nature', 'nature.glb', { fit: 4.2, max: 8800 });
  add('core', 'waterfall', 'waterfall.glb', { fit: 3.2, max: 4400 });
  add('core', 'castle_tower', 'castle_tower.glb', { fit: 3.0, max: 6600 });
  add('core', 'kayak', 'kayak.glb', { fit: 0.9, max: 1760 });
  // ------------------------------------------------ CORE: camps (survival kit)
  const SK = L + 'survivalkit/';
  for (const [n, f, fit] of [['tent', 'tent', 1.6], ['tent_half', 'tent_half', 1.4], ['campfire', 'campfire', 0.7], ['workbench', 'workbench', 1.0], ['anvil', 'workbench_anvil', 0.9], ['grind', 'workbench_grind', 0.9], ['chest', 'chest', 0.6], ['s_barrel', 'barrel', 0.45], ['s_box', 'box', 0.5], ['s_box_open', 'box_open', 0.5], ['palisade', 'fence_fortified', 1.0], ['fence_frame', 'fence_frame', 1.0], ['signpost', 'signpost', 0.6], ['resource_stone', 'resource_stone', 1.9], ['fishing_stand', 'fishing_stand', 1.2], ['structure', 'structure', 1.6], ['log_fall', 'tree_fall', 1.4], ['log_fall_large', 'tree_fall_large', 1.8]])
    add('core', n, SK + f + '.glb', { fit, max: 2640 });
  // ------------------------------------------------ CORE: nature (vale & highlands)
  const SN = L + 'stylizednature/';
  for (let i = 1; i <= 5; i++) {
    const s = i === 1 ? '' : '_' + i;
    add('core', 'tree_' + i, SN + 'tree' + s + '.glb', { h: 2.0, max: 1540 });
    add('core', 'pine_' + i, SN + 'pine' + s + '.glb', { h: 2.2, max: 1320 });
  }
  add('core', 'birch', L + 'ultimatestylized/birch_trees.glb', { h: 2.1, max: 1320, split: true });
  add('core', 'maple', L + 'ultimatestylized/maple_trees.glb', { h: 2.0, max: 1540, split: true });
  add('core', 'utree', L + 'ultimatestylized/trees.glb', { h: 2.0, max: 1540, split: true });
  add('core', 'rock', L + 'ultimatestylized/rocks.glb', { fit: 1.9, max: 1320, split: true });
  add('core', 'bushes', L + 'ultimatestylized/bushes.glb', { h: 0.55, max: 1100, split: true });
  add('core', 'flower_bush', L + 'ultimatestylized/flower_bushes.glb', { h: 0.55, max: 1100, split: true });
  add('core', 'uflowers', L + 'ultimatestylized/flowers.glb', { h: 0.25, max: 550, split: true });
  add('core', 'ugrass', L + 'ultimatestylized/grass.glb', { h: 0.22, max: 330, split: true });
  for (const [n, f, h, mx] of [['bush', 'bush', 0.5, 500], ['bush_flowers', 'bush_with_flowers', 0.55, 500], ['clover', 'clover', 0.1, 120], ['clover_2', 'clover_2', 0.1, 120], ['grass', 'grass', 0.22, 120], ['grass_wispy', 'grass_wispy', 0.25, 120], ['grass_wispy_2', 'grass_wispy_2', 0.25, 120], ['tall_grass', 'tall_grass', 0.35, 150], ['fern', 'fern', 0.3, 200], ['flower_group', 'flower_group', 0.25, 200], ['flower_group_2', 'flower_group_2', 0.25, 200], ['flower_single', 'flower_single', 0.2, 100], ['flower_single_2', 'flower_single_2', 0.2, 100], ['flower_petal', 'flower_petal', 0.12, 80], ['mushroom', 'mushroom', 0.14, 120], ['mushroom_l', 'mushroom_laetiporus', 0.16, 150], ['plant', 'plant', 0.3, 200], ['plant_big', 'plant_big', 0.45, 250], ['pebble_1', 'pebble_round', 0.08, 60], ['pebble_2', 'pebble_square', 0.08, 60], ['pebble_3', 'pebble_round_3', 0.08, 60], ['rock_m1', 'rock_medium', 0.9, 400], ['rock_m2', 'rock_medium_2', 0.9, 400], ['rock_m3', 'rock_medium_3', 0.9, 400]])
    add('core', n, SN + f + '.glb', { h, max: mx });
  // ------------------------------------------------ CORE: high-quality replacements
  const HQ = L + 'hq/';
  const MT = { walk: ['Walk', 10], run: ['Run', 8], idle: ['Idle', 4], death: ['Death', 8] };
  add('core', 'c_rider', HQ + 'character_animated.glb', { h: 0.95, max: 5000, clips: Object.assign({ attack: ['Dagger_Attack', 8], work: ['PickUp', 8] }, MT) });
  const HO = { walk: ['Walk', 10], run: ['Gallop', 8], idle: [['|Idle', 'Idle'], 4], attack: ['Attack_Headbutt', 8], work: ['Eating', 8], death: ['Death', 8] };
  add('core', 'horse_q', HQ + 'horse.glb', { h: 1.05, max: 4000, clips: HO });
  add('core', 'horse_white', HQ + 'white_horse.glb', { h: 1.1, max: 4000, clips: HO });
  add('core', 'siege_cannon', HQ + 'cannon.glb', { fit: 1.2, max: 5000 });
  add('core', 'catapult_m', HQ + 'catapult_2.glb', { fit: 1.25, max: 4000 });
  add('core', 'stone_wall', HQ + 'stone_wall.glb', { fit: 1.0, max: 1000 });
  add('core', 'wall_tower', HQ + 'stone_wall_towers.glb', { fit: 1.0, max: 4000 });
  add('core', 'castle_gate', HQ + 'castle_gate.glb', { fit: 1.0, max: 4000 });
  add('core', 'crops', HQ + 'crops.glb', { fit: 2.6, max: 6000 });
  add('core', 'farm_dirt', HQ + 'farm_dirt.glb', { fit: 2.9, max: 1500 });
  add('core', 'wheat', HQ + 'wheat.glb', { h: 0.45, max: 800 });
  add('core', 'berries', HQ + 'bush_with_berries.glb', { h: 0.6, max: 1600 });
  add('core', 'minecart', HQ + 'minecart.glb', { fit: 0.8, max: 200 });
  add('core', 'open_barn', HQ + 'open_barn.glb', { fit: 1.95, max: 3500 });
  add('core', 'castle_fortress', HQ + 'castle_fortress.glb', { fit: 4.9, max: 9000 });
  add('core', 'wooden_fortress', HQ + 'wooden_fortress.glb', { fit: 3.7, max: 9000 });
  add('core', 'town_hall', HQ + 'town_center.glb', { fit: 3.7, max: 9000 });
  add('core', 'town_hall_2', HQ + 'town_center_2.glb', { fit: 3.7, max: 9000 });
  add('core', 'horse_statue', HQ + 'horse_statue.glb', { fit: 1.6, max: 4000 });
  add('core', 'stag_statue', HQ + 'stag_statue.glb', { fit: 1.4, max: 4000 });
  add('core', 'monument', HQ + 'wooden_monument.glb', { fit: 1.6, max: 4000 });
  add('core', 'big_barn', HQ + 'big_barn.glb', { fit: 2.9, max: 8000 });
  add('core', 'meat_ham', L + 'meat/ham.glb', { fit: 0.6, max: 600 });
  add('core', 'meat_steak', L + 'meat/steak.glb', { fit: 0.5, max: 700 });
  add('core', 'meat_fish', L + 'meat/salmon.glb', { fit: 0.65, max: 1800 });
  // ------------------------------------------------ COAST (pirates)
  const PR = L + 'piratekit/';
  for (const [n, f, o] of [['treasure', 'chest_gold', { fit: 0.9, max: 1760 }], ['chest_closed', 'chest_closed', { fit: 0.8, max: 1320 }], ['gold_ore', 'gold_ore', { fit: 1.9, max: 1980 }], ['gold_bag', 'gold_bag', { fit: 0.5, max: 880 }]]) add('core', n, PR + f + '.glb', o);
  for (const n of ['pirate_captain', 'henry', 'anne', 'mako', 'sharky', 'skeleton', 'skeleton_2']) add(n.startsWith('skeleton') ? 'marsh' : 'coast', 'pr_' + n, PR + n + '.glb', { h: 0.98, max: 3960, clips: P });
  for (const [n, f, o] of [['ship', 'ship', { fit: 6.0, max: 7700 }], ['small_ship', 'small_ship', { fit: 3.2, max: 5500 }], ['dock', 'dock', { fit: 3.0, max: 3300 }], ['dock_broken', 'dock_broken', { fit: 3.0, max: 3300 }], ['pr_house', 'house', { fit: 1.9, max: 5500 }], ['pr_house_2', 'house_2', { fit: 1.9, max: 5500 }], ['pr_house_3', 'house_3', { fit: 1.9, max: 5500 }], ['palm_1', 'palm_tree', { h: 2.3, max: 1100 }], ['palm_2', 'palm_tree_2', { h: 2.3, max: 1100 }], ['palm_3', 'palm_tree_3', { h: 2.3, max: 1100 }], ['cannon', 'cannon', { fit: 1.0, max: 1980 }], ['pr_barrel', 'barrel', { fit: 0.45, max: 880 }], ['pr_rocks', 'rocks', { fit: 1.8, max: 1320 }], ['pr_rocks_2', 'rocks_2', { fit: 1.8, max: 1320 }], ['pr_rock', 'rock', { fit: 1.2, max: 880 }], ['pr_sawmill', 'sawmill', { fit: 1.95, max: 5500 }], ['bucket_fish', 'bucket_of_fish', { fit: 0.4, max: 660 }], ['shark', 'shark', { len: 1.6, max: 1760 }], ['pr_bird', 'bird', { h: 0.3, max: 880 }], ['pr_wood', 'wood', { fit: 0.8, max: 880 }]])
    add('coast', n, PR + f + '.glb', o);
  for (const n of ['crab', 'seal', 'turtle', 'dolphin', 'whale', 'fish']) add('coast', 'a_' + n, L + 'animalsuleawmbsy/' + n + '.glb', { h: { crab: 0.22, seal: 0.4, turtle: 0.3, dolphin: 0.6, whale: 1.4, fish: 0.25 }[n], max: 1980 });
  add('coast', 'upalm', L + 'ultimatestylized/palm_trees.glb', { h: 2.4, max: 1320, split: true });
  // ------------------------------------------------ WILDS (dinosaurs & crystals)
  for (const [n, h] of [['t_rex', 1.9], ['velociraptor', 0.8], ['triceratops', 1.3], ['stegosaurus', 1.4], ['parasaurolophus', 1.5], ['apatosaurus', 2.6]]) add('wilds', 'd_' + n, L + 'animateddinosaur/' + n + '.glb', { h, max: 3960, clips: D });
  for (let i = 1; i <= 8; i++) add('wilds', 'crystal_' + i, L + 'crystalpack/crystal' + (i === 1 ? '' : '_' + i) + '.glb', { h: 1.2, max: 880 });
  for (let i = 1; i <= 5; i++) add('wilds', 'twisted_' + i, SN + 'twisted_tree' + (i === 1 ? '' : '_' + i) + '.glb', { h: 2.3, max: 1540 });
  for (const n of ['rhino', 'elephant', 'lizard', 'snake', 'spider', 'frog']) add('wilds', 'a_' + n, L + 'animalsuleawmbsy/' + n + '.glb', { h: { rhino: 0.9, elephant: 1.4, lizard: 0.15, snake: 0.12, spider: 0.15, frog: 0.15 }[n], max: 1980 });
  // ------------------------------------------------ MARSH (haunted)
  const HB = L + 'halloweenbits/';
  for (const [n, f, o] of [['crypt', 'crypt', { fit: 2.6, max: 5500 }], ['shrine', 'shrine', { fit: 1.0, max: 1760 }], ['shrine_2', 'shrine_2', { fit: 1.0, max: 1760 }], ['arch', 'arch', { fit: 1.6, max: 1760 }], ['arch_gate', 'arch_gate', { fit: 1.6, max: 1760 }], ['grave', 'grave', { fit: 0.6, max: 660 }], ['grave_2', 'grave_2', { fit: 0.6, max: 660 }], ['gravestone', 'gravestone', { fit: 0.5, max: 660 }], ['gravestone_2', 'gravestone_2', { fit: 0.5, max: 660 }], ['grave_marker', 'grave_marker', { fit: 0.4, max: 440 }], ['damaged_grave', 'damaged_grave', { fit: 0.6, max: 660 }], ['coffin', 'coffin', { fit: 0.6, max: 660 }], ['iron_fence', 'iron_fence', { fit: 1.0, max: 880 }], ['iron_fence_d', 'damaged_iron_fence', { fit: 1.0, max: 880 }], ['h_fence', 'fence', { fit: 1.0, max: 660 }], ['h_fence_b', 'fence_broken', { fit: 1.0, max: 660 }], ['pumpkin', 'pumpkin', { fit: 0.4, max: 660 }], ['jacko', 'jackolantern', { fit: 0.4, max: 660 }], ['jacko_2', 'pumpkin_orange_jacko', { fit: 0.4, max: 660 }], ['pumpkin_y', 'yellow_pumpkin', { fit: 0.35, max: 660 }], ['post_lantern', 'post_lantern', { fit: 0.35, max: 660 }], ['post_skull', 'post_with_skull', { fit: 0.35, max: 660 }], ['h_lantern', 'lantern', { fit: 0.25, max: 440 }], ['ribcage', 'ribcage', { fit: 0.8, max: 660 }], ['h_rocks', 'rocks', { fit: 1.2, max: 880 }], ['dead_tree_l', 'tree_dead_large_deco', { h: 2.2, max: 1540 }], ['h_dead_tree', 'dead_tree', { h: 1.9, max: 1320 }], ['h_dead_tree_2', 'dead_tree_2', { h: 1.9, max: 1320 }], ['h_dead_small', 'small_dead_tree', { h: 1.2, max: 880 }]])
    add('marsh', n, HB + f + '.glb', o);
  for (let i = 1; i <= 6; i++) add('marsh', 'autumn_' + i, HB + 'autumn_pine' + (i === 1 ? '' : '_' + i) + '.glb', { h: 2.2, max: 1100 });
  for (let i = 1; i <= 5; i++) add('marsh', 'dead_' + i, SN + 'dead_tree' + (i === 1 ? '' : '_' + i) + '.glb', { h: 2.1, max: 1320 });
  add('marsh', 'udead', L + 'ultimatestylized/dead_trees.glb', { h: 2.0, max: 1320, split: true });
  window.MANIFEST = M;
})();
