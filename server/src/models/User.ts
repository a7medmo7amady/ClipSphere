import mongoose, { type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import { VIDEO_EMBEDDING_VECTOR_LENGTH } from "../config/vector";

export type PublicUser = {
  id: string;
  username: string;
  name?: string;
  email: string;
  bio: string;
  avatarKey?: string;
  role: "user" | "admin";
  active: boolean;
  accountStatus: "active" | "banned";
  createdAt: Date;
  updatedAt: Date;
};

export interface IUser {
  username: string;
  name?: string;
  email: string;
  password: string;
  bio: string;
  avatarKey?: string;
  role: "user" | "admin";
  active: boolean;
  accountStatus: "active" | "banned";
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  notificationPreferences: {
    inApp: {
      followers: boolean;
      comments: boolean;
      likes: boolean;
      tips: boolean;
    };
    email: {
      followers: boolean;
      comments: boolean;
      likes: boolean;
      tips: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;

  recommendationEmbedding?: number[];
  recommendationEmbeddingUpdatedAt?: Date;
  recommendationEmbeddingStatus?: "pending" | "ready" | "failed";
  recommendationEmbeddingLastError?: string;

  stripeCustomerId?: string;

  comparePassword(candidate: string): Promise<boolean>;
  toPublicJSON(): PublicUser;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80,
    },
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
      maxlength: 500,
      default: "",
    },
    avatarKey: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    notificationPreferences: {
      inApp: {
        followers: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
      },
      email: {
        followers: { type: Boolean, default: false },
        comments: { type: Boolean, default: false },
        likes: { type: Boolean, default: false },
        tips: { type: Boolean, default: false },
      },
    },

    recommendationEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
      validate: {
        validator(value: number[] | undefined) {
          return value === undefined || value.length === VIDEO_EMBEDDING_VECTOR_LENGTH;
        },
        message: `Recommendation embedding must contain exactly ${VIDEO_EMBEDDING_VECTOR_LENGTH} numbers`,
      },
    },
    recommendationEmbeddingUpdatedAt: {
      type: Date,
      select: false,
    },
    recommendationEmbeddingStatus: {
      type: String,
      enum: ["pending", "ready", "failed"],
      default: "pending",
      select: false,
      index: true,
    },
    recommendationEmbeddingLastError: {
      type: String,
      maxlength: 2000,
      select: false,
    },
    stripeCustomerId: {
      type: String,
      select: false,
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
    username: this.username,
    name: this.name,
    email: this.email,
    bio: this.bio,
    avatarKey: this.avatarKey,
    role: this.role,
    active: this.active,
    accountStatus: this.accountStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;

