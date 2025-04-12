const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 3000; // Update to desired port of localhost:address

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres', // Update to your username
    host: 'localhost',
    database: 'luxor_challenge', // Ensure this is the same name as the database created in POSTGRES/MYSQL
    password: 'password', // Your password
    port: 5432, // Update to your port
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to the database:', err.stack);
    }
    console.log('Connected to luxor_challenge database');
    release();
});

// JWT Secret (replace with a secure key in production, e.g., from env vars)
const JWT_SECRET = 'your_jwt_secret_key'; // TODO: Store in .env

// Nodemailer setup (configure with your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // TODO: Replace
        pass: 'your_email_password', // TODO: Replace
    },
});

// CRUD Routes for user table

// CREATE: Add a new user
app.post('/users', async (req, res) => {
    const { name, email, username, password, login_pin } = req.body;
    if (!password || !username || !email) {
        return res.status(400).json({ error: 'Password, username, and email are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
      INSERT INTO public."user" (name, email, username, password, login_pin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, username, login_pin
    `;
        const values = [name, email, username, hashedPassword, login_pin];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email or username already exists' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error creating user' });
        }
    }
});

// LOGIN: Authenticate user or owner
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        // Check user table first
        let query = 'SELECT id, username, email, password FROM public."user" WHERE username = $1';
        let result = await pool.query(query, [username]);
        let user = result.rows[0];
        let role = 'user';

        if (!user) {
            // Check owner table
            query = 'SELECT id, username, email, password FROM public.owner WHERE username = $1';
            result = await pool.query(query, [username]);
            user = result.rows[0];
            role = 'owner';
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id.toString(), username: user.username, role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email,
                role, // Include role in response
            },
        });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// FORGOT PASSWORD: Send reset link (unchanged, assumes user table for now)
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const query = 'SELECT * FROM public."user" WHERE email = $1';
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const user = result.rows[0];
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '15m',
        });
        const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetLink}\nThis link expires in 15 minutes.`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error processing request' });
    }
});

// READ: Get all users
app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT id, name, email, username, login_pin FROM public."user"';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// READ: Get a single user by ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT id, name, email, username, login_pin FROM public."user" WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// UPDATE: Update a user by ID
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, username, password, login_pin } = req.body;
    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const query = `
      UPDATE public."user"
      SET name = $1, email = $2, username = $3, password = COALESCE($4, password), login_pin = $5
      WHERE id = $6
      RETURNING id, name, email, username, login_pin
    `;
        const values = [name, email, username, hashedPassword, login_pin, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email or username already exists' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error updating user' });
        }
    }
});

// DELETE: Delete a user by ID
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM public."user" WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// CRUD Routes for collections table (unchanged)
app.post('/collections', async (req, res) => {
    const { name, description, stocks, price } = req.body;
    if (!name || stocks == null || price == null) {
        return res.status(400).json({ error: 'Name, stocks, and price are required' });
    }
    try {
        const query = `
      INSERT INTO public.collections (name, description, stocks, price)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, stocks, price
    `;
        const values = [name, description, stocks, price];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error creating collection' });
    }
});

app.get('/collections', async (req, res) => {
    try {
        const query = 'SELECT id, name, description, stocks, price FROM public.collections';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching collections' });
    }
});

app.get('/collections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT id, name, description, stocks, price FROM public.collections WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching collection' });
    }
});

app.put('/collections/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, stocks, price } = req.body;
    try {
        const query = `
      UPDATE public.collections
      SET name = $1, description = $2, stocks = $3, price = $4
      WHERE id = $5
      RETURNING id, name, description, stocks, price
    `;
        const values = [name, description, stocks, price, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error updating collection' });
    }
});

app.delete('/collections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM public.collections WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json({ message: 'Collection deleted successfully' });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error deleting collection' });
    }
});

// CRUD Routes for bids table (unchanged)
app.post('/bids', async (req, res) => {
    const { collection_id, price, user_id, status, number_bids } = req.body;
    if (!collection_id || !user_id || price == null) {
        return res.status(400).json({ error: 'Collection ID, user ID, and price are required' });
    }
    try {
        const query = `
      INSERT INTO public.bids (collection_id, price, user_id, status, number_bids, date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
    `;
        const values = [collection_id, price, user_id, status, number_bids];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            res.status(400).json({ error: 'Invalid collection ID or user ID' });
        } else if (err.code === '23514') {
            res.status(400).json({ error: 'Status must be pending, accepted, rejected, or null' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error creating bid' });
        }
    }
});

// GET /bids - Include formatted date in response
app.get('/bids', async (req, res) => {
    try {
        const query = `
      SELECT id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
      FROM public.bids
    `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching bids' });
    }
});

// GET /bids/:id - Include formatted date in response
app.get('/bids/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
      SELECT id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
      FROM public.bids
      WHERE id = $1
    `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching bid' });
    }
});

// GET /bids/by-collection/:collection_id - Include formatted date in response
app.get('/bids/by-collection/:collection_id', async (req, res) => {
    const { collection_id } = req.params;
    try {
        const query = `
      SELECT id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
      FROM public.bids
      WHERE collection_id = $1
    `;
        const result = await pool.query(query, [collection_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching bids for collection' });
    }
});

// PUT /bids/:id - Add date update with current timestamp
app.put('/bids/:id', async (req, res) => {
    const { id } = req.params;
    const { collection_id, price, user_id, status, number_bids } = req.body;
    try {
        const query = `
      UPDATE public.bids
      SET collection_id = $1, price = $2, user_id = $3, status = $4, number_bids = $5, date = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
    `;
        const values = [collection_id, price, user_id, status, number_bids, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            res.status(400).json({ error: 'Invalid collection ID or user ID' });
        } else if (err.code === '23514') {
            res.status(400).json({ error: 'Status must be pending, accepted, rejected, or null' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error updating bid' });
        }
    }
});

// POST /bids/accept - Include formatted date in response
app.post('/bids/accept', async (req, res) => {
    const { collection_id, bid_id } = req.body;
    if (!collection_id || !bid_id) {
        return res.status(400).json({ error: 'Collection ID and bid ID are required' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const checkBidQuery = `
      SELECT id FROM public.bids
      WHERE id = $1 AND collection_id = $2
    `;
        const checkBidResult = await client.query(checkBidQuery, [bid_id, collection_id]);
        if (checkBidResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Bid not found or does not match collection' });
        }
        const acceptQuery = `
      UPDATE public.bids
      SET status = 'accepted', date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
    `;
        const acceptResult = await client.query(acceptQuery, [bid_id]);
        const rejectQuery = `
      UPDATE public.bids
      SET status = 'rejected', date = CURRENT_TIMESTAMP
      WHERE collection_id = $1 AND id != $2 AND status != 'rejected'
    `;
        await client.query(rejectQuery, [collection_id, bid_id]);
        await client.query('COMMIT');
        res.json(acceptResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23514') {
            res.status(400).json({ error: 'Invalid status value' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error accepting bid' });
        }
    } finally {
        client.release();
    }
});

// POST /bids/reject - Include formatted date in response
app.post('/bids/reject', async (req, res) => {
    const { collection_id, bid_id } = req.body;
    if (!collection_id || !bid_id) {
        return res.status(400).json({ error: 'Collection ID and bid ID are required' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const checkBidQuery = `
      SELECT id FROM public.bids
      WHERE id = $1 AND collection_id = $2
    `;
        const checkBidResult = await client.query(checkBidQuery, [bid_id, collection_id]);
        if (checkBidResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Bid not found or does not match collection' });
        }
        const rejectQuery = `
      UPDATE public.bids
      SET status = 'rejected', date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
    `;
        const rejectResult = await client.query(rejectQuery, [bid_id]);
        await client.query('COMMIT');
        res.json(rejectResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23514') {
            res.status(400).json({ error: 'Invalid status value' });
        } else {
            console.error(err.stack);
            res.status(500).json({ error: 'Error rejecting bid' });
        }
    } finally {
        client.release();
    }
});

// GET /bids/closed/:user_id - Fetch accepted or rejected bids for a user
app.get('/bids/closed/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = `
            SELECT id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
            FROM public.bids
            WHERE user_id = $1 AND status IN ('accepted', 'rejected')
        `;
        const result = await pool.query(query, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching closed bids for user' });
    }
});

app.get('/bids/pending/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = `
            SELECT id, collection_id, price, user_id, status, number_bids, to_char(date, 'MM/DD/YYYY HH24:MI:SS:MS') as date
            FROM public.bids
            WHERE user_id = $1 AND status = 'pending'
        `;
        const result = await pool.query(query, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error fetching pending bids' });
    }
});

// DELETE /bids/:id - Delete a bid by ID
app.delete('/bids/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Check if the bid exists and is pending
        const checkBidQuery = `
            SELECT id, user_id FROM public.bids
            WHERE id = $1 AND status = 'pending'
        `;
        const checkBidResult = await client.query(checkBidQuery, [id]);
        if (checkBidResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pending bid not found' });
        }
        // Optionally, verify user_id matches (uncomment if needed)
        /*
        const bid = checkBidResult.rows[0];
        const user_id = req.body.user_id || req.query.user_id; // Adjust based on auth
        if (bid.user_id !== user_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Unauthorized to delete this bid' });
        }
        */
        const deleteQuery = `
            DELETE FROM public.bids
            WHERE id = $1
            RETURNING id
        `;
        const deleteResult = await client.query(deleteQuery, [id]);
        await client.query('COMMIT');
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        res.status(200).json({});
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.stack);
        res.status(500).json({ error: 'Error deleting bid' });
    } finally {
        client.release();
    }
});

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});