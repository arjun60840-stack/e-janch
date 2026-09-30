import { KitType } from '@/types';

export interface TestTypeDefinition {
  id: string;
  kitType: KitType;
  name: string;
  nameHi: string;
  reagent: string;
  expectedColorHex: string;
  expectedColorName: string;
  expectedColorNameHi: string;
  description: string;
  descriptionHi: string;
}

export interface KitDefinition {
  id: KitType;
  name: string;
  nameHi: string;
  shortCode: string;
  badgeColor: string;
  description: string;
  descriptionHi: string;
  tests: TestTypeDefinition[];
}

export const KIT_DEFINITIONS: Record<KitType, KitDefinition> = {
  STANDARD_NARCOTIC: {
    id: 'STANDARD_NARCOTIC',
    name: 'Standard Narcotic Drugs Kit',
    nameHi: 'मानक मादक पदार्थ किट',
    shortCode: 'SNDK',
    badgeColor: 'bg-blue-800 text-white',
    description: 'Rapid field identification for Opium, Morphine, Heroin, Cannabis, Cocaine, Methaqualone, and related narcotics.',
    descriptionHi: 'अफीम, मॉर्फिन, हेरोइन, भांग/गांजा, कोकीन, मेथाक्वालोन और संबंधित नशीले पदार्थों के लिए त्वरित फील्ड परीक्षण।',
    tests: [
      {
        id: 'opium',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Opium',
        nameHi: 'अफीम (Opium)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#4A0E4E',
        expectedColorName: 'Reddish-Violet to Purple',
        expectedColorNameHi: 'लाल-बैंगनी से गहरा बैंगनी',
        description: 'Observe color change upon contact with field ampoule. Positive reaction shifts to distinct purple/violet hue.',
        descriptionHi: 'फील्ड किट में नमूना रखने पर रंग परिवर्तन देखें। सकारात्मक प्रतिक्रिया पर बैंगनी रंग बनता है।',
      },
      {
        id: 'morphine',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Morphine',
        nameHi: 'मॉर्फिन (Morphine)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#581C87',
        expectedColorName: 'Deep Violet',
        expectedColorNameHi: 'गहरा बैंगनी',
        description: 'Rapid violet coloration within 5-10 seconds indicating presumptive presence of morphine alkaloids.',
        descriptionHi: '5-10 सेकंड के भीतर गहरा बैंगनी रंग मॉर्फिन की प्रारंभिक उपस्थिति दर्शाता है।',
      },
      {
        id: 'codeine',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Codeine',
        nameHi: 'कोडीन (Codeine)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#3B0764',
        expectedColorName: 'Dark Violet-Blue',
        expectedColorNameHi: 'गहरा नीला-बैंगनी',
        description: 'Violet coloration shifting to dark blue over 30 seconds.',
        descriptionHi: 'बैंगनी से नीले रंग की ओर अग्रसर रंग परिवर्तन।',
      },
      {
        id: 'heroin',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Heroin (Diacetylmorphine)',
        nameHi: 'हेरोइन (Heroin)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#6B21A8',
        expectedColorName: 'Purple-Violet',
        expectedColorNameHi: 'बैंगनी',
        description: 'Immediate deep purple colorimetric development.',
        descriptionHi: 'तत्काल गहरे बैंगनी रंग की प्रतिक्रिया।',
      },
      {
        id: 'amphetamines',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Amphetamines / Methamphetamine',
        nameHi: 'एम्फ़ैटेमिन (Amphetamines)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#EA580C',
        expectedColorName: 'Orange to Brown',
        expectedColorNameHi: 'नारंगी से भूरा',
        description: 'Characteristic orange changing to deep orange-brown.',
        descriptionHi: 'विशिष्ट नारंगी से गहरा भूरा रंग।',
      },
      {
        id: 'mescaline',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Mescaline',
        nameHi: 'मेस्केलिन (Mescaline)',
        reagent: 'Marquis Reagent',
        expectedColorHex: '#D97706',
        expectedColorName: 'Bright Orange',
        expectedColorNameHi: 'चमकीला नारंगी',
        description: 'Instant bright orange color reaction.',
        descriptionHi: 'त्वरित चमकीला नारंगी रंग।',
      },
      {
        id: 'marijuana_cannabis',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Marijuana / Cannabis',
        nameHi: 'गांजा / भांग (Cannabis)',
        reagent: 'Duquenois-Levine Reagent',
        expectedColorHex: '#7C3AED',
        expectedColorName: 'Indigo / Violet in lower layer',
        expectedColorNameHi: 'निचली परत में गहरा बैंगनी',
        description: 'Color extraction into lower organic chloroform layer turning indigo/violet.',
        descriptionHi: 'निचली परत में गहरा बैंगनी/नील वर्ण बनना।',
      },
      {
        id: 'hashish',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Hashish (Charas)',
        nameHi: 'हशीश / चरस (Hashish)',
        reagent: 'Duquenois-Levine Reagent',
        expectedColorHex: '#6D28D9',
        expectedColorName: 'Violet-Purple',
        expectedColorNameHi: 'गहरा जामुनी बैंगनी',
        description: 'Extraction to lower layer showing dense violet coloration.',
        descriptionHi: 'निचले स्तर में गहरा जामुनी रंग स्पष्ट दिखाई देता है।',
      },
      {
        id: 'hashish_oil',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Hashish Oil',
        nameHi: 'हशीश तेल (Hashish Oil)',
        reagent: 'Duquenois-Levine Reagent',
        expectedColorHex: '#4C1D95',
        expectedColorName: 'Deep Dark Violet',
        expectedColorNameHi: 'अति गहरा बैंगनी',
        description: 'Dense violet reaction in solvent separation.',
        descriptionHi: 'विलायक विभाजन में अति गहरा बैंगनी रंग।',
      },
      {
        id: 'cocaine',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Cocaine',
        nameHi: 'कोकीन (Cocaine)',
        reagent: 'Scott / Cobalt Thiocyanate Reagent',
        expectedColorHex: '#1D4ED8',
        expectedColorName: 'Brilliant Blue Precipitate',
        expectedColorNameHi: 'चमकीला नीला अवक्षेप',
        description: 'Formation of brilliant turquoise-blue precipitate and pink separation upon acid introduction.',
        descriptionHi: 'चमकीला नीला अवक्षेप और गुलाबी परत विभाजन।',
      },
      {
        id: 'methaqualone',
        kitType: 'STANDARD_NARCOTIC',
        name: 'Methaqualone (Mandrax)',
        nameHi: 'मेथाक्वालोन (Methaqualone)',
        reagent: 'Fischer / Mandelin Reagent',
        expectedColorHex: '#047857',
        expectedColorName: 'Blue-Green',
        expectedColorNameHi: 'नीला-हरा (Blue-Green)',
        description: 'Distinctive blue-green color shift.',
        descriptionHi: 'विशिष्ट नीला-हरा रंग परिवर्तन।',
      },
    ],
  },
  PRECURSOR_CHEMICAL: {
    id: 'PRECURSOR_CHEMICAL',
    name: 'Precursor Chemicals Kit',
    nameHi: 'प्रीकर्सर रसायन किट',
    shortCode: 'PCK',
    badgeColor: 'bg-emerald-800 text-white',
    description: 'Identification of precursor chemicals including Ephedrine, Acetic Anhydride, Anthranilic Acid, and Potassium Permanganate.',
    descriptionHi: 'एफेड्रिन, एसिटिक एनहाइड्राइड, एंथ्रानिलिक एसिड और पोटेशियम परमैंगनेट आदि नियंत्रित प्रीकर्सर रसायनों की फील्ड पहचान।',
    tests: [
      {
        id: 'ephedrine',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Ephedrine',
        nameHi: 'एफेड्रिन (Ephedrine)',
        reagent: "Chen's Reagent",
        expectedColorHex: '#9333EA',
        expectedColorName: 'Purple-Violet',
        expectedColorNameHi: 'बैंगनी (Purple)',
        description: "Copper sulfate and sodium hydroxide yielding purple coordination complex.",
        descriptionHi: "रीएजेंट मिलाने पर स्पष्ट बैंगनी रंग का निर्माण।",
      },
      {
        id: 'pseudoephedrine',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Pseudoephedrine',
        nameHi: 'स्यूडोएफेड्रिन (Pseudoephedrine)',
        reagent: "Chen's Reagent",
        expectedColorHex: '#A855F7',
        expectedColorName: 'Distinct Purple',
        expectedColorNameHi: 'स्पष्ट बैंगनी रंग',
        description: 'Positive coordination complex showing purple.',
        descriptionHi: 'सकारात्मक प्रतिक्रिया पर बैंगनी रंग।',
      },
      {
        id: 'acetic_anhydride',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Acetic Anhydride',
        nameHi: 'एसिटिक एनहाइड्राइड (Acetic Anhydride)',
        reagent: 'Aniline / Ferric Chloride',
        expectedColorHex: '#991B1B',
        expectedColorName: 'Brownish-Red Precipitate',
        expectedColorNameHi: 'भूरा-लाल अवक्षेप',
        description: 'Color reaction and precipitation indicating anhydride bond.',
        descriptionHi: 'भूरा-लाल अवक्षेप और रंग परिवर्तन।',
      },
      {
        id: 'anthranilic_acid',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Anthranilic Acid',
        nameHi: 'एंथ्रानिलिक एसिड (Anthranilic Acid)',
        reagent: 'Diazotization Coupling Reagent',
        expectedColorHex: '#C2410C',
        expectedColorName: 'Intense Orange-Red',
        expectedColorNameHi: 'गहरा नारंगी-लाल',
        description: 'Azo dye development producing intense orange-red tone.',
        descriptionHi: 'गहरा नारंगी-लाल रंग का उद्भव।',
      },
      {
        id: 'potassium_permanganate',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Potassium Permanganate',
        nameHi: 'पोटेशियम परमैंगनेट (Potassium Permanganate)',
        reagent: 'Acidified Oxalic Test',
        expectedColorHex: '#F3F4F6',
        expectedColorName: 'Decolorization (Purple to Clear)',
        expectedColorNameHi: 'रंगहीन होना (बैंगनी से पारदर्शी)',
        description: 'Rapid loss of permanganate purple hue upon reduction.',
        descriptionHi: 'प्रतिक्रिया पर बैंगनी रंग का पारदर्शी/रंगहीन होना।',
      },
      {
        id: 'norephedrine',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Norephedrine',
        nameHi: 'नॉरएफेड्रिन (Norephedrine)',
        reagent: 'Ninhydrin Reagent',
        expectedColorHex: '#BE185D',
        expectedColorName: 'Violet-Pink (Ruhemann Purple)',
        expectedColorNameHi: 'बैंगनी-गुलाबी',
        description: 'Amino alcohol reaction turning violet-pink.',
        descriptionHi: 'अमीनो अल्कोहल प्रतिक्रिया में बैंगनी-गुलाबी रंग।',
      },
      {
        id: 'phenylacetic_acid',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Phenylacetic Acid',
        nameHi: 'फेनिलएसिटिक एसिड (Phenylacetic Acid)',
        reagent: 'Liebermann Reagent',
        expectedColorHex: '#78350F',
        expectedColorName: 'Yellow shifting to Dark Brown',
        expectedColorNameHi: 'पीले से गहरा भूरा',
        description: 'Color shift from pale yellow to dark brown.',
        descriptionHi: 'पीले रंग से गहरे भूरे रंग में परिवर्तन।',
      },
      {
        id: 'piperonal',
        kitType: 'PRECURSOR_CHEMICAL',
        name: 'Piperonal (Heliotropin)',
        nameHi: 'पाइपरोनल (Piperonal)',
        reagent: 'Gallic Acid Reagent',
        expectedColorHex: '#065F46',
        expectedColorName: 'Emerald Green',
        expectedColorNameHi: 'पन्ना हरा (Emerald Green)',
        description: 'Condensation product developing emerald green.',
        descriptionHi: 'पन्ना हरा रंग उत्पन्न होना।',
      },
    ],
  },
  KETAMINE: {
    id: 'KETAMINE',
    name: 'Ketamine Kit',
    nameHi: 'केटामिन किट',
    shortCode: 'KET',
    badgeColor: 'bg-amber-700 text-white',
    description: 'Targeted colorimetric reagents for rapid field screening of Ketamine and Ketamine Hydro-Chloride.',
    descriptionHi: 'केटामिन और केटामिन हाइड्रोक्लोराइड की त्वरित फील्ड जांच के लिए विशेष कलरिमेट्रिक रीएजेंट किट।',
    tests: [
      {
        id: 'ketamine_rapid',
        kitType: 'KETAMINE',
        name: 'Ketamine Rapid Field Test',
        nameHi: 'केटामिन रैपिड फील्ड टेस्ट',
        reagent: 'Morris Reagent',
        expectedColorHex: '#86198F',
        expectedColorName: 'Violet-Purple Complex',
        expectedColorNameHi: 'बैंगनी-जामुनी रंग',
        description: 'Reagent turns violet-purple within seconds upon contact with ketamine base.',
        descriptionHi: 'केटामिन के संपर्क में आने पर कुछ ही सेकंड में गहरा बैंगनी-जामुनी रंग बनता है।',
      },
      {
        id: 'ketamine_hcl',
        kitType: 'KETAMINE',
        name: 'Ketamine Hydro-Chloride Test',
        nameHi: 'केटामिन हाइड्रोक्लोराइड टेस्ट',
        reagent: 'Modified Cobalt Thiocyanate',
        expectedColorHex: '#0284C7',
        expectedColorName: 'Bright Sky Blue',
        expectedColorNameHi: 'चमकीला आसमानी नीला',
        description: 'Precipitation turning bright sky blue.',
        descriptionHi: 'चमकीले नीले रंग का निर्माण।',
      },
    ],
  },
};

export function getKitDefinition(kitType: KitType): KitDefinition {
  return KIT_DEFINITIONS[kitType] || KIT_DEFINITIONS.STANDARD_NARCOTIC;
}

export function getTestDefinition(kitType: KitType, testId: string): TestTypeDefinition | undefined {
  const kit = getKitDefinition(kitType);
  return kit.tests.find(t => t.id === testId);
}

export function getAllTests(): TestTypeDefinition[] {
  return Object.values(KIT_DEFINITIONS).flatMap(k => k.tests);
}
