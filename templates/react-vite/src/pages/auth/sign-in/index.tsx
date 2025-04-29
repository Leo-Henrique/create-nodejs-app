import { privateRoutes } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import "./styles.css";

const signInFormSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(6).max(255),
});

type SignInForm = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const navigate = useNavigate();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSignIn = async (input: SignInForm) => {
    console.log(input);
    navigate(privateRoutes.dashboard.path);
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
          onSubmit={signInForm.handleSubmit(onSignIn)}
          noValidate
        >
          <div className="sign-in-form-input-container">
            <input
              {...signInForm.register("email")}
              type="email"
              placeholder="Your email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {signInForm.formState.errors.email && (
              <span className="sign-in-form-input-error">
                {signInForm.formState.errors.email.message}
              </span>
            )}
          </div>

          <div className="sign-in-form-input-container">
            <input
              {...signInForm.register("password")}
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {signInForm.formState.errors.password && (
              <span className="sign-in-form-input-error">
                {signInForm.formState.errors.password.message}
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
