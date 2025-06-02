import { Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UnprocessableEntityException } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Request, Response } from "express";
import { CreateReviewDTO } from "./dto/createReview.dto";

@Controller("products")
export class ProductController {
  constructor(
    // ...
    private ProductService: ProductService,
  ) {}

  @Get("/")
  async GetProductsWithPagination(@Req() req: Request, @Res() res: Response): Promise<Response | void> {
    const { results, total, page, pageTotal } = await this.ProductService.GetProductsWithPagination({
      search: req.query.search ? req.query.search.toString() : "",
      page: req.query.page ? parseInt(req.query.page.toString()) : 1,
      pp: req.query.pp ? parseInt(req.query.pp.toString()) : 25, // per page items
      sortType: req.query.sort_type === "asc" ? "asc" : "desc",
      sortBy: req.query.sort?.toString() || "createdAt",
    });

    return res.json({ records: results, page, total, pageTotal });
  }

  @Get("/:id")
  async GetProductById(@Param("id") id: string, @Req() req: Request, @Res() res: Response): Promise<Response | void> {
    const product = await this.ProductService.GetProductById(id);
    if (!product) throw new NotFoundException();

    return res.json(product);
  }

  @Get("/:id/reviews")
  async GetProductReviews(@Param("id") id: string, @Req() req: Request, @Res() res: Response): Promise<Response | void> {
    const reviews = (await this.ProductService.GetProductReviews(id)) || [];

    return res.json(reviews);
  }

  @Post("/:id/reviews")
  async CreateReviewForProduct(@Param("id") id: string, @Body() body: CreateReviewDTO, @Req() req: Request, @Res() res: Response): Promise<Response | void> {
    const newReview = await this.ProductService.CreateReviewForProduct(id, body.text, body.rating, body.usersName);
    if (!newReview) throw new UnprocessableEntityException([{ property: "", errors: ["review did not post. try again maybe!"] }]);

    return res.end();
  }

  @Get("/:id/summarize")
  async GetSummarizeInfo(@Param("id") id: string, @Req() req: Request, @Res() res: Response): Promise<Response | void> {
    const type: "reviews" | "description" = req.query.type?.toString() == "reviews" ? "reviews" : "description";
    const product = await this.ProductService.GetProductById(id);
    if (!product) throw new NotFoundException();

    // TODO ...
  }
}
