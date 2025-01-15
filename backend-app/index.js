import express from 'express';
import { config } from 'dotenv';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import cors from 'cors'; // To handle cross-origin requests

// Load environment variables
config();

// Initialize the app
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for the frontend to communicate with the backend

// Database Connection
// connectDB();

// API Routes
app.use('/api', routes);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the GA4 Audience Manager Backend!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
