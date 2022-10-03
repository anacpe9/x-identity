import * as bcrypt from 'bcrypt';

export const comparePasswords = async (userPassword, currentHashedPassword) => {
  return await bcrypt.compare(userPassword, currentHashedPassword);
};

export const hashPasswords = async (userPassword) => {
  const bSalt: string = bcrypt.genSaltSync(8);
  const hash = await bcrypt.hash(userPassword, bSalt);

  return hash;
};
