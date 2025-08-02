import {User} from "../models/User.models.js"
import bcrypt from "bcryptjs";
export const updateprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password change failed", error: error.message });
  }
};