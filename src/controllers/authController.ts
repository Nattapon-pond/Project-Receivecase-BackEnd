import dbClient from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Fetch all users
export const getUser = async () => {
  try {
    const result = await dbClient.query(
      "SELECT * FROM receive_case_project.user"
    );
    if (result.rows.length === 0) {
      return { error: "ไม่พบผู้ใช้" };
    }
    return result.rows;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล:", error);
    return { error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" };
  }
};

// Fetch user by userbyid
export const getUserById = async (user_id: number) => {
  try {
    const result = await dbClient.query(
      "SELECT * FROM receive_case_project.user WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return { error: "ไม่พบผู้ใช้ที่มี ID นี้" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล:", error);
    return { error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" };
  }
};

// Update user
export const updateUser = async (
  user_id: number,
  user_name: string,
  password: string
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbClient.query(
      "UPDATE receive_case_project.user SET user_name = $1, password = $2 WHERE user_id = $3 RETURNING user_id, user_name",
      [user_name, hashedPassword, user_id]
    );
    if (result.rows.length === 0) {
      return { error: "ไม่พบผู้ใช้ที่ต้องการอัปเดต" };
    }
    return result.rows[0];
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:", error);
    return { error: "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้" };
  }
};

// Delete user
export const deleteUser = async (user_id: number) => {
  try {
    const result = await dbClient.query(
      "DELETE FROM receive_case_project.user WHERE user_id = $1 RETURNING user_id",
      [user_id]
    );
    if (result.rows.length === 0) {
      return { error: "ไม่พบผู้ใช้ที่ต้องการลบ" };
    }
    return { message: "ลบข้อมูลผู้ใช้สำเร็จ", user_id: result.rows[0].user_id };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้:", error);
    return { error: "ไม่สามารถลบข้อมูลผู้ใช้ได้" };
  }
};

// ฟังก์ชันเพิ่มผู้ใช้ใหม่ (รองรับทั้งฐานข้อมูลและ mock data)
// Mock Data สำหรับการทดสอบ
export const mockUsers = [
  {
    user_id: 1,
    user_name: "DenisPond",
    password: "$2b$10$NrV9ISxT7J4ghm0U7EnwS.VHfb2xyT.Y7p78yAgf9kJos6gByp3Ou", // password ถูกแฮชด้วย bcrypt
  },
];

// ฟังก์ชันเพิ่มผู้ใช้
export const addUser = async (
  user_name: string,
  Password: string,
  useMock: boolean = false // ใช้ `true` เพื่อเพิ่มลงใน mockUsers แทนฐานข้อมูล
) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    if (useMock) {
      // เพิ่มผู้ใช้ใน mock data
      const userExists = mockUsers.some((u) => u.user_name === user_name);
      if (userExists) {
        return { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว (mock)" };
      }

      const newUser = {
        user_id: mockUsers.length + 1,
        user_name,
        password: hashedPassword,
      };

      mockUsers.push(newUser);
      console.log("เพิ่มผู้ใช้ใหม่สำเร็จ (mock):", newUser);
      return { message: "เพิ่มผู้ใช้สำเร็จ (mock)", user: newUser };
    } else {
      // เพิ่มผู้ใช้ในฐานข้อมูล PostgreSQL
      const result = await dbClient.query(
        "INSERT INTO receive_case_project.user (user_name, password) VALUES ($1, $2) RETURNING user_id, user_name",
        [user_name, hashedPassword]
      );

      console.log("เพิ่มผู้ใช้ใหม่สำเร็จ (database):", result.rows[0]);
      return { message: "เพิ่มผู้ใช้สำเร็จ (database)", user: result.rows[0] };
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้ใช้:", error);
    return { error: "ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้" };
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ (ใช้ได้กับ mock data และ database)
export const getUserByUsernameToLogin = async (
  user_name: string,
  useMock: boolean = false // ใช้ `true` เพื่อดึงจาก mockUsers
) => {
  try {
    if (useMock) {
      // ดึงข้อมูลผู้ใช้จาก mockUsers
      const user = mockUsers.find((u) => u.user_name === user_name);

      if (!user) {
        return { error: "ไม่พบผู้ใช้ที่มีชื่อผู้ใช้นี้ (mock)" };
      }

      return user;
    } else {
      // ดึงข้อมูลผู้ใช้จากฐานข้อมูล PostgreSQL
      const result = await dbClient.query(
        "SELECT * FROM receive_case_project.user WHERE user_name = $1",
        [user_name]
      );

      if (result.rows.length === 0) {
        return { error: "ไม่พบผู้ใช้ที่มีชื่อผู้ใช้นี้ (database)" };
      }

      return result.rows[0];
    }
  } catch (error) {
    console.error("Error in getUserByUsernameToLogin:", error);
    return { error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" };
  }
};

// ฟังก์ชัน Login
export const login = async (user_name: string, password: string, useMock: boolean = false) => {
  try {
    const user = await getUserByUsernameToLogin(user_name, useMock);
    if ("error" in user) {
      console.error("User not found:", user.error);
      return { error: user.error };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password attempt for user:", user_name);
      return { error: "รหัสผ่านไม่ถูกต้อง" };
    }

    const payload = {
      userId: user.user_id,
      user_name: user.user_name,
    };

    const secret = process.env.JWT_SECRET || "yourSecretKey";
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return { message: "เข้าสู่ระบบสำเร็จ", token };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
    return { error: "ไม่สามารถเข้าสู่ระบบได้" };
  }
};

