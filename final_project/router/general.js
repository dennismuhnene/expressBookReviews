const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user:
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        const bookList = books; // Simulating async fetch
        res.send(JSON.stringify(bookList, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve books." });
    }
});

// Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found for the given ISBN.");
        }
    })
    .then(data => res.json(data))
    .catch(error => res.status(404).json({ message: error }));
});

// Get book details based on author using Promise with Axios
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase();

    new Promise((resolve, reject) => {
        const filteredBooks = [];

        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === authorName) {
                filteredBooks.push({ isbn, ...books[isbn] });
            }
        }

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject("No books found by that author.");
        }
    })
    .then(data => res.json(data))
    .catch(error => res.status(404).json({ message: error }));
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    const titleName = req.params.title.toLowerCase();

    try {
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
    } catch (err) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// Get book review (unchanged)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.json({ reviews: books[isbn].reviews });
    } else {
        res.status(404).json({ message: "Book not found for the gven ISBN" });
    }
});

module.exports.general = public_users;
