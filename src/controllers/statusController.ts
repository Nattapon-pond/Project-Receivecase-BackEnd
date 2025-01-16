import dbClient from "../db";

// Add new status
export const addStatus = async (statusData: {
  status_id: number;
  status_name: string;
}) => {
  try {
    const { status_id, status_name } = statusData;

    if (!status_id || !status_name) {
      return { error: "Both status_id and status_name are required" };
    }

    const query = `
      INSERT INTO receive_case_project.status (status_id, status_name)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await dbClient.query(query, [status_id, status_name]);

    if (result.rowCount === 0) {
      return { error: "Failed to add status: No rows inserted" };
    }

    return { message: "Status added successfully", data: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in addStatus:", error.message);
      return { error: `Failed to add status: ${error.message}` };
    }
    return { error: "Failed to add status: Unknown error" };
  }
};

// Get all statuses
export const getAllStatuses = async () => {
  try {
    const query = "SELECT * FROM receive_case_project.status";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No statuses found" };
    }

    return result.rows;
  } catch (error) {
    console.error("Database query error in getAllStatuses:", error);
    return { error: "Failed to retrieve statuses" };
  }
};

// Get status by ID
export const getStatusById = async (id: number) => {
  try {
    const query =
      "SELECT * FROM receive_case_project.status WHERE status_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Status not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in getStatusById:", error);
    return { error: "Failed to retrieve status" };
  }
};

// Update status by ID
export const updateStatus = async (p0: number, updatedData: object, statusData: { status_id: number; status_name: string; }) => {
    try {
      const query = `
        SELECT * FROM receive_case_project.status WHERE status_id = $1`;
      const values = [statusData.status_id];
  
      const checkResult = await dbClient.query(query, values);
      if (checkResult.rowCount === 0) {
        return { error: "Status not found" };
      }
  
      // ตรวจสอบว่า status_name มีการเปลี่ยนแปลงจริงหรือไม่
      const existingStatus = checkResult.rows[0];
      if (existingStatus.status_name === statusData.status_name) {
        return { error: "No changes made, status_name is the same" };
      }
  
      // ถ้ามีการเปลี่ยนแปลงจริง ๆ ให้ทำการอัปเดต
      const updateQuery = `
        UPDATE receive_case_project.status
        SET status_name = $2
        WHERE status_id = $1
        RETURNING *`;
  
      const updateValues = [statusData.status_id, statusData.status_name];
      const result = await dbClient.query(updateQuery, updateValues);
  
      return result.rows[0];
    } catch (error) {
      console.error("Database update error:", error);
      return { error: "Failed to update status" };
    }
  };
  
// Delete status by ID
export const deleteStatus = async (id: number) => {
  try {
    const query = `
      DELETE FROM receive_case_project.status
      WHERE status_id = $1
      RETURNING *;
    `;
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Status not found" };
    }

    return { message: "Status deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Database query error in deleteStatus:", error);
    return { error: "Failed to delete status" };
  }
};
