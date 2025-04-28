export interface MetObject {
  objectID: number;
  primaryImage: string;
  title: string;
  geographyType?: string;
  country?: string;
  city?: string;
  state?: string;
  county?: string;
  region?: string;
  subregion?: string;
  locale?: string;
  locus?: string;
  excavation?: string;
  river?: string;
  classification?: string;
  department?: string;
  objectName?: string;
  culture?: string;
  period?: string;
  dynasty?: string;
  reign?: string;
  artistDisplayName?: string;
  artistDisplayBio?: string;
  artistNationality?: string;
  objectDate?: string;
  objectBeginDate?: number;
  objectEndDate?: number;
  medium?: string;
  dimensions?: string;
  creditLine?: string;
  isPublicDomain?: boolean;
  tags?: Array<{ term: string; AAT_URL: string; Wikidata_URL: string }>;
  
  // Added fields - not from MET API directly but calculated in our app
  geographyLat?: number; // Derived from country or other location data
  geographyLng?: number; // Derived from country or other location data
} 