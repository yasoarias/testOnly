const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

const app = express();
const port = 3000;
const newverifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from header
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded; // Attach user info to request
    next();
  });
};


// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://razzrel-events.vercel.app']
      : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
); // Use the cors middleware

// Add these lines after line 39 (after the existing CORS configuration)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? 'https://razzrel-events.vercel.app'
    : 'http://localhost:5173'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    console.log("Attempting to continue despite connection error");
  }
  console.log("MySQL connection established");
});

// Add connection error handler
db.on('error', function(err) {
  console.error('MySQL connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'HANDSHAKE_NO_SSL_SUPPORT') {
    console.log('Attempting to reconnect to MySQL...');
    setTimeout(() => {
      db.connect();
    }, 2000);
  }
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Remove 'Bearer ' prefix if it exists
  const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

  jwt.verify(tokenValue, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to check if user is authenticated
const isUser = (req, res, next) => {
  if (!req.user)
    return res.status(403).json({ message: "No user authenticated" });
  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Require Admin Role!" });
  }
};

// Public Routes
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, contactNo, termsAccepted } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (role, fullName, email, password, contactNo, termsAccepted) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      ["user", fullName, email, hashedPassword, contactNo, termsAccepted],
      (err, result) => {
        if (err) {
          console.error("Error inserting data into MySQL:", err);
          if (err.code === "ER_DUP_ENTRY") {
            res
              .status(400)
              .json({ success: false, message: "Email already exists" });
          } else {
            res.status(500).json({ success: false, message: "Database error" });
          }
          return;
        }
        res.json({ success: true, message: "User registered successfully" });
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
});

app.post("/login", (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  console.log("Executing query:", query, "with email:", email);
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Error on the server." });
      return;
    }
    console.log("Query results:", results);
    if (results.length === 0) {
      console.log("User not found:", email);
      res.status(404).json({ message: "User not found." });
      return;
    }
    const user = results[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      console.log("Invalid password for user:", email);
      res.status(401).json({ message: "Invalid password!" });
      return;
    }
    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        contactNo: user.contactNo,
        profilePicture: user.profilePicture, // Add this line
      },
      JWT_SECRET,
      { expiresIn: 86400 } // 24 hours
    );
    console.log("Login successful for user:", email);
    res.status(200).json({
      auth: true,
      token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        contactNo: user.contactNo,
        profilePicture: user.profilePicture, // Add this line
      },
    });
  });
});

// Private Routes
app.get("/user/profile", verifyToken, (req, res) => {
  const userId = req.user.id;
  console.log("Fetching profile for user ID:", userId);

  const query =
    "SELECT id, role, fullName, email, contactNo, termsAccepted, created_at, profilePicture FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      res.status(500).json({ message: "Error fetching user profile" });
      return;
    }

    if (results.length === 0) {
      console.log("No user found with ID:", userId);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = results[0];
    console.log("Fetched user data:", user);
    res.json(user);
  });
});

app.get("/admin/users", verifyToken, isAdmin, (req, res) => {
  const query = "SELECT id, fullName, email, role FROM users";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error on the server." });
      return;
    }
    res.status(200).json(results);
  });
});

// New API endpoint for fetching all users
app.get("/api/users", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const query =
    "SELECT id, fullName, email, created_at FROM users LIMIT ? OFFSET ?";
  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Fetch total count for pagination
    db.query(
      "SELECT COUNT(*) as total FROM users",
      (countErr, countResults) => {
        if (countErr) {
          console.error("Error fetching user count:", countErr);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json({
          users: results,
          total: countResults[0].total,
          totalPages: Math.ceil(countResults[0].total / limit),
          page: page,
        });
      }
    );
  });
});

// New route to add a product (only for admin)
app.post(
  "/api/products",
  verifyToken,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    const { name, description, price, category } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("Received product data:", {
      name,
      description,
      price,
      category,
      imagePath,
    });

    const query =
      "INSERT INTO products (name, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [name, description, price, category, imagePath],
      (err, result) => {
        if (err) {
          console.error("Error adding product:", err);
          res
            .status(500)
            .json({ success: false, message: "Error adding product" });
          return;
        }
        console.log("Product added successfully:", result);
        res.status(201).json({
          success: true,
          message: "Product added successfully",
          productId: result.insertId,
        });
      }
    );
  }
);

// New route to get all products
app.get("/api/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res
        .status(500)
        .json({ message: "Error fetching products from the server." });
      return;
    }
    res.status(200).json(results);
  });
});

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, "profile-" + Date.now() + path.extname(file.originalname));
  },
});

const uploadProfile = multer({ storage: profileStorage });

// Serve profile pictures statically
app.use("/uploads/profiles", express.static("uploads/profiles"));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add this new endpoint for updating user information
app.post(
  "/api/user/update",
  verifyToken,
  uploadProfile.single("profilePicture"),
  (req, res) => {
    const { fullName, email, contactNo } = req.body;
    const userId = req.user.id;
    const profilePicturePath = req.file
      ? `/uploads/profiles/${req.file.filename}`
      : null;

    console.log("Updating user:", userId);
    console.log("New data:", {
      fullName,
      email,
      contactNo,
      profilePicturePath,
    });

    let updateQuery = "UPDATE users SET fullName = ?, email = ?, contactNo = ?";
    let updateParams = [fullName, email, contactNo];

    if (profilePicturePath) {
      updateQuery += ", profilePicture = ?";
      updateParams.push(profilePicturePath);
    }

    updateQuery += " WHERE id = ?";
    updateParams.push(userId);

    console.log("Update query:", updateQuery);
    console.log("Update params:", updateParams);

    db.query(updateQuery, updateParams, (err, result) => {
      if (err) {
        console.error("Error updating user information:", err);
        return res.status(500).json({
          success: false,
          message: "Error updating user information",
        });
      }

      // Fetch updated user data
      const selectQuery =
        "SELECT id, role, fullName, email, contactNo, profilePicture FROM users WHERE id = ?";
      db.query(selectQuery, [userId], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching updated user information",
          });
        }

        const updatedUser = results[0];
        delete updatedUser.password;

        res.status(200).json({
          success: true,
          message: "User information updated successfully",
          user: updatedUser,
        });
      });
    });
  }
);

// Updated route to rate a product and add feedback
app.post("/api/products/:id/rate", newverifyToken, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const { rating, feedback_text } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  // Insert the rating into the database
  const ratingQuery =
    "INSERT INTO ratings (product_id, user_id, rating) VALUES (?, ?, ?)";
  db.query(
    ratingQuery,
    [productId, userId, rating],
    (ratingErr, ratingResult) => {
      if (ratingErr) {
        console.error("Error saving rating:", ratingErr);
        return res.status(500).json({ message: "Error saving rating." });
      }

      // If feedback is provided, insert it into the feedback table
      if (feedback_text) {
        const feedbackQuery =
          "INSERT INTO feedback (product_id, user_id, feedback_text) VALUES (?, ?, ?)";
        db.query(
          feedbackQuery,
          [productId, userId, feedback_text],
          (feedbackErr, feedbackResult) => {
            if (feedbackErr) {
              console.error("Error saving feedback:", feedbackErr);
              return res
                .status(500)
                .json({ message: "Error saving feedback." });
            }
            res
              .status(201)
              .json({ message: "Rating and feedback added successfully." });
          }
        );
      } else {
        res.status(201).json({ message: "Rating added successfully." });
      }
    }
  );
});

// New route to get ratings and feedback for a product
app.get("/api/products/:id/ratings", (req, res) => {
  const productId = req.params.id;
  const query = `
    SELECT r.rating, f.feedback_text, u.fullName, u.profilePicture, r.created_at
    FROM ratings r
    LEFT JOIN feedback f ON r.product_id = f.product_id AND r.user_id = f.user_id
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC`;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching ratings and feedback:", err);
      return res
        .status(500)
        .json({ message: "Error fetching ratings and feedback." });
    }
    res.status(200).json(results);
  });
});

// New route to get average rating for a product
app.get("/api/products/:id/average-rating", (req, res) => {
  const productId = req.params.id;
  const query = `
    SELECT AVG(rating) as averageRating, COUNT(*) as totalRatings
    FROM ratings
    WHERE product_id = ?`;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching average rating:", err);
      return res
        .status(500)
        .json({ message: "Error fetching average rating." });
    }
    const { averageRating, totalRatings } = results[0];
    res.status(200).json({
      averageRating: averageRating ? parseFloat(averageRating).toFixed(1) : 0,
      totalRatings,
    });
  });
});

// New route to add a comment
app.post("/api/products/:id/comments", newverifyToken, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id; // Get the user ID from the token
  const { text } = req.body; // Get the comment text from the request body

  // Insert the comment into the database
  const query =
    "INSERT INTO comments (product_id, user_id, text) VALUES (?, ?, ?)";
  db.query(query, [productId, userId, text], (err, result) => {
    if (err) {
      console.error("Error saving comment:", err);
      return res.status(500).json({ message: "Error saving comment." });
    }
    res.status(201).json({ message: "Comment added successfully." });
  });
});

// New route to get comments for a product
app.get("/api/products/:id/comments", (req, res) => {
  const productId = req.params.id;
  const query = `
    SELECT c.id, c.text, c.created_at, u.fullName, u.profilePicture
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.product_id = ?
    ORDER BY c.created_at DESC`;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ message: "Error fetching comments." });
    }
    res.status(200).json(results);
  });
});

app.get("/api/products/:id/user-rating", newverifyToken, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  const query =
    "SELECT rating FROM ratings WHERE product_id = ? AND user_id = ?";
  db.query(query, [productId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching user rating:", err);
      return res.status(500).json({ message: "Error fetching user rating." });
    }
    const userRating = results.length > 0 ? results[0].rating : null;
    res.status(200).json({ userRating });
  });
});

// Add this route after your existing routes

// Route to handle booking form submissions
app.post("/api/bookings", verifyToken, async (req, res) => {
  const {
    fullName,
    eventDate,
    contactNumber,
    email,
    venueName,
    venueAddress,
    expectedGuests,
    specialRequests,
    packageId,
    eventType,
  } = req.body;

  const userId = req.user.id;

  try {
    const bookingQuery = `
      INSERT INTO bookings (
        user_id,
        full_name,
        event_date,
        contact_number,
        email,
        venue_name,
        venue_address,
        expected_guests,
        special_requests,
        package_id,
        event_type,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    db.query(
      bookingQuery,
      [
        userId,
        fullName,
        eventDate,
        contactNumber,
        email,
        venueName,
        venueAddress,
        expectedGuests,
        specialRequests,
        packageId,
        eventType,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating booking:", err);
          return res
            .status(500)
            .json({ message: "Error creating booking: " + err.message });
        }

        res.status(201).json({
          message: "Booking created successfully",
          bookingId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error in booking creation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add this new route to fetch bookings
app.get("/api/bookings", newverifyToken, (req, res) => {
  console.log(
    "Fetching bookings for user:",
    req.user.id,
    "with role:",
    req.user.role
  );

  let query;
  let queryParams;

  if (req.user.role === "admin") {
    query = `
      SELECT b.*, p.name as package_name, p.price as package_price, u.fullName as user_name
      FROM bookings b
      LEFT JOIN products p ON b.package_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.event_date DESC
    `;
    queryParams = [];
  } else {
    query = `
      SELECT b.*, p.name as package_name, p.price as package_price, u.fullName as user_name
      FROM bookings b
      LEFT JOIN products p ON b.package_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.event_date DESC
    `;
    queryParams = [req.user.id];
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ message: "Error fetching bookings." });
    }
    res.status(200).json(results);
  });
});

// Accept a booking
app.put("/api/bookings/:id/accept", verifyToken, (req, res) => {
  const bookingId = req.params.id;
  const query =
    'UPDATE bookings SET status = "Accepted", accepted_at = NOW() WHERE id = ?';

  db.query(query, [bookingId], (err, result) => {
    if (err) {
      console.error("Error accepting booking:", err);
      return res.status(500).json({ message: "Error accepting booking." });
    }

    // Create a notification for the user
    const notificationQuery =
      'INSERT INTO notifications (user_id, message, type) SELECT user_id, CONCAT("Your booking for ", event_type, " on ", DATE_FORMAT(event_date, "%Y-%m-%d"), " has been accepted."), "success" FROM bookings WHERE id = ?';

    db.query(notificationQuery, [bookingId], (notifErr, notifResult) => {
      if (notifErr) {
        console.error("Error creating notification:", notifErr);
      }
      res.status(200).json({ message: "Booking accepted successfully." });
    });
  });
});

// Decline a booking
app.put("/api/bookings/:id/decline", verifyToken, (req, res) => {
  const bookingId = req.params.id;
  const query =
    'UPDATE bookings SET status = "Declined", declined_at = NOW() WHERE id = ?';

  db.query(query, [bookingId], (err, result) => {
    if (err) {
      console.error("Error declining booking:", err);
      return res.status(500).json({ message: "Error declining booking." });
    }

    // Create a notification for the user
    const notificationQuery =
      'INSERT INTO notifications (user_id, message, type) SELECT user_id, CONCAT("Your booking for ", event_type, " on ", DATE_FORMAT(event_date, "%Y-%m-%d"), " has been declined."), "error" FROM bookings WHERE id = ?';

    db.query(notificationQuery, [bookingId], (notifErr, notifResult) => {
      if (notifErr) {
        console.error("Error creating notification:", notifErr);
      }
      res.status(200).json({ message: "Booking declined successfully." });
    });
  });
});

app.put(
  "/api/products/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category, currentImagePath } = req.body;
    let imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : currentImagePath;

    const updateQuery =
      "UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_path = ? WHERE id = ?";
    const updateParams = [
      name,
      description,
      price,
      category,
      imagePath,
      productId,
    ];

    db.query(updateQuery, updateParams, (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ message: "Error updating product" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product updated successfully" });
    });
  }
);

// Add this new route to fetch all bookings
app.get("/api/bookings", newverifyToken, (req, res) => {
  console.log("Fetching all bookings");

  const query = `
    SELECT b.*, p.name as package_name, u.fullName as user_name
    FROM bookings b
    LEFT JOIN products p ON b.package_id = p.id
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.event_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ message: "Error fetching bookings." });
    }
    res.status(200).json(results);
  });
});

// Add this new route to fetch a specific product
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const query = "SELECT * FROM products WHERE id = ?";

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res
        .status(500)
        .json({ message: "Error fetching product from the server." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(results[0]);
  });
});

// Add a new notification
app.post("/api/notifications", verifyToken, (req, res) => {
  const { userId, message, type, relatedContent, actionUser } = req.body;
  const query = `
    INSERT INTO notifications 
    (user_id, message, type, related_content, action_user_id, read) 
    VALUES (?, ?, ?, ?, ?, 0)
  `;

  db.query(
    query,
    [userId, message, type, relatedContent, actionUser],
    (err, result) => {
      if (err) {
        console.error("Error creating notification:", err);
        return res
          .status(500)
          .json({ message: "Error creating notification." });
      }
      res.status(201).json({ message: "Notification created successfully." });
    }
  );
});

// Add this new route for admin notifications
app.get("/api/admin/notifications", verifyToken, isAdmin, (req, res) => {
  const query = `
    SELECT b.id, b.event_type as packageType, b.venue_name as venue, b.created_at as createdAt, u.fullName as userName
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    WHERE b.status = 'Pending'
    ORDER BY b.created_at DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching admin notifications:", err);
      return res.status(500).json({ message: "Error fetching notifications." });
    }
    res.status(200).json(results);
  });
});

// Update the existing notifications route to handle user notifications
app.get("/api/notifications", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user notifications:", err);
      return res.status(500).json({ message: "Error fetching notifications." });
    }
    res.status(200).json(results);
  });
});

// Get unread notifications count
app.get("/api/notifications/unread-count", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query =
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = 0";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching unread notifications count:", err);
      return res
        .status(500)
        .json({ message: "Error fetching unread notifications count." });
    }
    res.status(200).json(results[0].count);
  });
});

app.get("/api/posts", verifyToken, (req, res) => {
  const query = `
    SELECT p.*, u.fullName as userName
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).json({ message: "Error fetching posts." });
    }
    res.status(200).json(results);
  });
});

// Add this new route for creating posts
app.post("/api/posts", verifyToken, upload.array("images", 5), (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const images = req.files.map((file) => file.filename).join(",");

  const query = "INSERT INTO posts (user_id, content, images) VALUES (?, ?, ?)";
  db.query(query, [userId, content, images], (err, result) => {
    if (err) {
      console.error("Error creating post:", err);
      return res.status(500).json({ message: "Error creating post." });
    }
    res
      .status(201)
      .json({ message: "Post created successfully.", postId: result.insertId });
  });
});

// Add this new endpoint after existing routes
app.post("/api/user/activity", verifyToken, (req, res) => {
  const userId = req.user.id;
  const isActive = req.body.isActive;

  const query = "UPDATE users SET is_active = ? WHERE id = ?";
  db.query(query, [isActive, userId], (err, result) => {
    if (err) {
      console.error("Error updating user activity:", err);
      return res.status(500).json({ message: "Error updating user activity." });
    }
    res.status(200).json({ message: "User activity updated successfully." });
  });
});

// Add endpoint to mark notifications as read
app.put("/api/notifications/mark-read", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query = "UPDATE notifications SET `read` = 1 WHERE user_id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error marking notifications as read:", err);
      return res.status(500).json({ message: "Error updating notifications." });
    }
    res.status(200).json({ message: "Notifications marked as read." });
  });
});

// Add new notification types
const notificationTypes = {
  REACTION: "reaction",
  COMMENT: "comment",
  SHARE: "share",
  MENTION: "mention",
};

app.post("/api/notifications", verifyToken, (req, res) => {
  const { userId, message, type, relatedContent, actionUser } = req.body;
  const query = `
    INSERT INTO notifications 
    (user_id, message, type, related_content, action_user_id, read) 
    VALUES (?, ?, ?, ?, ?, 0)
  `;

  db.query(
    query,
    [userId, message, type, relatedContent, actionUser],
    (err, result) => {
      if (err) {
        console.error("Error creating notification:", err);
        return res
          .status(500)
          .json({ message: "Error creating notification." });
      }
      res.status(201).json({ message: "Notification created successfully." });
    }
  );
});

// Add endpoint to mark notification as read
app.put("/api/notifications/:id/read", verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const query = "UPDATE notifications SET `read` = 1 WHERE id = ?";

  db.query(query, [notificationId], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res.status(500).json({ message: "Error updating notification." });
    }
    res.status(200).json({ message: "Notification marked as read." });
  });
});

// Add this new route for checking unread notifications
app.get("/api/admin/notifications/unread", verifyToken, isAdmin, (req, res) => {
  const query = `
    SELECT COUNT(*) as unreadCount
    FROM bookings
    WHERE status = 'Pending'
    AND is_read = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error checking unread notifications:", err);
      return res.status(500).json({ message: "Error checking notifications." });
    }
    res.status(200).json({ unreadCount: results[0].unreadCount });
  });
});

// Add endpoint to mark notifications as read
app.put(
  "/api/admin/notifications/mark-read",
  verifyToken,
  isAdmin,
  (req, res) => {
    const query = "UPDATE bookings SET is_read = 1 WHERE status = 'Pending'";

    db.query(query, (err, result) => {
      if (err) {
        console.error("Error marking notifications as read:", err);
        return res
          .status(500)
          .json({ message: "Error updating notifications." });
      }
      res.status(200).json({ message: "Notifications marked as read." });
    });
  }
);

// Add a new endpoint for user notifications count
app.get("/api/notifications/unread", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT COUNT(*) as unreadCount
    FROM notifications
    WHERE user_id = ? AND \`read\` = 0
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error checking unread notifications:", err);
      return res.status(500).json({ message: "Error checking notifications." });
    }
    res.status(200).json({ unreadCount: results[0].unreadCount });
  });
});

// Add endpoint to mark user notifications as read
app.put("/api/notifications/mark-read", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query =
    "UPDATE notifications SET `read` = 1 WHERE user_id = ? AND `read` = 0";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error marking notifications as read:", err);
      return res.status(500).json({ message: "Error updating notifications." });
    }
    res.status(200).json({ message: "Notifications marked as read." });
  });
});

// Update the admin notifications endpoint
app.get("/api/admin/notifications/unread", verifyToken, isAdmin, (req, res) => {
  const query = `
    SELECT COUNT(*) as unreadCount
    FROM bookings
    WHERE status = 'Pending'
    AND is_read = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error checking unread notifications:", err);
      return res.status(500).json({ message: "Error checking notifications." });
    }
    res.status(200).json({ unreadCount: results[0].unreadCount });
  });
});

// Add cancel booking endpoint
app.put("/api/bookings/:id/cancel", verifyToken, (req, res) => {
  const packageId = parseInt(req.params.id);
  const userId = req.user.id;
  const bookingId = req.body.bookingId; // We'll need to pass this from the frontend

  console.log(
    "Cancel request received - Package ID:",
    packageId,
    "User ID:",
    userId,
    "Booking ID:",
    bookingId
  );

  const cancelQuery = `
    UPDATE bookings 
    SET 
      status = 'Cancelled',
      declined_at = NOW()
    WHERE package_id = ?
    AND user_id = ?
    AND status = 'Pending'
    AND created_at = (
      SELECT MIN(created_at) 
      FROM bookings 
      WHERE package_id = ? 
      AND user_id = ? 
      AND status = 'Pending'
    )
    LIMIT 1
  `;

  db.query(
    cancelQuery,
    [packageId, userId, packageId, userId],
    (err, result) => {
      if (err) {
        console.error("Error during cancellation:", err);
        return res.status(500).json({ message: "Error cancelling booking." });
      }

      console.log("Cancel query result:", result); // Debug log

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No pending booking found to cancel." });
      }

      // Create a notification for the cancellation
      const notificationQuery = `
      INSERT INTO notifications (user_id, message, type) 
      VALUES (?, ?, ?)
    `;

      const notificationMessage = `Your booking for package ${packageId} has been cancelled.`;

      db.query(
        notificationQuery,
        [userId, notificationMessage, "info"],
        (notifErr, notifResult) => {
          if (notifErr) {
            console.error("Error creating notification:", notifErr);
          }
          res.status(200).json({
            message: "Booking cancelled successfully.",
            packageId: packageId,
          });
        }
      );
    }
  );
});

// Add this route for deleting a product (place it with other product routes)
app.delete("/api/products/:id", verifyToken, isAdmin, async (req, res) => {
  const productId = req.params.id;

  console.log("Delete request received for product:", productId);

  try {
    // First check if product exists and get its image path
    const checkQuery = "SELECT * FROM products WHERE id = ?";

    db.query(checkQuery, [productId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking product:", checkErr);
        return res.status(500).json({ message: "Error checking product" });
      }

      if (checkResults.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get the image path for deletion
      const imagePath = checkResults[0].image_path;

      // Delete the product from database
      const deleteQuery = "DELETE FROM products WHERE id = ?";

      db.query(deleteQuery, [productId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error("Error deleting product:", deleteErr);
          return res.status(500).json({ message: "Error deleting product" });
        }

        // If there was an image, try to delete it from filesystem
        if (imagePath) {
          const fullPath = path.join(__dirname, imagePath);
          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          } catch (fsError) {
            console.error("Error deleting image file:", fsError);
            // Continue even if image deletion fails
          }
        }

        return res.status(200).json({
          success: true,
          message: "Product deleted successfully",
          deletedId: productId,
        });
      });
    });
  } catch (error) {
    console.error("Error in delete operation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add this error handling middleware at the end of your file (before app.listen)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add this error handler specifically for the login route
app.use('/login', (err, req, res, next) => {
  console.error('Login error:', err);
  res.status(500).json({
    success: false,
    message: 'An error occurred during login',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
