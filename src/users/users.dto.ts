import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ description: 'Email' })
  @IsNotEmpty()
  @IsEmail()
  @IsString({ message: 'username must be a string' })
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty()
  @IsString({ message: 'password must be a string and not empty.' })
  password: string;
}

export class UserSignupDto {
  @ApiProperty({ description: 'Email' })
  @IsNotEmpty()
  @IsEmail()
  @IsString({ message: 'username must be a string' })
  email: string;

  @ApiProperty({ description: 'Display name' })
  @IsNotEmpty({ message: 'display name must be a string and not empty.' })
  @IsString({ message: 'display name must be a string and not empty.' })
  displayName: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty()
  @IsString({ message: 'password must be a string' })
  password: string;

  @ApiProperty({ description: 'Confirm Password' })
  confirmPassword: string;
}
