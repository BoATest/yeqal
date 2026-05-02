import { Router, type IRouter } from "express";
import healthRouter from "./health";
import homeworkRouter from "./homework";

const router: IRouter = Router();

router.use(healthRouter);
router.use(homeworkRouter);

export default router;
