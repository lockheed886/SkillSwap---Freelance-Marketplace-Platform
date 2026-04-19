// server/server.js
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth/auth.routes');
const freelancerRoutes = require('./routes/freelancers/freelancers.routes');
const projectRoutes = require('./routes/projects/project.routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const messageRoutes = require('./routes/messages/messages.routes');
const { initSocket } = require('./utils/socket');


dotenv.config();
connectDB();

const app = express();
const reviewRoutes = require('./routes/review/reviewRoutes');
const analyticsRoutes = require('./routes/admin/analytics.routes');
const verificationRoutes = require('./routes/admin/verification.routes');
const adminNotificationRoutes = require('./routes/admin/notifications.routes');
const userNotificationRoutes = require('./routes/notifications/notifications.routes');
const profileRoutes = require('./routes/freelancers/profile.routes');
const bidAnalyticsRoutes = require('./routes/bids/bidAnalytics.routes');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('SkillSwap API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/verification', verificationRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/notifications', userNotificationRoutes);
app.use('/api/bids', bidAnalyticsRoutes);
// (You can mount other APIs here)
app.use('/api/freelancers/profile', profileRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use(notFound);
app.use(errorHandler);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
