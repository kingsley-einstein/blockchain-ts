import express from "express";
import router from "./router";

const app: express.Application = express();

app.use(express.json());
app.use("/api/v1", router);

app.listen(7000, () => console.log("App is running on port 7000"));

// export default app;
