const prisma = require('../config/prismaClient');

function toListingDTO(animal) {
  if (!animal) return null;
  return {
    id: String(animal.id),
    title: animal.title,
    slug: animal.slug,
    description: animal.description || '',
    species: animal.species,
    breed: animal.breed || '',
    age: animal.age ?? 0,
    gender: animal.gender,
    price: animal.price == null ? 0 : Number(animal.price),
    currency: animal.currency || 'USD',
    country: animal.country || '',
    city: animal.city || '',
    status: animal.status,
    rejectionReason: animal.rejection_reason || null,
    availability: animal.is_available ? 'available' : 'sold',
    views: animal.views ?? 0,
    createdAt: animal.created_at?.toISOString?.() ?? '',
    updatedAt: animal.updated_at?.toISOString?.() ?? '',
  };
}

function toListingWithImages(animal) {
  const base = toListingDTO(animal);
  const images = Array.isArray(animal.animal_images)
    ? animal.animal_images.map((img) => img.image_url)
    : Array.isArray(animal.images)
      ? animal.images
      : [];

  return {
    ...base,
    images,
    coverImage: images[0] || null,
    sellerId: String(animal.user_id),
    sellerName: animal.user?.name || animal.users?.name || 'Seller',
  };
}

function toDetailsDTO(animal) {
  return toListingWithImages(animal);
}

exports.createListing = async (userId, data) => {
  const animal = await prisma.animals.create({
    data: {
      user_id: Number(userId),
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      species: data.species,
      breed: data.breed || null,
      age: data.age ?? null,
      gender: data.gender || undefined,
      price: data.price ?? null,
      currency: data.currency || 'USD',
      country: data.country || null,
      city: data.city || null,
      status: 'pending',
      is_available: true,
    },
  });

  return toListingWithImages(animal);
};

exports.getPublicListings = async () => {
  const animals = await prisma.animals.findMany({
    where: { status: 'approved', is_available: true },
    orderBy: { created_at: 'desc' },
    include: { animal_images: true },
  });

  return animals.map(toListingWithImages);
};

exports.getListingsByUser = async (userId) => {
  const animals = await prisma.animals.findMany({
    where: { user_id: Number(userId) },
    orderBy: { created_at: 'desc' },
    include: { animal_images: true },
  });

  return animals.map(toListingWithImages);
};

exports.getAllListings = async () => {
  const animals = await prisma.animals.findMany({
    orderBy: { created_at: 'desc' },
    include: { animal_images: true },
  });

  return animals.map(toListingWithImages);
};

exports.getListingBySlug = async (slug) => {
  const animal = await prisma.animals.findUnique({
    where: { slug },
    include: { animal_images: true },
  });

  if (!animal) return null;
  return toDetailsDTO(animal);
};

exports.addImages = async (animalId, imageUrls) => {
  if (!imageUrls?.length) return [];

  await prisma.animal_images.createMany({
    data: imageUrls.map((url) => ({
      animal_id: Number(animalId),
      image_url: url,
    })),
  });

  const imgs = await prisma.animal_images.findMany({
    where: { animal_id: Number(animalId) },
    orderBy: { created_at: 'desc' },
  });

  return imgs.map((i) => i.image_url);
};

exports.getById = async (id) => {
  return prisma.animals.findUnique({
    where: { id: Number(id) },
    include: { animal_images: true },
  });
};

exports.updateListing = async (id, data) => {
  const updateData = {
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    species: data.species,
    breed: data.breed || null,
    age: data.age ?? null,
    gender: data.gender || undefined,
    price: data.price ?? null,
    currency: data.currency || undefined,
    country: data.country || null,
    city: data.city || null,
  };

  if (data.availability) {
    updateData.is_available =
      data.availability === 'available' || data.availability === 'reserved';
  }

  const updated = await prisma.animals.update({
    where: { id: Number(id) },
    data: updateData,
    include: { animal_images: true },
  });

  return toListingWithImages(updated);
};

exports.updateStatus = async (id, status, rejectionReason = null) => {
  const data = { status };

  // Set or clear rejection reason based on status
  if (status === 'rejected' && rejectionReason) {
    data.rejection_reason = rejectionReason;
  } else if (status === 'approved') {
    data.rejection_reason = null; // Clear rejection reason if approved
  }

  const updated = await prisma.animals.update({
    where: { id: Number(id) },
    data,
    include: { animal_images: true },
  });

  return toListingWithImages(updated);
};

exports.deleteListing = async (id) => {
  await prisma.animal_images.deleteMany({ where: { animal_id: Number(id) } });
  return prisma.animals.delete({ where: { id: Number(id) } });
};

// Increment view count
exports.incrementViews = async (id) => {
  const updated = await prisma.animals.update({
    where: { id: Number(id) },
    data: { views: { increment: 1 } },
    include: { animal_images: true },
  });
  return toListingWithImages(updated);
};

// Get listing owner ID
exports.getOwnerId = async (id) => {
  const animal = await prisma.animals.findUnique({
    where: { id: Number(id) },
    select: { user_id: true },
  });
  return animal?.user_id ?? null;
};

exports.toListingDTO = toListingDTO;
exports.toListingWithImages = toListingWithImages;
