const prisma = require('../config/prismaClient');

// Add a favorite
exports.add = async (userId, animalId) => {
  const favorite = await prisma.favorites.create({
    data: {
      user_id: Number(userId),
      animal_id: Number(animalId),
    },
  });
  return favorite;
};

// Remove a favorite
exports.remove = async (userId, animalId) => {
  const result = await prisma.favorites.deleteMany({
    where: {
      user_id: Number(userId),
      animal_id: Number(animalId),
    },
  });
  return result.count > 0;
};

// Check if user has favorited an animal
exports.isFavorited = async (userId, animalId) => {
  const favorite = await prisma.favorites.findFirst({
    where: {
      user_id: Number(userId),
      animal_id: Number(animalId),
    },
  });
  return !!favorite;
};

// Get all favorites for a user (with animal details)
exports.getByUserId = async (userId) => {
  const favorites = await prisma.favorites.findMany({
    where: { user_id: Number(userId) },
    orderBy: { created_at: 'desc' },
  });

  // Get full animal details for each favorite
  const animalIds = favorites.map(f => f.animal_id);
  
  if (animalIds.length === 0) return [];

  const animals = await prisma.animals.findMany({
    where: { 
      id: { in: animalIds },
      status: 'approved', // Only show approved listings
    },
    include: { animal_images: true },
  });

  return animals;
};

// Get favorite animal IDs for a user (for quick lookup)
exports.getFavoriteIds = async (userId) => {
  const favorites = await prisma.favorites.findMany({
    where: { user_id: Number(userId) },
    select: { animal_id: true },
  });
  return favorites.map(f => f.animal_id);
};

// Count total favorites for an animal
exports.countForAnimal = async (animalId) => {
  return prisma.favorites.count({
    where: { animal_id: Number(animalId) },
  });
};

// Count total favorites received by a user's listings
exports.countForUserListings = async (userId) => {
  // Get all animal IDs owned by this user
  const userAnimals = await prisma.animals.findMany({
    where: { user_id: Number(userId) },
    select: { id: true },
  });

  const animalIds = userAnimals.map(a => a.id);
  
  if (animalIds.length === 0) return 0;

  return prisma.favorites.count({
    where: { animal_id: { in: animalIds } },
  });
};

