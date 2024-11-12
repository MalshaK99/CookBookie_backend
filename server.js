const express = require('express');  
const cors = require('cors');  
const connectDB = require('./config/db');  
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');  
const recipeRoutes = require('./routes/recipeRoutes');
const emailRoutes = require('./routes/emailRoutes'); // Import the email route
const app = express();  
const path = require("path");
require('dotenv').config();  

connectDB();  

app.use(cors());  
app.use(express.json());  

app.use('/api/users', userRoutes); 
app.use('/api/reviews', reviewRoutes); 
app.use('/api/recipes', recipeRoutes);
app.use('/api', emailRoutes); // Add the email route here
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 5000;  

app.listen(PORT, () => {  
    console.log(`Server is running on port ${PORT}`);  
});
