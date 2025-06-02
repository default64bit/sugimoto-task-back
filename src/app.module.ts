import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { ProductsModule } from './entities/products/product.module';

@Module({
  imports: [
    // ...
    ConfigModule.forRoot({ envFilePath: ['.env', '.env.local', '.env.stage', '.env.production'] }),
    PrismaModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
