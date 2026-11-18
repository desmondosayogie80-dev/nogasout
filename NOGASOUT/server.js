const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))

// Import Routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

// Mount Routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nogasout server running at http://localhost:${PORT}`);
});