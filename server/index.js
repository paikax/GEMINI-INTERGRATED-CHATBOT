require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

const genAI = new GoogleGenerativeAI('AIzaSyAz6OUXvjFemUABdeFqCsFOoC-2k0ioH1k');




// MongoDB connection setup
const mongoUrl = "mongodb+srv://nguyentb1148:PPhCj6Vm7DDQWatq@geminichatboxclonedb.q6ybh.mongodb.net/?retryWrites=true&w=majority&appName=GeminiChatboxCloneDb";
const client = new MongoClient(mongoUrl, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// Function to connect to MongoDB
async function connectDB() {
    try {
        console.log("Connecting to MongoDB.");
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

async function insertMessageToMongoDB(userId, sessionId, message) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");
        
        const existingConversation = await collection.findOne({ sessionId });
        
        if (existingConversation) {
            await collection.updateOne(
                { sessionId },
                { $push: { messages: message } }
            );
            console.log("New message added to existing conversation");
        } else {
            const newConversation = {
                _id: new ObjectId(),
                sessionId,
                userId,
                messages: [message],
                timestamp: new Date().toISOString(),
            };
            await collection.insertOne(newConversation);
            console.log("New conversation created");
        }
    } catch (error) {
        console.error("Error inserting message into conversation:", error);
    }
}

async function fetchMessagesFromMongoDB(sessionId) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");
        
        const conversation = await collection.findOne({ sessionId });
        return conversation ? conversation.messages : [];
    } catch (error) {
        console.error("Error fetching messages from MongoDB:", error);
        return [];
    }
}

function generateRandomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}



// ------------------------------------------------------------------


app.post("/api/chat", async (req, res) => {
    const userInput = req.body.input;
    const sessionId = req.body.sessionId; // Expecting sessionId from client
    const history = await fetchMessagesFromMongoDB(sessionId); // Fetching chat history
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const start = Date.now();
    let responseText = "";

    try {
        const allHistory = history.map((item) => item.content);
        const result = await model.generateContentStream([...allHistory, userInput]);

        for await (const chunk of result.stream) {
            responseText += chunk.text();
        }

        res.json({ response: responseText });
        console.log("Full Response:", responseText);
        
        // Save user message to MongoDB
        await insertMessageToMongoDB(req.body.userId, sessionId, { content: userInput, fromUser: true });
        // Save AI response to MongoDB
        await insertMessageToMongoDB(req.body.userId, sessionId, { content: responseText, fromUser: false });

        const end = Date.now();
        console.log("Response time (ms):", end - start);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB(); // Connect to MongoDB when server starts
});

app.post("/api/register", async (req, res) => {
    const { email, fullName, gender, password } = req.body;

    try {
        const database = client.db("DEV-G5");
        const usersCollection = database.collection("users");

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "email is already exists" });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = {
            email,
            fullName, 
            gender,
            password: hashedPassword,

        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login route
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const database = client.db("DEV-G5");
        const usersCollection = database.collection("users");

        // Find the user by username
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare the password with the hashed password in the database
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Successful login
        const userData = {
            userId: user._id,
            fullName: user.fullName,
            gender: user.gender,
            email: user.email,
        };

        // Successful login
        res.status(200).json({ message: "Login successful", user: userData });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await fetchUserFromDatabase(userId); // Implement this function to retrieve user data
        if (user) {
            res.json(user); // Send user data as JSON
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

async function fetchUserFromDatabase(userId) {
    try {
        const database = client.db("DEV-G5"); // Connect to the 'DEV-G5' database
        const usersCollection = database.collection("users"); // Access the 'users' collection

        // Fetch the user document by userId
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        // Return the user data, omitting the password for security
        if (user) {
            const { password, ...userData } = user; // Exclude the password field
            return userData; // Return user data without the password
        } else {
            return null; // User not found
        }
    } catch (error) {
        console.error("Error fetching user from database:", error);
        throw new Error("Database query failed"); // Throw an error if there's an issue
    }
}

app.put("/api/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { fullName, gender } = req.body;

    try {
        const database = client.db("DEV-G5");
        const usersCollection = database.collection("users");

        // Update the user's profile
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { fullName, gender } }
        );

        if (updateResult.modifiedCount > 0) {
            res.status(200).json({ message: "Profile updated successfully" });
        } else {
            res.status(400).json({ message: "No changes made or user not found" });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/api/logout', (req, res) => {
    // For JWT, you might just clear the token on the client side,
    // but if you're managing sessions, you might want to destroy the session.
    // Example:
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.' });
        }
        res.status(200).json({ message: 'Logged out successfully.' });
    });
});



