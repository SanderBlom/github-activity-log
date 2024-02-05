import express from 'express'
import PR from "./routes/PrRoute.js"
import index from "./routes/indexRoute.js"
import invalid from "./routes/invalidRoute.js"
import { startCronJob } from './utils/updateCache.js';
import { validateEnv } from './utils/envValidator.js';

validateEnv();

const app = express()
app.use(express.json())

// Route handling
app.use("/", index)
app.use("/api/pr", PR)
app.use("*", invalid)

const PORT = process.env.SERVER_PORT || 3000

startCronJob();

app.listen(PORT , () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

