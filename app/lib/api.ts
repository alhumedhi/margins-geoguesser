import axios from 'axios';
import { MetObject } from '../components/types/met';

const MET_API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
const COSTUME_DEPARTMENT_ID = 8; // The Costume Institute department ID (hardcoded based on API docs)

// Add timeout to axios requests
const axiosWithTimeout = (url: string, timeout: number = 10000) => {
  return axios.get(url, {
    timeout: timeout, // 10 second timeout
  });
};

/**
 * Infer location from item description using common location indicators
 */
function inferLocationFromDescription(description: string): { country: string | null; coordinates: { lat: number; lng: number } | null } {
  if (!description) return { country: null, coordinates: null };

  // Common location indicators in descriptions
  const locationIndicators = [
    { pattern: /(?:from|of|in|at) (?:the )?(?:ancient )?(?:city of )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, type: 'city' },
    { pattern: /(?:from|of|in|at) (?:the )?(?:ancient )?(?:kingdom of )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, type: 'kingdom' },
    { pattern: /(?:from|of|in|at) (?:the )?(?:ancient )?(?:region of )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, type: 'region' },
    { pattern: /(?:from|of|in|at) (?:the )?(?:ancient )?(?:empire of )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, type: 'empire' },
    { pattern: /(?:from|of|in|at) (?:the )?(?:ancient )?(?:dynasty of )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g, type: 'dynasty' }
  ];

  // Common historical locations and their modern equivalents
  const historicalLocations: { [key: string]: string } = {
    'Rome': 'Italy',
    'Athens': 'Greece',
    'Constantinople': 'Turkey',
    'Byzantium': 'Turkey',
    'Persia': 'Iran',
    'Babylon': 'Iraq',
    'Mesopotamia': 'Iraq',
    'Egypt': 'Egypt',
    'China': 'China',
    'Japan': 'Japan',
    'India': 'India',
    'France': 'France',
    'England': 'United Kingdom',
    'Britain': 'United Kingdom',
    'Spain': 'Spain',
    'Portugal': 'Portugal',
    'Netherlands': 'Netherlands',
    'Germany': 'Germany',
    'Austria': 'Austria',
    'Russia': 'Russia',
    'Ottoman': 'Turkey',
    'Ming': 'China',
    'Qing': 'China',
    'Tang': 'China',
    'Han': 'China',
    'Mughal': 'India',
    'Viking': 'Norway',
    'Celtic': 'United Kingdom',
    'Greek': 'Greece',
    'Roman': 'Italy',
    'Egyptian': 'Egypt',
    'Persian': 'Iran',
    'Byzantine': 'Turkey',
    'Mediterranean': 'Italy',
    'Renaissance': 'Italy',
    'Baroque': 'France',
    'Rococo': 'France',
    'Victorian': 'United Kingdom',
    'Edwardian': 'United Kingdom',
    'Georgian': 'United Kingdom',
    'Elizabethan': 'United Kingdom',
    'Tudor': 'United Kingdom',
    'Stuart': 'United Kingdom',
    'Hanoverian': 'United Kingdom',
    'Windsor': 'United Kingdom',
    'Bourbon': 'France',
    'Habsburg': 'Austria',
    'Romanov': 'Russia',
    'Qing': 'China',
    'Ming': 'China',
    'Tang': 'China',
    'Han': 'China',
    'Zhou': 'China',
    'Shang': 'China',
    'Xia': 'China',
    'Mughal': 'India',
    'Maurya': 'India',
    'Gupta': 'India',
    'Chola': 'India',
    'Pallava': 'India',
    'Pandya': 'India',
    'Chera': 'India',
    'Vijayanagara': 'India',
    'Maratha': 'India',
    'Mongol': 'Mongolia',
    'Ottoman': 'Turkey',
    'Safavid': 'Iran',
    'Qajar': 'Iran',
    'Pahlavi': 'Iran',
    'Achaemenid': 'Iran',
    'Sassanid': 'Iran',
    'Umayyad': 'Syria',
    'Abbasid': 'Iraq',
    'Fatimid': 'Egypt',
    'Mamluk': 'Egypt',
    'Ayyubid': 'Egypt',
    'Seljuk': 'Turkey',
    'Ghaznavid': 'Afghanistan',
    'Timurid': 'Uzbekistan',
    'Samanid': 'Uzbekistan',
    'Khwarezmian': 'Uzbekistan',
    'Kara-Khanid': 'Kazakhstan',
    'Kara-Khitai': 'Kazakhstan',
    'Golden Horde': 'Russia',
    'Ilkhanate': 'Iran',
    'Chagatai': 'Uzbekistan',
    'Yuan': 'China',
    'Ming': 'China',
    'Qing': 'China',
    'Tang': 'China',
    'Han': 'China',
    'Zhou': 'China',
    'Shang': 'China',
    'Xia': 'China',
    'Joseon': 'South Korea',
    'Goryeo': 'South Korea',
    'Silla': 'South Korea',
    'Baekje': 'South Korea',
    'Goguryeo': 'South Korea',
    'Heian': 'Japan',
    'Kamakura': 'Japan',
    'Muromachi': 'Japan',
    'Edo': 'Japan',
    'Meiji': 'Japan',
    'Taisho': 'Japan',
    'Showa': 'Japan',
    'Heisei': 'Japan',
    'Reiwa': 'Japan'
  };

  // Try to find location indicators in the description
  for (const indicator of locationIndicators) {
    const matches = [...description.matchAll(indicator.pattern)];
    for (const match of matches) {
      const location = match[1];
      
      // Check if the location matches a known historical location
      for (const [historical, modern] of Object.entries(historicalLocations)) {
        if (location.toLowerCase().includes(historical.toLowerCase())) {
          const coords = getCountryCoordinates(modern);
          if (coords) {
            return { country: modern, coordinates: coords };
          }
        }
      }
    }
  }

  return { country: null, coordinates: null };
}

/**
 * Process a MetObject to ensure it has geographic coordinates
 * The MET API doesn't provide direct lat/lng, so we extract from location data
 */
function processMetObject(object: any): MetObject {
  let geographyLat: number | undefined = undefined;
  let geographyLng: number | undefined = undefined;
  let country: string | undefined = object.country;
  
  // First try to get coordinates from explicit location data
  if (object.country) {
    const coords = getCountryCoordinates(object.country);
    if (coords) {
      geographyLat = coords.lat;
      geographyLng = coords.lng;
    }
  }
  
  // If no coordinates from country, try using culture
  if ((geographyLat === undefined || geographyLng === undefined) && object.culture) {
    const countryFromCulture = mapCultureToCountry(object.culture);
    if (countryFromCulture) {
      const coords = getCountryCoordinates(countryFromCulture);
      if (coords) {
        geographyLat = coords.lat;
        geographyLng = coords.lng;
        country = countryFromCulture;
      }
    }
  }
  
  // If still no coordinates, try to infer from description
  if ((geographyLat === undefined || geographyLng === undefined) && object.objectDate && object.medium) {
    const description = `${object.objectDate} ${object.medium}`;
    const inferred = inferLocationFromDescription(description);
    if (inferred.coordinates) {
      geographyLat = inferred.coordinates.lat;
      geographyLng = inferred.coordinates.lng;
      country = inferred.country || country;
    }
  }
  
  // If still no coordinates, try to infer from title
  if ((geographyLat === undefined || geographyLng === undefined) && object.title) {
    const inferred = inferLocationFromDescription(object.title);
    if (inferred.coordinates) {
      geographyLat = inferred.coordinates.lat;
      geographyLng = inferred.coordinates.lng;
      country = inferred.country || country;
    }
  }
  
  // If still no coordinates, use default MET coordinates
  if (geographyLat === undefined || geographyLng === undefined) {
    geographyLat = 40.7794;
    geographyLng = -73.9632;
    country = 'United States';
  }
  
  return {
    ...object,
    geographyLat,
    geographyLng,
    country
  };
}

/**
 * Map culture strings to country names
 */
function mapCultureToCountry(culture: string): string | null {
  if (!culture) return null;
  
  // Comprehensive mapping of nationality/cultural adjectives to country names
  const cultureMap: { [key: string]: string } = {
    // North America
    'American': 'United States',
    'Canadian': 'Canada',
    'Mexican': 'Mexico',
    'Cuban': 'Cuba',
    'Jamaican': 'Jamaica',
    'Haitian': 'Haiti',
    'Dominican': 'Dominican Republic',
    'Puerto Rican': 'Puerto Rico',
    'Bahamian': 'Bahamas',
    'Belizean': 'Belize',
    'Costa Rican': 'Costa Rica',
    'Guatemalan': 'Guatemala',
    'Honduran': 'Honduras',
    'Nicaraguan': 'Nicaragua',
    'Panamanian': 'Panama',
    'Salvadoran': 'El Salvador',
    
    // South America
    'Brazilian': 'Brazil',
    'Argentine': 'Argentina',
    'Argentinian': 'Argentina',
    'Argentinean': 'Argentina',
    'Chilean': 'Chile',
    'Colombian': 'Colombia',
    'Ecuadorian': 'Ecuador',
    'Paraguayan': 'Paraguay',
    'Peruvian': 'Peru',
    'Uruguayan': 'Uruguay',
    'Venezuelan': 'Venezuela',
    'Bolivian': 'Bolivia',
    'Guyanese': 'Guyana',
    'Surinamese': 'Suriname',
    
    // Europe - Western
    'British': 'United Kingdom',
    'English': 'United Kingdom',
    'Scottish': 'United Kingdom',
    'Welsh': 'United Kingdom',
    'Irish': 'Ireland',
    'French': 'France',
    'German': 'Germany',
    'Italian': 'Italy',
    'Spanish': 'Spain',
    'Portuguese': 'Portugal',
    'Dutch': 'Netherlands',
    'Belgian': 'Belgium',
    'Luxembourgish': 'Luxembourg',
    'Swiss': 'Switzerland',
    'Austrian': 'Austria',
    'Liechtensteiner': 'Liechtenstein',
    'Monégasque': 'Monaco',
    'Monacan': 'Monaco',
    
    // Europe - Northern
    'Danish': 'Denmark',
    'Finnish': 'Finland',
    'Icelandic': 'Iceland',
    'Norwegian': 'Norway',
    'Swedish': 'Sweden',
    'Estonian': 'Estonia',
    'Latvian': 'Latvia',
    'Lithuanian': 'Lithuania',
    
    // Europe - Eastern
    'Polish': 'Poland',
    'Czech': 'Czech Republic',
    'Czechoslovakian': 'Czech Republic',
    'Slovak': 'Slovakia',
    'Hungarian': 'Hungary',
    'Romanian': 'Romania',
    'Bulgarian': 'Bulgaria',
    'Moldovan': 'Moldova',
    'Ukrainian': 'Ukraine',
    'Belarusian': 'Belarus',
    'Russian': 'Russia',
    'Slovenian': 'Slovenia',
    'Slovene': 'Slovenia',
    'Croatian': 'Croatia',
    'Bosnian': 'Bosnia and Herzegovina',
    'Serbian': 'Serbia',
    'Macedonian': 'North Macedonia',
    'Kosovar': 'Kosovo',
    'Albanian': 'Albania',
    
    // Europe - Southern
    'Greek': 'Greece',
    'Maltese': 'Malta',
    'Cypriot': 'Cyprus',
    'Turkish': 'Turkey',
    'Andorran': 'Andorra',
    'Sammarinese': 'San Marino',
    'Vatican': 'Vatican City',
    
    // Middle East
    'Iranian': 'Iran',
    'Persian': 'Iran',
    'Iraqi': 'Iraq',
    'Syrian': 'Syria',
    'Lebanese': 'Lebanon',
    'Israeli': 'Israel',
    'Palestinian': 'Palestine',
    'Jordanian': 'Jordan',
    'Saudi': 'Saudi Arabia',
    'Saudi Arabian': 'Saudi Arabia',
    'Yemeni': 'Yemen',
    'Omani': 'Oman',
    'Emirati': 'United Arab Emirates',
    'UAE': 'United Arab Emirates',
    'Qatari': 'Qatar',
    'Bahraini': 'Bahrain',
    'Kuwaiti': 'Kuwait',
    
    // Asia - East
    'Chinese': 'China',
    'Japanese': 'Japan',
    'Korean': 'South Korea',
    'North Korean': 'North Korea',
    'Mongolian': 'Mongolia',
    'Taiwanese': 'Taiwan',
    'Hong Kong': 'Hong Kong',
    
    // Asia - South
    'Indian': 'India',
    'Pakistani': 'Pakistan',
    'Bangladeshi': 'Bangladesh',
    'Sri Lankan': 'Sri Lanka',
    'Ceylonese': 'Sri Lanka',
    'Nepalese': 'Nepal',
    'Nepali': 'Nepal',
    'Bhutanese': 'Bhutan',
    'Maldivian': 'Maldives',
    'Afghan': 'Afghanistan',
    
    // Asia - Southeast
    'Vietnamese': 'Vietnam',
    'Thai': 'Thailand',
    'Siamese': 'Thailand',
    'Cambodian': 'Cambodia',
    'Khmer': 'Cambodia',
    'Laotian': 'Laos',
    'Burmese': 'Myanmar',
    'Myanmar': 'Myanmar',
    'Malaysian': 'Malaysia',
    'Malayan': 'Malaysia',
    'Singaporean': 'Singapore',
    'Indonesian': 'Indonesia',
    'Filipino': 'Philippines',
    'Philippine': 'Philippines',
    'Bruneian': 'Brunei',
    'Timorese': 'East Timor',
    
    // Asia - Central
    'Kazakh': 'Kazakhstan',
    'Uzbek': 'Uzbekistan',
    'Turkmen': 'Turkmenistan',
    'Kyrgyz': 'Kyrgyzstan',
    'Tajik': 'Tajikistan',
    
    // Oceania
    'Australian': 'Australia',
    'New Zealand': 'New Zealand',
    'Kiwi': 'New Zealand',
    'Papua New Guinean': 'Papua New Guinea',
    'Fijian': 'Fiji',
    'Solomon Islander': 'Solomon Islands',
    'Vanuatuan': 'Vanuatu',
    'Samoan': 'Samoa',
    'Tongan': 'Tonga',
    
    // Africa - North
    'Egyptian': 'Egypt',
    'Libyan': 'Libya',
    'Tunisian': 'Tunisia',
    'Algerian': 'Algeria',
    'Moroccan': 'Morocco',
    'Sudanese': 'Sudan',
    
    // Africa - West
    'Nigerian': 'Nigeria',
    'Ghanaian': 'Ghana',
    'Ivorian': 'Ivory Coast',
    'Senegalese': 'Senegal',
    'Malian': 'Mali',
    'Guinean': 'Guinea',
    'Beninese': 'Benin',
    'Togolese': 'Togo',
    'Sierra Leonean': 'Sierra Leone',
    'Liberian': 'Liberia',
    'Mauritanian': 'Mauritania',
    'Gambian': 'Gambia',
    'Bissau-Guinean': 'Guinea-Bissau',
    'Cape Verdean': 'Cape Verde',
    'Burkinabé': 'Burkina Faso',
    'Nigerien': 'Niger',
    
    // Africa - Central
    'Congolese': 'Democratic Republic of the Congo',
    'Cameroonian': 'Cameroon',
    'Chadian': 'Chad',
    'Central African': 'Central African Republic',
    'Gabonese': 'Gabon',
    'Equatorial Guinean': 'Equatorial Guinea',
    'São Toméan': 'São Tomé and Príncipe',
    
    // Africa - East
    'Ethiopian': 'Ethiopia',
    'Abyssinian': 'Ethiopia',
    'Kenyan': 'Kenya',
    'Ugandan': 'Uganda',
    'Tanzanian': 'Tanzania',
    'Rwandan': 'Rwanda',
    'Burundian': 'Burundi',
    'Somali': 'Somalia',
    'Djiboutian': 'Djibouti',
    'Eritrean': 'Eritrea',
    'South Sudanese': 'South Sudan',
    'Seychellois': 'Seychelles',
    'Mauritian': 'Mauritius',
    'Comoran': 'Comoros',
    
    // Africa - Southern
    'South African': 'South Africa',
    'Namibian': 'Namibia',
    'Botswanan': 'Botswana',
    'Zimbabwean': 'Zimbabwe',
    'Rhodesian': 'Zimbabwe',
    'Zambian': 'Zambia',
    'Malawian': 'Malawi',
    'Mozambican': 'Mozambique',
    'Angolan': 'Angola',
    'Swazi': 'Eswatini',
    'Basotho': 'Lesotho',
    'Malagasy': 'Madagascar'
  };
  
  // Normalize culture string for matching
  const normalizedCulture = culture.trim();
  
  // Direct lookup
  if (cultureMap[normalizedCulture]) {
    return cultureMap[normalizedCulture];
  }
  
  // Case-insensitive lookup
  const caseInsensitiveMatch = Object.keys(cultureMap).find(
    key => key.toLowerCase() === normalizedCulture.toLowerCase()
  );
  
  if (caseInsensitiveMatch) {
    return cultureMap[caseInsensitiveMatch];
  }
  
  // Check if culture starts with any known adjectives
  // This handles cases like "French, 18th century" or "Italian Renaissance"
  for (const [adjective, country] of Object.entries(cultureMap)) {
    if (normalizedCulture.toLowerCase().startsWith(adjective.toLowerCase() + ' ') ||
        normalizedCulture.toLowerCase().startsWith(adjective.toLowerCase() + ',')) {
      return country;
    }
  }
  
  // If no matches were found in our map, log the culture string for future additions
  console.log(`No country mapping found for culture: "${culture}"`);
  
  return null;
}

/**
 * Get coordinates for a country by name
 * Uses a mapping of common countries
 */
export function getCountryCoordinates(country: string): { lat: number; lng: number } | null {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    'United States': { lat: 37.0902, lng: -95.7129 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'United Kingdom': { lat: 55.3781, lng: -3.4360 },
    'Italy': { lat: 41.8719, lng: 12.5674 },
    'China': { lat: 35.8617, lng: 104.1954 },
    'Japan': { lat: 36.2048, lng: 138.2529 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'Spain': { lat: 40.4637, lng: -3.7492 },
    'Egypt': { lat: 26.8206, lng: 30.8025 },
    'India': { lat: 20.5937, lng: 78.9629 },
    'Russia': { lat: 61.5240, lng: 105.3188 },
    'Canada': { lat: 56.1304, lng: -106.3468 },
    'Mexico': { lat: 23.6345, lng: -102.5528 },
    'Brazil': { lat: -14.2350, lng: -51.9253 },
    'Australia': { lat: -25.2744, lng: 133.7751 },
    'Turkey': { lat: 38.9637, lng: 35.2433 },
    'Greece': { lat: 39.0742, lng: 21.8243 },
    'South Korea': { lat: 35.9078, lng: 127.7669 },
    'Netherlands': { lat: 52.1326, lng: 5.2913 },
    'Sweden': { lat: 60.1282, lng: 18.6435 },
    'Switzerland': { lat: 46.8182, lng: 8.2275 },
    'Austria': { lat: 47.5162, lng: 14.5501 },
    'Belgium': { lat: 50.5039, lng: 4.4699 },
    'Denmark': { lat: 56.2639, lng: 9.5018 },
    'Norway': { lat: 60.4720, lng: 8.4689 },
    'Finland': { lat: 61.9241, lng: 25.7482 },
    'Poland': { lat: 51.9194, lng: 19.1451 },
    'Portugal': { lat: 39.3999, lng: -8.2245 },
    'Iran': { lat: 32.4279, lng: 53.6880 },
    'Iraq': { lat: 33.2232, lng: 43.6793 },
    'Syria': { lat: 34.8021, lng: 38.9968 },
    'Israel': { lat: 31.0461, lng: 34.8516 },
    'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
    'Morocco': { lat: 31.7917, lng: -7.0926 },
    'Algeria': { lat: 28.0339, lng: 1.6596 },
    'Tunisia': { lat: 33.8869, lng: 9.5375 },
    'South Africa': { lat: -30.5595, lng: 22.9375 },
    'Nigeria': { lat: 9.0820, lng: 8.6753 },
    'Ethiopia': { lat: 9.1450, lng: 40.4897 },
    'Kenya': { lat: 0.0236, lng: 37.9062 },
    'Thailand': { lat: 15.8700, lng: 100.9925 },
    'Vietnam': { lat: 14.0583, lng: 108.2772 },
    'Philippines': { lat: 12.8797, lng: 121.7740 },
    'Indonesia': { lat: -0.7893, lng: 113.9213 },
    'Malaysia': { lat: 4.2105, lng: 101.9758 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'New Zealand': { lat: -40.9006, lng: 174.8860 },
    'Argentina': { lat: -38.4161, lng: -63.6167 },
    'Chile': { lat: -35.6751, lng: -71.5430 },
    'Peru': { lat: -9.1900, lng: -75.0152 },
    'Colombia': { lat: 4.5709, lng: -74.2973 },
    'Afghanistan': { lat: 33.9391, lng: 67.7100 },
    'Pakistan': { lat: 30.3753, lng: 69.3451 },
    'Bangladesh': { lat: 23.6850, lng: 90.3563 },
    'Myanmar': { lat: 21.9162, lng: 95.9560 },
    'Cambodia': { lat: 12.5657, lng: 104.9910 },
    'Costa Rica': { lat: 9.7489, lng: -83.7534 },
  };
  
  // Normalize country name to handle case differences
  const normalizedCountry = country.trim();
  
  // Direct lookup
  if (coordinates[normalizedCountry]) {
    return coordinates[normalizedCountry];
  }
  
  // Try case-insensitive lookup
  const match = Object.keys(coordinates).find(
    key => key.toLowerCase() === normalizedCountry.toLowerCase()
  );
  
  return match ? coordinates[match] : null;
}

/**
 * Calculate distance between two geographic points using Haversine formula
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Define types for API responses
interface DepartmentsResponse {
  departments: Array<{
    departmentId: number;
    displayName: string;
  }>;
}

interface ObjectsResponse {
  total: number;
  objectIDs: number[] | null;
}

/**
 * Fetch a batch of suitable costume images from the MET API
 */
export async function fetchCostumeImages(count: number = 10): Promise<MetObject[]> {
  try {
    console.log("[API] fetchCostumeImages: Starting to fetch images, count:", count);
    
    // Use hardcoded department ID instead of fetching it
    const departmentId = COSTUME_DEPARTMENT_ID;

    console.log("[API] Using Costume Institute department ID:", departmentId);
    
    // Fetch object IDs from the Costume Institute
    console.log("[API] Fetching object IDs from MET API...");
    const objectsResponse = await axiosWithTimeout(
      `${MET_API_BASE_URL}/objects?departmentIds=${departmentId}`
    );
    
    // Type assertion for the response data
    console.log("[API] Received response from objects endpoint");
    const objectsData = objectsResponse.data as ObjectsResponse;
    const objectIds = objectsData.objectIDs || [];
    
    console.log(`[API] Found ${objectIds.length} objects in the Costume Institute`);
    
    if (objectIds.length === 0) {
      console.error("[API] No object IDs returned from the API");
      return [];
    }
    
    // Shuffle the array for randomness
    const shuffledIds = [...objectIds].sort(() => 0.5 - Math.random());
    
    // Increase the number of items to fetch significantly
    const fetchCount = Math.min(20, shuffledIds.length); // Fetch up to 20 items at once
    console.log(`[API] Fetching details for ${fetchCount} objects`);
    
    // Fetch details for multiple objects in parallel
    const fetchPromises = shuffledIds.slice(0, fetchCount).map(async (id) => {
      try {
        console.log(`[API] Fetching object ${id}...`);
        const response = await axiosWithTimeout(`${MET_API_BASE_URL}/objects/${id}`);
        console.log(`[API] Successfully fetched object ${id}`);
        return response.data as any;
      } catch (error) {
        console.error(`[API] Error fetching object ${id}:`, error);
        return null;
      }
    });
    
    console.log("[API] Waiting for all object fetch promises to resolve...");
    const results = await Promise.all(fetchPromises);
    
    console.log(`[API] Successfully fetched ${results.filter(Boolean).length} objects`);
    
    // Much more lenient filtering - only require title and image
    console.log("[API] Filtering for valid results with minimal requirements...");
    const validResults = results
      .filter(item => {
        if (!item) {
          console.log("[API] Filtering: Item is null");
          return false;
        }
        if (!item.primaryImage) {
          console.log(`[API] Filtering: Item ${item.objectID} has no primary image`);
          return false;
        }
        if (!item.title) {
          console.log(`[API] Filtering: Item ${item.objectID} has no title`);
          return false;
        }
        return true;
      })
      .map(item => {
        console.log(`[API] Processing item ${item.objectID} for coordinates`);
        const processedItem = processMetObject(item);
        
        // If no coordinates found, use default coordinates
        if (processedItem.geographyLat === undefined || processedItem.geographyLng === undefined) {
          console.log(`[API] No coordinates found for item ${item.objectID}, using default coordinates`);
          // Try to get coordinates from country first
          if (item.country) {
            const coords = getCountryCoordinates(item.country);
            if (coords) {
              processedItem.geographyLat = coords.lat;
              processedItem.geographyLng = coords.lng;
            }
          }
          
          // If still no coordinates, try culture
          if ((processedItem.geographyLat === undefined || processedItem.geographyLng === undefined) && item.culture) {
            const countryFromCulture = mapCultureToCountry(item.culture);
            if (countryFromCulture) {
              const coords = getCountryCoordinates(countryFromCulture);
              if (coords) {
                processedItem.geographyLat = coords.lat;
                processedItem.geographyLng = coords.lng;
              }
            }
          }
          
          // If still no coordinates, use a default location (New York, where the MET is)
          if (processedItem.geographyLat === undefined || processedItem.geographyLng === undefined) {
            processedItem.geographyLat = 40.7794;
            processedItem.geographyLng = -73.9632;
            console.log(`[API] Using default MET coordinates for item ${item.objectID}`);
          }
        }
        
        return processedItem;
      })
      .slice(0, count);
    
    console.log(`[API] Found ${validResults.length} valid costume objects`);
    
    if (validResults.length === 0) {
      // Log sample of items to see what we're getting
      console.log("[API] Sample of fetched items (no valid items found):");
      results.slice(0, 3).forEach((item, index) => {
        if (item) {
          console.log(`[API] Item ${index}:`, {
            id: item.objectID,
            title: item.title,
            primaryImage: !!item.primaryImage,
            country: item.country,
            culture: item.culture,
            geographyType: item.geographyType
          });
        }
      });
      
      // If we still have no valid items, try one more time with a different set
      if (validResults.length === 0 && shuffledIds.length > fetchCount) {
        console.log("[API] No valid items found, trying again with next batch...");
        return fetchCostumeImages(count);
      }
    } else {
      console.log("[API] Valid items found, returning data");
    }
    
    return validResults;
  } catch (error) {
    console.error('[API] Error in fetchCostumeImages:', error);
    // If there's an error, wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 2000));
    return fetchCostumeImages(count);
  }
}

/**
 * Fetch a single random costume image
 */
export async function fetchRandomCostumeImage(): Promise<MetObject | null> {
  const images = await fetchCostumeImages(1);
  return images.length > 0 ? images[0] : null;
} 