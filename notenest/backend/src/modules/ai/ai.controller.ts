import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { aiService } from "./ai.service";

export const aiController = {
  process: asyncHandler(async (req: Request, res: Response) => {
    const { action, text } = req.body;
    const { result, provider } = await aiService.process(action, text);
    res.status(200).json(new ApiResponse("AI response generated", { result, provider }));
  }),
};
