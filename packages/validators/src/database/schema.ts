import { z } from 'zod';

export const BusinessStatusEnum = z.enum(['OPEN', 'CLOSED', 'HOLIDAY', 'TEMPORARILY_CLOSED']);
export const PublishStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']);
export const AvailabilityStatusEnum = z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'SEASONAL']);
export const BadgeTypeEnum = z.enum([
  'NONE',
  'SIGNATURE',
  'BEST_SELLER',
  'NEW',
  'SEASONAL',
  'CHEFS_CHOICE',
]);
export const MediaTypeEnum = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']);
export const MediaStatusEnum = z.enum(['READY', 'PROCESSING', 'ERROR']);
export const UserRoleEnum = z.enum(['OWNER', 'MANAGER', 'STAFF']);
export const UserStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'DISABLED']);

export const PrismaBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  businessStatus: BusinessStatusEnum,
  logoId: z.string().nullable(),
  favicon: z.string().nullable(),
  coverImageId: z.string().nullable(),
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string().email(),
  website: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  googleMapsUrl: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  hours: z.any(),
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  youtube: z.string().nullable(),
  x: z.string().nullable(),
  threads: z.string().nullable(),
  linkedin: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  keywords: z.string().nullable(),
  deliveryAvailable: z.boolean(),
  takeawayAvailable: z.boolean(),
  dineInAvailable: z.boolean(),
  status: PublishStatusEnum,
});

export const PrismaCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  coverImageId: z.string().nullable(),
  theme: z.string(),
  layoutType: z.string(),
  animationPreset: z.string(),
  displayOrder: z.number().int(),
  isFeatured: z.boolean(),
  isVisible: z.boolean(),
  accentColor: z.string().nullable(),
  status: PublishStatusEnum,
});

export const PrismaProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
  price: z.number(),
  categoryId: z.string(),
  imageId: z.string().nullable(),
  badge: BadgeTypeEnum,
  isFeatured: z.boolean(),
  isVisible: z.boolean(),
  availabilityStatus: AvailabilityStatusEnum,
  displayOrder: z.number().int(),
  isAvailable: z.boolean(),
  preparationTime: z.number().int(),
  isSeasonal: z.boolean(),
  status: PublishStatusEnum,
});

export const PrismaMediaSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  fileName: z.string(),
  displayName: z.string().nullable(),
  altText: z.string().nullable(),
  type: MediaTypeEnum,
  originalUrl: z.string(),
  optimizedUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  sizeBytes: z.number().int(),
  format: z.string().nullable(),
  dominantColor: z.string().nullable(),
  blurHash: z.string().nullable(),
  cropMode: z.string().nullable(),
  focusPoint: z.string().nullable(),
  isUsed: z.boolean(),
  status: MediaStatusEnum,
});

export const PrismaHomepageSchema = z.object({
  id: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroImageId: z.string().nullable(),
  heroCtaText: z.string().nullable(),
  heroCtaLink: z.string().nullable(),
  aboutTitle: z.string().nullable(),
  aboutDescription: z.string().nullable(),
  storyTitle: z.string().nullable(),
  storyDescription: z.string().nullable(),
  status: PublishStatusEnum,
});

export const PrismaHomepageSectionSchema = z.object({
  id: z.string(),
  homepageId: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  imageId: z.string().nullable(),
  buttonText: z.string().nullable(),
  buttonLink: z.string().nullable(),
  backgroundColor: z.string().nullable(),
  displayOrder: z.number().int(),
});

export const PrismaUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRoleEnum,
  status: UserStatusEnum,
});

export const PrismaAuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string(),
  oldValue: z.any().nullable(),
  newValue: z.any().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
});
