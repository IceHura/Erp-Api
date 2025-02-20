import { User, UserRole } from "../models/User";
import bcrypt from "bcryptjs";

export const initializeAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });

    if (!existingAdmin) {
      console.log("🔹 No admin found, creating default admin...");

      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = new User({
        name: "Default Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      await admin.save();
      console.log("✅ Default admin created: admin@example.com / admin123");
    } else {
      console.log("✅ Admin already exists.");
    }
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  }
};
