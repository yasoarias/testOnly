const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Add this line with your other routes
app.use("/api/users", userRoutes);

// ... rest of the code ...

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
