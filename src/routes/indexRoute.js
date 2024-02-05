import {Router} from "express";
const router = Router();

router.get("/", async (req, res) => {
    res.status(200).json({ info: "The application was started successfully" })
})
export default router;