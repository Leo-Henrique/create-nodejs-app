import { env } from "@/env";
import { app, openApiUrlPathname } from "@/http/app";

app.listen(env.API_PORT, ({ url }) => {
  const openApiUrl = new URL(url);

  openApiUrl.pathname = `${app.config.prefix ?? ""}${openApiUrlPathname}`;

  console.log(openApiUrl.toString());
});
