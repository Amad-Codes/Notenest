import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { notesService } from "./notes.service";

function userId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.userId;
}

export const notesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { search, tag, view } = req.query as {
      search?: string;
      tag?: string;
      view: "active" | "archived" | "trash" | "pinned";
    };
    const notes = await notesService.list(userId(req), { search, tag, view });
    res.status(200).json(new ApiResponse("Notes fetched", notes));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const note = await notesService.getById(req.params.id, userId(req));
    res.status(200).json(new ApiResponse("Note fetched", note));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const note = await notesService.create(userId(req), req.body);
    res.status(201).json(new ApiResponse("Note created", note));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const note = await notesService.update(req.params.id, userId(req), req.body);
    res.status(200).json(new ApiResponse("Note updated", note));
  }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const note = await notesService.softDelete(req.params.id, userId(req));
    res.status(200).json(new ApiResponse("Note moved to trash", note));
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const note = await notesService.restore(req.params.id, userId(req));
    res.status(200).json(new ApiResponse("Note restored", note));
  }),

  permanentlyDelete: asyncHandler(async (req: Request, res: Response) => {
    await notesService.permanentlyDelete(req.params.id, userId(req));
    res.status(200).json(new ApiResponse("Note permanently deleted", null));
  }),

  listTags: asyncHandler(async (req: Request, res: Response) => {
    const tags = await notesService.listTags(userId(req));
    res.status(200).json(new ApiResponse("Tags fetched", tags));
  }),

  uploadAttachment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("No file was uploaded");
    const attachment = await notesService.addAttachment(req.params.id, userId(req), req.file);
    res.status(201).json(new ApiResponse("Attachment uploaded", attachment));
  }),

  deleteAttachment: asyncHandler(async (req: Request, res: Response) => {
    await notesService.removeAttachment(req.params.id, req.params.attachmentId, userId(req));
    res.status(200).json(new ApiResponse("Attachment deleted", null));
  }),
};
