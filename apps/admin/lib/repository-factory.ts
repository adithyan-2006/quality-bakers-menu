import { BusinessRepository } from '../features/business/repositories/business-repo';
import { PrismaBusinessRepository } from '../features/business/repositories/prisma-business-repo';

import { CategoryRepository as MockCategoryRepository } from '../features/categories/repositories/category-repo';
import { PrismaCategoryRepository } from '../features/categories/repositories/prisma-category-repo';

import { ProductRepository as MockProductRepository } from '../features/products/repositories/product-repo';
import { PrismaProductRepository } from '../features/products/repositories/prisma-product-repo';

import { HomepageRepository as MockHomepageRepository } from '../features/homepage/repositories/homepage-repo';
import { PrismaHomepageRepository } from '../features/homepage/repositories/prisma-homepage-repo';

import { MediaRepository as MockMediaRepository } from '../features/media/repositories/media-repo';
import { PrismaMediaRepository } from '../features/media/repositories/prisma-media-repo';

import { UserRepository as MockUserRepository } from '../features/users/repositories/user-repository';
import { PrismaUserRepository } from '../features/users/repositories/prisma-user-repository';

import { AuditRepository as MockAuditRepository } from '../features/audit/repositories/audit-repository';
import { PrismaAuditRepository } from '../features/audit/repositories/prisma-audit-repository';

export class RepositoryFactory {
  private static get usePrisma(): boolean {
    if (process.env.REPOSITORY_DRIVER === 'mock') {
      return false;
    }
    // Default to Prisma in production, when explicitly configured, or when not set
    return (
      process.env.NODE_ENV === 'production' ||
      process.env.REPOSITORY_DRIVER === 'prisma' ||
      !process.env.REPOSITORY_DRIVER
    );
  }

  static getBusinessRepository() {
    return this.usePrisma ? PrismaBusinessRepository : BusinessRepository;
  }

  static getCategoryRepository() {
    return this.usePrisma ? PrismaCategoryRepository : MockCategoryRepository;
  }

  static getProductRepository() {
    return this.usePrisma ? PrismaProductRepository : MockProductRepository;
  }

  static getHomepageRepository() {
    return this.usePrisma ? PrismaHomepageRepository : MockHomepageRepository;
  }

  static getMediaRepository() {
    return this.usePrisma ? PrismaMediaRepository : MockMediaRepository;
  }

  static getUserRepository() {
    return this.usePrisma ? PrismaUserRepository : MockUserRepository;
  }

  static getAuditRepository() {
    return this.usePrisma ? PrismaAuditRepository : MockAuditRepository;
  }
}
