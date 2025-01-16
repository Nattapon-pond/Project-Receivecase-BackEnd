// import { Elysia } from 'elysia';
// import { getUsers, getUserByUsername, addUser, updateUser, deleteUser } from '../controllers/userController';

// // กำหนด Interface สำหรับข้อมูลผู้ใช้ที่เข้ามาใน POST และ PUT request
// interface UserRequest {
//   user_name: string;
//   password: string;
// }

// // Initialize Elysia app
// const app = new Elysia();

// // Get All Users
// app.get('/users', async (req) => {
//   try {
//     const response = await getUser();  // เรียกใช้ฟังก์ชัน getUser
//     if (response.status !== 200) {
//       return { status: response.status, body: response.body };
//     }
//     return { status: 200, body: response.body }; // ส่งข้อมูลผู้ใช้ทั้งหมด
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return { status: 500, body: { error: "Failed to fetch users" } };
//   }
// });

// // Get User by Username
// app.get('/users/:username', async (req) => {
//   const { username } = req.params;
//   try {
//     const user = await getUserByUsername(username); // เรียกใช้ฟังก์ชัน getUserByUsername
//     if (user.error) {
//       return { status: 404, body: { error: user.error } }; // หากไม่พบผู้ใช้
//     }
//     return { status: 200, body: user }; // ส่งข้อมูลของผู้ใช้
//   } catch (error) {
//     console.error("Error fetching user by username:", error);
//     return { status: 500, body: { error: "Failed to fetch user" } };
//   }
// });

// // Add New User
// app.post('/users', async (req) => {
//   const { user_name, password } = req.body as UserRequest;  // ใช้ Type Assertion เพื่อบอก TypeScript ว่า req.body เป็น UserRequest
//   try {
//     if (!user_name || !password) {
//       return { status: 400, body: { error: "User name and password are required" } };
//     }

//     const newUser = await addUser({ user_name, password }); // เรียกใช้ฟังก์ชัน addUser
//     if (newUser.error) {
//       return { status: 400, body: { error: newUser.error } };
//     }
//     return { status: 201, body: newUser }; // ส่งข้อมูลผู้ใช้ใหม่ที่ถูกเพิ่ม
//   } catch (error) {
//     console.error("Error adding user:", error);
//     return { status: 500, body: { error: "Failed to add user" } };
//   }
// });

// // Update User
// app.put('/users', async (req) => {
//   const { user_id, user_name, password } = req.body as { user_id: string; user_name: string; password: string };  // ใช้ Type Assertion
//   try {
//     if (!user_id || !user_name || !password) {
//       return { status: 400, body: { error: "User ID, user name, and password are required" } };
//     }

//     const updatedUser = await updateUser({ user_id, user_name, password }); // เรียกใช้ฟังก์ชัน updateUser
//     if (updatedUser.error) {
//       return { status: 400, body: { error: updatedUser.error } };
//     }
//     return { status: 200, body: updatedUser }; // ส่งข้อมูลผู้ใช้ที่ถูกอัปเดต
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return { status: 500, body: { error: "Failed to update user" } };
//   }
// });

// // Delete User
// app.delete('/users/:user_id', async (req) => {
//   const { user_id } = req.params;
//   try {
//     if (!user_id) {
//       return { status: 400, body: { error: "User ID is required" } };
//     }

//     const deletedUser = await deleteUser(user_id); // เรียกใช้ฟังก์ชัน deleteUser
//     if (deletedUser.error) {
//       return { status: 404, body: { error: deletedUser.error } };
//     }
//     return { status: 200, body: deletedUser }; // ส่งข้อมูลผู้ใช้ที่ถูกลบ
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     return { status: 500, body: { error: "Failed to delete user" } };
//   }
// });

// export default app;
