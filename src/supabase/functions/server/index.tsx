import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-f9780152/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ====================

// Register new user
app.post('/make-server-f9780152/auth/register', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    // Validate role
    const validRoles = ['student', 'faculty', 'admin'];
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role. Must be student, faculty, or admin.' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during user registration: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.log(`Error creating user profile: ${profileError.message}`);
      return c.json({ error: 'Failed to create user profile' }, 500);
    }

    return c.json({ 
      message: 'User registered successfully',
      user: { id: data.user.id, email, name, role }
    });
  } catch (error) {
    console.log(`Registration error: ${error}`);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// ==================== USER MANAGEMENT ====================

// Get user profile
app.get('/make-server-f9780152/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('id');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return c.json({ error: error.message }, 404);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Update user profile
app.put('/make-server-f9780152/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('id');
    
    // Users can only update their own profile unless they're admin
    if (user.id !== userId && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error updating user profile: ${error}`);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Get all users (admin only)
app.get('/make-server-f9780152/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// ==================== EVENT MANAGEMENT ====================

// Get all events with filters
app.get('/make-server-f9780152/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventType = c.req.query('type');
    const startDate = c.req.query('start_date');
    const endDate = c.req.query('end_date');

    let query = supabase
      .from('events')
      .select('*, created_by:users!events_created_by_fkey(id, name, email)')
      .order('start_time', { ascending: true });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.log(`Error fetching events: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in events endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Get single event
app.get('/make-server-f9780152/events/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const { data, error } = await supabase
      .from('events')
      .select('*, created_by:users!events_created_by_fkey(id, name, email)')
      .eq('id', eventId)
      .single();

    if (error) {
      return c.json({ error: error.message }, 404);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error fetching event: ${error}`);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// Create event
app.post('/make-server-f9780152/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only faculty and admin can create events
    if (!['faculty', 'admin'].includes(user.user_metadata?.role)) {
      return c.json({ error: 'Forbidden - Faculty or Admin access required' }, 403);
    }

    const eventData = await c.req.json();
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select('*, created_by:users!events_created_by_fkey(id, name, email)')
      .single();

    if (error) {
      console.log(`Error creating event: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create event endpoint: ${error}`);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event
app.put('/make-server-f9780152/events/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    
    // Check if user is the creator or admin
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    if (event.created_by !== user.id && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - You can only edit your own events' }, 403);
    }

    const updates = await c.req.json();
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select('*, created_by:users!events_created_by_fkey(id, name, email)')
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error updating event: ${error}`);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Delete event
app.delete('/make-server-f9780152/events/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    
    // Check if user is the creator or admin
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    if (event.created_by !== user.id && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - You can only delete your own events' }, 403);
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.log(`Error deleting event: ${error}`);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// ==================== EXAMS ====================

// Get all exams
app.get('/make-server-f9780152/exams', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('exams')
      .select('*, created_by:users!exams_created_by_fkey(id, name, email)')
      .order('exam_date', { ascending: true });

    if (error) {
      console.log(`Error fetching exams: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in exams endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch exams' }, 500);
  }
});

// Create exam
app.post('/make-server-f9780152/exams', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only faculty and admin can create exams
    if (!['faculty', 'admin'].includes(user.user_metadata?.role)) {
      return c.json({ error: 'Forbidden - Faculty or Admin access required' }, 403);
    }

    const examData = await c.req.json();
    const { data, error } = await supabase
      .from('exams')
      .insert({
        ...examData,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select('*, created_by:users!exams_created_by_fkey(id, name, email)')
      .single();

    if (error) {
      console.log(`Error creating exam: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create exam endpoint: ${error}`);
    return c.json({ error: 'Failed to create exam' }, 500);
  }
});

// ==================== ASSIGNMENTS ====================

// Get all assignments
app.get('/make-server-f9780152/assignments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('*, created_by:users!assignments_created_by_fkey(id, name, email)')
      .order('deadline', { ascending: true });

    if (error) {
      console.log(`Error fetching assignments: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in assignments endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch assignments' }, 500);
  }
});

// Create assignment
app.post('/make-server-f9780152/assignments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only faculty and admin can create assignments
    if (!['faculty', 'admin'].includes(user.user_metadata?.role)) {
      return c.json({ error: 'Forbidden - Faculty or Admin access required' }, 403);
    }

    const assignmentData = await c.req.json();
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        ...assignmentData,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select('*, created_by:users!assignments_created_by_fkey(id, name, email)')
      .single();

    if (error) {
      console.log(`Error creating assignment: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create assignment endpoint: ${error}`);
    return c.json({ error: 'Failed to create assignment' }, 500);
  }
});

// Submit assignment
app.post('/make-server-f9780152/assignments/:id/submit', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const assignmentId = c.req.param('id');
    const submissionData = await c.req.json();

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        ...submissionData,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log(`Error submitting assignment: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in submit assignment endpoint: ${error}`);
    return c.json({ error: 'Failed to submit assignment' }, 500);
  }
});

// Get assignment submissions
app.get('/make-server-f9780152/assignments/:id/submissions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const assignmentId = c.req.param('id');
    
    // Faculty can see all submissions, students can only see their own
    let query = supabase
      .from('submissions')
      .select('*, student:users!submissions_student_id_fkey(id, name, email)')
      .eq('assignment_id', assignmentId);

    if (user.user_metadata?.role === 'student') {
      query = query.eq('student_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.log(`Error fetching submissions: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in submissions endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch submissions' }, 500);
  }
});

// ==================== NOTIFICATIONS ====================

// Get user notifications
app.get('/make-server-f9780152/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.log(`Error fetching notifications: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in notifications endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.put('/make-server-f9780152/notifications/:id/read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error marking notification as read: ${error}`);
    return c.json({ error: 'Failed to update notification' }, 500);
  }
});

// Mark all notifications as read
app.put('/make-server-f9780152/notifications/read-all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.log(`Error marking all notifications as read: ${error}`);
    return c.json({ error: 'Failed to update notifications' }, 500);
  }
});

// Create notification (internal use)
app.post('/make-server-f9780152/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationData = await c.req.json();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString(),
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.log(`Error creating notification: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create notification endpoint: ${error}`);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

// ==================== DASHBOARD ====================

// Student dashboard
app.get('/make-server-f9780152/dashboard/student', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const now = new Date().toISOString();

    // Get upcoming events
    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(5);

    // Get upcoming exams
    const { data: upcomingExams } = await supabase
      .from('exams')
      .select('*')
      .gte('exam_date', now)
      .order('exam_date', { ascending: true })
      .limit(5);

    // Get pending assignments
    const { data: pendingAssignments } = await supabase
      .from('assignments')
      .select('*')
      .gte('deadline', now)
      .order('deadline', { ascending: true })
      .limit(5);

    // Get unread notifications count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return c.json({
      upcomingEvents: upcomingEvents || [],
      upcomingExams: upcomingExams || [],
      pendingAssignments: pendingAssignments || [],
      unreadNotifications: unreadCount || 0
    });
  } catch (error) {
    console.log(`Error fetching student dashboard: ${error}`);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Faculty dashboard
app.get('/make-server-f9780152/dashboard/faculty', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get events created by faculty
    const { data: myEvents } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', user.id)
      .order('start_time', { ascending: false })
      .limit(5);

    // Get assignments created by faculty
    const { data: myAssignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('created_by', user.id)
      .order('deadline', { ascending: false })
      .limit(5);

    // Get exams created by faculty
    const { data: myExams } = await supabase
      .from('exams')
      .select('*')
      .eq('created_by', user.id)
      .order('exam_date', { ascending: false })
      .limit(5);

    // Get pending submissions count
    const { count: submissionsCount } = await supabase
      .from('submissions')
      .select('*, assignment:assignments!inner(created_by)', { count: 'exact', head: true })
      .eq('assignment.created_by', user.id)
      .is('grade', null);

    return c.json({
      myEvents: myEvents || [],
      myAssignments: myAssignments || [],
      myExams: myExams || [],
      pendingSubmissions: submissionsCount || 0
    });
  } catch (error) {
    console.log(`Error fetching faculty dashboard: ${error}`);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Admin dashboard
app.get('/make-server-f9780152/dashboard/admin', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Get total counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    const { count: totalExams } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });

    const { count: totalAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true });

    // Get user distribution by role
    const { data: usersByRole } = await supabase
      .from('users')
      .select('role');

    const roleCounts = {
      student: 0,
      faculty: 0,
      admin: 0
    };

    usersByRole?.forEach(u => {
      if (u.role in roleCounts) {
        roleCounts[u.role as keyof typeof roleCounts]++;
      }
    });

    return c.json({
      totalUsers: totalUsers || 0,
      totalEvents: totalEvents || 0,
      totalExams: totalExams || 0,
      totalAssignments: totalAssignments || 0,
      usersByRole: roleCounts
    });
  } catch (error) {
    console.log(`Error fetching admin dashboard: ${error}`);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// ==================== COMMENTS ====================

// Get comments for an entity
app.get('/make-server-f9780152/comments/:entityType/:entityId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');

    const { data, error } = await supabase
      .from('comments')
      .select('*, user:users!comments_user_id_fkey(id, name, email, profile_picture)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.log(`Error fetching comments: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in comments endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Create comment
app.post('/make-server-f9780152/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentData = await c.req.json();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...commentData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select('*, user:users!comments_user_id_fkey(id, name, email, profile_picture)')
      .single();

    if (error) {
      console.log(`Error creating comment: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create comment endpoint: ${error}`);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// Update comment
app.put('/make-server-f9780152/comments/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('id');
    const { comment_text } = await c.req.json();

    const { data, error } = await supabase
      .from('comments')
      .update({ comment_text, is_edited: true })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select('*, user:users!comments_user_id_fkey(id, name, email, profile_picture)')
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error updating comment: ${error}`);
    return c.json({ error: 'Failed to update comment' }, 500);
  }
});

// Delete comment
app.delete('/make-server-f9780152/comments/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('id');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.log(`Error deleting comment: ${error}`);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

// ==================== REACTIONS ====================

// Get reactions for an entity
app.get('/make-server-f9780152/reactions/:entityType/:entityId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');

    const { data, error } = await supabase
      .from('reactions')
      .select('*, user:users!reactions_user_id_fkey(id, name)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      console.log(`Error fetching reactions: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Group by reaction type
    const grouped = data?.reduce((acc: any, reaction: any) => {
      const type = reaction.reaction_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(reaction);
      return acc;
    }, {}) || {};

    return c.json({ reactions: data, grouped });
  } catch (error) {
    console.log(`Error in reactions endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch reactions' }, 500);
  }
});

// Add reaction
app.post('/make-server-f9780152/reactions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reactionData = await c.req.json();
    const { data, error } = await supabase
      .from('reactions')
      .insert({
        ...reactionData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select('*, user:users!reactions_user_id_fkey(id, name)')
      .single();

    if (error) {
      console.log(`Error creating reaction: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create reaction endpoint: ${error}`);
    return c.json({ error: 'Failed to create reaction' }, 500);
  }
});

// Remove reaction
app.delete('/make-server-f9780152/reactions/:entityType/:entityId/:reactionType', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');
    const reactionType = c.req.param('reactionType');

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.log(`Error removing reaction: ${error}`);
    return c.json({ error: 'Failed to remove reaction' }, 500);
  }
});

// ==================== FILE ATTACHMENTS ====================

// Upload file metadata (actual file uploaded to Supabase Storage separately)
app.post('/make-server-f9780152/files', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const fileData = await c.req.json();
    const { data, error } = await supabase
      .from('file_attachments')
      .insert({
        ...fileData,
        uploaded_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log(`Error saving file metadata: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in file upload endpoint: ${error}`);
    return c.json({ error: 'Failed to save file metadata' }, 500);
  }
});

// Get files for an entity
app.get('/make-server-f9780152/files/:entityType/:entityId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');

    const { data, error } = await supabase
      .from('file_attachments')
      .select('*, uploader:users!file_attachments_uploaded_by_fkey(id, name)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`Error fetching files: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in files endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// Delete file
app.delete('/make-server-f9780152/files/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const fileId = c.req.param('id');

    // Get file info first
    const { data: file } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('id', fileId)
      .single();

    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Check permissions
    if (file.uploaded_by !== user.id && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { error } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', fileId);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.log(`Error deleting file: ${error}`);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// ==================== SEARCH ====================

// Global search
app.get('/make-server-f9780152/search', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const query = c.req.query('q')?.toLowerCase() || '';
    
    if (!query) {
      return c.json({ events: [], exams: [], assignments: [] });
    }

    // Search events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(10);

    // Search exams
    const { data: exams } = await supabase
      .from('exams')
      .select('*')
      .or(`title.ilike.%${query}%,course_code.ilike.%${query}%,course_name.ilike.%${query}%`)
      .limit(10);

    // Search assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,course_code.ilike.%${query}%`)
      .limit(10);

    return c.json({
      events: events || [],
      exams: exams || [],
      assignments: assignments || []
    });
  } catch (error) {
    console.log(`Error in search endpoint: ${error}`);
    return c.json({ error: 'Failed to search' }, 500);
  }
});

// ==================== EXPORT ====================

// Export events as CSV
app.get('/make-server-f9780152/export/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    // Convert to CSV
    const headers = ['Title', 'Type', 'Start Time', 'End Time', 'Location', 'Department'];
    const rows = events?.map(e => [
      e.title,
      e.event_type,
      e.start_time,
      e.end_time || '',
      e.location || '',
      e.department || ''
    ]) || [];

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="events.csv"'
      }
    });
  } catch (error) {
    console.log(`Error exporting events: ${error}`);
    return c.json({ error: 'Failed to export events' }, 500);
  }
});

// ==================== EMAIL REMINDERS ====================

// Send email reminders (called by cron job)
app.post('/make-server-f9780152/reminders/send', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // This should be called by a cron job or system process
    // For now, we'll require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Find unsent reminders
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, user:users!reminders_user_id_fkey(email, name, notification_preferences)')
      .eq('is_sent', false)
      .lte('reminder_time', twoDaysFromNow.toISOString());

    if (error) {
      console.log(`Error fetching reminders: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    const sentReminders = [];
    
    for (const reminder of reminders || []) {
      // Check if user wants email notifications
      if (reminder.user?.notification_preferences?.email) {
        // Log the email (actual sending would require email service integration)
        const { data: emailLog } = await supabase
          .from('email_logs')
          .insert({
            recipient_email: reminder.user.email,
            recipient_user_id: reminder.user_id,
            email_type: 'reminder',
            subject: 'Upcoming Event Reminder',
            entity_type: reminder.entity_type,
            entity_id: reminder.entity_id,
            sent_at: new Date().toISOString(),
            status: 'sent'
          })
          .select()
          .single();

        // Mark reminder as sent
        await supabase
          .from('reminders')
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id);

        sentReminders.push(reminder.id);
      }
    }

    return c.json({ 
      message: `Sent ${sentReminders.length} reminders`,
      reminderIds: sentReminders
    });
  } catch (error) {
    console.log(`Error sending reminders: ${error}`);
    return c.json({ error: 'Failed to send reminders' }, 500);
  }
});

// Create reminder
app.post('/make-server-f9780152/reminders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reminderData = await c.req.json();
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...reminderData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log(`Error creating reminder: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.log(`Error in create reminder endpoint: ${error}`);
    return c.json({ error: 'Failed to create reminder' }, 500);
  }
});

Deno.serve(app.fetch);