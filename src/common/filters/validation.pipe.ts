import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationException } from './validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const validateOption = {
      whitelist: true,
    };
    const object = plainToClass(metatype, value);
    const errors = await validate(object, validateOption);
    if (errors.length > 0) {
      const message = errors.map((error) => {
        return {
          error: `${Object.values(error.constraints)}`,
        };
      });
      throw new ValidationException(message);
    }
    return object;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
