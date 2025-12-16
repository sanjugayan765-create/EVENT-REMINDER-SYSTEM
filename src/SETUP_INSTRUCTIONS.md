# University Event Reminder System - Setup Instructions

## Overview
This is a complete University Event Reminder System with role-based access control, event management, exam scheduling, assignment tracking, and real-time notifications.

## Database Setup (CRITICAL - MUST DO FIRST)

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. Click on "New Query"

### Step 2: Run the Database Schema
1. Open the file `/database-schema.sql` in this project
2. Copy the ENTIRE contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
5. Wait for all statements to execute successfully
6. You should see a success message

### Step 3: Verify Tables Were Created
After running the SQL, verify the following tables exist in your Supabase database:
- `users`
- `events`
- `exams`
- `assignments`
- `submissions`
- `notifications`
- `event_registrations`
- `reminders`
- `venues`

You can check this by going to the **Table Editor** in your Supabase dashboard.

## Application Features

### User Roles & Access
The system supports three user roles:

#### 1. **Student**
- View dashboard with upcoming events, exams, and assignments
- View all events, exams, and assignments
- Submit assignments
- Receive notifications
- View personal calendar

#### 2. **Faculty**
- All student permissions
- Create, edit, and delete events
- Create and manage exams
- Create and manage assignments
- Grade student submissions
- View faculty dashboard with teaching analytics

#### 3. **Admin**
- All faculty permissions
- View system-wide analytics
- Manage users
- Access admin dashboard
- View usage statistics

### Core Modules

#### Dashboard
- **Student Dashboard**: Shows upcoming events, exams, pending assignments, and notifications
- **Faculty Dashboard**: Shows created events, exams, assignments, and pending submissions
- **Admin Dashboard**: Shows system statistics, user distribution, and analytics with charts

#### Events Management
- Create events with multiple types (lecture, exam, seminar, workshop, sports, cultural, etc.)
- Set event visibility (public, department, course, private)
- Specify location, venue, course code, and department
- Color-coded event types
- Filter events by type
- Edit and delete own events

#### Examinations
- Schedule exams with course information
- Specify exam type (midterm, final, quiz, practical)
- Set duration, venue, and total marks
- Add syllabus coverage and instructions
- Allowed materials list

#### Assignments
- Create assignments with deadlines
- Multiple assignment types (homework, project, report, presentation, essay, lab)
- Set total marks and late penalties
- Group assignment support
- Submission format specifications
- Student submission portal

#### Notifications
- Real-time notification system
- Priority levels (low, normal, high, urgent)
- Notification types (event, exam, assignment, deadline, grade, announcement, etc.)
- Mark as read functionality
- Unread notification counter

## Getting Started

### First Time Setup

1. **Create Your First Admin Account**
   - Click "Sign Up" on the login page
   - Enter your details
   - **Important**: Select "Admin" as the role
   - Complete registration

2. **Create Test Accounts** (Optional)
   You can create additional accounts for testing:
   - Student account: student@university.edu / password123
   - Faculty account: faculty@university.edu / password123
   - Admin account: admin@university.edu / password123

3. **Start Using the System**
   - After logging in, you'll see your role-specific dashboard
   - Navigate using the top navigation bar
   - Faculty and Admin can create events, exams, and assignments
   - Students can view and submit assignments

## API Endpoints

The system uses the following API structure:

### Authentication
- POST `/auth/register` - Register new user
- Sign in/out handled by Supabase Auth

### Users
- GET `/users/:id` - Get user profile
- PUT `/users/:id` - Update user profile
- GET `/users` - Get all users (admin only)

### Events
- GET `/events` - Get all events (with filters)
- POST `/events` - Create event (faculty/admin)
- GET `/events/:id` - Get single event
- PUT `/events/:id` - Update event
- DELETE `/events/:id` - Delete event

### Exams
- GET `/exams` - Get all exams
- POST `/exams` - Create exam (faculty/admin)

### Assignments
- GET `/assignments` - Get all assignments
- POST `/assignments` - Create assignment (faculty/admin)
- POST `/assignments/:id/submit` - Submit assignment
- GET `/assignments/:id/submissions` - Get submissions

### Notifications
- GET `/notifications` - Get user notifications
- PUT `/notifications/:id/read` - Mark as read
- PUT `/notifications/read-all` - Mark all as read

### Dashboard
- GET `/dashboard/student` - Student dashboard data
- GET `/dashboard/faculty` - Faculty dashboard data
- GET `/dashboard/admin` - Admin dashboard data

## Security Features

1. **Role-Based Access Control (RBAC)**
   - Row Level Security (RLS) enabled on all tables
   - Users can only access data according to their role
   - Students can only submit their own assignments
   - Faculty can only edit their own events/exams/assignments
   - Admins have full access

2. **Authentication**
   - JWT-based authentication via Supabase
   - Secure password hashing
   - Email verification (auto-confirmed for development)

3. **Data Protection**
   - SQL injection prevention
   - Input validation
   - Authorized endpoints only

## Database Schema Highlights

### Users Table
- Stores user profiles linked to Supabase Auth
- Tracks roles, departments, and notification preferences

### Events Table
- Comprehensive event management
- Support for recurring events
- Visibility controls
- Color coding

### Exams Table
- Detailed exam information
- Syllabus coverage tracking
- Seating arrangements
- Instructions and materials

### Assignments Table
- Deadline tracking
- Late submission policies
- Group assignment support
- Grading rubrics

### Notifications Table
- Priority-based notifications
- Related entity tracking
- Read/unread status
- Delivery tracking

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in
- Check that your session hasn't expired
- Try logging out and back in

### "Forbidden" Error
- You're trying to access a feature not available to your role
- Faculty/Admin features require appropriate role

### Database Connection Issues
- Verify you ran the `database-schema.sql` file
- Check your Supabase connection is active
- Ensure all tables were created successfully

### No Data Showing
- Create some test data using the "Create" buttons
- Faculty/Admin accounts needed to create events, exams, and assignments
- Students will see data once it's created

## Next Steps & Enhancements

This system provides a solid foundation. You can enhance it with:

1. **File Uploads**: Add assignment file submissions using Supabase Storage
2. **Email Notifications**: Integrate email service (SendGrid, AWS SES)
3. **SMS Reminders**: Add Twilio integration
4. **Calendar Export**: Add iCal/Google Calendar export
5. **Advanced Analytics**: More charts and reports
6. **Real-time Updates**: Implement Supabase Realtime subscriptions
7. **Search Functionality**: Add advanced search and filters
8. **Mobile App**: Build native mobile applications
9. **Attendance Tracking**: Add QR code check-in for events
10. **Grade Management**: Complete grading system with gradebook

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the database schema in `database-schema.sql`
3. Check browser console for error messages
4. Verify Supabase connection and table creation

## Important Notes

- This is a development/prototype system
- Do not use for real student PII without proper security review
- Run the database schema BEFORE using the application
- Create an admin account first to access all features
- The system uses Row Level Security for data protection

---

**Congratulations!** You now have a fully functional University Event Reminder System. Start by creating your admin account and exploring the features.
