import dbClient from "../db";

// เพิ่มข้อมูล team
export const addTeam = async (teamData: { team_id: number; team_name: string }) => {
  try {
    const { team_id, team_name } = teamData;

    // ตรวจสอบว่า team_id และ team_name มีค่าหรือไม่
    if (!team_id || !team_name) {
      return { error: "Both team_id and team_name are required" };
    }

    // SQL Query สำหรับเพิ่มข้อมูลทีม
    const query = `
      INSERT INTO receive_case_project.team (team_id, team_name)
      VALUES ($1, $2)
      RETURNING *;
    `;

    // คิวรีข้อมูลไปยังฐานข้อมูล
    const result = await dbClient.query(query, [team_id, team_name]);

    if (result.rowCount === 0) {
      return { error: "Failed to add team: No rows inserted" };
    }

    return { message: "Team added successfully", data: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in addTeam:", error.message);
      return { error: `Failed to add team: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to add team: Unknown error" };
    }
  }
};

// ดึงข้อมูลทีมทั้งหมด
export const getAllTeams = async () => {
  try {
    const query = "SELECT * FROM receive_case_project.team";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No teams found" };
    }

    return result.rows;
  } catch (error) {
    console.error("Database query error in getAllTeams:", error);
    return { error: "Failed to retrieve teams" };
  }
};

// ดึงข้อมูลทีมโดยใช้ team_id
export const getTeamById = async (id: number) => {
  try {
    const query = "SELECT * FROM receive_case_project.team WHERE team_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Team not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in getTeamById:", error);
    return { error: "Failed to retrieve team" };
  }
};

// อัปเดตข้อมูลทีม
export const updateTeam = async (
  id: number,
  updatedData: { [key: string]: any }
) => {
  try {
    const checkQuery = "SELECT * FROM receive_case_project.team WHERE team_id = $1";
    const checkResult = await dbClient.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return { error: "Team not found" };
    }

    const columns = Object.keys(updatedData);
    const values = Object.values(updatedData);
    const setClause = columns
      .map((col, index) => `${col} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE receive_case_project.team
      SET ${setClause}
      WHERE team_id = $1
      RETURNING *;
    `;

    const result = await dbClient.query(query, [id, ...values]);

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in updateTeam:", error);
    return { error: "Failed to update team" };
  }
};

// ลบข้อมูลทีมโดยใช้ team_id
export const deleteTeam = async (id: number) => {
  try {
    const query = `
      DELETE FROM receive_case_project.team
      WHERE team_id = $1
      RETURNING *;
    `;
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Team not found" };
    }

    return { message: "Team deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Database query error in deleteTeam:", error);
    return { error: "Failed to delete team" };
  }
};
