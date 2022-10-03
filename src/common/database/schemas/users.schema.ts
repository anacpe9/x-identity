import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ required: true, default: 'user', enum: ['admin', 'user'] })
  role: string;

  @Prop({ required: true })
  pass: string; // Temporarily placed here, The password should be separate on production.

  @Prop({ required: true, default: false })
  deleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ deleted: 1 }, { background: true, partialFilterExpression: { deleted: true } });
UserSchema.index({ isActive: 1 }, { background: true, partialFilterExpression: { isActive: false } });

export { UserSchema };
