import express from 'express';
import { Group } from "../models/Group.js";
import { Post } from "../models/post.js";
import {User} from  "../models/User.models.js";
import {verifyToken} from "../middleware/authMiddlesware.js";
// Generate unique invite code
const router = express.Router();
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get all groups (public + user's private groups)
router.get('/', verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { isPrivate: false },
        { members: req.user.id }
      ]
    })
    .populate('creator', 'username')
    .populate('members', 'username')
    .sort({ createdAt: -1 });

    // Add member count and online count (mock for now)
    const groupsWithCounts = groups.map(group => ({
      ...group.toObject(),
      memberCount: group.members.length,
      onlineCount: Math.floor(group.members.length * 0.3), // Mock online count
      isMember: group.members.some(member => member._id.toString() === req.user.id)
    }));

    res.json({ groups: groupsWithCounts });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new group
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, anime, isPrivate = false } = req.body;

    if (!name || !anime) {
      return res.status(400).json({ message: 'Name and anime are required' });
    }

    const inviteCode = generateInviteCode();

    const group = new Group({
      name,
      description,
      anime,
      creator: req.user.id,
      admins: [req.user.id],
      members: [req.user.id],
      isPrivate,
      inviteCode,
      memberCount: 1
    });

    await group.save();

    // Add group to user's joinedGroups
    await User.findByIdAndUpdate(req.user.id, {
      $push: { joinedGroups: group._id }
    });

    await group.populate('creator', 'username');
    await group.populate('members', 'username');

    res.status(201).json({ 
      group: {
        ...group.toObject(),
        memberCount: 1,
        onlineCount: 1,
        isMember: true
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join group
router.post('/:groupId/join', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    if (group.isPrivate) {
      return res.status(403).json({ message: 'Group is private' });
    }

    await Group.findByIdAndUpdate(req.params.groupId, {
      $push: { members: req.user.id },
      $inc: { memberCount: 1 }
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { joinedGroups: req.params.groupId }
    });

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave group
router.post('/:groupId/leave',verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member' });
    }

    if (group.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'Creator cannot leave group' });
    }

    await Group.findByIdAndUpdate(req.params.groupId, {
      $pull: { 
        members: req.user.id,
        admins: req.user.id
      },
      $inc: { memberCount: -1 }
    });

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { joinedGroups: req.params.groupId }
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group details
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'username')
      .populate('members', 'username')
      .populate('admins', 'username');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user has access
    if (group.isPrivate && !group.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      group: {
        ...group.toObject(),
        memberCount: group.members.length,
        onlineCount: Math.floor(group.members.length * 0.3),
        isMember: group.members.some(member => member._id.toString() === req.user.id)
      }
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search groups
router.get('/search/:query', verifyToken, async (req, res) => {
  try {
    const { query } = req.params;
    
    const groups = await Group.find({
      $and: [
        {
          $or: [
            { isPrivate: false },
            { members: req.user.id }
          ]
        },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { anime: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('creator', 'username')
    .populate('members', 'username')
    .limit(20);

    const groupsWithCounts = groups.map(group => ({
      ...group.toObject(),
      memberCount: group.members.length,
      onlineCount: Math.floor(group.members.length * 0.3),
      isMember: group.members.some(member => member._id.toString() === req.user.id)
    }));

    res.json({ groups: groupsWithCounts });
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;