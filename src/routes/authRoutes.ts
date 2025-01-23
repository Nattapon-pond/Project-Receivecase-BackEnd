import { Context, Elysia } from "elysia";
import {
  getUser,
  addUser,
  updateUser,
  deleteUser,
  getUserById,
  login,
} from "../controllers/authController";

export const authRoutes = (app: Elysia) => {
  // Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
  app.get("/user", async () => {
    try {
      const users = await getUser();

      if ("error" in users) {
        return {
          status: 404,
          body: { error: users.error },
        };
      }

      return {
        status: 200,
        body: users,
      };
    } catch (error) {
      console.error("Error in GET /user route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" },
      };
    }
  });

  // Route สำหรับดึงข้อมูลผู้ใช้ตาม userId
  app.get("/user/:id", async (ctx) => {
    try {
      const { id } = ctx.params;

      // แปลง `id` จาก string ให้เป็น number และตรวจสอบว่าค่าถูกต้องหรือไม่
      const user_id = Number(id);
      if (isNaN(user_id)) {
        return {
          status: 400,
          body: { error: "user_id ต้องเป็นตัวเลข" },
        };
      }

      // เรียกใช้งานฟังก์ชัน `getUserById`
      const user = await getUserById(user_id);

      if ("error" in user) {
        return {
          status: 404,
          body: { error: user.error },
        };
      }

      return {
        status: 200,
        body: user,
      };
    } catch (error) {
      console.error("Error in GET /user/:id route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" },
      };
    }
  });

  // Route สำหรับอัปเดตข้อมูลผู้ใช้
  app.put("/user/:user_id", async (ctx: Context) => {
    try {
      const { user_id } = ctx.params; // ดึง user_id จากพารามิเตอร์
      const body = await ctx.body as { user_name?: string; password?: string }; // รับ body ที่ส่งมาจาก client
  
      // ตรวจสอบว่า body ถูกส่งมาหรือไม่ และมีรูปแบบเป็น object หรือไม่
      if (!body || typeof body !== "object") {
        return {
          status: 400,
          body: { error: "ข้อมูลไม่ถูกต้อง" },
        };
      }
  
      // ตรวจสอบว่ามี user_name และ password ครบถ้วนหรือไม่
      const { user_name, password } = body;
      if (!user_name || !password) {
        return {
          status: 400,
          body: { error: "ข้อมูลไม่ครบถ้วน (ต้องการ user_name และ password)" },
        };
      }
  
      // แปลง user_id จาก string เป็น number และตรวจสอบว่าถูกต้องหรือไม่
      const userIdNumber = parseInt(user_id, 10);
      if (isNaN(userIdNumber)) {
        return {
          status: 400,
          body: { error: "user_id ไม่ถูกต้อง" },
        };
      }
  
      // เรียกใช้ updateUser
      const result = await updateUser(userIdNumber, user_name, password);
  
      // ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่
      if ("error" in result) {
        return {
          status: 404,
          body: { error: result.error },
        };
      }
  
      return {
        status: 200,
        body: result,
      };
    } catch (error) {
      console.error("Error in PUT /user/:user_id route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้" },
      };
    }
  });
  

  app.delete("/user/:user_id", async (ctx: Context) => {
    try {
      const { user_id } = ctx.params; // ดึง user_id จากพารามิเตอร์

      // แปลง user_id จาก string เป็น number
      const userIdNumber = parseInt(user_id, 10);
      if (isNaN(userIdNumber)) {
        return {
          status: 400,
          body: { error: "user_id ไม่ถูกต้อง" },
        };
      }

      // เรียกใช้ deleteUser
      const result = await deleteUser(userIdNumber);

      if ("error" in result) {
        return {
          status: 404,
          body: result,
        };
      }

      return {
        status: 200,
        body: result,
      };
    } catch (error) {
      console.error("Error in DELETE /user/:user_id route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถลบข้อมูลผู้ใช้ได้" },
      };
    }
  });

  // Route สำหรับเพิ่มผู้ใช้
  app.post("/registeruser", async (ctx) => {
    try {
      const body = ctx.body as { user_name?: string; password?: string };

      if (!body || typeof body !== "object") {
        return {
          status: 400,
          body: { error: "ข้อมูลไม่ถูกต้อง" },
        };
      }

      const { user_name, password } = body;

      if (!user_name || !password) {
        return {
          status: 400,
          body: { error: "user_name และ password เป็นข้อมูลที่จำเป็น" },
        };
      }

      const result = await addUser(user_name, password);

      if ("error" in result) {
        return {
          status: 400,
          body: result,
        };
      }

      return {
        status: 201,
        body: result,
      };
    } catch (error) {
      console.error("Error in POST /user route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้" },
      };
    }
  });

  // Route สำหรับเข้าสู่ระบบผู้ใช้
  app.post("/login", async (ctx) => {
  
    try {
      // ตรวจสอบว่า Headers ระบุ Content-Type เป็น JSON หรือไม่
      const contentType = ctx.headers["content-type"];
      if (contentType !== "application/json") {
        return {
          status: 400,
          body: { error: "Content-Type ต้องเป็น application/json" },
        };
      }
  
      // รับ body จาก client
      const body = await ctx.body as { user_name?: string; password?: string };
  
      // ตรวจสอบว่า body มีข้อมูลหรือไม่
      if (!body || typeof body !== "object") {
        return {
          status: 400,
          body: { error: "ข้อมูลไม่ถูกต้อง" },
        };
      }
  
      // ตรวจสอบว่า user_name และ password ถูกส่งมาครบหรือไม่
      const { user_name, password } = body;
  
      if (!user_name || !password) {
        return {
          status: 400,
          body: { error: "user_name และ password เป็นข้อมูลที่จำเป็น" },
        };
      }
  
      // เรียกใช้ฟังก์ชัน login เพื่อตรวจสอบข้อมูลผู้ใช้
      const result = await login(user_name, password);
  
      // ตรวจสอบผลลัพธ์จาก login
      if ("error" in result) {
        return {
          status: 400,
          body: { error: result.error },
        };
      }
  
      // ส่งผลลัพธ์พร้อม Token กลับไป
      return {
        status: 200,
        data: { message: result.message, token: result.token },
      };
    } catch (error) {
      console.error("Error in POST /login route:", error);
      return {
        status: 500,
        body: { error: "ไม่สามารถเข้าสู่ระบบได้" },
      };
    }
  });
  
  
};
