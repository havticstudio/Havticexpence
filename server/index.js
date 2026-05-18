import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://havticstudio_db_user:MD0o5GOiX0z56yB1@cluster0.okvclct.mongodb.net/office_expense_manager?retryWrites=true&w=majority";

console.log('⏳ Connecting to MongoDB Atlas...');
mongoose.connect(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch(err => {
    console.warn('⚠️ MongoDB Atlas Connection Failed. Trying Local Fallback...');
    
    // Automatic local fallback
    mongoose.connect('mongodb://127.0.0.1:27017/office_expense_manager')
      .then(() => console.log('✅ Connected to Local MongoDB successfully!'))
      .catch(localErr => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n=============================================================');
        console.log('⚡ HOW TO FIX THIS MONGO CONNECTION ISSUE:');
        console.log('-------------------------------------------------------------');
        console.log('Since 0.0.0.0/0 is whitelisted in Atlas, your ISP or local router');
        console.log('firewall is likely blocking port 27017.');
        console.log('');
        console.log('👉 SOLUTION A: Use your Mobile Hotspot (GP/BL/Robi).');
        console.log('   Mobile networks in BD do not block port 27017!');
        console.log('');
        console.log('👉 SOLUTION B: Start Local MongoDB (Offline Mode):');
        console.log('   Run: sudo apt update && sudo apt install -y mongodb');
        console.log('   Run: sudo systemctl start mongodb');
        console.log('=============================================================\n');
      });
  });

// Basic Route
app.get('/', (req, res) => {
  res.send('Office Expense Manager API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
