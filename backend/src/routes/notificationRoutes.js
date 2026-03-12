import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = Router();

// GET /api/notifications/:userId - Get all notifications for user
router.get("/:userId", getNotifications);

// PUT /api/notifications/:id/read - Mark one as read
router.put("/:id/read", markAsRead);

// PUT /api/notifications/user/:userId/read - Mark all as read
router.put("/user/:userId/read", markAllAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", deleteNotification);

export default router;
