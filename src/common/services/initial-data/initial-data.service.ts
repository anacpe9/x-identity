import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User, UserDocument } from '../../database/schemas/users.schema';
import { hashPasswords } from '../../shared/utils';

@Injectable()
export class InitialDataService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<UserDocument>,
  ) {}

  async hasAdminUser(): Promise<boolean> {
    const admin = await this.userModel.findById('0').lean();
    if (!admin) return false;
    if (admin.role === 'admin' && !admin.deleted) return true;

    return false;
  }
  async onModuleInit() {
    try {
      Logger.log('Start Initial Data ...');

      // Randomly delay to prevent other pods from starting at the same time.
      const ms = Math.floor(Math.random() * 2000);
      await new Promise((res) => setTimeout(res, ms));

      const adminUser = await this.userModel.findById('0').lean();
      if (!adminUser) {
        const pass =
          process.env.NODE_ENV === 'test'
            ? '\x50\x40\x73\x73\x77\x30\x72\x64\x46\x6f\x72\x54\x65\x73\x74\x69\x6e\x67\x31\x32\x33\x34\x35\x36' // P@ssw0rdForTesting123456
            : '\x41\x64\x6d\x69\x6e\x50\x40\x73\x73\x77\x30\x72\x64';
        const hash = await hashPasswords(pass);
        await this.userModel.create({
          _id: '0',
          email: 'admin@x-store.local',
          displayName: 'Administrator',
          role: 'admin',
          pass: hash,
          deleted: false,
        });
      } else {
        // restore
        if (adminUser.deleted || adminUser.role !== 'admin') {
          await this.userModel.findByIdAndUpdate('_id', {
            $set: {
              role: 'admin',
              deleted: false,
            },
          });
        }
      }

      const success = await this.hasAdminUser();
      Logger.log(`System has admin: ${success}`);
    } catch (err) {
      Logger.log(`Initial data error: ${err}`);
      Logger.error(err);
    }
  }
}
