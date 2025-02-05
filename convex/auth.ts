import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

const CustomUserSchema = Password<DataModel>({
  profile(params) {
    return {
      name: params.name as string,
      email: params.email as string,
      customImage: params.customImage as string,
      chats: [],
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomUserSchema],
});
