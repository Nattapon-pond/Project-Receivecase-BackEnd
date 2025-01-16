// import { QueryResult } from "pg";
// import dbClient from "../db"; // ใช้ dbClient ที่เชื่อมต่อไว้แล้ว

// // export const addImage = async (imgData: {
// //   img_name: string;
// //   img: string;
// //   // img_id?: number; // img_id เป็น optional
// // }) => {
// //   const { img_name, img, img_id } = imgData;
// //   const { img_name, img, img_id } = imgData;

// //   try {
// //     // ตรวจสอบว่า img_name และ img ถูกกำหนดค่า
// //     if (!img_name || !img) {
// //       throw new Error("กรุณาระบุข้อมูล img_name และ img ให้ครบถ้วน");
// //     }

// //     // ถ้า img_id ถูกกำหนดมา ต้องตรวจสอบว่า img_id นี้ไม่มีอยู่ในฐานข้อมูล
// //     if (img_id) {
// //       const existingImgId: QueryResult<any> = await dbClient.query(
// //         "SELECT img_id FROM receive_case_project.img WHERE img_id = $1",
// //         [img_id]
// //       );

// //       // ตรวจสอบว่า existingImgId ไม่เป็น null และมี rowCount
// //       if (existingImgId.rowCount !== null && existingImgId.rowCount > 0) {
// //         throw new Error(`img_id ${img_id} นี้มีอยู่แล้วในฐานข้อมูล`);
// //       }
// //     }

// //     // คำสั่ง SQL สำหรับการเพิ่มข้อมูล
// //     let query: string;
// //     let params: (string | number)[];

// //     if (img_id) {
// //       // กรณีที่มี img_id กำหนด
// //       query = `
// //         INSERT INTO receive_case_project.img (img_id, img_name, img)
// //         VALUES ($1, $2, $3)
// //         RETURNING img_id, img_name, img;
// //       `;
// //       params = [img_id, img_name, img];
// //     } else {
// //       // กรณีที่ไม่มี img_id (ให้ฐานข้อมูลสร้างค่า img_id อัตโนมัติ)
// //       query = `
// //         INSERT INTO receive_case_project.img (img_name, img)
// //         VALUES ($1, $2)
// //         RETURNING img_id, img_name, img;
// //       `;
// //       params = [img_name, img];
// //     }

// //     // ใช้ dbClient ที่เชื่อมต่ออยู่แล้วในการ query
// //     const result = await dbClient.query(query, params);

// //     // ตรวจสอบผลลัพธ์การ query
// //     if (result.rowCount === 0) {
// //       throw new Error("ไม่สามารถเพิ่มข้อมูลรูปภาพได้");
// //     }

// //     return {
// //       success: true,
// //       message: "เพิ่มข้อมูลรูปภาพสำเร็จ",
// //       data: result.rows[0],
// //     };
// //   } catch (error: unknown) {
// //     // จับข้อผิดพลาดและคืนค่าข้อความที่เหมาะสม
// //     if (error instanceof Error) {
// //       console.error("Database query error in addImage:", error.message);
// //       return { error: `เกิดข้อผิดพลาด: ${error.message}` };
// //     } else {
// //       console.error("Unknown error:", error);
// //       return { error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
// //     }
// //   }
// // };

// export const addImage = async (imgData: { img_name: string; img: string }) => {
//   const { img_name, img } = imgData;

//   try {
//     // ตรวจสอบว่า img_name และ img ถูกกำหนดค่า
//     if (!img_name || !img) {
//       throw new Error("กรุณาระบุข้อมูล img_name และ img ให้ครบถ้วน");
//     }

//     // คำสั่ง SQL สำหรับการเพิ่มข้อมูล (ไม่ต้องใช้ img_id)
//     const query = `
//       INSERT INTO receive_case_project.img (img_name, img)
//       VALUES ($1, $2)
//       RETURNING  img_name, img;
//     `;
//     const params = [img_name, img];

//     // ใช้ dbClient ที่เชื่อมต่ออยู่แล้วในการ query
//     const result = await dbClient.query(query, params);

//     // ตรวจสอบผลลัพธ์การ query
//     if (result.rowCount === 0) {
//       throw new Error("ไม่สามารถเพิ่มข้อมูลรูปภาพได้");
//     }

//     return {
//       success: true,
//       message: "เพิ่มข้อมูลรูปภาพสำเร็จ",
//       data: result.rows[0],
//     };
//   } catch (error: unknown) {
//     // จับข้อผิดพลาดและคืนค่าข้อความที่เหมาะสม
//     if (error instanceof Error) {
//       console.error("Database query error in addImage:", error.message);
//       return { error: `เกิดข้อผิดพลาด: ${error.message}` };
//     } else {
//       console.error("Unknown error:", error);
//       return { error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
//     }
//   }
// };

// // ดึงข้อมูลทั้งหมด
// export const getAllImages = async () => {
//   try {
//     // ตรวจสอบให้แน่ใจว่าใช้คำสั่ง SQL ที่ถูกต้อง
//     const query = "SELECT * FROM receive_case_project.img"; // ตรวจสอบชื่อของ table ในฐานข้อมูล

//     // ส่ง query ไปยังฐานข้อมูล
//     const result = await dbClient.query(query);

//     // ตรวจสอบว่าผลลัพธ์มีข้อมูลหรือไม่
//     if (result.rowCount === 0) {
//       return { status: 404, error: "No images found" }; // ไม่มีข้อมูลในตาราง
//     }

//     // ส่งข้อมูลที่ได้จากฐานข้อมูลในรูปแบบ JSON
//     return { status: 200, data: result.rows }; // ใช้ status code 200 สำหรับการตอบกลับที่สำเร็จ
//   } catch (error: unknown) {
//     // ตรวจสอบว่า error เป็นประเภท Error หรือไม่
//     if (error instanceof Error) {
//       // หาก error เป็นประเภท Error, เราสามารถเข้าถึง message ได้
//       console.error("Database query error in getAllImages:", error.message);
//       return {
//         status: 500,
//         error: `Failed to retrieve images from the database: ${error.message}`,
//       };
//     } else {
//       // ถ้า error ไม่ใช่ประเภท Error, ให้ส่งข้อความทั่วไป
//       console.error("Unknown error occurred:", error);
//       return {
//         status: 500,
//         error: "Failed to retrieve images from the database",
//       };
//     }
//   }
// };

// // ดึงข้อมูลตาม ID
// export const getImageById = async (id: number) => {
//   try {
//     const query = "SELECT * FROM img WHERE img_id = $1";
//     const result = await dbClient.query(query, [id]);

//     if (result.rowCount === 0) {
//       return { error: "Image not found" };
//     }

//     return result.rows[0];
//   } catch (error) {
//     console.error("Database query error:", error);
//     return { error: "Failed to retrieve image" };
//   }
// };

// // อัพเดทข้อมูลตาม ID
// export const updateImage = async (
//   id: number,
//   updatedData: { [key: string]: any }
// ) => {
//   try {
//     const checkQuery = "SELECT * FROM img WHERE img_id = $1";
//     const checkResult = await dbClient.query(checkQuery, [id]);

//     if (checkResult.rowCount === 0) {
//       return { error: "Image not found" };
//     }

//     const columns = Object.keys(updatedData);
//     const values = Object.values(updatedData);

//     const setClause = columns
//       .map((col, index) => `${col} = $${index + 2}`)
//       .join(", ");
//     const query = `UPDATE img SET ${setClause} WHERE img_id = $1 RETURNING *`;

//     const result = await dbClient.query(query, [id, ...values]);

//     return result.rows[0];
//   } catch (error) {
//     console.error("Database query error in updateImage:", error);
//     return { error: "Failed to update image" };
//   }
// };

// // ลบข้อมูลตาม ID
// export const deleteImage = async (id: number) => {
//   try {
//     const query = `
//         DELETE FROM img
//         WHERE img_id = $1
//         RETURNING *;
//       `;
//     const result = await dbClient.query(query, [id]);

//     if (result.rowCount === 0) {
//       return { error: "Image not found" };
//     }

//     return { message: "Image deleted successfully", data: result.rows[0] };
//   } catch (error) {
//     console.error("Database query error in deleteImage:", error);
//     return { error: "Failed to delete image" };
//   }
// };
