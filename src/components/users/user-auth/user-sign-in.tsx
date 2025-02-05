import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/ui/submit-button";
import CustomInput from "@/components/ui/custom-input";
import CustomPasswordInput from "@/components/ui/custom-password-inupt";
import { Button } from "@/components/ui/button";

const UserSignIn = ({
  isLogin,
  setIsLogin,
}: {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const userSignInZodSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(12),
  });
  const navigate = useNavigate();

  type UserSignInType = z.infer<typeof userSignInZodSchema>;

  const form = useForm<UserSignInType>({
    resolver: zodResolver(userSignInZodSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn } = useAuthActions();

  const handleSignIn = async (data: UserSignInType) => {
    console.log(data);
    try {
      setLoading(true);
      setError(null);

      await signIn("password", {
        email: data.email,
        password: data.password,

        flow: "signIn",
      })
        .catch((err: any) => {
          console.log(err);
          setError(err.message);
        })
        .finally(() => {
          navigate("/");
        });
    } catch (err: any) {
      if (err.message.includes("InvalidSecret")) {
        setError("Invalid email or password");
      }
    } finally {
      setError(null);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-full items-center justify-center">
      <section className="flex h-fit flex-col text-center items-center justify-end ">
        <h1 className="text-3xl font-bold text-center">
          {isLogin ? "Sign In" : "Sign Up"}
        </h1>
        <p>
          {isLogin ? "Sign in to your account" : "Sign up for a new account"}
        </p>
      </section>
      <Form {...form}>
        <form
          className="flex flex-col space-y-3 max-w-xl w-full mx-auto h-fit justify-center"
          onSubmit={form.handleSubmit(handleSignIn)}
        >
          <CustomInput control={form.control} name="email" label="Email" />
          <CustomPasswordInput
            control={form.control}
            name="password"
            label="Password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          {error && <div className="text-red-500">{error}</div>}

          <SubmitButton
            type="submit"
            isLoading={loading}
            loadingText="Signing Up"
          >
            Sign Up
          </SubmitButton>
        </form>
      </Form>
      <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create an account" : "Already have an account?"}
      </Button>
    </main>
  );
};

export default UserSignIn;
