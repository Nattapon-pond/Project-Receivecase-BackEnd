import { Elysia } from "elysia";
import {
  addMainCase,
  getAllMainCases,
  getMainCaseById,
  updateMainCase,
  deleteMainCase,
} from "../controllers/maincaseController";

export const mainCasesRoutes = (app: Elysia) => {
  // ดึงข้อมูลทั้งหมด (GET)
  app.get("/main-cases", async () => {
    try {
      const result = await getAllMainCases();
      
      // ตรวจสอบกรณีที่เกิด error
      if (result.error) {
        return new Response(JSON.stringify(result), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // คืนค่าข้อมูลเมื่อสำเร็จ
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) { // กำหนดชนิดของ error
      console.error("Error in GET /main-cases:", error.message || error);
      return new Response("Failed to retrieve main cases", { status: 500 });
    }
  });

  // ดึงข้อมูลตาม ID (GET by ID)
  app.get("/main-cases/:id", async ({ params }) => {
    try {
      const { id } = params;
      const result = await getMainCaseById(Number(id));

      if (!result) {
        return new Response("Main case not found", {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in GET /main-cases/:id:", error);
      return new Response("Failed to retrieve main case", { status: 500 });
    }
  });

  // เพิ่มข้อมูล (POST)
  app.post("/main-cases", async ({ body }) => {
    try {
      const mainCaseData = body as { main_case_id: number; main_case_name: string };
      const result = await addMainCase(mainCaseData);

      if (result.error) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in POST /main-cases:", error);
      return new Response("Failed to add main case", { status: 500 });
    }
  });

  // อัปเดตข้อมูล (PUT)
  app.put("/main-cases/:id", async ({ params, body }) => {
    try {
      const { id } = params;
      const mainCaseData = body as { main_case_name: string };

      if (!id || !mainCaseData.main_case_name) {
        return new Response(
          JSON.stringify({ error: "ID and main_case_name are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await updateMainCase(Number(id), mainCaseData);

      if (result.error) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in PUT /main-cases/:id:", error);
      return new Response("Failed to update main case", { status: 500 });
    }
  });

  // ลบข้อมูล (DELETE)
  app.delete("/main-cases/:id", async ({ params }) => {
    try {
      const { id } = params;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await deleteMainCase(Number(id));

      if (result.error) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in DELETE /main-cases/:id:", error);
      return new Response("Failed to delete main case", { status: 500 });
    }
  });
};
