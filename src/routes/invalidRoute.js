// Catch-all route handler
import {Router} from "express";

const router = Router();
router.all("*", (req, res) => {
    res.status(404).json({ error: "The path you specified is invalid" });
});

export default router;