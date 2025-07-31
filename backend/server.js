const express = require("express");
const cors = require("cors"); 
const stockRoutes = require("./routes/stock");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use(express.static("../frontend"));

// routes
app.use("/api", stockRoutes);
app.use("/api", portfolioRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
