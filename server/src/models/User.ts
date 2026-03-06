import mongoose, { type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

export type PublicUser = {
  id: string;
  name?: string;
  email: string;
  bio: string;
  avatar?: { objectName: string };
  createdAt: Date;
  updatedAt: Date;
};

export interface IUser {
  name?: string;
  email: string;
  password: string;
  bio: string;
  avatar?: {
    objectName?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  toPublicJSON(): PublicUser;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "",
    },
    avatar: {
      objectName: {
        type: String,
        trim: true,
      },
      updatedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(this: UserDocument) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar?.objectName ? { objectName: this.avatar.objectName } : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;

