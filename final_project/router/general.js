const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user:
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the user already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});



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
