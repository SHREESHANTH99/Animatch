import {Notification} from "../models/Notification.js"

class NotificationHelper {
  static async createNotification({
    userId,
    type,
    message,
    relatedUser = null,
    relatedPost = null,
    relatedGroup = null,
    metadata = {}
  }) {
    try {
      const notification = new Notification({
        userId,
        type,
        message,
        relatedUser,
        relatedPost,
        relatedGroup,
        metadata
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Create like notification
  static async createLikeNotification(postUserId, likerUserId, likerUsername, postId) {
    if (postUserId.toString() === likerUserId.toString()) {
      return; // Don't notify users about their own likes
    }

    const message = `${likerUsername} liked your post`;
    
    return this.createNotification({
      userId: postUserId,
      type: 'like',
      message,
      relatedUser: likerUserId,
      relatedPost: postId
    });
  }

  // Create comment notification
  static async createCommentNotification(postUserId, commenterUserId, commenterUsername, postId) {
    if (postUserId.toString() === commenterUserId.toString()) {
      return; // Don't notify users about their own comments
    }

    const message = `${commenterUsername} commented on your post`;
    
    return this.createNotification({
      userId: postUserId,
      type: 'comment',
      message,
      relatedUser: commenterUserId,
      relatedPost: postId
    });
  }

  // Create mention notification
  static async createMentionNotification(mentionedUserId, mentionerUserId, mentionerUsername, postId) {
    const message = `${mentionerUsername} mentioned you in a post`;
    
    return this.createNotification({
      userId: mentionedUserId,
      type: 'mention',
      message,
      relatedUser: mentionerUserId,
      relatedPost: postId
    });
  }

  // Create group invite notification
  static async createGroupInviteNotification(invitedUserId, inviterUserId, inviterUsername, groupId, groupName) {
    const message = `${inviterUsername} invited you to join ${groupName}`;
    
    return this.createNotification({
      userId: invitedUserId,
      type: 'group_invite',
      message,
      relatedUser: inviterUserId,
      relatedGroup: groupId,
      metadata: { groupName }
    });
  }

  // Batch create notifications
  static async createBulkNotifications(notifications) {
    try {
      return await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Bulk create notifications error:', error);
      throw error;
    }
  }

  // Clean up old notifications (call this periodically)
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Cleanup notifications error:', error);
      throw error;
    }
  }
}

export default NotificationHelper;
