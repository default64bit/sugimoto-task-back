import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  providers: [ProductService],
  controllers: [ProductController],
  imports: [PrismaModule],
})
export class ProductsModule {}
