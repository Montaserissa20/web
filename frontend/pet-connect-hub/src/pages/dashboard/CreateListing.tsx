import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { listingsApi } from '@/services/api';
import { categories, locations, breedsBySpecies } from '@/data/mockData';
import { Species, Gender, AvailabilityStatus } from '@/types';
import { slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CreateListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    species: '' as Species | '',
    breed: '',
    age: '',
    gender: '' as Gender | '',
    price: '',
    country: '',
    city: '',
    availability: 'available' as AvailabilityStatus,
    images: [] as string[],
  });
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs of existing images
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store actual files for upload
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing listing data when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchListing = async () => {
        setIsFetching(true);
        try {
          const response = await listingsApi.getById(id);
          if (response.success && response.data) {
            const listing = response.data;
            setFormData({
              title: listing.title || '',
              slug: listing.slug || '',
              description: listing.description || '',
              species: listing.species || '',
              breed: listing.breed || '',
              age: listing.age?.toString() || '',
              gender: listing.gender || '',
              price: listing.price?.toString() || '',
              country: listing.country || '',
              city: listing.city || '',
              availability: listing.availability || 'available',
              images: listing.images || [],
            });
            setExistingImages(listing.images || []);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load listing data.',
              variant: 'destructive',
            });
            navigate('/dashboard/listings');
          }
        } finally {
          setIsFetching(false);
        }
      };
      fetchListing();
    }
  }, [isEditing, id, navigate, toast]);

  // Auto-generate slug from title (only for new listings)
  useEffect(() => {
    if (formData.title && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.title),
      }));
    }
  }, [formData.title, isEditing]);

  // Get breeds for selected species
  const availableBreeds = formData.species
    ? breedsBySpecies[formData.species as Species] || []
    : [];

  // Get cities for selected country
  const availableCities = formData.country
    ? locations.find(l => l.country === formData.country)?.cities || []
    : [];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'species' ? { breed: '' } : {}),
      ...(field === 'country' ? { city: '' } : {}),
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = formData.images.length;
    const remainingSlots = 5 - totalImages;

    // Store file objects and create preview URLs
    Array.from(files).slice(0, remainingSlots).forEach(file => {
      // Store the actual file for later upload
      setImageFiles(prev => [...prev, file]);

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 5),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index];
    const isExistingImage = existingImages.includes(imageToRemove);

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    if (isExistingImage) {
      // Remove from existing images list
      setExistingImages(prev => prev.filter(img => img !== imageToRemove));
    } else {
      // Remove from new files (calculate index in imageFiles array)
      const newImageIndex = index - existingImages.filter(img => formData.images.slice(0, index).includes(img)).length;
      setImageFiles(prev => prev.filter((_, i) => i !== newImageIndex));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.species) newErrors.species = 'Species is required';
    if (!formData.breed) newErrors.breed = 'Breed is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user || !formData.species || !formData.gender) return;

    setIsLoading(true);
    try {
      // Keep existing images that weren't removed
      const keptExistingImages = existingImages.filter(img => formData.images.includes(img));

      const listingData = {
        title: formData.title,
        slug: isEditing ? formData.slug : slugify(formData.title, Date.now().toString().slice(-4)),
        description: formData.description,
        species: formData.species,
        breed: formData.breed,
        age: Number(formData.age),
        gender: formData.gender,
        price: Number(formData.price),
        country: formData.country,
        city: formData.city,
        availability: formData.availability,
        sellerId: user.id,
        sellerName: user.displayName,
        sellerRating: user.rating,
        // Pass existing images to keep when updating
        existingImages: isEditing ? keptExistingImages : undefined,
      };

      const response = isEditing
        ? await listingsApi.update(id!, listingData)
        : await listingsApi.create(listingData);

      if (response.success && response.data) {
        // Upload new images if we have file objects
        if (imageFiles.length > 0) {
          const uploadResponse = await listingsApi.uploadImages(response.data.id, imageFiles);
          if (!uploadResponse.success) {
            console.warn('Failed to upload images:', uploadResponse.message);
            // Still continue since listing was created/updated
          }
        }

        toast({
          title: isEditing ? 'Listing updated' : 'Listing created',
          description: isEditing
            ? 'Your listing has been updated successfully.'
            : 'Your listing has been submitted for review.',
        });
        navigate('/dashboard/listings');
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading listing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your listing details' : 'Fill in the details to create a new listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Adorable Golden Retriever Puppy"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="adorable-golden-retriever-puppy"
                />
                <p className="text-xs text-muted-foreground">
                  Preview: /animals/{formData.species || 'species'}/{formData.slug || 'your-listing-slug'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your pet in detail..."
                rows={5}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select value={formData.species} onValueChange={(v) => handleChange('species', v)}>
                  <SelectTrigger className={errors.species ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.species && <p className="text-sm text-destructive">{errors.species}</p>}
              </div>

              <div className="space-y-2">
                <Label>Breed *</Label>
                <Select
                  value={formData.breed}
                  onValueChange={(v) => handleChange('breed', v)}
                  disabled={!formData.species}
                >
                  <SelectTrigger className={errors.breed ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBreeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.breed && <p className="text-sm text-destructive">{errors.breed}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (months) *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="e.g., 6"
                  className={errors.age ? 'border-destructive' : ''}
                />
                {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="e.g., 500"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(v) => handleChange('availability', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="adopted">Adopted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.country} value={loc.country}>
                        {loc.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label>City *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(v) => handleChange('city', v)}
                  disabled={!formData.country}
                >
                  <SelectTrigger className={errors.city ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-xs text-center">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
            <p className="text-xs text-muted-foreground">
              Upload up to 5 images. The first image will be used as the cover.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Listing' : 'Create Listing'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
