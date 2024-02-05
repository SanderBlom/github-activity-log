import {Router} from "express";
import { GetOpenPRs, GetClosedPRs, GetAllPRs } from '../controllers/PullRequestController.js';
const router = Router();

router.get("/open", async (req, res) => {
    try {
        const data = await GetOpenPRs();
        if(data.length === 0){
            res.status(404).json({ error: "No, data found" });
        }
        res.json(data);
    } catch (error) {
        if (error.message === "No usernames has been defined") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "An error has occurred" });
    }
});

router.get("/closed", async (req, res) => {
    try {
        const data = await GetClosedPRs();
        if(data.length === 0){
            res.status(404).json({ error: "No, data found" });
        }
        res.json(data);
    } catch (error) {
        if (error.message === "No usernames has been defined") {
            return res.status(404).json({ error: error.message });
        }
        console.log(error)
        res.status(500).json({ error: "An error has occurred" });
    }
});

router.get("/", async (req, res) => {
    try {
        const data = await GetAllPRs();
        if(data.length === 0){
            res.status(404).json({ error: "No, data found" });
        }
        res.json(data);
    } catch (error) {
        if (error.message === "No usernames has been defined") {
            return res.status(404).json({ error: error.message });
        }
        console.log(error)
        res.status(500).json({ error: "An error has occurred" });
    }
});

export default router;