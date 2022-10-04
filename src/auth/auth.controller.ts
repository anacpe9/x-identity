import { delay } from './../common/shared/utils';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from './../authz/authz.dto';
import { AuthzService } from './../authz/authz.service';
import { UsersService } from '../users/users.service';
import { UserSignupDto, UserLoginDto } from '../users/users.dto';
import { LoginDto } from './auth.dto';
import { Authz } from '../authz/authz.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthzService, private readonly userService: UsersService) {}

  @ApiResponse({
    status: 200,
    description: 'Success, Return The user id',
    type: String,
  })
  @Post('signup')
  public async signup(@Body() userSignupDto: UserSignupDto): Promise<string> {
    const newId = await this.userService.signup(userSignupDto);
    return newId;
  }

  @ApiResponse({
    status: 201,
    description: 'Success, Return The user information and access token',
    type: LoginDto,
  })
  @Post('login')
  public async login(@Body() loginUserDto: UserLoginDto): Promise<LoginDto> {
    // prevent brute force
    const waitTime = 1000;
    const startTime = Date.now();
    try {
      const user = await this.userService.findByLogin(loginUserDto);
      const token = await this.authService.sign(
        { id: user.id, email: user.email, role: user.role },
        {
          expiresIn: user.role === 'admin' ? '15m' : '1d',
        },
      );
      return {
        user: user,
        token: token,
      };
    } catch (error) {
      throw error;
    } finally {
      const finishTime = Date.now();
      const elapseTime = finishTime - startTime;
      if (waitTime - elapseTime) {
        await delay(waitTime - elapseTime);
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Success, Return The user information and access token',
    type: LoginDto,
  })
  @Authz()
  @Get('whoami')
  public async extractValidJwt(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
