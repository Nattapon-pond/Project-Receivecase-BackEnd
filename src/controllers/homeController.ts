import dbClient from "../db";

export const getHome = async () => {
  try {
    await dbClient.query("SELECT NOW()");
    return new Response("API Breaking Down Respect Athur.");
  } catch (error) {
    console.error("Database query error:", error);
    return new Response("Database connection failed", { status: 500 });
  }
};
