import { HttpException, HttpStatus, Injectable, Logger, UsePipes } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { User, UserDocument, UserSchema } from '../common/database/schemas/users.schema';
import { UserLoginDto, UserSignupDto, UserDto } from './users.dto';

import { plainToClass } from 'class-transformer';
import { validateOrReject, IsEmail } from 'class-validator';
import { comparePasswords, hashPasswords } from '../common/shared/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findByLogin({ email, password }: UserLoginDto) {
    const user: any = await this.userModel.findOne({ email: email }).lean();

    if (!user) {
      throw new HttpException('User or Password invalid [001]', HttpStatus.UNAUTHORIZED);
    }

    const areEqual = await comparePasswords(password, user.pass);
    if (!areEqual) {
      throw new HttpException('User or Password invalid [002]', HttpStatus.UNAUTHORIZED);
    }

    return {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      deleted: user.deleted,
    } as UserDto;
  }

  async signup(payload: UserSignupDto) {
    const nw = plainToClass(UserSignupDto, payload);
    await validateOrReject(nw, {
      // whitelist: true,
      // forbidNonWhitelisted: true,
      skipMissingProperties: false,
      // validationError: { target: false, value: false },
    });

    const { email, displayName, password, confirmPassword } = payload;

    if (password !== confirmPassword) {
      throw new HttpException('password and confirm-password is mismatched', HttpStatus.BAD_REQUEST);
    }

    const pattern = this.configService.get<string>('app.password_validate_regex');
    const regex = new RegExp(pattern);
    const valid = regex.test(password);

    if (!valid) {
      throw new HttpException(
        'the password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailLower = email.toLowerCase();
    const user = await this.userModel.findOne({ email: emailLower }).lean();
    if (user) {
      throw new HttpException('the email is duplicated', HttpStatus.FORBIDDEN);
    }

    const hash = await hashPasswords(password);
    const newUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: emailLower,
      displayName: displayName,
      role: 'user',
      pass: hash,
      deleted: false,
    });

    return newUser._id;
  }
}
