import { Elysia } from "elysia";
import {
  createBranch,
  deleteBranch,
  getbranch,
  getBranchById,
  updateBranch,
} from "../controllers/branchesController";

export const branchesRoutes = (app: Elysia) => {
  //get All branches
  app.get("/branches", async () => {
    return await getbranch();
  });

  //get By id branches
  app.get("/branches/:id", async ({ params }) => {
    try {
      const { id } = params; // รับค่า id จาก URL
      const branch = await getBranchById(id);

      // ตรวจสอบว่ามี error หรือไม่
      if (branch.error) {
        return new Response(JSON.stringify(branch), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // ส่งข้อมูล branch กลับ
      return new Response(JSON.stringify(branch), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in /branches/:id route:", error);
      return new Response("Failed to retrieve branch by id", { status: 500 });
    }
  });

  // inset data
  app.post(
    "/branches",
    async (ctx: { body: { branch_id: string; branch_name: string } }) => {
      try {
        // อ่าน body จาก ctx
        const branchData = ctx.body;

        // เรียกฟังก์ชัน createBranch
        const newBranch = await createBranch(branchData);

        if (newBranch.error) {
          return new Response(JSON.stringify(newBranch), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(newBranch), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error in POST /branches route:", error);
        return new Response("Failed to create branch", { status: 500 });
      }
    }
  );

  // Update data by id
  app.put(
    "/branches/:branch_id",
    async (ctx: {
      params: { branch_id: string };
      body: { branch_name: string };
    }) => {
      try {
        const { branch_id } = ctx.params;
        const { branch_name } = ctx.body;

        if (!branch_id || !branch_name) {
          return new Response(
            JSON.stringify({ error: "Branch ID and Branch Name are required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const updatedBranch = await updateBranch({ branch_id, branch_name });

        if (updatedBranch.error) {
          return new Response(JSON.stringify(updatedBranch), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(updatedBranch), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error in PUT /branches/:branch_id route:", error);
        return new Response("Failed to update branch", { status: 500 });
      }
    }
  );

  app.delete(
    "/branches/:branch_id",
    async (ctx: { params: { branch_id: string } }) => {
      try {
        const { branch_id } = ctx.params;

        if (!branch_id) {
          return new Response(
            JSON.stringify({ error: "Branch ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // เรียกฟังก์ชัน deleteBranch เพื่อทำการลบข้อมูล
        const deletedBranch = await deleteBranch(branch_id);

        if (deletedBranch.error) {
          return new Response(JSON.stringify(deletedBranch), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(deletedBranch), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error in DELETE /branches/:branch_id route:", error);
        return new Response("Failed to delete branch", { status: 500 });
      }
    }
  );
};
