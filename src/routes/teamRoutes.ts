import { Elysia } from "elysia";
import {
  addTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
} from "../controllers/teamController";





export const teamsRoutes = (app: Elysia) => {
  // Route สำหรับดึงข้อมูลทีมทั้งหมด
  app.get("/team", async () => {
    try {
      const teams = await getAllTeams();

      if (!Array.isArray(teams) || teams.length === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: "No teams found" }),
        };
      }

      return {
        status: 200,
        body: teams, // ส่งข้อมูลพนักงานทั้งหมดในรูปแบบ array
      };
    } catch (error) {
      console.error("Error in GET /team route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve teams" }),
      };
    }
  });

  // Route สำหรับดึงข้อมูลทีมตาม ID
  app.get("/team/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const team = await getTeamById(id);

      if (team.error) {
        return {
          status: 404,
          body: JSON.stringify({ error: team.error }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(team),
      };
    } catch (error) {
      console.error("Error in GET /team/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve team" }),
      };
    }
  });

  // Route สำหรับอัปเดตข้อมูลทีม
  app.put("/team/:id", async (context) => {
    try {
      const { params, body } = context;
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

      const result = await updateTeam(Number(id), updatedData);

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
      console.error("Error in PUT /team/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to update team" }),
      };
    }
  });

  // Route สำหรับลบข้อมูลทีม
  app.delete("/team/:id", async ({ params }) => {
    try {
      const { id } = params;

      if (!id || isNaN(Number(id))) {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid team ID" }),
        };
      }

      const result = await deleteTeam(Number(id));

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
      console.error("Error in DELETE /team/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to delete team" }),
      };
    }
  });

  // Route สำหรับเพิ่มข้อมูลทีม
  app.post(
    "/team",
    async (ctx: { body: { team_id: number; team_name: string } }) => {
      try {
        const newTeam = ctx.body;

        if (!newTeam.team_id || !newTeam.team_name) {
          return {
            status: 400,
            body: JSON.stringify({
              error: "team_id and team_name are required",
            }),
          };
        }

        const result = await addTeam(newTeam);

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
};
