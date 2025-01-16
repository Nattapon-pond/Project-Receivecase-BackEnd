import dbClient from "../db";

export const createLevelUrgency = async (data: { level_urgent_name: string }) => {
  try {
    const { level_urgent_name } = data;

    if (!level_urgent_name) {
      return { error: "level_urgent_name is required" };
    }

    const query = `
      INSERT INTO receive_case_project.level_urgent (level_urgent_name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await dbClient.query(query, [level_urgent_name]);

    if (result.rowCount === 0) {
      return { error: "Failed to add level urgency: No rows inserted" };
    }

    return { message: "Level urgency added successfully", data: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in createLevelUrgency:", error.message);
      return { error: `Failed to add level urgency: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to add level urgency: Unknown error" };
    }
  }
};


// ฟังก์ชันดึงข้อมูลจากฐานข้อมูล
export const getLevelUrgencies = async () => {
  try {
    const query = `SELECT * FROM receive_case_project.level_urgent;`;
    const result = await dbClient.query(query);
    return { data: result.rows };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database query error in getLevelUrgencies:', error.message);
      return { error: `Failed to retrieve level urgencies: ${error.message}` };
    } else {
      console.error('Unknown error:', error);
      return { error: 'Failed to retrieve level urgencies: Unknown error' };
    }
  }
};


export const getLevelUrgenciesById = async (id: number) => {
  try {
    const query = "SELECT * FROM receive_case_project.level_urgent WHERE level_urgent_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "levelurgencies not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in getLevelUrgenciesById:", error);
    return { error: "Failed to retrieve team" };
  }
};


export const updateLevelUrgency = async (
  id: number,
  data: { level_urgent_name: string }  // รับแค่ level_urgent_name
) => {
  try {
    const { level_urgent_name } = data;

    if (!id || !level_urgent_name) {
      return { error: "ID and level_urgent_name are required" };
    }

    const query = `
      UPDATE receive_case_project.level_urgent
      SET level_urgent_name = $1
      WHERE level_urgent_id = $2
      RETURNING *;
    `;

    const result = await dbClient.query(query, [level_urgent_name, id]);

    if (result.rowCount === 0) {
      return { error: "Failed to update level urgency: No rows updated" };
    }

    return {
      message: "LevelUrgency updated successfully",
      data: result.rows[0],
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in updateLevelUrgency:", error.message);
      return { error: `Failed to update level urgency: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to update level urgency: Unknown error" };
    }
  }
};

export const deleteLevelUrgency = async (id: number) => {
  try {
    if (!id) {
      return { error: "ID is required" };
    }

    // เปลี่ยนชื่อคอลัมน์จาก id เป็น level_urgent_id ถ้าจำเป็น
    const query = `DELETE FROM receive_case_project.level_urgent WHERE level_urgent_id = $1 RETURNING *;`;  // ใช้ level_urgent_id แทน id
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Failed to delete level urgency: No rows deleted" };
    }

    return {
      message: "LevelUrgency deleted successfully",
      data: result.rows[0],
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in deleteLevelUrgency:", error.message);
      return { error: `Failed to delete level urgency: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to delete level urgency: Unknown error" };
    }
  }
};