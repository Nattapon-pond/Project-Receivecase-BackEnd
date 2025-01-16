import { Elysia } from 'elysia';
import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { convertToBase64 } from '../utils/fileUtils';
import { addImage } from '../controllers/imgcaseController';

export const imageUploadController = (app: Elysia) => {
  // Upload Image Route
  app.post('/upload-image', async ({ request }) => {
    return new Promise((resolve, reject) => {
      try {
        const headers = Object.fromEntries(request.headers.entries());

        // Ensure the Content-Type is multipart/form-data
        if (
          !headers['content-type'] ||
          !headers['content-type'].includes('multipart/form-data')
        ) {
          return resolve({ status: 400, error: 'Invalid Content-Type header' });
        }

        const busboy = Busboy({ headers });
        const uploadDir = path.resolve('uploads');
        let img_name: string = '';
        let filePath: string = '';

        // Check if the upload directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        busboy.on('file', (fieldname, file, filename) => {
          // Assign file path with unique timestamp
          filePath = path.join(uploadDir, `${Date.now()}-${filename}`);

          // Create a write stream to save the file
          const writeStream = fs.createWriteStream(filePath);
          file.pipe(writeStream);

          writeStream.on('finish', () => {
            console.log(`File uploaded to ${filePath}`);
          });
        });

        busboy.on('field', (fieldname, val) => {
          if (fieldname === 'img_name') img_name = val;
        });

        busboy.on('finish', async () => {
          try {
            // Ensure img_name and filePath are provided
            if (!img_name || !filePath) {
              return resolve({ status: 400, error: 'Missing img_name or file' });
            }

            // Convert image to Base64
            const imgBase64 = await convertToBase64(filePath);
            if (!imgBase64) {
              return resolve({ status: 500, error: 'Failed to convert file to Base64' });
            }

            // Add image to the database
            const result = await addImage({ img_name, img: imgBase64 });
            if (result.error) {
              return resolve({ status: 400, error: result.error });
            }

            resolve({ status: 200, data: result });
          } catch (error) {
            resolve({
              status: 500,
              error: 'Unexpected error during file upload',
            });
          }
        });

        // Pipe the request body to Busboy for processing
        if (request.body) {
          const bodyStream = Readable.from(request.body as AsyncIterable<Buffer>);
          bodyStream.pipe(busboy);

          bodyStream.on('error', (err: Error) => {
            reject({ status: 500, error: 'Error in request body stream' });
          });
        } else {
          reject({ status: 400, error: 'Request body is invalid or empty' });
        }
      } catch (error) {
        reject({ status: 500, error: 'Unexpected server error' });
      }
    });
  });
};
