import { env } from "./config/env";
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Lela Secondary School API running on http://localhost:${env.PORT}`);
});
