import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- User (for auth: admin & employee login) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --- Employee (managed by admin) ---
const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: String,
  designation: String,
  phone: String,
  username: { type: String }, // linked login username
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

// --- Expense line items ---
const LineItemSchema = new mongoose.Schema({
  date: { type: Date },
  from: { type: String },
  to: { type: String },
  purpose: { type: String },
  vehicle: { type: String },
  amount: { type: Number, required: true },
  approvedAmount: { type: Number }
});

// --- Expense (bill submission) ---
const ExpenseSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employeeName: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [LineItemSchema],
  totalAmount: { type: Number, required: true },
  approvedTotalAmount: { type: Number },
  advance: { type: Number, default: 0 },
  advanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advance' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Settled', 'Draft'], 
    default: 'Pending' 
  },
  rejectionReason: String,
  remarks: String,
  reviewNotes: String,
  isReturned: { type: Boolean, default: false }
}, { timestamps: true });

// --- Company ---
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: String,
  phone: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// --- Advance ---
const AdvanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  amount: { type: Number, required: true },
  remainingAmount: { type: Number },
  date: { type: Date, default: Date.now },
  purpose: String,
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// --- Settlement ---
const SettlementSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: String,
  expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  advance: { type: Number, default: 0 },
  billTotal: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Employee Return', 'Office Pay'], required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Employee = mongoose.model('Employee', EmployeeSchema);
export const Company = mongoose.model('Company', CompanySchema);
export const Expense = mongoose.model('Expense', ExpenseSchema);
export const Advance = mongoose.model('Advance', AdvanceSchema);
export const Settlement = mongoose.model('Settlement', SettlementSchema);
