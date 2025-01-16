export const notFoundHandler = () => {
    return new Response(
      JSON.stringify({ message: "Not Found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  };
  