import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Heart, CheckCircle, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/common/ListingCard';
import { LoadingCard } from '@/components/common/LoadingSpinner';
import { listingsApi } from '@/services/api';
import { categories, siteStats } from '@/data/mockData';
import { Listing } from '@/types';
import { cn } from '@/lib/utils';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [latestListings, setLatestListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await listingsApi.getLatest(6);
        if (response.success) {
          setLatestListings(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?keyword=${encodeURIComponent(searchQuery)}`;
    }
  };

  const howItWorks = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Browse',
      description: 'Search thousands of listings from verified sellers around the world.',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Connect',
      description: 'Contact sellers directly through our secure messaging platform.',
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Adopt or Buy',
      description: 'Meet your new companion and complete your adoption or purchase safely.',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 animate-slide-up">
              Find Your Perfect
              <span className="block">Furry Companion</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover thousands of adorable pets looking for loving homes. 
              From playful puppies to elegant cats, your new best friend is waiting.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex gap-2 bg-card/95 backdrop-blur-sm p-2 rounded-2xl shadow-xl">
                <Input
                  type="search"
                  placeholder="Search for dogs, cats, birds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-12 text-lg"
                />
                <Button type="submit" size="lg" className="px-8 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">{siteStats.totalListings.toLocaleString()}+</div>
                <div className="text-sm text-primary-foreground/80">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">{siteStats.totalUsers.toLocaleString()}+</div>
                <div className="text-sm text-primary-foreground/80">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">{siteStats.successfulAdoptions.toLocaleString()}+</div>
                <div className="text-sm text-primary-foreground/80">Successful Adoptions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect pet from our diverse selection of categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/browse?species=${category.id}`}
                className="group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                    <span className="text-sm text-primary font-medium">{category.count} listings</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                Latest Listings
              </h2>
              <p className="text-muted-foreground">
                Discover our newest additions looking for homes
              </p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="hidden sm:flex">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
              : latestListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/browse">
              <Button>
                View All Listings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding your perfect companion is easy with PetMarket
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/25">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-secondary-foreground text-sm font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                Why Choose PetMarket?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Verified Sellers</h3>
                    <p className="text-muted-foreground">All our sellers go through a verification process to ensure safe transactions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Active Community</h3>
                    <p className="text-muted-foreground">Join thousands of pet lovers and share experiences with fellow animal enthusiasts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Adoption First</h3>
                    <p className="text-muted-foreground">We promote responsible pet ownership and support animal adoption initiatives.</p>
                  </div>
                </div>
              </div>
              <Link to="/register" className="inline-block mt-8">
                <Button size="lg">
                  Join PetMarket Today
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800"
                  alt="Happy pets"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['🐕', '🐱', '🐰'].map((emoji, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg ring-2 ring-card">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">2,341+</div>
                    <div className="text-xs text-muted-foreground">Successful Adoptions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 gradient-warm">
        <div className="container-custom text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-secondary-foreground mb-4">
            Ready to Find Your New Best Friend?
          </h2>
          <p className="text-secondary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start browsing thousands of adorable pets today or list your own pets to find them loving homes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/browse">
              <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
                Browse Animals
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
