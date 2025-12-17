import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/common/ListingCard';
import { LoadingCard, LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { listingsApi } from '@/services/api';
import { categories, locations, breedsBySpecies } from '@/data/mockData';
import { Listing, ListingFilters, SortOption, Species, Gender, AvailabilityStatus } from '@/types';
import { capitalize } from '@/lib/utils';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>(
    (searchParams.get('species')?.split(',') as Species[]) || []
  );
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '');
  const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '');
  const [gender, setGender] = useState<Gender | ''>(searchParams.get('gender') as Gender || '');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');

  // Available cities based on selected country
  const availableCities = useMemo(() => {
    if (!selectedCountry) return [];
    const location = locations.find(l => l.country === selectedCountry);
    return location?.cities || [];
  }, [selectedCountry]);

  // Build filters object
  const buildFilters = (): ListingFilters => {
    const filters: ListingFilters = {};
    if (keyword) filters.keyword = keyword;
    if (selectedSpecies.length) filters.species = selectedSpecies;
    if (selectedCountry) filters.country = selectedCountry;
    if (selectedCity) filters.city = selectedCity;
    if (priceMin) filters.priceMin = Number(priceMin);
    if (priceMax) filters.priceMax = Number(priceMax);
    if (ageMin) filters.ageMin = Number(ageMin);
    if (ageMax) filters.ageMax = Number(ageMax);
    if (gender) filters.gender = gender;
    return filters;
  };

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await listingsApi.getAll(buildFilters(), sortBy, currentPage, 12);
        if (response.success) {
          setListings(response.data);
          setTotalItems(response.pagination?.totalItems || 0);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [keyword, selectedSpecies, selectedCountry, selectedCity, priceMin, priceMax, ageMin, ageMax, gender, sortBy, currentPage]);

  // Update URL params
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (selectedSpecies.length) params.set('species', selectedSpecies.join(','));
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedCity) params.set('city', selectedCity);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams();
  };

  const toggleSpecies = (species: Species) => {
    setSelectedSpecies(prev =>
      prev.includes(species)
        ? prev.filter(s => s !== species)
        : [...prev, species]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedSpecies([]);
    setSelectedCountry('');
    setSelectedCity('');
    setPriceMin('');
    setPriceMax('');
    setAgeMin('');
    setAgeMax('');
    setGender('');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [
    selectedSpecies.length > 0,
    selectedCountry,
    selectedCity,
    priceMin,
    priceMax,
    ageMin,
    ageMax,
    gender,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Species */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Species</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedSpecies.includes(cat.id)}
                onCheckedChange={() => toggleSpecies(cat.id)}
              />
              <span className="text-sm">{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Select value={selectedCountry || "all"} onValueChange={(v) => { setSelectedCountry(v === "all" ? "" : v); setSelectedCity(''); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.country} value={loc.country}>{loc.country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCountry && (
          <Select value={selectedCity || "all"} onValueChange={(v) => setSelectedCity(v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {availableCities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Price range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Price Range ($)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Age range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Age (months)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max"
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Gender</Label>
        <Select value={gender || "any"} onValueChange={(v) => setGender(v === "any" ? "" : v as Gender)}>
          <SelectTrigger>
            <SelectValue placeholder="Any gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Browse Animals</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'listing' : 'listings'} found
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, breed..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          <div className="flex gap-2">
            {/* Mobile filter button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters badges */}
        {(selectedSpecies.length > 0 || selectedCountry || gender) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSpecies.map(species => (
              <Badge
                key={species}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleSpecies(species)}
              >
                {capitalize(species)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {selectedCountry && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => { setSelectedCountry(''); setSelectedCity(''); }}
              >
                {selectedCountry}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {gender && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => setGender('')}
              >
                {capitalize(gender)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                title="No listings found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                action={{
                  label: 'Clear Filters',
                  onClick: clearFilters,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            {!isLoading && listings.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" disabled>
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
