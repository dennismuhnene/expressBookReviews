const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Check if a user with the given username already exists
    // Filter the users array for any user with the same username
    const usersWithSameName = users.filter((user) => {
        return user.username === username;
    });

    // Return true if any user with the same username is found, otherwise false
    if (usersWithSameName.length > 0) {
        return true;
    } else {
        return false;
    }
};

const authenticatedUser = (username,password)=>{ //returns boolean
// Check if the user with the given username and password exists
    // Filter the users array for any user with the same username and password
    const validUsers = users.filter((user) => {
        return user.username === username && user.password === password;
    });

    // Return true if any valid user is found, otherwise false
    if (validUsers.length > 0) {
        return true;
    } else {
        return false;
    }
};

// Login endpoint
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required in request body." });   
    }

    const username = req.user.username;

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully.",
        reviews: books[isbn].reviews
    });
});

// Delete book review:
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    const username = req.user.username;

    // Check if the user has reviewed this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user to delete." });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully." });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
