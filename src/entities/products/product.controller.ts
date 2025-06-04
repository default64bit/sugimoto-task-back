import { Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UnprocessableEntityException } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Request, Response as eResponse } from "express";
import { CreateReviewDTO } from "./dto/createReview.dto";
import OpenAI from "openai";
import { Stream } from "openai/core/streaming";

@Controller("products")
export class ProductController {
  constructor(
    // ...
    private ProductService: ProductService,
  ) {}

  @Get("/")
  async GetProductsWithPagination(@Req() req: Request, @Res() res: eResponse): Promise<eResponse | void> {
    const { results, total, page, pageTotal } = await this.ProductService.GetProductsWithPagination({
      search: req.query.search ? req.query.search.toString() : "",
      page: req.query.page ? parseInt(req.query.page.toString()) : 1,
      pp: req.query.pp ? parseInt(req.query.pp.toString()) : 25, // per page items
      sortType: req.query.sort_type === "asc" ? "asc" : "desc",
      sortBy: req.query.sort?.toString() || "createdAt",
    });

    const records = results.map((item) => {
      return { ...item, price: item.price.toString() };
    });

    return res.json({ records, page, total, pageTotal });
  }

  @Get("/:id")
  async GetProductById(@Param("id") id: string, @Req() req: Request, @Res() res: eResponse): Promise<eResponse | void> {
    const product = await this.ProductService.GetProductById(id);
    if (!product) throw new NotFoundException();

    return res.json({ ...product, price: product.price.toString() });
  }

  @Get("/:id/reviews")
  async GetProductReviews(@Param("id") id: string, @Req() req: Request, @Res() res: eResponse): Promise<eResponse | void> {
    const reviews = (await this.ProductService.GetProductReviews(id)) || [];

    return res.json(reviews);
  }

  @Post("/:id/reviews")
  async CreateReviewForProduct(@Param("id") id: string, @Body() body: CreateReviewDTO, @Req() req: Request, @Res() res: eResponse): Promise<eResponse | void> {
    const newReview = await this.ProductService.CreateReviewForProduct(id, body.text, body.rating, body.usersName);
    if (!newReview) throw new UnprocessableEntityException([{ property: "", errors: ["review did not post. try again maybe!"] }]);

    return res.end();
  }

  @Post("/:id/summarize")
  async GetSummarizeInfo(@Param("id") id: string, @Req() req: Request, @Res() res: eResponse): Promise<eResponse | void> {
    const type: "reviews" | "description" = req.body.type?.toString() == "reviews" ? "reviews" : "description";
    const product = await this.ProductService.GetProductById(id);
    if (!product) throw new NotFoundException();

    let prompt = "";
    switch (type) {
      case "description":
        prompt = `Summarize the given description for a product (product name is ${product.name}):`;
        prompt += product.desc;
        break;
      case "reviews":
        prompt = `Based on the listed reviews provided, summarize the reviews in 3-line paragraph:`;
        prompt += JSON.stringify(product.reviews.map((review) => review.reviewText));
        break;
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    messages.push({ role: "user", content: prompt });

    let error: boolean = false;
    let AiResponse: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | undefined;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    await openai.chat.completions
      .create({ model: "chatgpt-4o-latest", stream: true, messages })
      .then((response) => (AiResponse = response))
      .catch(async (e) => {
        error = true;
      });

    if (error) throw new UnprocessableEntityException([{ property: "", errors: ["AI Error!"] }]);
    if (!AiResponse) throw new UnprocessableEntityException([{ property: "", errors: ["No Response!"] }]);

    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    for await (const chunk of AiResponse) {
      if (!chunk) continue;
      const msg = chunk.choices[0].delta.content?.toString() || "";
      res.write(msg);
    }

    res.on("close", () => res.end());
  }
}
