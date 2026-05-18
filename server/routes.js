import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Employee, Company, Expense, Settlement, Advance } from './models.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'havtic_expense_secret_2026';

// --- Auth Middleware ---
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// ===================== AUTH =====================

// Signup
router.post('/auth/signup', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Username already taken' });

    const user = new User({ username: username.toLowerCase(), phone, password, role: 'employee' });
    await user.save();
    res.status(201).json({ message: 'Account created. Contact admin for activation.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      phone: user.phone,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== DASHBOARD =====================

router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const totalOutstanding = await Employee.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    const pendingBills = await Expense.countDocuments({ status: 'Pending' });
    const settlementsThisMonth = await Settlement.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const approvedThisWeek = await Expense.countDocuments({
      status: 'Approved',
      updatedAt: { $gte: sevenDaysAgo }
    });

    const paidThisWeekAgg = await Settlement.aggregate([
      { $match: { type: 'Office Pay', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const paidThisWeek = paidThisWeekAgg[0]?.total || 0;

    res.json({
      totalOutstanding: totalOutstanding[0]?.total || 0,
      pendingBills,
      settlementsThisMonth,
      approvedThisWeek,
      paidThisWeek
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===================== EMPLOYEES =====================

router.get('/employees', auth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/employees', auth, adminOnly, async (req, res) => {
  try {
    const { name, employeeId, department, phone, designation, username, password } = req.body;

    // Create user account for this employee
    let user = null;
    if (username && password) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
      user = new User({ username: username.toLowerCase(), phone, password, role: 'employee' });
      await user.save();
    }

    const employee = new Employee({
      name, employeeId, department, phone, designation,
      username: username?.toLowerCase(),
      user: user?._id,
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ===================== ADVANCES =====================

router.get('/advances', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) return res.json([]);
      query.employee = employee._id;
      query.$or = [
        { remainingAmount: { $gt: 0 } },
        { remainingAmount: { $exists: false } }
      ];
    }
    const advances = await Advance.find(query).populate('employee').populate('company').sort({ createdAt: -1 });
    res.json(advances);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/advances', auth, adminOnly, async (req, res) => {
  try {
    const { employee, company, amount, date, purpose } = req.body;
    const advance = new Advance({
      employee,
      company,
      amount,
      remainingAmount: amount, // set initial remaining amount
      date,
      purpose,
      givenBy: req.user._id
    });
    await advance.save();

    await Employee.findByIdAndUpdate(employee, { $inc: { balance: amount } });
    res.status(201).json(advance);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ===================== EXPENSES =====================

router.get('/expenses', auth, async (req, res) => {
  try {
    let query = { status: { $ne: 'Draft' } };
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }
    const expenses = await Expense.find(query)
      .populate('employee')
      .populate({ path: 'advanceId', populate: { path: 'company' } })
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get drafts for the current employee
router.get('/expenses/my-drafts', auth, async (req, res) => {
  try {
    const drafts = await Expense.find({ user: req.user._id, status: 'Draft' })
      .populate('employee')
      .populate({ path: 'advanceId', populate: { path: 'company' } })
      .sort({ createdAt: -1 });
    res.json(drafts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get a specific expense/draft by ID
router.get('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employee')
      .populate({ path: 'advanceId', populate: { path: 'company' } });
    if (!expense) return res.status(404).json({ message: 'Bill not found' });
    
    // Authorization check: standard employees can only view their own bills
    if (req.user.role === 'employee' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a saved draft
router.delete('/expenses/drafts/:id', auth, async (req, res) => {
  try {
    const draft = await Expense.findOne({ _id: req.params.id, user: req.user._id, status: 'Draft' });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Draft deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/expenses', auth, async (req, res) => {
  try {
    const { items, totalAmount, advanceId, status, draftId, remarks } = req.body;

    // Find employee linked to this user
    const employee = await Employee.findOne({ user: req.user._id });

    let advanceAmt = 0;
    if (advanceId) {
      const selectedAdv = await Advance.findById(advanceId);
      if (selectedAdv) {
        advanceAmt = selectedAdv.remainingAmount !== undefined ? selectedAdv.remainingAmount : selectedAdv.amount;
      }
    } else {
      advanceAmt = employee?.balance || 0;
    }

    let expense;
    // If draftId is provided, we update the existing draft record in-place
    if (draftId) {
      expense = await Expense.findOne({ _id: draftId, user: req.user._id });
      if (expense) {
        expense.items = items;
        expense.totalAmount = totalAmount;
        expense.advance = advanceAmt;
        expense.advanceId = advanceId || null;
        expense.remarks = remarks || '';
        expense.status = status === 'Draft' ? 'Draft' : 'Pending';
        expense.rejectionReason = '';
        expense.reviewNotes = '';
        await expense.save();
        return res.json(expense);
      }
    }

    expense = new Expense({
      employee: employee?._id,
      employeeName: req.user.username,
      user: req.user._id,
      items,
      totalAmount,
      advance: advanceAmt,
      advanceId: advanceId || null,
      remarks: remarks || '',
      status: status === 'Draft' ? 'Draft' : 'Pending',
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/expenses/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { items, approvedTotalAmount, reviewNotes, isReturned } = req.body;

    expense.status = 'Approved';
    if (approvedTotalAmount !== undefined) {
      expense.approvedTotalAmount = approvedTotalAmount;
    } else {
      expense.approvedTotalAmount = expense.totalAmount;
    }
    if (reviewNotes !== undefined) expense.reviewNotes = reviewNotes;
    if (isReturned !== undefined) expense.isReturned = isReturned;

    // Update individual items' approvedAmount
    if (items && Array.isArray(items)) {
      items.forEach(itm => {
        const found = expense.items.id(itm._id || itm.id);
        if (found) {
          found.approvedAmount = itm.approvedAmount;
        }
      });
    }

    await expense.save();

    // Create settlement
    const advance = expense.advance || 0;
    const bill = expense.approvedTotalAmount || expense.totalAmount || 0;
    const diff = advance - bill;

    const settlement = new Settlement({
      employee: expense.employee,
      employeeName: expense.employeeName,
      expense: expense._id,
      advance,
      billTotal: bill,
      amount: Math.abs(diff),
      type: diff >= 0 ? 'Employee Return' : 'Office Pay',
    });
    await settlement.save();

    // Update the linked Advance's remainingAmount
    if (expense.advanceId) {
      const adv = await Advance.findById(expense.advanceId);
      if (adv) {
        const currentRemaining = adv.remainingAmount !== undefined ? adv.remainingAmount : adv.amount;
        const deduction = Math.min(bill, currentRemaining);
        adv.remainingAmount = currentRemaining - deduction;
        await adv.save();
      }
    }

    // Update employee balance
    if (expense.employee) {
      const coveredAmount = Math.min(bill, expense.advance);
      await Employee.findByIdAndUpdate(expense.employee, { $inc: { balance: -coveredAmount } });
    }

    res.json({ message: 'Approved and settled', settlement });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/expenses/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    expense.status = 'Rejected';
    expense.rejectionReason = req.body.reason || '';
    await expense.save();
    res.json({ message: 'Rejected' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ===================== SETTLEMENTS =====================

router.get('/settlements', auth, async (req, res) => {
  try {
    const settlements = await Settlement.find().populate('employee').populate('expense').sort({ createdAt: -1 });
    const totalPaid = await Settlement.aggregate([
      { $match: { type: 'Office Pay' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalReturned = await Settlement.aggregate([
      { $match: { type: 'Employee Return' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      settlements,
      stats: {
        totalPaid: totalPaid[0]?.total || 0,
        totalReturned: totalReturned[0]?.total || 0,
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Employee's own settlements
router.get('/settlements/my', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.json([]);
    const settlements = await Settlement.find({ employee: employee._id }).populate('expense').sort({ createdAt: -1 });
    res.json(settlements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===================== COMPANIES =====================

router.get('/companies', auth, async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/companies', auth, adminOnly, async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });
    const company = new Company({ name, address, phone, createdBy: req.user._id });
    await company.save();
    res.status(201).json(company);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/companies/:id', auth, adminOnly, async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ===================== LEDGER (Employee) =====================

router.get('/ledger/my', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.json({ transactions: [], stats: { balance: 0, totalReceived: 0, totalSpent: 0 } });

    const advances = await Advance.find({ employee: employee._id }).populate('company').sort({ createdAt: -1 });
    const expenses = await Expense.find({ employee: employee._id, status: { $in: ['Approved', 'Settled'] } }).sort({ createdAt: -1 });

    const transactions = [
      ...advances.map(a => ({ type: 'Advance Received', amount: a.amount, date: a.date, direction: 'in', company: a.company?.name || '', purpose: a.purpose || '' })),
      ...expenses.map(e => ({ type: 'Bill Submitted', amount: e.totalAmount, date: e.createdAt, direction: 'out', company: '', purpose: '' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalReceived = advances.reduce((s, a) => s + a.amount, 0);
    const totalSpent = expenses.reduce((s, e) => s + e.totalAmount, 0);

    res.json({
      transactions,
      stats: { balance: employee.balance, totalReceived, totalSpent },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===================== REPORTS =====================

router.get('/reports', auth, adminOnly, async (req, res) => {
  try {
    const totalExpenses = await Expense.aggregate([
      { $match: { status: { $in: ['Approved', 'Settled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const employeeCount = await Employee.countDocuments();
    const billsProcessed = await Expense.countDocuments({ status: { $in: ['Approved', 'Settled'] } });

    const total = totalExpenses[0]?.total || 0;

    // Category breakdown from line items
    const catData = await Expense.aggregate([
      { $match: { status: { $in: ['Approved', 'Settled'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.vehicle', total: { $sum: '$items.amount' } } },
      { $sort: { total: -1 } }
    ]);

    const categories = catData.map(c => ({
      name: c._id || 'Other',
      amount: c.total,
      percent: total > 0 ? Math.round((c.total / total) * 100) : 0,
    }));

    // Top spenders
    const topData = await Expense.aggregate([
      { $match: { status: { $in: ['Approved', 'Settled'] } } },
      { $group: { _id: '$employee', total: { $sum: '$totalAmount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    const topSpenders = [];
    for (const t of topData) {
      const emp = await Employee.findById(t._id);
      if (emp) topSpenders.push({ name: emp.name, department: emp.department, amount: t.total });
    }

    res.json({
      stats: {
        totalExpenses: total,
        avgPerEmployee: employeeCount > 0 ? Math.round(total / employeeCount) : 0,
        growthRate: 0,
        billsProcessed,
      },
      categories,
      topSpenders,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
