import { Elysia } from "elysia";
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { convertToBase64 } from "../utils/fileUtils";
import { uploadImages } from "../controllers/imgcaseController";

export const imageUploadController = (app: Elysia) => {
  // Upload Image Route 
  app.post("/upload-images", async ({ request }) => {
    return new Promise((resolve, reject) => {
      try {
        const headers = Object.fromEntries(request.headers.entries());

        // Ensure the Content-Type is multipart/form-data
        if (
          !headers["content-type"] ||
          !headers["content-type"].includes("multipart/form-data")
        ) {
          return resolve({ status: 400, error: "Invalid Content-Type header" });
        }

        const busboy = Busboy({ headers });
        const uploadDir = path.resolve("uploads");
        const filePaths: string[] = [];

        // Check if the upload directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        busboy.on("file", (fieldname, file, filename) => {
          const filePath = path.join(uploadDir, `${Date.now()}-${filename}`);
          filePaths.push(filePath);

          const writeStream = fs.createWriteStream(filePath);
          file.pipe(writeStream);

          writeStream.on("finish", () => {
            console.log(`File uploaded to ${filePath}`);
          });
        });

        busboy.on("finish", async () => {
          try {
            if (filePaths.length === 0) {
              return resolve({ status: 400, error: "No files uploaded" });
            }

            const imgBase64Array = await Promise.all(
              filePaths.map(async (filePath) => await convertToBase64(filePath))
            );

            if (imgBase64Array.some((img) => !img)) {
              return resolve({
                status: 500,
                error: "Failed to convert some files to Base64",
              });
            }

            const result = await uploadImages(imgBase64Array as string[]);
            if (result.error) {
              return resolve({ status: 400, error: result.error });
            }

            resolve({ status: 200, data: result });
          } catch (error) {
            resolve({
              status: 500,
              error: "Unexpected error during file upload",
            });
          }
        });

        if (request.body) {
          const bodyStream = Readable.from(
            request.body as AsyncIterable<Buffer>
          );
          bodyStream.pipe(busboy);

          bodyStream.on("error", (err: Error) => {
            reject({ status: 500, error: "Error in request body stream" });
          });
        } else {
          reject({ status: 400, error: "Request body is invalid or empty" });
        }
      } catch (error) {
        reject({ status: 500, error: "Unexpected server error" });
      }
    });
  });
};
