import { notificationModel } from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationModel.getByUserId(userId);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationModel.markAsRead(id);
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationModel.markAllAsRead(userId);
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationModel.delete(id);
    res.json({ message: "Notification deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
