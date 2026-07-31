import { z } from 'zod';
import {
  IDSchema,
  UUIDSchema,
  ProductIdSchema,
  CategoryIdSchema,
  ImageIdSchema,
  SlugSchema,
  PriceSchema,
  EmailSchema,
  PasswordSchema,
  CategoryNameSchema,
  CategoryDescriptionSchema,
  ProductNameSchema,
  ProductDescriptionSchema
} from './schema';

export type ID = z.infer<typeof IDSchema>;
export type UUID = z.infer<typeof UUIDSchema>;
export type ProductId = z.infer<typeof ProductIdSchema>;
export type CategoryId = z.infer<typeof CategoryIdSchema>;
export type ImageId = z.infer<typeof ImageIdSchema>;
export type Slug = z.infer<typeof SlugSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type CategoryName = z.infer<typeof CategoryNameSchema>;
export type CategoryDescription = z.infer<typeof CategoryDescriptionSchema>;
export type ProductName = z.infer<typeof ProductNameSchema>;
export type ProductDescription = z.infer<typeof ProductDescriptionSchema>;
