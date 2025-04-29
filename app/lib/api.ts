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
    'Afghanistan': 'Afghanistan',
    'Albania': 'Albania',
    'Algeria': 'Algeria',
    'Andorra': 'Andorra',
    'Angola': 'Angola',
    'Antigua and Barbuda': 'Antigua and Barbuda',
    'Argentina': 'Argentina',
    'Armenia': 'Armenia',
    'Australia': 'Australia',
    'Austria': 'Austria',
    'Azerbaijan': 'Azerbaijan',
    'Bahamas': 'Bahamas',
    'Bahrain': 'Bahrain',
    'Bangladesh': 'Bangladesh',
    'Barbados': 'Barbados',
    'Belarus': 'Belarus',
    'Belgium': 'Belgium',
    'Belize': 'Belize',
    'Benin': 'Benin',
    'Bhutan': 'Bhutan',
    'Bolivia': 'Bolivia',
    'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
    'Botswana': 'Botswana',
    'Brazil': 'Brazil',
    'Brunei': 'Brunei',
    'Bulgaria': 'Bulgaria',
    'Burkina Faso': 'Burkina Faso',
    'Burundi': 'Burundi',
    'Cambodia': 'Cambodia',
    'Cameroon': 'Cameroon',
    'Canada': 'Canada',
    'Cape Verde': 'Cape Verde',
    'Central African Republic': 'Central African Republic',
    'Chad': 'Chad',
    'Chile': 'Chile',
    'China': 'China',
    'Colombia': 'Colombia',
    'Comoros': 'Comoros',
    'Congo': 'Congo',
    'Costa Rica': 'Costa Rica',
    'Croatia': 'Croatia',
    'Cuba': 'Cuba',
    'Cyprus': 'Cyprus',
    'Czech Republic': 'Czech Republic',
    'Denmark': 'Denmark',
    'Djibouti': 'Djibouti',
    'Dominica': 'Dominica',
    'Dominican Republic': 'Dominican Republic',
    'Ecuador': 'Ecuador',
    'Egypt': 'Egypt',
    'El Salvador': 'El Salvador',
    'Equatorial Guinea': 'Equatorial Guinea',
    'Eritrea': 'Eritrea',
    'Estonia': 'Estonia',
    'Eswatini': 'Eswatini',
    'Ethiopia': 'Ethiopia',
    'Fiji': 'Fiji',
    'Finland': 'Finland',
    'France': 'France',
    'Gabon': 'Gabon',
    'Gambia': 'Gambia',
    'Georgia': 'Georgia',
    'Germany': 'Germany',
    'Ghana': 'Ghana',
    'Greece': 'Greece',
    'Grenada': 'Grenada',
    'Guatemala': 'Guatemala',
    'Guinea': 'Guinea',
    'Guinea-Bissau': 'Guinea-Bissau',
    'Guyana': 'Guyana',
    'Haiti': 'Haiti',
    'Honduras': 'Honduras',
    'Hungary': 'Hungary',
    'Iceland': 'Iceland',
    'India': 'India',
    'Indonesia': 'Indonesia',
    'Iran': 'Iran',
    'Iraq': 'Iraq',
    'Ireland': 'Ireland',
    'Israel': 'Israel',
    'Italy': 'Italy',
    'Jamaica': 'Jamaica',
    'Japan': 'Japan',
    'Jordan': 'Jordan',
    'Kazakhstan': 'Kazakhstan',
    'Kenya': 'Kenya',
    'Kiribati': 'Kiribati',
    'Korea': 'Korea',
    'Kosovo': 'Kosovo',
    'Kuwait': 'Kuwait',
    'Kyrgyzstan': 'Kyrgyzstan',
    'Laos': 'Laos',
    'Latvia': 'Latvia',
    'Lebanon': 'Lebanon',
    'Lesotho': 'Lesotho',
    'Liberia': 'Liberia',
    'Libya': 'Libya',
    'Liechtenstein': 'Liechtenstein',
    'Lithuania': 'Lithuania',
    'Luxembourg': 'Luxembourg',
    'Madagascar': 'Madagascar',
    'Malawi': 'Malawi',
    'Malaysia': 'Malaysia',
    'Maldives': 'Maldives',
    'Mali': 'Mali',
    'Malta': 'Malta',
    'Marshall Islands': 'Marshall Islands',
    'Mauritania': 'Mauritania',
    'Mauritius': 'Mauritius',
    'Mexico': 'Mexico',
    'Micronesia': 'Micronesia',
    'Moldova': 'Moldova',
    'Monaco': 'Monaco',
    'Mongolia': 'Mongolia',
    'Montenegro': 'Montenegro',
    'Morocco': 'Morocco',
    'Mozambique': 'Mozambique',
    'Myanmar': 'Myanmar',
    'Namibia': 'Namibia',
    'Nauru': 'Nauru',
    'Nepal': 'Nepal',
    'Netherlands': 'Netherlands',
    'New Zealand': 'New Zealand',
    'Nicaragua': 'Nicaragua',
    'Niger': 'Niger',
    'Nigeria': 'Nigeria',
    'North Macedonia': 'North Macedonia',
    'Norway': 'Norway',
    'Oman': 'Oman',
    'Pakistan': 'Pakistan',
    'Palau': 'Palau',
    'Panama': 'Panama',
    'Papua New Guinea': 'Papua New Guinea',
    'Paraguay': 'Paraguay',
    'Peru': 'Peru',
    'Philippines': 'Philippines',
    'Poland': 'Poland',
    'Portugal': 'Portugal',
    'Qatar': 'Qatar',
    'Romania': 'Romania',
    'Russia': 'Russia',
    'Rwanda': 'Rwanda',
    'Saint Kitts and Nevis': 'Saint Kitts and Nevis',
    'Saint Lucia': 'Saint Lucia',
    'Saint Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
    'Samoa': 'Samoa',
    'San Marino': 'San Marino',
    'Sao Tome and Principe': 'Sao Tome and Principe',
    'Saudi Arabia': 'Saudi Arabia',
    'Senegal': 'Senegal',
    'Serbia': 'Serbia',
    'Seychelles': 'Seychelles',
    'Sierra Leone': 'Sierra Leone',
    'Singapore': 'Singapore',
    'Slovakia': 'Slovakia',
    'Slovenia': 'Slovenia',
    'Solomon Islands': 'Solomon Islands',
    'Somalia': 'Somalia',
    'South Africa': 'South Africa',
    'South Sudan': 'South Sudan',
    'Spain': 'Spain',
    'Sri Lanka': 'Sri Lanka',
    'Sudan': 'Sudan',
    'Suriname': 'Suriname',
    'Sweden': 'Sweden',
    'Switzerland': 'Switzerland',
    'Syria': 'Syria',
    'Taiwan': 'Taiwan',
    'Tajikistan': 'Tajikistan',
    'Tanzania': 'Tanzania',
    'Thailand': 'Thailand',
    'Timor-Leste': 'Timor-Leste',
    'Togo': 'Togo',
    'Tonga': 'Tonga',
    'Trinidad and Tobago': 'Trinidad and Tobago',
    'Tunisia': 'Tunisia',
    'Turkey': 'Turkey',
    'Turkmenistan': 'Turkmenistan',
    'Tuvalu': 'Tuvalu',
    'Uganda': 'Uganda',
    'Ukraine': 'Ukraine',
    'United Arab Emirates': 'United Arab Emirates',
    'United Kingdom': 'United Kingdom',
    'United States': 'United States',
    'Uruguay': 'Uruguay',
    'Uzbekistan': 'Uzbekistan',
    'Vanuatu': 'Vanuatu',
    'Vatican City': 'Vatican City',
    'Venezuela': 'Venezuela',
    'Vietnam': 'Vietnam',
    'Yemen': 'Yemen',
    'Zambia': 'Zambia',
    'Zimbabwe': 'Zimbabwe'
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

const historicalLocations: Record<string, {
  modernName: string;
  coordinates: [number, number];
  historicalNames?: string[];
  ethnicDescriptors?: string[];
}> = {
  'Afghanistan': {
    modernName: 'Afghanistan',
    coordinates: [33.9391, 67.7100],
    historicalNames: ['Khorasan', 'Ariana', 'Gandhara'],
    ethnicDescriptors: ['Afghan', 'Pashtun', 'Tajik', 'Hazara', 'Uzbek']
  },
  'Albania': {
    modernName: 'Albania',
    coordinates: [41.1533, 20.1683],
    historicalNames: ['Illyria', 'Arberia'],
    ethnicDescriptors: ['Albanian', 'Illyrian', 'Arbereshe']
  },
  'Algeria': {
    modernName: 'Algeria',
    coordinates: [28.0339, 1.6596],
    historicalNames: ['Numidia', 'Mauretania Caesariensis'],
    ethnicDescriptors: ['Algerian', 'Berber', 'Kabyle', 'Tuareg']
  },
  'Andorra': {
    modernName: 'Andorra',
    coordinates: [42.5063, 1.5218],
    ethnicDescriptors: ['Andorran', 'Catalan']
  },
  'Angola': {
    modernName: 'Angola',
    coordinates: [-11.2027, 17.8739],
    historicalNames: ['Kingdom of Ndongo', 'Kingdom of Kongo'],
    ethnicDescriptors: ['Angolan', 'Ovimbundu', 'Kimbundu', 'Bakongo']
  },
  'Antigua and Barbuda': {
    modernName: 'Antigua and Barbuda',
    coordinates: [17.0608, -61.7964],
    ethnicDescriptors: ['Antiguan', 'Barbudan', 'Caribbean']
  },
  'Argentina': {
    modernName: 'Argentina',
    coordinates: [-38.4161, -63.6167],
    historicalNames: ['Viceroyalty of the Río de la Plata'],
    ethnicDescriptors: ['Argentine', 'Criollo', 'Mestizo', 'Mapuche']
  },
  'Armenia': {
    modernName: 'Armenia',
    coordinates: [40.0691, 45.0382],
    historicalNames: ['Urartu', 'Kingdom of Armenia'],
    ethnicDescriptors: ['Armenian', 'Hay', 'Hemshin']
  },
  'Australia': {
    modernName: 'Australia',
    coordinates: [-25.2744, 133.7751],
    historicalNames: ['New Holland'],
    ethnicDescriptors: ['Australian', 'Aboriginal', 'Torres Strait Islander']
  },
  'Austria': {
    modernName: 'Austria',
    coordinates: [47.5162, 14.5501],
    historicalNames: ['Ostmark', 'Austrian Empire', 'Austria-Hungary'],
    ethnicDescriptors: ['Austrian', 'German', 'Slovene', 'Croat', 'Hungarian']
  },
  'Azerbaijan': {
    modernName: 'Azerbaijan',
    coordinates: [40.1431, 47.5769],
    historicalNames: ['Arran', 'Caucasian Albania'],
    ethnicDescriptors: ['Azerbaijani', 'Azeri', 'Talysh', 'Lezgin']
  },
  'Bahamas': {
    modernName: 'Bahamas',
    coordinates: [25.0343, -77.3963],
    ethnicDescriptors: ['Bahamian', 'Afro-Bahamian', 'Lucayan']
  },
  'Bahrain': {
    modernName: 'Bahrain',
    coordinates: [26.0667, 50.5577],
    historicalNames: ['Dilmun', 'Tylos'],
    ethnicDescriptors: ['Bahraini', 'Arab', 'Ajami']
  },
  'Bangladesh': {
    modernName: 'Bangladesh',
    coordinates: [23.6850, 90.3563],
    historicalNames: ['Bengal', 'East Bengal'],
    ethnicDescriptors: ['Bangladeshi', 'Bengali', 'Chakma', 'Marma']
  },
  'Barbados': {
    modernName: 'Barbados',
    coordinates: [13.1939, -59.5432],
    ethnicDescriptors: ['Barbadian', 'Bajan', 'Afro-Barbadian']
  },
  'Belarus': {
    modernName: 'Belarus',
    coordinates: [53.7098, 27.9534],
    historicalNames: ['Ruthenia', 'White Russia'],
    ethnicDescriptors: ['Belarusian', 'Ruthenian', 'Polish', 'Russian']
  },
  'Belgium': {
    modernName: 'Belgium',
    coordinates: [50.5039, 4.4699],
    historicalNames: ['Belgica', 'Austrian Netherlands'],
    ethnicDescriptors: ['Belgian', 'Flemish', 'Walloon', 'German']
  },
  'Belize': {
    modernName: 'Belize',
    coordinates: [17.1899, -88.4976],
    historicalNames: ['British Honduras'],
    ethnicDescriptors: ['Belizean', 'Maya', 'Garifuna', 'Mestizo']
  },
  'Benin': {
    modernName: 'Benin',
    coordinates: [9.3077, 2.3158],
    historicalNames: ['Dahomey'],
    ethnicDescriptors: ['Beninese', 'Fon', 'Yoruba', 'Adja']
  },
  'Bhutan': {
    modernName: 'Bhutan',
    coordinates: [27.5142, 90.4336],
    historicalNames: ['Druk Yul'],
    ethnicDescriptors: ['Bhutanese', 'Drukpa', 'Ngalop', 'Sharchop']
  },
  'Bolivia': {
    modernName: 'Bolivia',
    coordinates: [-16.2902, -63.5887],
    historicalNames: ['Upper Peru'],
    ethnicDescriptors: ['Bolivian', 'Quechua', 'Aymara', 'Guarani']
  },
  'Bosnia and Herzegovina': {
    modernName: 'Bosnia and Herzegovina',
    coordinates: [43.9159, 17.6791],
    historicalNames: ['Bosnia', 'Herzegovina'],
    ethnicDescriptors: ['Bosnian', 'Bosniak', 'Serb', 'Croat']
  },
  'Botswana': {
    modernName: 'Botswana',
    coordinates: [-22.3285, 24.6849],
    historicalNames: ['Bechuanaland'],
    ethnicDescriptors: ['Batswana', 'Tswana', 'San', 'Kgalagadi']
  },
  'Brazil': {
    modernName: 'Brazil',
    coordinates: [-14.2350, -51.9253],
    historicalNames: ['Terra do Brasil'],
    ethnicDescriptors: ['Brazilian', 'Mestizo', 'Caboclo', 'Caipira']
  },
  'Brunei': {
    modernName: 'Brunei',
    coordinates: [4.5353, 114.7277],
    historicalNames: ['Poni', 'Barunai'],
    ethnicDescriptors: ['Bruneian', 'Malay', 'Dayak', 'Kedayan']
  },
  'Bulgaria': {
    modernName: 'Bulgaria',
    coordinates: [42.7339, 25.4858],
    historicalNames: ['First Bulgarian Empire', 'Second Bulgarian Empire'],
    ethnicDescriptors: ['Bulgarian', 'Pomak', 'Turk', 'Roma']
  },
  'Burkina Faso': {
    modernName: 'Burkina Faso',
    coordinates: [12.2383, -1.5616],
    historicalNames: ['Upper Volta'],
    ethnicDescriptors: ['Burkinabe', 'Mossi', 'Fulani', 'Gurma']
  },
  'Burundi': {
    modernName: 'Burundi',
    coordinates: [-3.3731, 29.9189],
    historicalNames: ['Urundi'],
    ethnicDescriptors: ['Burundian', 'Hutu', 'Tutsi', 'Twa']
  },
  'Cambodia': {
    modernName: 'Cambodia',
    coordinates: [12.5657, 104.9910],
    historicalNames: ['Kambuja', 'Khmer Empire'],
    ethnicDescriptors: ['Cambodian', 'Khmer', 'Cham', 'Vietnamese']
  },
  'Cameroon': {
    modernName: 'Cameroon',
    coordinates: [7.3697, 12.3547],
    historicalNames: ['Kamerun'],
    ethnicDescriptors: ['Cameroonian', 'Bamileke', 'Fulani', 'Duala']
  },
  'Canada': {
    modernName: 'Canada',
    coordinates: [56.1304, -106.3468],
    historicalNames: ['New France'],
    ethnicDescriptors: ['Canadian', 'First Nations', 'Inuit', 'Métis']
  },
  'Cape Verde': {
    modernName: 'Cape Verde',
    coordinates: [16.5388, -23.0418],
    ethnicDescriptors: ['Cape Verdean', 'Crioulo', 'Mestiço']
  },
  'Central African Republic': {
    modernName: 'Central African Republic',
    coordinates: [6.6111, 20.9394],
    historicalNames: ['Ubangi-Shari'],
    ethnicDescriptors: ['Central African', 'Baya', 'Banda', 'Mandjia']
  },
  'Chad': {
    modernName: 'Chad',
    coordinates: [15.4542, 18.7322],
    historicalNames: ['Kanem-Bornu Empire'],
    ethnicDescriptors: ['Chadian', 'Sara', 'Arab', 'Toubou']
  },
  'Chile': {
    modernName: 'Chile',
    coordinates: [-35.6751, -71.5430],
    historicalNames: ['Captaincy General of Chile'],
    ethnicDescriptors: ['Chilean', 'Mapuche', 'Aymara', 'Rapa Nui']
  },
  'China': {
    modernName: 'China',
    coordinates: [35.8617, 104.1954],
    historicalNames: ['Zhongguo', 'Middle Kingdom', 'Qing', 'Ming', 'Tang', 'Han'],
    ethnicDescriptors: ['Chinese', 'Han', 'Manchu', 'Mongol', 'Tibetan', 'Uyghur']
  },
  'Colombia': {
    modernName: 'Colombia',
    coordinates: [4.5709, -74.2973],
    historicalNames: ['New Granada'],
    ethnicDescriptors: ['Colombian', 'Mestizo', 'Paisa', 'Costeño']
  },
  'Comoros': {
    modernName: 'Comoros',
    coordinates: [-11.8750, 43.8722],
    historicalNames: ['Comorian Sultanates'],
    ethnicDescriptors: ['Comorian', 'Shirazi', 'Antalote', 'Makoa']
  },
  'Congo': {
    modernName: 'Congo',
    coordinates: [-0.2280, 15.8277],
    historicalNames: ['Kingdom of Kongo'],
    ethnicDescriptors: ['Congolese', 'Kongo', 'Teke', 'Mbochi']
  },
  'Costa Rica': {
    modernName: 'Costa Rica',
    coordinates: [9.7489, -83.7534],
    ethnicDescriptors: ['Costa Rican', 'Tico', 'Mestizo', 'Bribri']
  },
  'Croatia': {
    modernName: 'Croatia',
    coordinates: [45.1000, 15.2000],
    historicalNames: ['Kingdom of Croatia'],
    ethnicDescriptors: ['Croatian', 'Dalmatian', 'Istrian', 'Slavonian']
  },
  'Cuba': {
    modernName: 'Cuba',
    coordinates: [21.5218, -77.7812],
    historicalNames: ['Spanish Cuba'],
    ethnicDescriptors: ['Cuban', 'Criollo', 'Afro-Cuban', 'Taíno']
  },
  'Cyprus': {
    modernName: 'Cyprus',
    coordinates: [35.1264, 33.4299],
    historicalNames: ['Alashiya'],
    ethnicDescriptors: ['Cypriot', 'Greek', 'Turkish', 'Maronite']
  },
  'Czech Republic': {
    modernName: 'Czech Republic',
    coordinates: [49.8175, 15.4730],
    historicalNames: ['Bohemia', 'Moravia', 'Czechoslovakia'],
    ethnicDescriptors: ['Czech', 'Bohemian', 'Moravian', 'Silesian']
  },
  'Denmark': {
    modernName: 'Denmark',
    coordinates: [56.2639, 9.5018],
    historicalNames: ['Danmark'],
    ethnicDescriptors: ['Danish', 'Dane', 'Jutlander', 'Zealander']
  },
  'Djibouti': {
    modernName: 'Djibouti',
    coordinates: [11.8251, 42.5903],
    historicalNames: ['French Somaliland'],
    ethnicDescriptors: ['Djiboutian', 'Afar', 'Somali', 'Issa']
  },
  'Dominica': {
    modernName: 'Dominica',
    coordinates: [15.4150, -61.3710],
    ethnicDescriptors: ['Dominican', 'Kalinago', 'Creole']
  },
  'Dominican Republic': {
    modernName: 'Dominican Republic',
    coordinates: [18.7357, -70.1627],
    historicalNames: ['Santo Domingo'],
    ethnicDescriptors: ['Dominican', 'Criollo', 'Afro-Dominican', 'Taíno']
  },
  'Ecuador': {
    modernName: 'Ecuador',
    coordinates: [-1.8312, -78.1834],
    historicalNames: ['Quito', 'Gran Colombia'],
    ethnicDescriptors: ['Ecuadorian', 'Mestizo', 'Quechua', 'Shuar']
  },
  'Egypt': {
    modernName: 'Egypt',
    coordinates: [26.8206, 30.8025],
    historicalNames: ['Kemet', 'Ancient Egypt', 'Aegyptus'],
    ethnicDescriptors: ['Egyptian', 'Coptic', 'Nubian', 'Bedouin']
  },
  'El Salvador': {
    modernName: 'El Salvador',
    coordinates: [13.7942, -88.8965],
    historicalNames: ['Cuzcatlan'],
    ethnicDescriptors: ['Salvadoran', 'Mestizo', 'Pipil', 'Lenca']
  },
  'Equatorial Guinea': {
    modernName: 'Equatorial Guinea',
    coordinates: [1.6508, 10.2679],
    historicalNames: ['Spanish Guinea'],
    ethnicDescriptors: ['Equatoguinean', 'Fang', 'Bubi', 'Ndowe']
  },
  'Eritrea': {
    modernName: 'Eritrea',
    coordinates: [15.1794, 39.7823],
    historicalNames: ['Medri Bahri', 'Italian Eritrea'],
    ethnicDescriptors: ['Eritrean', 'Tigrinya', 'Tigre', 'Afar']
  },
  'Estonia': {
    modernName: 'Estonia',
    coordinates: [58.5953, 25.0136],
    historicalNames: ['Estland', 'Livonia'],
    ethnicDescriptors: ['Estonian', 'Seto', 'Võro', 'Russian']
  },
  'Eswatini': {
    modernName: 'Eswatini',
    coordinates: [-26.5225, 31.4659],
    historicalNames: ['Swaziland'],
    ethnicDescriptors: ['Swazi', 'Nguni', 'Sotho']
  },
  'Ethiopia': {
    modernName: 'Ethiopia',
    coordinates: [9.1450, 40.4897],
    historicalNames: ['Abyssinia', 'Aksum'],
    ethnicDescriptors: ['Ethiopian', 'Amhara', 'Oromo', 'Tigray']
  },
  'Fiji': {
    modernName: 'Fiji',
    coordinates: [-17.7134, 178.0650],
    historicalNames: ['Viti'],
    ethnicDescriptors: ['Fijian', 'iTaukei', 'Indo-Fijian', 'Rotuman']
  },
  'Finland': {
    modernName: 'Finland',
    coordinates: [61.9241, 25.7482],
    historicalNames: ['Suomi', 'Grand Duchy of Finland'],
    ethnicDescriptors: ['Finnish', 'Sami', 'Swedish', 'Karelian']
  },
  'France': {
    modernName: 'France',
    coordinates: [46.2276, 2.2137],
    historicalNames: ['Gaul', 'Francia', 'Kingdom of France'],
    ethnicDescriptors: ['French', 'Breton', 'Occitan', 'Corsican']
  },
  'Gabon': {
    modernName: 'Gabon',
    coordinates: [-0.8037, 11.6094],
    historicalNames: ['French Congo'],
    ethnicDescriptors: ['Gabonese', 'Fang', 'Punu', 'Teke']
  },
  'Gambia': {
    modernName: 'Gambia',
    coordinates: [13.4432, -15.3101],
    historicalNames: ['Senegambia'],
    ethnicDescriptors: ['Gambian', 'Mandinka', 'Fula', 'Wolof']
  },
  'Georgia': {
    modernName: 'Georgia',
    coordinates: [42.3154, 43.3569],
    historicalNames: ['Colchis', 'Iberia', 'Kingdom of Georgia'],
    ethnicDescriptors: ['Georgian', 'Kartvelian', 'Mingrelian', 'Svan']
  },
  'Germany': {
    modernName: 'Germany',
    coordinates: [51.1657, 10.4515],
    historicalNames: ['Germania', 'Holy Roman Empire', 'Prussia'],
    ethnicDescriptors: ['German', 'Bavarian', 'Saxon', 'Frisian']
  },
  'Ghana': {
    modernName: 'Ghana',
    coordinates: [7.9465, -1.0232],
    historicalNames: ['Gold Coast', 'Ghana Empire'],
    ethnicDescriptors: ['Ghanaian', 'Akan', 'Ewe', 'Ga']
  },
  'Greece': {
    modernName: 'Greece',
    coordinates: [39.0742, 21.8243],
    historicalNames: ['Hellas', 'Byzantium', 'Ancient Greece'],
    ethnicDescriptors: ['Greek', 'Pontic', 'Macedonian', 'Arvanite']
  },
  'Grenada': {
    modernName: 'Grenada',
    coordinates: [12.1165, -61.6790],
    historicalNames: ['French Grenada'],
    ethnicDescriptors: ['Grenadian', 'Afro-Grenadian', 'Carib']
  },
  'Guatemala': {
    modernName: 'Guatemala',
    coordinates: [15.7835, -90.2308],
    historicalNames: ['Maya Civilization'],
    ethnicDescriptors: ['Guatemalan', 'Maya', 'Ladino', 'Xinca']
  },
  'Guinea': {
    modernName: 'Guinea',
    coordinates: [9.9456, -9.6966],
    historicalNames: ['French Guinea'],
    ethnicDescriptors: ['Guinean', 'Fula', 'Malinke', 'Susu']
  },
  'Guinea-Bissau': {
    modernName: 'Guinea-Bissau',
    coordinates: [11.8037, -15.1804],
    historicalNames: ['Portuguese Guinea'],
    ethnicDescriptors: ['Bissau-Guinean', 'Fula', 'Balanta', 'Mandinka']
  },
  'Guyana': {
    modernName: 'Guyana',
    coordinates: [4.8604, -58.9302],
    historicalNames: ['British Guiana'],
    ethnicDescriptors: ['Guyanese', 'Indo-Guyanese', 'Afro-Guyanese', 'Amerindian']
  },
  'Haiti': {
    modernName: 'Haiti',
    coordinates: [18.9712, -72.2852],
    historicalNames: ['Saint-Domingue'],
    ethnicDescriptors: ['Haitian', 'Afro-Haitian', 'Creole']
  },
  'Honduras': {
    modernName: 'Honduras',
    coordinates: [15.2000, -86.2419],
    historicalNames: ['Spanish Honduras'],
    ethnicDescriptors: ['Honduran', 'Mestizo', 'Lenca', 'Garifuna']
  },
  'Hungary': {
    modernName: 'Hungary',
    coordinates: [47.1625, 19.5033],
    historicalNames: ['Magyar', 'Kingdom of Hungary'],
    ethnicDescriptors: ['Hungarian', 'Magyar', 'Szekely', 'Romani']
  },
  'Iceland': {
    modernName: 'Iceland',
    coordinates: [64.9631, -19.0208],
    historicalNames: ['Ísland'],
    ethnicDescriptors: ['Icelandic', 'Norse']
  },
  'India': {
    modernName: 'India',
    coordinates: [20.5937, 78.9629],
    historicalNames: ['Bharat', 'Hindustan', 'Indus Valley'],
    ethnicDescriptors: ['Indian', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi']
  },
  'Indonesia': {
    modernName: 'Indonesia',
    coordinates: [-0.7893, 113.9213],
    historicalNames: ['Dutch East Indies', 'Majapahit'],
    ethnicDescriptors: ['Indonesian', 'Javanese', 'Sundanese', 'Balinese', 'Batak']
  },
  'Iran': {
    modernName: 'Iran',
    coordinates: [32.4279, 53.6880],
    historicalNames: ['Persia', 'Elam', 'Parthia'],
    ethnicDescriptors: ['Iranian', 'Persian', 'Azeri', 'Kurd', 'Lur']
  },
  'Iraq': {
    modernName: 'Iraq',
    coordinates: [33.2232, 43.6793],
    historicalNames: ['Mesopotamia', 'Babylonia', 'Assyria'],
    ethnicDescriptors: ['Iraqi', 'Arab', 'Kurd', 'Assyrian', 'Turkmen']
  },
  'Ireland': {
    modernName: 'Ireland',
    coordinates: [53.4129, -8.2439],
    historicalNames: ['Éire', 'Hibernia'],
    ethnicDescriptors: ['Irish', 'Gaelic', 'Ulster', 'Connacht']
  },
  'Israel': {
    modernName: 'Israel',
    coordinates: [31.0461, 34.8516],
    historicalNames: ['Judea', 'Canaan', 'Palestine'],
    ethnicDescriptors: ['Israeli', 'Jewish', 'Arab', 'Druze']
  },
  'Italy': {
    modernName: 'Italy',
    coordinates: [41.8719, 12.5674],
    historicalNames: ['Italia', 'Roman Empire', 'Etruria'],
    ethnicDescriptors: ['Italian', 'Sicilian', 'Sardinian', 'Venetian']
  },
  'Jamaica': {
    modernName: 'Jamaica',
    coordinates: [18.1096, -77.2975],
    historicalNames: ['Xaymaca'],
    ethnicDescriptors: ['Jamaican', 'Afro-Jamaican', 'Taino']
  },
  'Japan': {
    modernName: 'Japan',
    coordinates: [36.2048, 138.2529],
    historicalNames: ['Nihon', 'Yamato', 'Edo', 'Meiji'],
    ethnicDescriptors: ['Japanese', 'Yamato', 'Ainu', 'Ryukyuan']
  },
  'Jordan': {
    modernName: 'Jordan',
    coordinates: [30.5852, 36.2384],
    historicalNames: ['Transjordan', 'Nabataea'],
    ethnicDescriptors: ['Jordanian', 'Arab', 'Circassian', 'Chechen']
  },
  'Kazakhstan': {
    modernName: 'Kazakhstan',
    coordinates: [48.0196, 66.9237],
    historicalNames: ['Kazakh Khanate'],
    ethnicDescriptors: ['Kazakh', 'Russian', 'Uzbek', 'Uighur']
  },
  'Kenya': {
    modernName: 'Kenya',
    coordinates: [-0.0236, 37.9062],
    historicalNames: ['British East Africa'],
    ethnicDescriptors: ['Kenyan', 'Kikuyu', 'Luo', 'Kamba', 'Maasai']
  },
  'Kiribati': {
    modernName: 'Kiribati',
    coordinates: [-3.3704, -168.7340],
    historicalNames: ['Gilbert Islands'],
    ethnicDescriptors: ['I-Kiribati', 'Micronesian']
  },
  'Korea': {
    modernName: 'Korea',
    coordinates: [35.9078, 127.7669],
    historicalNames: ['Joseon', 'Goryeo', 'Silla'],
    ethnicDescriptors: ['Korean', 'Joseon', 'Goryeo']
  },
  'Kuwait': {
    modernName: 'Kuwait',
    coordinates: [29.3117, 47.4818],
    historicalNames: ['Qurain'],
    ethnicDescriptors: ['Kuwaiti', 'Arab', 'Bedouin']
  },
  'Kyrgyzstan': {
    modernName: 'Kyrgyzstan',
    coordinates: [41.2044, 74.7661],
    historicalNames: ['Kyrgyz Khanate'],
    ethnicDescriptors: ['Kyrgyz', 'Russian', 'Uzbek', 'Dungan']
  },
  'Laos': {
    modernName: 'Laos',
    coordinates: [19.8563, 102.4955],
    historicalNames: ['Lan Xang', 'French Laos'],
    ethnicDescriptors: ['Lao', 'Hmong', 'Khmu', 'Tai']
  },
  'Latvia': {
    modernName: 'Latvia',
    coordinates: [56.8796, 24.6032],
    historicalNames: ['Livonia', 'Courland'],
    ethnicDescriptors: ['Latvian', 'Livonian', 'Russian']
  },
  'Lebanon': {
    modernName: 'Lebanon',
    coordinates: [33.8547, 35.8623],
    historicalNames: ['Phoenicia', 'Mount Lebanon'],
    ethnicDescriptors: ['Lebanese', 'Arab', 'Maronite', 'Druze']
  },
  'Lesotho': {
    modernName: 'Lesotho',
    coordinates: [-29.6099, 28.2336],
    historicalNames: ['Basutoland'],
    ethnicDescriptors: ['Basotho', 'Sotho']
  },
  'Liberia': {
    modernName: 'Liberia',
    coordinates: [6.4281, -9.4295],
    historicalNames: ['American Colonization Society'],
    ethnicDescriptors: ['Liberian', 'Kpelle', 'Bassa', 'Kru']
  },
  'Libya': {
    modernName: 'Libya',
    coordinates: [26.3351, 17.2283],
    historicalNames: ['Tripolitania', 'Cyrenaica'],
    ethnicDescriptors: ['Libyan', 'Arab', 'Berber', 'Tuareg']
  },
  'Liechtenstein': {
    modernName: 'Liechtenstein',
    coordinates: [47.1660, 9.5554],
    historicalNames: ['Vaduz'],
    ethnicDescriptors: ['Liechtensteiner', 'Alemannic']
  },
  'Lithuania': {
    modernName: 'Lithuania',
    coordinates: [55.1694, 23.8813],
    historicalNames: ['Grand Duchy of Lithuania'],
    ethnicDescriptors: ['Lithuanian', 'Samogitian', 'Polish']
  },
  'Luxembourg': {
    modernName: 'Luxembourg',
    coordinates: [49.8153, 6.1296],
    historicalNames: ['Luxemburg'],
    ethnicDescriptors: ['Luxembourger', 'German', 'French']
  },
  'Madagascar': {
    modernName: 'Madagascar',
    coordinates: [-18.7669, 46.8691],
    historicalNames: ['Malagasy Kingdom'],
    ethnicDescriptors: ['Malagasy', 'Merina', 'Betsileo', 'Betsimisaraka']
  },
  'Malawi': {
    modernName: 'Malawi',
    coordinates: [-13.2543, 34.3015],
    historicalNames: ['Nyasaland'],
    ethnicDescriptors: ['Malawian', 'Chewa', 'Yao', 'Tumbuka']
  },
  'Malaysia': {
    modernName: 'Malaysia',
    coordinates: [4.2105, 101.9758],
    historicalNames: ['Malaya', 'British Malaya'],
    ethnicDescriptors: ['Malaysian', 'Malay', 'Chinese', 'Indian', 'Iban']
  },
  'Maldives': {
    modernName: 'Maldives',
    coordinates: [3.2028, 73.2207],
    historicalNames: ['Divehi Rajje'],
    ethnicDescriptors: ['Maldivian', 'Divehi']
  },
  'Mali': {
    modernName: 'Mali',
    coordinates: [17.5707, -3.9962],
    historicalNames: ['Mali Empire', 'French Sudan'],
    ethnicDescriptors: ['Malian', 'Bambara', 'Fula', 'Songhai']
  },
  'Malta': {
    modernName: 'Malta',
    coordinates: [35.9375, 14.3754],
    historicalNames: ['Melita'],
    ethnicDescriptors: ['Maltese', 'Sicilian']
  },
  'Marshall Islands': {
    modernName: 'Marshall Islands',
    coordinates: [7.1315, 171.1845],
    historicalNames: ['Ratak Chain', 'Ralik Chain'],
    ethnicDescriptors: ['Marshallese', 'Micronesian']
  },
  'Mauritania': {
    modernName: 'Mauritania',
    coordinates: [21.0079, -10.9408],
    historicalNames: ['French West Africa'],
    ethnicDescriptors: ['Mauritanian', 'Moor', 'Fula', 'Soninke']
  },
  'Mauritius': {
    modernName: 'Mauritius',
    coordinates: [-20.3484, 57.5522],
    historicalNames: ['Île de France'],
    ethnicDescriptors: ['Mauritian', 'Creole', 'Indo-Mauritian', 'Sino-Mauritian']
  },
  'Mexico': {
    modernName: 'Mexico',
    coordinates: [23.6345, -102.5528],
    historicalNames: ['New Spain', 'Aztec Empire'],
    ethnicDescriptors: ['Mexican', 'Mestizo', 'Nahua', 'Maya', 'Zapotec']
  },
  'Micronesia': {
    modernName: 'Micronesia',
    coordinates: [7.4256, 150.5508],
    historicalNames: ['Caroline Islands'],
    ethnicDescriptors: ['Micronesian', 'Chuukese', 'Pohnpeian', 'Yapese']
  },
  'Moldova': {
    modernName: 'Moldova',
    coordinates: [47.4116, 28.3699],
    historicalNames: ['Bessarabia', 'Moldavia'],
    ethnicDescriptors: ['Moldovan', 'Romanian', 'Gagauz', 'Russian']
  },
  'Monaco': {
    modernName: 'Monaco',
    coordinates: [43.7384, 7.4246],
    historicalNames: ['Monaco-Ville'],
    ethnicDescriptors: ['Monégasque', 'French', 'Italian']
  },
  'Mongolia': {
    modernName: 'Mongolia',
    coordinates: [46.8625, 103.8467],
    historicalNames: ['Mongol Empire', 'Outer Mongolia'],
    ethnicDescriptors: ['Mongolian', 'Khalkha', 'Buryat', 'Kazakh']
  },
  'Montenegro': {
    modernName: 'Montenegro',
    coordinates: [42.7087, 19.3744],
    historicalNames: ['Duklja', 'Zeta'],
    ethnicDescriptors: ['Montenegrin', 'Serb', 'Bosniak', 'Albanian']
  },
  'Morocco': {
    modernName: 'Morocco',
    coordinates: [31.7917, -7.0926],
    historicalNames: ['Al-Maghrib', 'Mauretania'],
    ethnicDescriptors: ['Moroccan', 'Arab', 'Berber', 'Sahrawi']
  },
  'Mozambique': {
    modernName: 'Mozambique',
    coordinates: [-18.6657, 35.5296],
    historicalNames: ['Portuguese East Africa'],
    ethnicDescriptors: ['Mozambican', 'Makhuwa', 'Tsonga', 'Lomwe']
  },
  'Myanmar': {
    modernName: 'Myanmar',
    coordinates: [21.9162, 95.9560],
    historicalNames: ['Burma', 'Pagan Kingdom'],
    ethnicDescriptors: ['Burmese', 'Bamar', 'Shan', 'Karen', 'Rakhine']
  },
  'Namibia': {
    modernName: 'Namibia',
    coordinates: [-22.9576, 18.4904],
    historicalNames: ['German South-West Africa'],
    ethnicDescriptors: ['Namibian', 'Ovambo', 'Herero', 'Nama']
  },
  'Nauru': {
    modernName: 'Nauru',
    coordinates: [-0.5228, 166.9315],
    historicalNames: ['Pleasant Island'],
    ethnicDescriptors: ['Nauruan', 'Micronesian']
  },
  'Nepal': {
    modernName: 'Nepal',
    coordinates: [28.3949, 84.1240],
    historicalNames: ['Gorkha Kingdom'],
    ethnicDescriptors: ['Nepalese', 'Nepali', 'Newar', 'Gurung', 'Tamang']
  },
  'Netherlands': {
    modernName: 'Netherlands',
    coordinates: [52.1326, 5.2913],
    historicalNames: ['Holland', 'Dutch Republic'],
    ethnicDescriptors: ['Dutch', 'Frisian', 'Flemish']
  },
  'New Zealand': {
    modernName: 'New Zealand',
    coordinates: [-40.9006, 174.8860],
    historicalNames: ['Aotearoa'],
    ethnicDescriptors: ['New Zealander', 'Māori', 'Pākehā', 'Pasifika']
  },
  'Nicaragua': {
    modernName: 'Nicaragua',
    coordinates: [12.8654, -85.2072],
    historicalNames: ['Spanish Nicaragua'],
    ethnicDescriptors: ['Nicaraguan', 'Mestizo', 'Miskito', 'Rama']
  },
  'Niger': {
    modernName: 'Niger',
    coordinates: [17.6078, 8.0817],
    historicalNames: ['French Niger'],
    ethnicDescriptors: ['Nigerien', 'Hausa', 'Zarma', 'Tuareg']
  },
  'Nigeria': {
    modernName: 'Nigeria',
    coordinates: [9.0820, 8.6753],
    historicalNames: ['British Nigeria'],
    ethnicDescriptors: ['Nigerian', 'Hausa', 'Yoruba', 'Igbo', 'Fulani']
  },
  'North Korea': {
    modernName: 'North Korea',
    coordinates: [40.3399, 127.5101],
    historicalNames: ['Joseon', 'Goryeo'],
    ethnicDescriptors: ['North Korean', 'Korean']
  },
  'North Macedonia': {
    modernName: 'North Macedonia',
    coordinates: [41.6086, 21.7453],
    historicalNames: ['Macedonia', 'Paeonia'],
    ethnicDescriptors: ['Macedonian', 'Albanian', 'Turkish', 'Romani']
  },
  'Norway': {
    modernName: 'Norway',
    coordinates: [60.4720, 8.4689],
    historicalNames: ['Norge', 'Noreg'],
    ethnicDescriptors: ['Norwegian', 'Sami', 'Kven']
  },
  'Oman': {
    modernName: 'Oman',
    coordinates: [21.5126, 55.9233],
    historicalNames: ['Magan', 'Oman Sultanate'],
    ethnicDescriptors: ['Omani', 'Arab', 'Baloch', 'Zanzibari']
  },
  'Pakistan': {
    modernName: 'Pakistan',
    coordinates: [30.3753, 69.3451],
    historicalNames: ['Indus Valley', 'Gandhara'],
    ethnicDescriptors: ['Pakistani', 'Punjabi', 'Sindhi', 'Pashtun', 'Baloch']
  },
  'Palau': {
    modernName: 'Palau',
    coordinates: [7.5150, 134.5825],
    historicalNames: ['Belau'],
    ethnicDescriptors: ['Palauan', 'Micronesian']
  },
  'Panama': {
    modernName: 'Panama',
    coordinates: [8.5380, -80.7821],
    historicalNames: ['New Granada'],
    ethnicDescriptors: ['Panamanian', 'Mestizo', 'Ngäbe', 'Kuna']
  },
  'Papua New Guinea': {
    modernName: 'Papua New Guinea',
    coordinates: [-6.3149, 143.9555],
    historicalNames: ['German New Guinea'],
    ethnicDescriptors: ['Papua New Guinean', 'Melanesian', 'Papuan']
  },
  'Paraguay': {
    modernName: 'Paraguay',
    coordinates: [-23.4425, -58.4438],
    historicalNames: ['Spanish Paraguay'],
    ethnicDescriptors: ['Paraguayan', 'Mestizo', 'Guarani']
  },
  'Peru': {
    modernName: 'Peru',
    coordinates: [-9.1899, -75.0152],
    historicalNames: ['Inca Empire', 'Viceroyalty of Peru'],
    ethnicDescriptors: ['Peruvian', 'Quechua', 'Aymara', 'Mestizo']
  },
  'Philippines': {
    modernName: 'Philippines',
    coordinates: [12.8797, 121.7740],
    historicalNames: ['Las Islas Filipinas'],
    ethnicDescriptors: ['Filipino', 'Tagalog', 'Cebuano', 'Ilocano', 'Moro']
  },
  'Poland': {
    modernName: 'Poland',
    coordinates: [51.9194, 19.1451],
    historicalNames: ['Polska', 'Polish-Lithuanian Commonwealth'],
    ethnicDescriptors: ['Polish', 'Kashubian', 'Silesian', 'Lemko']
  },
  'Portugal': {
    modernName: 'Portugal',
    coordinates: [39.3999, -8.2245],
    historicalNames: ['Lusitania', 'Kingdom of Portugal'],
    ethnicDescriptors: ['Portuguese', 'Lusitanian']
  },
  'Qatar': {
    modernName: 'Qatar',
    coordinates: [25.3548, 51.1839],
    historicalNames: ['Catara'],
    ethnicDescriptors: ['Qatari', 'Arab', 'Bedouin']
  },
  'Romania': {
    modernName: 'Romania',
    coordinates: [45.9432, 24.9668],
    historicalNames: ['Dacia', 'Wallachia', 'Moldavia'],
    ethnicDescriptors: ['Romanian', 'Vlach', 'Hungarian', 'Roma']
  },
  'Russia': {
    modernName: 'Russia',
    coordinates: [61.5240, 105.3188],
    historicalNames: ['Rus', 'Kievan Rus', 'Russian Empire'],
    ethnicDescriptors: ['Russian', 'Tatar', 'Bashkir', 'Chechen']
  },
  'Rwanda': {
    modernName: 'Rwanda',
    coordinates: [-1.9403, 29.8739],
    historicalNames: ['Kingdom of Rwanda'],
    ethnicDescriptors: ['Rwandan', 'Hutu', 'Tutsi', 'Twa']
  },
  'Saint Kitts and Nevis': {
    modernName: 'Saint Kitts and Nevis',
    coordinates: [17.3578, -62.7830],
    historicalNames: ['Saint Christopher'],
    ethnicDescriptors: ['Kittitian', 'Nevisian', 'Afro-Caribbean']
  },
  'Saint Lucia': {
    modernName: 'Saint Lucia',
    coordinates: [13.9094, -60.9789],
    ethnicDescriptors: ['Saint Lucian', 'Afro-Caribbean']
  },
  'Saint Vincent and the Grenadines': {
    modernName: 'Saint Vincent and the Grenadines',
    coordinates: [12.9843, -61.2872],
    ethnicDescriptors: ['Vincentian', 'Afro-Caribbean', 'Garifuna']
  },
  'Samoa': {
    modernName: 'Samoa',
    coordinates: [-13.7590, -172.1046],
    historicalNames: ['German Samoa'],
    ethnicDescriptors: ['Samoan', 'Polynesian']
  },
  'San Marino': {
    modernName: 'San Marino',
    coordinates: [43.9424, 12.4578],
    historicalNames: ['Republic of San Marino'],
    ethnicDescriptors: ['Sammarinese', 'Italian']
  },
  'Sao Tome and Principe': {
    modernName: 'Sao Tome and Principe',
    coordinates: [0.1864, 6.6131],
    historicalNames: ['Portuguese São Tomé and Príncipe'],
    ethnicDescriptors: ['São Toméan', 'Forro', 'Angolar']
  },
  'Saudi Arabia': {
    modernName: 'Saudi Arabia',
    coordinates: [23.8859, 45.0792],
    historicalNames: ['Hejaz', 'Najd'],
    ethnicDescriptors: ['Saudi', 'Arab', 'Bedouin']
  },
  'Senegal': {
    modernName: 'Senegal',
    coordinates: [14.4974, -14.4524],
    historicalNames: ['French Senegal'],
    ethnicDescriptors: ['Senegalese', 'Wolof', 'Fula', 'Serer']
  },
  'Serbia': {
    modernName: 'Serbia',
    coordinates: [44.0165, 21.0059],
    historicalNames: ['Rascia', 'Serbian Empire'],
    ethnicDescriptors: ['Serbian', 'Bosniak', 'Hungarian', 'Roma']
  },
  'Seychelles': {
    modernName: 'Seychelles',
    coordinates: [-4.6796, 55.4920],
    historicalNames: ['French Seychelles'],
    ethnicDescriptors: ['Seychellois', 'Creole', 'Indian', 'Chinese']
  },
  'Sierra Leone': {
    modernName: 'Sierra Leone',
    coordinates: [8.4606, -11.7799],
    historicalNames: ['British Sierra Leone'],
    ethnicDescriptors: ['Sierra Leonean', 'Mende', 'Temne', 'Limba']
  },
  'Singapore': {
    modernName: 'Singapore',
    coordinates: [1.3521, 103.8198],
    historicalNames: ['Temasek'],
    ethnicDescriptors: ['Singaporean', 'Chinese', 'Malay', 'Indian', 'Eurasian']
  },
  'Slovakia': {
    modernName: 'Slovakia',
    coordinates: [48.6690, 19.6990],
    historicalNames: ['Slovak Republic'],
    ethnicDescriptors: ['Slovak', 'Hungarian', 'Roma']
  },
  'Slovenia': {
    modernName: 'Slovenia',
    coordinates: [46.1512, 14.9955],
    historicalNames: ['Carniola'],
    ethnicDescriptors: ['Slovene', 'Italian', 'Hungarian']
  },
  'Solomon Islands': {
    modernName: 'Solomon Islands',
    coordinates: [-9.6457, 160.1562],
    historicalNames: ['British Solomon Islands'],
    ethnicDescriptors: ['Solomon Islander', 'Melanesian']
  },
  'Somalia': {
    modernName: 'Somalia',
    coordinates: [5.1521, 46.1996],
    historicalNames: ['Land of Punt'],
    ethnicDescriptors: ['Somali', 'Issa', 'Darod', 'Hawiye']
  },
  'South Africa': {
    modernName: 'South Africa',
    coordinates: [-30.5595, 22.9375],
    historicalNames: ['Union of South Africa'],
    ethnicDescriptors: ['South African', 'Zulu', 'Xhosa', 'Afrikaner', 'Coloured']
  },
  'South Korea': {
    modernName: 'South Korea',
    coordinates: [35.9078, 127.7669],
    historicalNames: ['Joseon', 'Goryeo'],
    ethnicDescriptors: ['South Korean', 'Korean']
  },
  'South Sudan': {
    modernName: 'South Sudan',
    coordinates: [6.8770, 31.3070],
    historicalNames: ['Southern Sudan'],
    ethnicDescriptors: ['South Sudanese', 'Dinka', 'Nuer', 'Shilluk']
  },
  'Spain': {
    modernName: 'Spain',
    coordinates: [40.4637, -3.7492],
    historicalNames: ['Hispania', 'Al-Andalus'],
    ethnicDescriptors: ['Spanish', 'Castilian', 'Catalan', 'Basque', 'Galician']
  },
  'Sri Lanka': {
    modernName: 'Sri Lanka',
    coordinates: [7.8731, 80.7718],
    historicalNames: ['Ceylon', 'Lanka'],
    ethnicDescriptors: ['Sri Lankan', 'Sinhalese', 'Tamil', 'Moor']
  },
  'Sudan': {
    modernName: 'Sudan',
    coordinates: [12.8628, 30.2176],
    historicalNames: ['Nubia', 'Kush'],
    ethnicDescriptors: ['Sudanese', 'Arab', 'Nubian', 'Beja']
  },
  'Suriname': {
    modernName: 'Suriname',
    coordinates: [3.9193, -56.0278],
    historicalNames: ['Dutch Guiana'],
    ethnicDescriptors: ['Surinamese', 'Hindustani', 'Creole', 'Javanese']
  },
  'Sweden': {
    modernName: 'Sweden',
    coordinates: [60.1282, 18.6435],
    historicalNames: ['Svea Rike'],
    ethnicDescriptors: ['Swedish', 'Sami', 'Finnish']
  },
  'Switzerland': {
    modernName: 'Switzerland',
    coordinates: [46.8182, 8.2275],
    historicalNames: ['Helvetia'],
    ethnicDescriptors: ['Swiss', 'German', 'French', 'Italian', 'Romansh']
  },
  'Syria': {
    modernName: 'Syria',
    coordinates: [34.8021, 38.9968],
    historicalNames: ['Aram', 'Assyria'],
    ethnicDescriptors: ['Syrian', 'Arab', 'Kurd', 'Assyrian']
  },
  'Taiwan': {
    modernName: 'Taiwan',
    coordinates: [23.6978, 120.9605],
    historicalNames: ['Formosa'],
    ethnicDescriptors: ['Taiwanese', 'Hoklo', 'Hakka', 'Aboriginal']
  },
  'Tajikistan': {
    modernName: 'Tajikistan',
    coordinates: [38.8610, 71.2761],
    historicalNames: ['Sogdiana', 'Transoxiana'],
    ethnicDescriptors: ['Tajik', 'Pamiri', 'Uzbek']
  },
  'Tanzania': {
    modernName: 'Tanzania',
    coordinates: [-6.3690, 34.8888],
    historicalNames: ['Tanganyika', 'Zanzibar'],
    ethnicDescriptors: ['Tanzanian', 'Sukuma', 'Nyamwezi', 'Chaga']
  },
  'Thailand': {
    modernName: 'Thailand',
    coordinates: [15.8700, 100.9925],
    historicalNames: ['Siam', 'Sukhothai'],
    ethnicDescriptors: ['Thai', 'Siamese', 'Lao', 'Chinese', 'Malay']
  },
  'Timor-Leste': {
    modernName: 'Timor-Leste',
    coordinates: [-8.8742, 125.7275],
    historicalNames: ['Portuguese Timor'],
    ethnicDescriptors: ['Timorese', 'Tetum', 'Mambai', 'Makasae']
  },
  'Togo': {
    modernName: 'Togo',
    coordinates: [8.6195, 0.8248],
    historicalNames: ['French Togoland'],
    ethnicDescriptors: ['Togolese', 'Ewe', 'Kabye', 'Tem']
  },
  'Tonga': {
    modernName: 'Tonga',
    coordinates: [-21.1790, -175.1982],
    historicalNames: ['Friendly Islands'],
    ethnicDescriptors: ['Tongan', 'Polynesian']
  },
  'Trinidad and Tobago': {
    modernName: 'Trinidad and Tobago',
    coordinates: [10.6918, -61.2225],
    historicalNames: ['Spanish Trinidad'],
    ethnicDescriptors: ['Trinidadian', 'Tobagonian', 'Indo-Trinidadian', 'Afro-Trinidadian']
  },
  'Tunisia': {
    modernName: 'Tunisia',
    coordinates: [33.8869, 9.5375],
    historicalNames: ['Carthage', 'Ifriqiya'],
    ethnicDescriptors: ['Tunisian', 'Arab', 'Berber']
  },
  'Turkey': {
    modernName: 'Turkey',
    coordinates: [38.9637, 35.2433],
    historicalNames: ['Anatolia', 'Ottoman Empire'],
    ethnicDescriptors: ['Turkish', 'Kurd', 'Armenian', 'Greek']
  },
  'Turkmenistan': {
    modernName: 'Turkmenistan',
    coordinates: [38.9697, 59.5563],
    historicalNames: ['Transoxiana'],
    ethnicDescriptors: ['Turkmen', 'Uzbek', 'Russian']
  },
  'Tuvalu': {
    modernName: 'Tuvalu',
    coordinates: [-7.1095, 177.6493],
    historicalNames: ['Ellice Islands'],
    ethnicDescriptors: ['Tuvaluan', 'Polynesian']
  },
  'Uganda': {
    modernName: 'Uganda',
    coordinates: [1.3733, 32.2903],
    historicalNames: ['Buganda'],
    ethnicDescriptors: ['Ugandan', 'Baganda', 'Banyankole', 'Basoga']
  },
  'Ukraine': {
    modernName: 'Ukraine',
    coordinates: [48.3794, 31.1656],
    historicalNames: ['Kievan Rus', 'Ruthenia'],
    ethnicDescriptors: ['Ukrainian', 'Rusyn', 'Russian', 'Crimean Tatar']
  },
  'United Arab Emirates': {
    modernName: 'United Arab Emirates',
    coordinates: [23.4241, 53.8478],
    historicalNames: ['Trucial States'],
    ethnicDescriptors: ['Emirati', 'Arab', 'Bedouin']
  },
  'United Kingdom': {
    modernName: 'United Kingdom',
    coordinates: [55.3781, -3.4360],
    historicalNames: ['Great Britain', 'Britannia'],
    ethnicDescriptors: ['British', 'English', 'Scottish', 'Welsh', 'Irish']
  },
  'United States': {
    modernName: 'United States',
    coordinates: [37.0902, -95.7129],
    historicalNames: ['Thirteen Colonies'],
    ethnicDescriptors: ['American', 'Native American', 'African American', 'Hispanic', 'Asian American']
  },
  'Uruguay': {
    modernName: 'Uruguay',
    coordinates: [-32.5228, -55.7658],
    historicalNames: ['Banda Oriental'],
    ethnicDescriptors: ['Uruguayan', 'Mestizo', 'Criollo']
  },
  'Uzbekistan': {
    modernName: 'Uzbekistan',
    coordinates: [41.3775, 64.5853],
    historicalNames: ['Transoxiana', 'Khwarezm'],
    ethnicDescriptors: ['Uzbek', 'Tajik', 'Karakalpak', 'Russian']
  },
  'Vanuatu': {
    modernName: 'Vanuatu',
    coordinates: [-15.3767, 166.9592],
    historicalNames: ['New Hebrides'],
    ethnicDescriptors: ['Ni-Vanuatu', 'Melanesian']
  },
  'Vatican City': {
    modernName: 'Vatican City',
    coordinates: [41.9029, 12.4534],
    historicalNames: ['Papal States'],
    ethnicDescriptors: ['Vatican', 'Italian']
  },
  'Venezuela': {
    modernName: 'Venezuela',
    coordinates: [6.4238, -66.5897],
    historicalNames: ['Spanish Main'],
    ethnicDescriptors: ['Venezuelan', 'Mestizo', 'Criollo', 'Indigenous']
  },
  'Vietnam': {
    modernName: 'Vietnam',
    coordinates: [14.0583, 108.2772],
    historicalNames: ['Dai Viet', 'Annam'],
    ethnicDescriptors: ['Vietnamese', 'Kinh', 'Tay', 'Thai', 'Hmong']
  },
  'Yemen': {
    modernName: 'Yemen',
    coordinates: [15.5527, 48.5164],
    historicalNames: ['Saba', 'Himyar'],
    ethnicDescriptors: ['Yemeni', 'Arab', 'Mahra', 'Soqotri']
  },
  'Zambia': {
    modernName: 'Zambia',
    coordinates: [-13.1339, 27.8493],
    historicalNames: ['Northern Rhodesia'],
    ethnicDescriptors: ['Zambian', 'Bemba', 'Tonga', 'Lozi']
  },
  'Zimbabwe': {
    modernName: 'Zimbabwe',
    coordinates: [-19.0154, 29.1549],
    historicalNames: ['Rhodesia', 'Great Zimbabwe'],
    ethnicDescriptors: ['Zimbabwean', 'Shona', 'Ndebele', 'Tonga']
  }
}; 