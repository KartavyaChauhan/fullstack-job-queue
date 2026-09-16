import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JobsModule } from './jobs/jobs.module.js';

@Module({
  imports: [JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
