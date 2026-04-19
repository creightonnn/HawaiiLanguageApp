-- ============================================================
-- Nā Inoa o Hawaiʻi — Seed Data (15 place names)
-- verified = false — pending cultural consultant review
-- ============================================================

insert into place_names (
  name_hawaiian, name_english, pronunciation, meaning,
  mooolelo, island, region,
  latitude, longitude, verified
) values

-- 1. Mānoa
(
  'Mānoa',
  'Manoa Valley',
  'MAH-no-ah',
  'Vast; thick; solid',
  'Mānoa Valley is a lush valley above Honolulu, known for its frequent rain and fertile land. The name reflects the broad, wide nature of the valley floor. It is home to the University of Hawaiʻi at Mānoa and the beloved Mānoa Falls trail. The valley features prominently in Hawaiian chant and poetry as a place of beauty and abundance. Rainbow Falls (Waihi) is a well-known landmark within the valley.',
  'Oʻahu', 'Honolulu',
  21.3333, -157.8025,
  false
),

-- 2. Waikīkī
(
  'Waikīkī',
  'Waikiki',
  'wy-kee-KEE',
  'Spouting water; gushing water',
  'Waikīkī was once a vast wetland system of taro patches and fishponds fed by streams from the Mānoa and Pālolo valleys. The name describes the freshwater springs that once bubbled up through the area. Hawaiian ali''i (chiefs) maintained summer homes along its shores. The wetlands were filled in during the early 20th century to create the resort district known worldwide today. Waikīkī remains one of the most recognized names in Hawaiʻi.',
  'Oʻahu', 'Honolulu',
  21.2769, -157.8270,
  false
),

-- 3. Hanalei
(
  'Hanalei',
  'Hanalei Bay',
  'hah-nah-LAY',
  'Crescent bay; lei-shaped bay',
  'Hanalei is a picturesque valley and bay on the north shore of Kauaʻi, named for the crescent shape of its bay that resembles a lei. The valley floor is one of the largest remaining patches of wetland taro cultivation in Hawaiʻi. The Hanalei River winds through the valley and empties into the bay. The area is celebrated in music and film for its dramatic beauty. It is a National Wildlife Refuge and home to several endangered waterbirds.',
  'Kauaʻi', 'North Shore',
  22.2027, -159.5016,
  false
),

-- 4. Kaimukī
(
  'Kaimukī',
  'Kaimuki',
  'ky-moo-KEE',
  'The ti oven; oven of the ti plant',
  'Kaimukī is a residential neighborhood in Honolulu whose name refers to an imu (underground oven) used to bake the ti plant root, a Hawaiian food staple. The area was sparsely populated until the early 1900s when the Honolulu streetcar line extended service there. Today it is known as a vibrant dining and shopping district. The neighborhood retains a strong local character distinct from tourist Honolulu. The elevated location offers views of Diamond Head and the ocean.',
  'Oʻahu', 'Honolulu',
  21.2797, -157.7983,
  false
),

-- 5. Nūʻuanu
(
  'Nūʻuanu',
  'Nuuanu Valley',
  'noo-oo-AH-noo',
  'Cool height; chilly height',
  'Nūʻuanu Pali is a dramatic cliff on the windward side of the Koʻolau Range on Oʻahu. Its name describes the cool, misty conditions at elevation caused by prevailing trade winds. The Nūʻuanu Pali lookout is the site of the 1795 Battle of Nuuanu, where Kamehameha I unified Oʻahu under his rule. The valley below contains the Royal Mausoleum, the burial place of Hawaiian royalty. Nūʻuanu Avenue is one of Honolulu''s historic main streets.',
  'Oʻahu', 'Honolulu',
  21.3658, -157.8372,
  false
),

-- 6. Waimea (Kauaʻi)
(
  'Waimea',
  'Waimea, Kauaʻi',
  'wy-MAY-ah',
  'Reddish water',
  'Waimea on Kauaʻi takes its name from the reddish sediment carried by the Waimea River from the island''s interior. This town holds a significant place in Hawaiian and world history as the site where Captain James Cook first made landfall in the Hawaiian Islands in January 1778. The nearby Waimea Canyon, often called the "Grand Canyon of the Pacific," drains into this area. The town was also the site of an early Russian fort built in 1817. Waimea was a major port in the sandalwood trade era.',
  'Kauaʻi', 'West Side',
  21.9572, -159.6663,
  false
),

-- 7. Hāmākua
(
  'Hāmākua',
  'Hamakua Coast',
  'hah-MAH-koo-ah',
  'The Mākua; possibly referring to a plant or ancestral figure',
  'Hāmākua is a coastal district along the northeastern shore of Hawaiʻi Island, known for its dramatic sea cliffs, waterfalls, and lush rainforest. The district was historically one of the most agriculturally productive on the island, with sugar plantations operating there for over a century. The Waipiʻo and Waimanu valleys, considered among the most sacred in Hawaiʻi, lie within the Hāmākua district. Akaka Falls, one of Hawaiʻi''s most visited waterfalls, is located here. The coast road offers some of the most dramatic scenery in the archipelago.',
  'Hawaiʻi', 'Hāmākua',
  20.0933, -155.3747,
  false
),

-- 8. Kailua (Oʻahu)
(
  'Kailua',
  'Kailua, Oʻahu',
  'ky-LOO-ah',
  'Two seas; two currents',
  'Kailua on the windward side of Oʻahu takes its name from two bodies of water — Kailua Bay and Kawainui Marsh, the largest freshwater marsh in Hawaiʻi. The area was a center of Hawaiian population and ali''i residence in pre-contact times. Ulupo Heiau, one of the largest heiau on Oʻahu, overlooks Kawainui Marsh. Today Kailua is known for its beautiful white sand beach and steady trade winds favored by windsurfers and kiteboarders. It remains one of the most sought-after residential communities on Oʻahu.',
  'Oʻahu', 'Windward',
  21.3962, -157.7391,
  false
),

-- 9. Lāhainā
(
  'Lāhainā',
  'Lahaina',
  'lah-HY-nah',
  'Cruel sun; merciless sun',
  'Lāhainā on western Maui was once the royal capital of the Hawaiian Kingdom under Kamehameha I and his successors. Its name refers to the intense heat of its dry, leeward climate. The town served as a major hub for the Pacific whaling industry in the 1800s and was home to the first school west of the Rockies. The historic Banyan Tree planted in 1873 became a beloved landmark. In August 2023, Lāhainā suffered a devastating wildfire that destroyed much of its historic district, marking a profound loss for Hawaiʻi.',
  'Maui', 'West Maui',
  20.8783, -156.6825,
  false
),

-- 10. Waiʻanae
(
  'Waiʻanae',
  'Waianae',
  'wy-AH-ny',
  'Water of the mullet; mullet waters',
  'Waiʻanae is a district and town on the dry, leeward coast of Oʻahu. The name likely refers to the mullet fish (ʻanae) that were raised in fishponds along this coastline. The area has a deep cultural connection to the kānaka maoli (Native Hawaiian) community and maintains strong Hawaiian cultural traditions. The Waiʻanae Range, which forms the western backbone of Oʻahu, takes the same name. The coastline is known for its calm, clear waters and is popular for diving and fishing.',
  'Oʻahu', 'Leeward',
  21.4433, -158.1855,
  false
),

-- 11. Kahaluʻu
(
  'Kahaluʻu',
  'Kahalu''u',
  'kah-hah-LOO-oo',
  'The diving place; the place of diving',
  'Kahaluʻu is a name shared by places on both Oʻahu and Hawaiʻi Island, derived from the word for diving or submerging. Kahaluʻu Bay on the Kona coast of Hawaiʻi Island is one of the best snorkeling spots in the state, where sea turtles (honu) gather at the reef. The bay was historically used for fishing and the nearby Kahaluʻu Beach Park preserves remnants of a heiau associated with the site. On Oʻahu, Kahaluʻu is a community in the Koʻolaupoko district of the windward side. The name reflects the importance of ocean diving in Hawaiian fishing culture.',
  'Hawaiʻi', 'North Kona',
  19.5766, -155.9700,
  false
),

-- 12. Puowaina (Punchbowl)
(
  'Puowaina',
  'Punchbowl Crater',
  'poo-oh-WY-nah',
  'Hill of placing; hill of sacrifice',
  'Puowaina is the Hawaiian name for the extinct volcanic crater in Honolulu known in English as Punchbowl. The name is often interpreted as "hill of sacrifice," referring to its use as a site for kapu (sacred law) executions in ancient times. The crater was formed about 75,000–100,000 years ago and rises 500 feet above sea level. Since 1949 it has served as the National Memorial Cemetery of the Pacific, the final resting place of over 53,000 American veterans. It remains one of the most visited and solemn sites in Honolulu.',
  'Oʻahu', 'Honolulu',
  21.3119, -157.8411,
  false
),

-- 13. ʻEwa
(
  'ʻEwa',
  'Ewa Plain',
  'EH-vah',
  'Crooked; straying from the correct path',
  'ʻEwa is a district on the western side of Oʻahu whose name means crooked or awry, possibly referring to the shape of the coastline or the winding paths of the region. It was historically a center of Hawaiian settlement with large fishponds and agricultural lands. During the plantation era ʻEwa was dominated by the ʻEwa Sugar Plantation, one of Hawaiʻi''s largest. The region is now one of the fastest-growing residential areas on Oʻahu. Oneʻula Beach Park preserves a stretch of coastline along ʻEwa''s shoreline.',
  'Oʻahu', 'ʻEwa',
  21.3247, -158.0514,
  false
),

-- 14. Kāneʻohe
(
  'Kāneʻohe',
  'Kaneohe',
  'KAH-neh-OH-heh',
  'Bamboo man; man-like bamboo',
  'Kāneʻohe is the largest community on the windward side of Oʻahu, situated along the shores of Kāneʻohe Bay. The name refers to a man named Kāne who was said to have been as slender as bamboo, or alternatively to the bamboo-like appearance of sugarcane in the area. Kāneʻohe Bay is the largest sheltered body of water in the Hawaiian Islands and contains extensive coral reefs and a sandbar. Mokoliʻi Island (Chinaman''s Hat) is a distinctive landmark within the bay. The area receives abundant rainfall from the Koʻolau Mountains.',
  'Oʻahu', 'Windward',
  21.4022, -157.8036,
  false
),

-- 15. Makapuʻu
(
  'Makapuʻu',
  'Makapuu Point',
  'mah-kah-POO-oo',
  'Bulging eye; protruding eye',
  'Makapuʻu is the easternmost point of Oʻahu, named for a rounded hill that was likened to a protruding eye. The Makapuʻu Lighthouse, built in 1909, guides ships around this rocky headland. The area is known for powerful shore break that draws experienced bodysurfers. Offshore lies Mānana Island (Rabbit Island) and Kāohikaipu Island, both seabird sanctuaries. Makapuʻu is mentioned in traditional Hawaiian navigation chants as a landmark for canoe voyagers approaching Oʻahu from the east.',
  'Oʻahu', 'East Honolulu',
  21.3108, -157.6499,
  false
);
