import { Router } from "express";
import { notesController } from "./notes.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { uploadMiddleware } from "../uploads/upload.middleware";
import { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from "./notes.validation";

const router = Router();

// Every note route requires a logged-in user.
router.use(requireAuth);

router.get("/tags", notesController.listTags);
router.get("/", validate(listNotesQuerySchema), notesController.list);
router.get("/:id", notesController.getById);
router.post("/", validate(createNoteSchema), notesController.create);
router.patch("/:id", validate(updateNoteSchema), notesController.update);
router.patch("/:id/trash", notesController.softDelete);
router.patch("/:id/restore", notesController.restore);
router.delete("/:id", notesController.permanentlyDelete);

router.post("/:id/attachments", uploadMiddleware, notesController.uploadAttachment);
router.delete("/:id/attachments/:attachmentId", notesController.deleteAttachment);

export default router;
