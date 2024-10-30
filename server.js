const express = require('express');  
const cors = require('cors');  
const connectDB = require('./config/db');  
const userRoutes = require('./routes/userRoutes');
const reviewRoutes=require('./routes/reviewRoutes')  
const app = express();  
require('dotenv').config();  

connectDB();  

app.use(cors());  
app.use(express.json());  

app.use('/api/users', userRoutes); 
app.use('/api/reviews',reviewRoutes); 

const PORT = process.env.PORT || 5000;  

app.listen(PORT, () => {  
    console.log(`Server is running on port ${PORT}`);  
});