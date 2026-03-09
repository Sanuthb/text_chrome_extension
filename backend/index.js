import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import iconRoutes from './routes/iconRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/icons', iconRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
