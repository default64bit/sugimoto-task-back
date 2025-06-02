import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { WithPaginationServiceParams } from 'src/interfaces/query.interfaces';

@Injectable()
export class ProductService {
  constructor(
    // ...
    public PrismaService: PrismaService,
  ) {}

  async GetAllProducts() {
    return await this.PrismaService.onModuleInit();
  }

  async GetProductsWithPagination(params: WithPaginationServiceParams) {
    const results = [];
    const total = 0;
    const pageTotal = 0;

    return { results, total, page: params.page, pageTotal };
  }

  async GetProductById(id: string) {
    return await this.PrismaService.products.findFirst({
      where: { id },
    });
  }

  async GetProductReviews(id: string) {
    return await this.PrismaService.productReviews.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async CreateReviewForProduct(id: string, text: string, rating: number, usersName: string) {
    return await this.PrismaService.productReviews.create({
      data: {
        
        reviewText: text,
        rating: rating,
        product: { connect: { id } },
      },
    });
  }
}
