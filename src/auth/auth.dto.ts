import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { UserDto } from '../users/users.dto';

export class LoginDto {
  @ApiProperty({
    description: 'UserDto',
    type: UserDto, // [UserDto],
  })
  user: UserDto;

  @ApiProperty({ description: 'Token' })
  @IsNotEmpty({ message: 'Token must be a string and not empty.' })
  @IsString({ message: 'Token name must be a string and not empty.' })
  token: string;
}
