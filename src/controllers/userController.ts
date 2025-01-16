// src/controllers/userController.ts
import dbClient from "../db";

// Add New User
export const addUser = async (userData: { user_name: string; password: string }) => {
  try {
    const query = `
      INSERT INTO receive_case_project.user (user_name, password)
      VALUES ($1, $2)
      RETURNING id, user_name, user_id;
    `;
    const values = [userData.user_name, userData.password];
    const result = await dbClient.query(query, values);

    if (result.rowCount === 0) {
      return { error: "Failed to create user" };
    }

    return { message: "User added successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Error in addUser:", error);
    return { error: "Database error" };
  }
};

// Get All Users
export const getUsers = async () => {
  try {
    const result = await dbClient.query(
      "SELECT id, user_name, password, user_id FROM receive_case_project.user"
    );

    if (result.rows.length === 0) {
      return { error: "No users found" };
    }

    return { message: "Users retrieved successfully", data: result.rows };
  } catch (error) {
    console.error("Error in getUsers:", error);
    return { error: "Failed to retrieve users" };
  }
};

// Get User by Username
export const getUserByUsername = async (username: string) => {
  try {
    const result = await dbClient.query(
      "SELECT id, user_name, password, user_id FROM receive_case_project.user WHERE user_name = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return { error: `User with username ${username} not found` };
    }

    return { message: "User retrieved successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Error in getUserByUsername:", error);
    return { error: "Failed to retrieve user" };
  }
};

// Update User
export const updateUser = async (userData: { user_id: string; user_name: string; password: string }) => {
  try {
    const query = `
      UPDATE receive_case_project.user
      SET user_name = $1, password = $2
      WHERE user_id = $3
      RETURNING id, user_name, user_id;
    `;
    const values = [userData.user_name, userData.password, userData.user_id];
    const result = await dbClient.query(query, values);

    if (result.rowCount === 0) {
      return { error: "User not found or no changes made" };
    }

    return { message: "User updated successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Error in updateUser:", error);
    return { error: "Failed to update user" };
  }
};

// Delete User
export const deleteUser = async (user_id: string) => {
  try {
    const query = `
      DELETE FROM receive_case_project.user
      WHERE user_id = $1
      RETURNING id, user_id;
    `;
    const result = await dbClient.query(query, [user_id]);

    if (result.rowCount === 0) {
      return { error: "User not found" };
    }

    return { message: "User deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return { error: "Failed to delete user" };
  }
};
