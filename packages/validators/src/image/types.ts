import { z } from 'zod';
import { ImageMetadataSchema, ImageUploadSchema } from './schema';

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;
