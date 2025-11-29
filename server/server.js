import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDb from './config/mongodb.js';
import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';

const app = express();
const port = process.env.PORT || 4000;
connectDb();

const allowedOrigins = ['https://mern-auth-system-nine.vercel.app', 'http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins ,credentials: true}));

// api endpoint 
app.get('/', (req, res) => {
    res.send('API Working');
})
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
});


export default app;