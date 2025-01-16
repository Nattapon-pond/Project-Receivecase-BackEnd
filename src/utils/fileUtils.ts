// src/utils/fileUtils.ts
import fs from 'fs';

// ฟังก์ชันแปลงไฟล์เป็น Base64
export const convertToBase64 = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath); // อ่านไฟล์
  return fileBuffer.toString("base64"); // แปลงเป็น Base64
};
