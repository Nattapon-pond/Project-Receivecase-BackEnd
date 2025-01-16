import { Elysia } from "elysia";
import {
  addStatus,
  deleteStatus,
  getAllStatuses,
  getStatusById,
  updateStatus,
} from "../controllers/statusController";

export const statusRoutes = (app: Elysia) => {
  // Route to get all statuses
  app.get("/status", async () => {
    try {
      const statuses = await getAllStatuses();
  
      // ตรวจสอบว่า statuses เป็นอาเรย์และไม่ว่างเปล่า
      if (!Array.isArray(statuses) || statuses.length === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: "No statuses found" }),
        };
      }
  
      // ส่งข้อมูลสถานะทั้งหมดโดยตรงใน body
      return {
        status: 200,
        body: JSON.stringify({ cases: statuses }),  // ส่งในรูปแบบ { cases: [...] }
      };
    } catch (error) {
      console.error("Error in GET /status route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve statuses" }),
      };
    }
  });
  

  // Route to get status by ID
  app.get("/status/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const status = await getStatusById(id);

      if (status.error) {
        return {
          status: 404,
          body: JSON.stringify({ error: status.error }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(status),
      };
    } catch (error) {
      console.error("Error in GET /status/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve status" }),
      };
    }
  });

  // Route to update status by ID
  app.put("/status/:id", async (context) => {
    try {
        const { params, body } = context;
        const { id } = params;

        // ตรวจสอบว่า body เป็นวัตถุหรือไม่
        if (!body || typeof body !== "object") {
            return {
                status: 400,
                body: JSON.stringify({ error: "Invalid request body" }),
            };
        }

        const updatedData = body as { status_id?: number; status_name?: string }; // กำหนด type สำหรับ updatedData

        // ตรวจสอบว่ามีข้อมูลใน body หรือไม่
        if (Object.keys(updatedData).length === 0) {
            return {
                status: 400,
                body: JSON.stringify({ error: "No data provided for update" }),
            };
        }

        // สร้าง statusData (ตัวอย่าง)
        const statusData = {
            status_id: updatedData.status_id || 0, // หรือค่าที่เหมาะสม
            status_name: updatedData.status_name || "Unknown", // หรือค่าที่เหมาะสม
        };

        // เรียกฟังก์ชัน updateStatus
        const result = await updateStatus(Number(id), updatedData, statusData);

        if (result.error) {
            return {
                status: 404,
                body: JSON.stringify({ error: "Failed to update status" }),
            };
        }

        return {
            status: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error in PUT /status/:id route:", error);
        return {
            status: 500,
            body: JSON.stringify({ error: "Failed to update status" }),
        };
    }
});

  // Route to delete status by ID
  app.delete("/status/:id", async ({ params }) => {
    try {
      const { id } = params;

      if (!id || isNaN(Number(id))) {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid status ID" }),
        };
      }

      const result = await deleteStatus(Number(id));

      if (result.error) {
        return {
          status: 404,
          body: JSON.stringify(result),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error("Error in DELETE /status/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to delete status" }),
      };
    }
  });

  // Route to add new status
  app.post(
    "/status",
    async (ctx: { body: { status_id: number; status_name: string } }) => {
      try {
        const newStatus = ctx.body;

        if (!newStatus.status_id || !newStatus.status_name) {
          return {
            status: 400,
            body: JSON.stringify({
              error: "status_id and status_name are required",
            }),
          };
        }

        const result = await addStatus(newStatus);

        if (result.error) {
          return {
            status: 400,
            body: JSON.stringify(result),
          };
        }

        return {
          status: 201,
          body: JSON.stringify(result),
        };
      } catch (error) {
        console.error("Error in POST /status route:", error);
        return {
          status: 500,
          body: JSON.stringify({ error: "Failed to add status" }),
        };
      }
    }
  );
};
