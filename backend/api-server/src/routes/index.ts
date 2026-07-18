import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import portfolioRouter from "./portfolio.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portfolioRouter);
router.use(adminRouter);

export default router;
