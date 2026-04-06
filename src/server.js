require('dotenv').config();
const app = require('./app');
const { connectPostgres } = require('./config/db.postgres');
const { connectMongo } = require('./config/db.mongo');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongo();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
