import { env } from "./env";

export function App() {
  return (
    <>
      <p>Hello world!</p>

      <p>Project name is: "{env.APP_NAME}"!</p>
    </>
  );
}
