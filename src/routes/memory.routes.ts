import express from "express";

const router = express.Router();
import {
  createMemoryController,
  fetchNearbyMemoriesController,
} from "../controllers/memory.controller";

router.post("/memories/create", createMemoryController);
router.get("/memories/nearby", fetchNearbyMemoriesController);

export default router;