import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // TODO : add a recconnect/retry logic

    // awaiting for a connection
    await this.$connect().catch((e) => console.log(e));
  }
}
