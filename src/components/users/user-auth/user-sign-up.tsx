import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import CustomInput from "@/components/ui/custom-input";
import CustomPasswordInput from "@/components/ui/custom-password-inupt";
import SubmitButton from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import CustomEmailInput from "@/components/ui/custom-email-input";
import AvatarSelectDialog from "@/web-avatars/web-avatar-dialog";
import { AvatarImageType, avtarImages } from "@/web-avatars/_avatars";
import { LoaderIcon } from "lucide-react";

// Example avatars array. In a real-world scenario, you might fetch this.

const UserSignUp = ({
  isLogin,
  setIsLogin,
}: {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setEmail] = useState(true);
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarImageType | null>(
    null
  );

  // Zod schema for sign up form.
  const userSignUpZodSchema = z
    .object({
      name: z
        .string()
        .min(
          2,
          "Your name should have at least 2 characters to ensure proper identification."
        )
        .max(
          100,
          "Please keep your name under 100 characters to maintain clarity."
        ),
      email: z
        .string()
        .email("Please enter a valid email address so we can reach you.")
        .min(2, "We need your email to continue the registration process."),
      customImage: z
        .string()
        .optional()
        .refine(
          (value) => value !== "",
          "Kindly provide a profile image so we can personalize your experience."
        ),
      password: z
        .string()
        .min(
          8,
          "Your password should be at least 8 characters for your security."
        )
        .max(
          12,
          "For your protection, please keep the password under 12 characters."
        ),
      confirmPassword: z
        .string()
        .min(
          8,
          "The confirmation password should be at least 8 characters long."
        )
        .max(
          12,
          "For consistency, please match the length of your original password."
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message:
        "It looks like the passwords don't match. Please confirm them again.",
      path: ["confirmPassword"],
    });

  type UserSignUpType = z.infer<typeof userSignUpZodSchema>;

  const form = useForm<UserSignUpType>({
    resolver: zodResolver(userSignUpZodSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      customImage: "",
      confirmPassword: "",
    },
  });

  const { signIn } = useAuthActions();

  const handleSignUp = async (data: UserSignUpType) => {
    console.log(data);
    // Ensure the user has selected an avatar.
    if (!selectedAvatar) {
      setError("Please select an avatar before signing up.");
      return;
    }

    setLoading(true);
    setError(null);
    await signIn("password", {
      name: data.name,
      email: data.email,
      password: data.password,
      customImage: selectedAvatar.image, // pass the selected avatar image here!
      flow: "signUp",
    })
      .then(() => {
        navigate("/chat");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className="flex flex-col items-center justify-center h-full w-full ">
      <section className="h-fit w-full text-center py-4">
        <h1 className="text-3xl font-bold text-center">Sign Up</h1>
        <p>Sign Up into your account</p>
      </section>

      {/* Avatar selection section */}

      <Form {...form}>
        <form
          className="flex flex-col space-y-3 max-w-xl w-full mx-auto justify-start h-fit"
          onSubmit={form.handleSubmit(handleSignUp)}
        >
          <div className="flex justify-center items-center">
            <AvatarSelectDialog
              userId={undefined}
              avatars={avtarImages}
              control={form.control}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              name="customImage"
              label=""
              // Instead of updating the DB (since the user doesn't exist yet),
              // we simply update local state.
            />
          </div>
          <CustomInput control={form.control} name="name" label="Name" />
          <CustomEmailInput
            setIsEmailAvailable={setEmail}
            control={form.control}
            name="email"
            label="Email"
          />
          <CustomPasswordInput
            control={form.control}
            name="password"
            label="Password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            placeholder="Enter your password"
          />
          <CustomPasswordInput
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            placeholder="Confirm your password"
          />

          {error && <div className="text-red-500">{error}</div>}

          <SubmitButton
            type="submit"
            isLoading={loading}
            className="bg-pink-400 hover:bg-pink-500 transition-all duration-300 ease-in-out"
            loadingText="Signing Up"
          >
            {loading ? (
              <span>
                <LoaderIcon className="animate-spin" />
              </span>
            ) : (
              <span>Sign Up</span>
            )}
          </SubmitButton>
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create an account" : "Already have an account?"}
          </Button>
        </form>
      </Form>
    </main>
  );
};

export default UserSignUp;
