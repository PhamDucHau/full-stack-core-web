import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AutomakerService } from './automaker.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [AutomakerService],
  exports: [AutomakerService],
})
export class AutomakerModule {}
