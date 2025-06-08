const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(409).json({message: "User already exists!"});  // Corrected to 409 Conflict
        }
    }
    // Return error if username or password is missing
    return res.status(400).json({message: "Unable to register user."});      // Corrected to 400 Bad Request
});

// Utility function 1:
// Check if a user with the given username already exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

// Utility function 2:
// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}



// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send JSON response with formatted book list data
  res.send(JSON.stringify(books, null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn

  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({message: "Book not found for the given ISBN."});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorName = req.params.author.toLowerCase();
    const filteredBooks = [];

    for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === authorName) {
            filteredBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (filteredBooks.length > 0) {
        res.json(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found by that author." });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title.toLowerCase();
    const filteredBooks = [];

    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === titleName) {
            filteredBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (filteredBooks.length > 0) {
        res.json(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found by that title." });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if(books[isbn]) {
    res.json({reviews: books[isbn].reviews });
  } else {
    res.status(404).json({message: "Book not found for the gven ISBN"});
  }
});

module.exports.general = public_users;
