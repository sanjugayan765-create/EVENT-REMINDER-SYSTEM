# 🚀 Quick Start Guide - University Event Reminder System

## ⚡ Get Started in 3 Steps

### Step 1: Set Up Database (5 minutes)
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy ALL contents from `/database-schema.sql`
4. Paste and click **Run**
5. ✅ Verify 9 tables were created in **Table Editor**

### Step 2: Create Your Account (1 minute)
1. Click **Sign Up** on the login page
2. Enter your details
3. **Important**: Select your role:
   - Choose **Admin** for full access
   - Choose **Faculty** to create events/exams/assignments
   - Choose **Student** to view only
4. Click **Sign Up**

### Step 3: Start Using the System! 🎉
You're ready! The dashboard will load automatically.

---

## 🎯 What Can You Do?

### As Admin (Recommended First Account)
- ✅ Create events, exams, and assignments
- ✅ View system-wide analytics
- ✅ Manage all content
- ✅ Access admin dashboard with charts

### As Faculty
- ✅ Create and manage events
- ✅ Schedule exams
- ✅ Post assignments
- ✅ View faculty dashboard

### As Student
- ✅ View all events, exams, and assignments
- ✅ Submit assignments
- ✅ See upcoming deadlines
- ✅ Receive notifications

---

## 📝 Try These First Actions

### Create Your First Event
1. Click **Events** in navigation
2. Click **+ Create Event**
3. Fill in the form:
   - Title: "Welcome Meeting"
   - Type: "Meeting"
   - Date/Time: Tomorrow
   - Location: "Main Hall"
4. Click **Create Event**

### Schedule an Exam
1. Click **Exams** in navigation
2. Click **+ Create Exam**
3. Fill in:
   - Title: "Midterm Exam"
   - Course Code: "CS101"
   - Type: "Midterm"
   - Date: Next week
4. Click **Create Exam**

### Post an Assignment
1. Click **Assignments** in navigation
2. Click **+ Create Assignment**
3. Fill in:
   - Title: "Research Paper"
   - Course Code: "ENG201"
   - Type: "Essay"
   - Deadline: In 2 weeks
4. Click **Create Assignment**

---

## 🎨 Navigation Guide

### Top Navigation Bar
- **Dashboard** - Your personalized home
- **Events** - All university events
- **Exams** - Examination schedules
- **Assignments** - Assignment tracking
- **Notifications** - Your alerts

### User Menu (Top Right)
- Shows your name and role
- **Logout** button to sign out

---

## 📊 Dashboard Features

### Student Dashboard Shows:
- 📅 Next 5 upcoming events
- 📚 Next 5 upcoming exams  
- 📝 Next 6 pending assignments
- 🔔 Unread notification count

### Faculty Dashboard Shows:
- 📅 Your last 5 events
- 📚 Your last 5 exams
- 📝 Your last 5 assignments
- 👥 Pending submissions to grade

### Admin Dashboard Shows:
- 📊 Total users, events, exams, assignments
- 📈 Bar chart of system statistics
- 🥧 Pie chart of user roles
- 📉 Detailed breakdowns

---

## 🎓 Sample Data to Create

Want to test the full system? Create these:

### Events
1. "Orientation Day" - Ceremony - Next Monday
2. "Guest Lecture" - Lecture - Next Tuesday
3. "Sports Meet" - Sports - Next Friday

### Exams
1. "Mathematics Final" - CS101 - Final - 2 weeks from now
2. "Physics Quiz" - PHY201 - Quiz - 1 week from now

### Assignments
1. "Database Design" - CS301 - Project - Due in 10 days
2. "Literature Review" - ENG101 - Essay - Due in 5 days

---

## 💡 Pro Tips

### 🎯 Filtering
- Use **Filter by Type** buttons on Events page
- Events are color-coded by type
- Assignments show countdown timers

### ⏰ Deadlines
- Red "Overdue" badges appear on late assignments
- Time remaining shows in hours/days
- Dashboard shows nearest deadlines first

### 🔔 Notifications
- Notifications auto-load when you visit the page
- Click checkmark to mark as read
- Use "Mark All as Read" button
- Priority levels show with colored borders

### 📱 Mobile Use
- Click hamburger menu (☰) on mobile
- All features work on mobile
- Swipe-friendly interface

---

## ⚠️ Common Questions

**Q: I can't create events?**
A: You need to be Faculty or Admin. Create a new account with Faculty/Admin role.

**Q: Where's my data stored?**
A: In your Supabase PostgreSQL database. It persists between sessions.

**Q: Can I edit events?**
A: Yes! Click the pencil icon. You can only edit your own events (unless you're Admin).

**Q: How do I delete something?**
A: Click the trash icon. Only creators and admins can delete.

**Q: No notifications showing?**
A: Notifications are created programmatically. The infrastructure is ready - you can extend it to auto-generate notifications when events are created.

---

## 🔧 Troubleshooting

### "Unauthorized" Error
→ Log out and log back in

### Can't see events I created
→ Make sure you're using a Faculty or Admin account

### Database errors
→ Verify you ran the entire `database-schema.sql` file

### Blank dashboard
→ Create some events/exams/assignments first!

---

## 🎉 You're All Set!

Start exploring the system. Create events, schedule exams, post assignments, and see how the dashboard updates in real-time!

### Next Steps:
1. ✅ Create multiple user accounts (different roles)
2. ✅ Add 5-10 events to test filtering
3. ✅ Schedule some exams
4. ✅ Post a few assignments
5. ✅ Check out the analytics on Admin Dashboard

---

## 📚 Need More Help?

- **Full Setup**: See `SETUP_INSTRUCTIONS.md`
- **All Features**: See `FEATURES.md`
- **Database Schema**: See `database-schema.sql`

Enjoy your University Event Reminder System! 🎓
