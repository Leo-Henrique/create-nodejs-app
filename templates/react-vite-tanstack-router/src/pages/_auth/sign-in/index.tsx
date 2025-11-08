import { env } from "@/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "./styles.css";

export const Route = createFileRoute("/_auth/sign-in/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `Sign In | ${env.PUBLIC_APP_NAME}`,
      },
    ],
  }),
});

const signInFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(255),
});

type SignInForm = z.infer<typeof signInFormSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const form = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (_input: SignInForm) => {
    navigate({ to: "/" });
  };

  return (
    <div className="sign-in-wrapper">
      <div className="sign-in-container">
        <div className="sign-in-header">
          <h1>Sign In</h1>

          <p>Log in to access the dashboard!</p>
        </div>

        <form
          className="sign-in-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="sign-in-form-input-container">
            <input
              {...form.register("email")}
              type="email"
              placeholder="Your email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {form.formState.errors.email && (
              <span className="sign-in-form-input-error">
                {form.formState.errors.email.message}
              </span>
            )}
          </div>

          <div className="sign-in-form-input-container">
            <input
              {...form.register("password")}
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {form.formState.errors.password && (
              <span className="sign-in-form-input-error">
                {form.formState.errors.password.message}
              </span>
            )}
          </div>

          <button className="sign-in-form-submit" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
