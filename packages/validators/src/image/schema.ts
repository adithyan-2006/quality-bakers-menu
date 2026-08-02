import { z } from 'zod';
import { IMAGE_CONFIG } from '@qbm/config';
import { ImageIdSchema } from '../common/schema';

/**
 * Schema representing metadata for an uploaded image.
 * Intended to validate variant data from image processing service.
 */
export const ImageMetadataSchema = z
  .object({
    id: ImageIdSchema,
    url: z.string({ required_error: 'URL is required' }).url('Invalid image URL format'),
    width: z
      .number({ required_error: 'Width is required' })
      .int()
      .positive('Width must be a positive integer'),
    height: z
      .number({ required_error: 'Height is required' })
      .int()
      .positive('Height must be a positive integer'),
    sizeBytes: z
      .number({ required_error: 'Size in bytes is required' })
      .int()
      .positive()
      .max(
        IMAGE_CONFIG.MAX_FILE_SIZE,
        `File size cannot exceed ${IMAGE_CONFIG.MAX_FILE_SIZE} bytes`,
      ),
    mimeType: z.enum(IMAGE_CONFIG.SUPPORTED_IMAGE_TYPES as unknown as [string, ...string[]], {
      invalid_type_error: 'Unsupported image format',
    }),
  })
  .strict();

/**
 * Schema for validating complete image upload payloads.
 * Used by backend API when persisting associated images for products.
 */
export const ImageUploadSchema = z
  .object({
    id: ImageIdSchema,
    filename: z
      .string({ required_error: 'Filename is required' })
      .min(1, 'Filename cannot be empty'),
    basePath: z
      .string({ required_error: 'Base path is required' })
      .min(1, 'Base path cannot be empty'),
    variants: z.record(z.string(), ImageMetadataSchema),
    createdAt: z
      .string({ required_error: 'createdAt timestamp is required' })
      .datetime('Invalid datetime format'),
  })
  .strict();
