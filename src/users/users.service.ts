import { Injectable, Logger, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument, UserSchema } from '../common/database/schemas/users.schema';
// import { UserLoginDto, UserSignupDto } from './users.dto';

import { plainToClass } from 'class-transformer';
import { validateOrReject, registerSchema } from 'class-validator';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString({ message: 'username must be a string' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'password must be a string and not empty.' })
  password: string;
}

export class UserSignupDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString({ message: 'username must be a string' })
  email: string;

  @IsNotEmpty({ message: 'display name must be a string and not empty.' })
  @IsString({ message: 'display name must be a string and not empty.' })
  displayName: string;

  @IsNotEmpty()
  @IsString({ message: 'password must be a string' })
  password: string;

  confirmPassword: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<UserDocument>,
  ) {}

  async login(payload: UserLoginDto) {
    return {};
  }

  async signup(payload: UserSignupDto) {
    const nw = plainToClass(UserSignupDto, payload);
    await validateOrReject(nw, {
      // whitelist: true,
      // forbidNonWhitelisted: true,
      skipMissingProperties: false,
      // validationError: { target: false, value: false },
    });

    return '1'.repeat(24);
  }
}
