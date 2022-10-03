import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HelloVersionDto } from './app.dto';
import { AppService } from './app.service';
import { AuthBasic } from './common/decorators/authz.decorator';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, type: HelloVersionDto })
  getHello() {
    return this.appService.getVersion();
  }

  @Get('/auth')
  @AuthBasic()
  @ApiResponse({ status: 200, type: HelloVersionDto })
  authHello() {
    return this.appService.getVersion();
  }
}
