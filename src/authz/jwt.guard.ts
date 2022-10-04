import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Constants } from '../common/constants';

export const guardName = 'jwt-access-token';
export const guardNameIgnoreExpiration = 'jwt-access-token-ignore-expiration';
const headerName = Constants.HEADER_NAME;

// import { AuthService } from '../auth.service';
// import { SERVER_CONFIG } from '../../../server.constants';
// import { IUser } from '../../user/interfaces/user.interface';
// import { IJwtPayload } from '../interfaces/jwt-payload.interface';

function genJwtConfig(configService: ConfigService<Record<string, unknown>, false>, baseOpt: Record<string, any>) {
  if (configService.get<string>('auth.jwt.algorithms') && configService.get<string>('auth.jwt.public_key')) {
    baseOpt.secretOrKey = Buffer.from(configService.get<string>('auth.jwt.public_key'), 'base64');
    baseOpt.algorithms = [configService.get<string>('auth.jwt.algorithms')]; // RS256, ES384, ES512
  } else {
    baseOpt.secret = configService.get<string>('auth.jwt.secret');
  }
  return baseOpt;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, guardName) {
  constructor(configService: ConfigService /* private readonly authService: AuthService */) {
    const baseOpt: Record<string, any> = {
      jwtFromRequest: ExtractJwt.fromHeader(headerName),
    };

    const opt = genJwtConfig(configService, baseOpt);
    super(opt, (payload: any, done: any) => {
      done(null, payload);
    });
  }
}

@Injectable()
export class JwtIgnoreExpirationStrategy extends PassportStrategy(Strategy, guardNameIgnoreExpiration) {
  constructor(configService: ConfigService /* private readonly authService: AuthService */) {
    const baseOpt: Record<string, any> = {
      jwtFromRequest: ExtractJwt.fromHeader(headerName),
      ignoreExpiration: true,
      jsonWebTokenOptions: {
        // ignoreExpiration: true,
        ignoreNotBefore: true,
      },
    };

    const opt = genJwtConfig(configService, baseOpt);
    super(opt, (payload: any, done: any) => {
      done(null, payload);
    });
  }
}

export const JwtGuard = AuthGuard(guardName);
export const JwtIgnoreExpirationGuard = AuthGuard(guardNameIgnoreExpiration);
