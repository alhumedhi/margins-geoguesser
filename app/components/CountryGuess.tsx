import React, { useState, useMemo } from 'react';
import countries from 'world-countries';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const CountryGuess: React.FC = () => {
  const { makeGuess, phase } = useGame();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort countries by name
  const countryNames = useMemo(() => 
    countries.map(country => country.name.common).sort(),
    []
  );
  
  // Filter countries based on search query
  const filteredCountries = useMemo(() => 
    searchQuery.trim() === '' 
      ? countryNames 
      : countryNames.filter(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [countryNames, searchQuery]
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCountry && phase === 'playing') {
      makeGuess(selectedCountry);
      setSelectedCountry('');
      setSearchQuery('');
    }
  };
  
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSearchQuery(country);
  };

  return (
    <motion.div 
      className="mt-32 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-3 text-yellow">Guess the Country of Origin</h3>
      
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-yellow" />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries..."
            className="pl-10 pr-4 py-3 w-full text-yellow bg-black border border-yellow rounded-md focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </div>
        
        {searchQuery.trim() !== '' && (
          <div className="mt-2 max-h-60 overflow-y-auto border border-yellow rounded-md bg-black">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="block w-full text-left px-4 py-2 hover:bg-yellow/10 transition-colors text-yellow"
                >
                  {country}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-yellow">No countries found</div>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="mt-4 w-full bg-yellow hover:bg-yellow text-black font-semibold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedCountry || phase !== 'playing'}
        >
          Submit Guess
        </button>
      </form>
    </motion.div>
  );
};

export default CountryGuess; 