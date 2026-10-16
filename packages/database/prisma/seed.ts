import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Clear database in a careful order to avoid foreign key errors
  console.log('Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.homepage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.business.deleteMany();
  await prisma.media.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log('Creating Admin Users...');
  await prisma.user.create({
    data: {
      id: 'user_1',
      name: 'Sarah Bakery',
      email: 'sarah@qualitybakers.com',
      role: 'OWNER',
      status: 'ACTIVE',
      phone: '+91 98765 43210',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    },
  });

  await prisma.user.create({
    data: {
      id: 'user_2',
      name: 'John Manager',
      email: 'john@qualitybakers.com',
      role: 'MANAGER',
      status: 'ACTIVE',
      phone: '+91 98765 11111',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    },
  });

  // 3. Create Media
  console.log('Creating Media...');
  const mediaCover = await prisma.media.create({
    data: {
      id: 'media_cover',
      publicId: 'quality_bakers_cover',
      fileName: 'storefront.jpg',
      originalUrl:
        'https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=1200&h=800&fit=crop',
      sizeBytes: 1500000,
    },
  });

  const mediaShake = await prisma.media.create({
    data: {
      id: 'media_shake',
      publicId: 'vanilla_shake_1',
      fileName: 'vanilla-scoop-hero.jpg',
      originalUrl:
        'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=1600&h=1200&fit=crop',
      sizeBytes: 1450000,
    },
  });

  // 4. Create Business
  console.log('Creating Business...');
  const defaultHours = { isClosed: false, openTime: '08:00', closeTime: '20:00' };
  await prisma.business.create({
    data: {
      id: 'biz_main',
      name: 'Quality Bakers',
      tagline: 'Artisanal Baking & Craft Beverages',
      description:
        'A family-owned bakery dedicated to crafting perfect pastries, fresh breads, and signature beverages daily.',
      businessStatus: 'OPEN',
      phone: '+91 9747995870',
      whatsapp: '+91 9747995870',
      email: 'hello.qualitybakers@gmail.com',
      website: 'https://qualitybakers.com',
      street: 'Thodiyoor - Sooranad Rd, Sooranad North',
      city: 'Sooranad',
      state: 'Kerala',
      country: 'India',
      postalCode: '690561',
      googleMapsUrl: 'https://maps.app.goo.gl/7b6qojCh9BaWQjfX7?g_st=atm',
      instagram: 'https://www.instagram.com/quality_bakers_sooranad?rpxt=MXY4MG9waTB3ZHAzNg==',
      hours: {
        monday: defaultHours,
        tuesday: defaultHours,
        wednesday: defaultHours,
        thursday: defaultHours,
        friday: defaultHours,
        saturday: { isClosed: false, openTime: '09:00', closeTime: '22:00' },
        sunday: { isClosed: false, openTime: '09:00', closeTime: '15:00' },
        holidayHours: 'Check our social media for specific holiday timings.',
      },
      coverImageId: mediaCover.id,
      seoTitle: 'Quality Bakers | Artisanal Bakery in Sooranad',
      seoDescription:
        'Visit Quality Bakers for fresh bread, pastries, and signature faloodas. Baked fresh daily.',
      keywords: 'bakery, fresh bread, pastries, cakes, falooda, sooranad, kerala',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // 5. Create Categories
  console.log('Creating Categories...');
  const cat1 = await prisma.category.create({
    data: {
      id: 'cat_1',
      slug: 'ice-cream-shake',
      name: 'Ice Cream Shake',
      description:
        'Thick, creamy, and blended to perfection. Our premium milkshakes are made with real ice cream and fresh ingredients.',
      theme: 'vibrant',
      layoutType: 'editorial-grid',
      animationPreset: 'fade-up',
      displayOrder: 0,
      isFeatured: true,
      isVisible: true,
      status: 'PUBLISHED',
    },
  });

  const cat2 = await prisma.category.create({
    data: {
      id: 'cat_2',
      slug: 'smoothies',
      name: 'Smoothies',
      description: 'Fresh fruit smoothies blended fresh every day.',
      theme: 'fresh',
      layoutType: 'gallery-wall',
      animationPreset: 'reveal',
      displayOrder: 1,
      isFeatured: false,
      isVisible: true,
      status: 'PUBLISHED',
    },
  });

  const cat3 = await prisma.category.create({
    data: {
      id: 'cat_3',
      slug: 'seasonal-specials',
      name: 'Seasonal Specials',
      description: 'Limited time offerings crafted for the season.',
      theme: 'warm',
      layoutType: 'spotlight',
      animationPreset: 'fade-up',
      displayOrder: 2,
      isFeatured: false,
      isVisible: false,
      status: 'DRAFT',
    },
  });

  const catIceCream = await prisma.category.create({
    data: {
      id: 'cat_ice_cream',
      slug: 'ice-cream',
      name: 'Ice Cream',
      description:
        'Rich, velvety scoops churned from fresh dairy cream and premium natural flavours, offering a timeless cool indulgence in every spoonful.',
      theme: 'classic',
      layoutType: 'editorial-grid',
      animationPreset: 'fade-up',
      displayOrder: 3,
      isFeatured: false,
      isVisible: true,
      status: 'PUBLISHED',
    },
  });

  // 6. Create Products
  console.log('Creating Products...');
  await prisma.product.create({
    data: {
      id: 'prod_1',
      slug: 'vanilla-scoop',
      name: 'Vanilla Scoop',
      shortDescription: 'Classic Madagascar vanilla bean ice cream.',
      price: 180,
      badge: 'SIGNATURE',
      isFeatured: true,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 0,
      categoryId: cat1.id,
      imageId: mediaShake.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_2',
      slug: 'strawberry-smoothie',
      name: 'Strawberry Smoothie',
      shortDescription: 'Fresh strawberries blended with yogurt.',
      price: 220,
      badge: 'BEST_SELLER',
      isFeatured: true,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 1,
      categoryId: cat2.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_3',
      slug: 'mango-frappe',
      name: 'Mango Frappe',
      shortDescription: 'A rich seasonal mango blend.',
      price: 250,
      badge: 'SEASONAL',
      isFeatured: false,
      isVisible: false,
      availabilityStatus: 'SEASONAL',
      status: 'DRAFT',
      displayOrder: 2,
      categoryId: cat3.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_ice_cream_vanilla',
      slug: 'ice-cream-vanilla',
      name: 'Vanilla',
      shortDescription:
        'Classic Madagascar vanilla bean ice cream churned to rich, silky perfection.',
      price: 60,
      badge: 'BEST_SELLER',
      isFeatured: true,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 3,
      categoryId: catIceCream.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_ice_cream_strawberry',
      slug: 'ice-cream-strawberry',
      name: 'Strawberry',
      shortDescription:
        'Vibrant and creamy scoop blended with sweet, sun-ripened orchard strawberries.',
      price: 60,
      badge: 'NONE',
      isFeatured: false,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 4,
      categoryId: catIceCream.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_ice_cream_pista',
      slug: 'ice-cream-pista',
      name: 'Pista',
      shortDescription: 'Rich, nutty pistachio scoop subtly infused with aromatic cardamom.',
      price: 70,
      badge: 'SIGNATURE',
      isFeatured: true,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 5,
      categoryId: catIceCream.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_ice_cream_chocolate',
      slug: 'ice-cream-chocolate',
      name: 'Chocolate',
      shortDescription: 'Indulgent and velvety scoop crafted with deep, dark cocoa and rich cream.',
      price: 70,
      badge: 'BEST_SELLER',
      isFeatured: true,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 6,
      categoryId: catIceCream.id,
    },
  });

  await prisma.product.create({
    data: {
      id: 'prod_ice_cream_butterscotch',
      slug: 'ice-cream-butterscotch',
      name: 'Butterscotch',
      shortDescription: 'Golden caramelised ice cream loaded with crunchy butter praline bits.',
      price: 70,
      badge: 'NONE',
      isFeatured: false,
      isVisible: true,
      availabilityStatus: 'AVAILABLE',
      status: 'PUBLISHED',
      displayOrder: 7,
      categoryId: catIceCream.id,
    },
  });

  // 7. Create Homepage
  console.log('Creating Homepage...');
  await prisma.homepage.create({
    data: {
      id: 'homepage_1',
      heroTitle: 'Freshly Baked Memories',
      heroSubtitle: 'Experience the magic of artisanal baking, crafted with love every single day.',
      heroCtaText: 'Explore Menu',
      heroCtaLink: '/menu',
      aboutTitle: 'Our Craft',
      aboutDescription:
        'Every morning, before the sun rises, our master bakers begin the delicate process of crafting perfect pastries. We source only the finest local ingredients.',
      aboutImageId: mediaCover.id,
      storyTitle: 'A Family Tradition',
      storyDescription:
        'Since 1985, our bakery has been the heart of the community. What started as a small kitchen has grown into a destination for lovers of fine baked goods.',
      status: 'PUBLISHED',
      featuredCategories: {
        connect: [{ id: cat1.id }, { id: cat2.id }],
      },
      sections: {
        create: [
          {
            type: 'BANNER',
            title: 'Summer Berry Collection',
            description:
              'Bright, fresh, and perfectly sweet. Try our new seasonal strawberry and blueberry pastries.',
            displayOrder: 0,
          },
          {
            type: 'PROMOTION',
            enabled: false,
            title: 'Weekend Special',
            description: 'Buy any two large pastries, get a coffee free.',
            buttonText: 'Order Now',
            backgroundColor: '#fff0e6',
            displayOrder: 1,
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
