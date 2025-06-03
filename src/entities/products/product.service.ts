import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { ProductOptions, Products } from "@prisma/client";
import { PrismaService } from "src/database/prisma.service";
import { WithPaginationServiceParams } from "src/interfaces/query.interfaces";

@Injectable()
export class ProductService {
  constructor(
    // ...
    public PrismaService: PrismaService,
  ) {}

  async GetAllProducts() {
    return await this.PrismaService.products.findMany();
  }

  async GetProductsWithPagination(params: WithPaginationServiceParams) {
    // check if sortby is allowed field in db
    const allowedSortFields = ["name", "desc", "price", "createdAt"];
    if (!allowedSortFields.includes(params.sortBy)) throw new UnprocessableEntityException([{ property: "", errors: ["invalid sortBy value"] }]);

    const skip = (params.page - 1) * params.pp;

    const [total, results] = await Promise.all([
      this.PrismaService.products.count(),
      this.PrismaService.products.findMany({
        skip,
        take: params.pp,
        orderBy: { [params.sortBy]: params.sortType },
        include: { images: true },
      }),
    ]);

    const pageTotal = Math.ceil(total / params.pp);

    return { results, total, page: params.page, pageTotal };
  }

  async GetProductById(id: string) {
    return await this.PrismaService.products.findFirst({
      where: { id },
      include: { images: true, options: { include: { optionValues: true } }, reviews: true },
    });
  }

  async GetProductReviews(id: string) {
    return await this.PrismaService.productReviews.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  async CreateReviewForProduct(id: string, text: string, rating: number, usersName: string) {
    return await this.PrismaService.productReviews.create({
      data: {
        user: usersName,
        reviewText: text,
        rating: rating,
        product: { connect: { id } },
      },
    });
  }
}
