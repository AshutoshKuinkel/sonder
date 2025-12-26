import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/errorHandler.middleware";
import { getDb } from "../config/db.config";
import {
  createMemoryModel,
  fetchNearbyMemoriesModel,
} from "../models/memory.model";

export const createMemoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, latitude, longitude } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!text || Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new CustomError(
        "Invalid or missing fields: text, latitude, longitude must be numbers",
        400
      );
    }

    const db = getDb();
    const memoryId = await createMemoryModel(db, text, lat, lng);

    res.status(201).json({
      message: `Memory Successfully Created!`,
      data: memoryId,
    });
  } catch (err: any) {
    next(err);
  }
};

export const fetchNearbyMemoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      throw new CustomError(
        "Missing required query params: latitude, longitude",
        400
      );
    }

    const db = getDb();
    const memories = await fetchNearbyMemoriesModel(
      db,
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : 200
    );

    // formatting response for unity:
    const formattedMemories = memories.map((memory) => ({
      id: memory.id,
      text: memory.text,
      latitude: memory.latitude,
      longitude: memory.longitude,
      type: "text", // hardcoded for now, add voice later
      timestamp: memory.createdAt.toDate().toISOString(),
    }));

    res.status(200).json({
      message: `Nearby memories fetched`,
      count: formattedMemories.length,
      memories: formattedMemories,
    });
  } catch (err: any) {
    next(err);
  }
};
