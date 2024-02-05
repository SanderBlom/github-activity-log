import {Router} from "express";
import { GetAllHTMLExample } from '../controllers/PullRequestController.js';
const router = Router();

router.get("/", async (req, res) => {
    try {
        const htmlResponse = await GetAllHTMLExample();
        if (htmlResponse == null) {
          
            res.send("<p>No data found</p>");
            return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlResponse);
    } catch (error) {
        console.log(error);
        res.status(500).send("<p>An error has occurred</p>");
    }
});
export default router;