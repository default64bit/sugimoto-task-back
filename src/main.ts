import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // adds validation pipe customizations
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException(
          errors.map((item) => {
            return {
              property: item.property,
              errors: item.constraints && Object.values(item.constraints),
            };
          }),
        );
      },
    }),
  );

  // yum, yum cookie parser
  app.use(cookieParser());

  // make them CORS happen
  app.enableCors({ origin: process.env.FRONT_URL });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
