import dbClient from '../db';

// Add Image
export const addImage = async (imgData: { img_name: string; img: string }) => {
  const { img_name, img } = imgData;

  try {
    if (!img_name || !img) {
      throw new Error("Please provide both img_name and img");
    }

    const query = `
      INSERT INTO receive_case_project.img (img_name, img)
      VALUES ($1, $2)
      RETURNING img_name, img;
    `;
    const params = [img_name, img];

    const result = await dbClient.query(query, params);

    if (result.rowCount === 0) {
      throw new Error("Failed to add image data");
    }

    return {
      success: true,
      message: "Image added successfully",
      data: result.rows[0],
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: `Error: ${error.message}` };
    } else {
      return { error: "An unexpected error occurred" };
    }
  }
};

// Get All Images
export const getAllImages = async () => {
  try {
    const query = "SELECT * FROM receive_case_project.img";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { status: 404, error: "No images found" };
    }

    return { status: 200, data: result.rows };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 500,
        error: `Failed to retrieve images: ${error.message}`,
      };
    } else {
      return {
        status: 500,
        error: "An unexpected error occurred while retrieving images",
      };
    }
  }
};

// Get Image by ID
export const getImageById = async (id: number) => {
  try {
    const query = "SELECT * FROM img WHERE img_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Image not found" };
    }

    return result.rows[0];
  } catch (error) {
    return { error: "Failed to retrieve image" };
  }
};

// Update Image
export const updateImage = async (
  id: number,
  updatedData: { [key: string]: any }
) => {
  try {
    const checkQuery = "SELECT * FROM img WHERE img_id = $1";
    const checkResult = await dbClient.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return { error: "Image not found" };
    }

    const columns = Object.keys(updatedData);
    const values = Object.values(updatedData);

    const setClause = columns
      .map((col, index) => `${col} = $${index + 2}`)
      .join(", ");
    const query = `UPDATE img SET ${setClause} WHERE img_id = $1 RETURNING *`;

    const result = await dbClient.query(query, [id, ...values]);

    return result.rows[0];
  } catch (error) {
    return { error: "Failed to update image" };
  }
};

// Delete Image
export const deleteImage = async (id: number) => {
  try {
    const query = "DELETE FROM img WHERE img_id = $1 RETURNING *";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Image not found" };
    }

    return { message: "Image deleted successfully", data: result.rows[0] };
  } catch (error) {
    return { error: "Failed to delete image" };
  }
};