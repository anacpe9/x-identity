import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { JwtPayload } from './authz.dto';

@Injectable()
export class AuthzService {
  private readonly algorithm: Algorithm;
  constructor(
    // private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.algorithm = this.configService.get<Algorithm>('auth.jwt.algorithms');
  }

  async sign(user: JwtPayload, options: Partial<JwtSignOptions>): Promise<string> {
    options.issuer = 'x-id';
    // options.algorithm = this.algorithm;
    return await this.jwtService.signAsync(user, options);
  }

  // async verify(user: any, options?: Partial<JwtVerifyOptions>): Promise<any> {
  //   return await this.jwtService.verifyAsync(user, options);
  // }
}
