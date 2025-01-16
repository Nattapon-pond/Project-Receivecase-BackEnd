import { Elysia } from "elysia";
import {
  createLevelUrgency,
  getLevelUrgencies,
  getLevelUrgenciesById,
  updateLevelUrgency,
  deleteLevelUrgency,
} from "../controllers/levelurgencyController";



interface LevelUrgency {
  level_urgent_id: number;
  level_urgent_name: string;
}

export const levelUrgencyRoutes = (app: Elysia) => {
  // Get all level urgencies
  app.get("/levelurgencies", async () => {
    try {
      const result = await getLevelUrgencies();
      if (result.error) {
        return { status: 404, body: { error: result.error } };
      }
      return { status: 200, body: result.data };
    } catch (error) {
      console.error("Error in GET /levelurgencies route:", error);
      return { status: 500, body: { error: "Failed to retrieve level urgencies" } };
    }
  });

  // Get level urgency by ID
  app.get("/levelurgencies/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const result = await getLevelUrgenciesById(id);
      if (result.error) {
        return { status: 404, body: { error: result.error } };
      }
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in GET /levelurgencies/:id route:", error);
      return { status: 500, body: { error: "Failed to retrieve level urgency" } };
    }
  });

  // Create a new level urgency
  app.post(
    "/levelurgencies",
    async (ctx: { body: { level_urgent_name: string } }) => {
      try {
        const { level_urgent_name } = ctx.body;
  
        if (!level_urgent_name) {
          return {
            status: 400,
            body: { error: "level_urgent_name is required" },
          };
        }
  
        const result = await createLevelUrgency({ level_urgent_name });
  
        if (result.error) {
          return { status: 400, body: { error: result.error } };
        }
  
        return { status: 201, body: result };
      } catch (error) {
        console.error("Error in POST /levelurgencies route:", error);
        return {
          status: 500,
          body: { error: "Failed to add level urgency" },
        };
      }
    }
  );
  

  // Update level urgency by ID
  app.put("/levelurgencies/:id", async (ctx: { params: { id: string }; body: LevelUrgency }) => {
    try {
      const id = parseInt(ctx.params.id, 10);
  
      // ตรวจสอบและดึงข้อมูลจาก body
      const { level_urgent_name } = ctx.body;  // ไม่ต้องส่ง level_urgent_id
  
      if (!level_urgent_name) {
        return { status: 400, body: { error: "level_urgent_name is required" } };
      }
  
      // เรียกใช้ฟังก์ชัน updateLevelUrgency โดยไม่ส่ง level_urgent_id
      const result = await updateLevelUrgency(id, { level_urgent_name });
  
      if (result.error) {
        return { status: 404, body: { error: result.error } };
      }
  
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in PUT /levelurgencies/:id route:", error);
      return { status: 500, body: { error: "Failed to update level urgency" } };
    }
  });
  
  // Delete level urgency by ID
  app.delete("/levelurgencies/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const result = await deleteLevelUrgency(id);
      if (result.error) {
        return { status: 404, body: { error: result.error } };
      }
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in DELETE /levelurgencies/:id route:", error);
      return { status: 500, body: { error: "Failed to delete level urgency" } };
    }
  });
};
