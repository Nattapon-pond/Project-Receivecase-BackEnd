import { Elysia } from "elysia";
import {
  addSubCaseData,
  deleteSubCaseData,
  getAllSubCaseData,
  getSubCaseDataById,
  updateSubCaseData,
} from "../controllers/subcasedataController";
import Database from "bun:sqlite";

// กำหนดประเภทข้อมูลของ request body
interface SubCaseData {
  sub_case_id: number;
  sub_case_name: string;
}

// Routes for SubCaseData
export const subCaseDataRoutes = (app: Elysia) => {
  // Get all SubCaseData
  app.get("/subcasedata", async () => {
    try {
      const subCaseData = await getAllSubCaseData();

      if (!Array.isArray(subCaseData) || subCaseData.length === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: "No subcase data found" }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(subCaseData),
      };
    } catch (error) {
      console.error("Error in GET /subcasedata route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve subcase data" }),
      };
    }
  });


  



  app.post(
    "/subcasedata",
    async (ctx: { body: { sub_case_id: number; sub_case_name: string } }) => {
      try {
        const newsubcsae = ctx.body;

        if (!newsubcsae.sub_case_id || !newsubcsae.sub_case_name) {
          return {
            status: 400,
            body: JSON.stringify({
              error: "team_id and team_name are required",
            }),
          };
        }

        const result = await addSubCaseData(newsubcsae);

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
        console.error("Error in POST /team route:", error);
        return {
          status: 500,
          body: JSON.stringify({ error: "Failed to add team" }),
        };
      }
    }
  );


  // Get SubCaseData by ID
  app.get("/subcasedata/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const subCaseData = await getSubCaseDataById(id);

      if (subCaseData.error) {
        return {
          status: 404,
          body: JSON.stringify({ error: subCaseData.error }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(subCaseData),
      };
    } catch (error) {
      console.error("Error in GET /subcasedata/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve subcase data" }),
      };
    }
  });

  

  // Update SubCaseData by ID
  app.put("/subcasedata/:id", async (ctx) => {
    try {
      const { params, body } = ctx;
      const { id } = params;

      if (!body || typeof body !== "object") {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid request body" }),
        };
      }

      const updatedData = body;

      if (Object.keys(updatedData).length === 0) {
        return {
          status: 400,
          body: JSON.stringify({ error: "No data provided for update" }),
        };
      }

      const result = await updateSubCaseData(Number(id), updatedData);

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
      console.error("Error in PUT /subcasedata/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to update subcase data" }),
      };
    }
  });

  // Delete SubCaseData by ID
  app.delete("/subcasedata/:id", async ({ params }) => {
    try {
      const { id } = params;

      if (!id || isNaN(Number(id))) {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid subcase data ID" }),
        };
      }

      const result = await deleteSubCaseData(Number(id));

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
      console.error("Error in DELETE /subcasedata/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to delete subcase data" }),
      };
    }
  });
};
