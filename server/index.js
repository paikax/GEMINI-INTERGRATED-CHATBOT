require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient, ServerApiVersion,  ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

const genAI = new GoogleGenerativeAI('AIzaSyD9ff9i9UzVshdB9xR1xnNx3fQDy0uqACA');


const conversationSchema = {
    _id: ObjectId,
    sessionId: String,
    userId: String,  // Add userId field
    messages: [{
        content: String,
        fromUser: Boolean,
        timestamp: Date
    }],
    title: String,
    createdAt: Date,
    updatedAt: Date
};

// MongoDB connection setup
const mongoUrl = "mongodb+srv://paikax2060:String123@handmadecraft.u2mx9jm.mongodb.net/?retryWrites=true&w=majority&appName=HandMadeCraft";
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

// ------------------------------------------------------------------

async function insertMessageToMongoDB(userId, sessionId, message) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");
        
        const existingConversation = await collection.findOne({ 
            sessionId,
            userId // Add userId to query
        });
        
        if (existingConversation) {
            await collection.updateOne(
                { sessionId, userId },
                { 
                    $push: { messages: message },
                    $set: { updatedAt: new Date() }
                }
            );
            console.log("New message added to existing conversation");
        } else {
            const newConversation = {
                sessionId,
                userId,
                messages: [message],
                createdAt: new Date(),
                updatedAt: new Date(),
                title: message.content.substring(0, 30) // Create initial title from first message
            };
            await collection.insertOne(newConversation);
            console.log("New conversation created");
        }
    } catch (error) {
        console.error("Error inserting message into conversation:", error);
    }
}

async function fetchMessagesFromMongoDB(userId, sessionId) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");
        
        const conversation = await collection.findOne({ 
            sessionId,
            userId // Add userId to query
        });
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

app.get("/api/conversations/:userId", async (req, res) => {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");
        
        const conversations = await collection
            .find({ userId: req.params.userId })
            .sort({ updatedAt: -1 })
            .toArray();
            
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/api/chat", async (req, res) => {
    const { input, userId, sessionId, history } = req.body;
    
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const start = Date.now();
    let responseText = "";

    try {
        const allHistory = history.map((item) => item.content);
        console.log("Conversation history: ", allHistory);
        const result = await model.generateContentStream([...allHistory, input]);

        for await (const chunk of result.stream) {
            responseText += chunk.text();
        }

        // Save messages with timestamps
        await insertMessageToMongoDB(userId, sessionId, { 
            content: input, 
            fromUser: true,
            timestamp: new Date()
        });
        
        await insertMessageToMongoDB(userId, sessionId, { 
            content: responseText, 
            fromUser: false,
            timestamp: new Date()
        });

        res.json({ response: responseText });
        
        const end = Date.now();
        console.log("Response time (ms):", end - start);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/conversations", async (req, res) => {
    const { userId, sessionId, message } = req.body;
    
    if (!userId || !sessionId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await insertMessageToMongoDB(userId, sessionId, message);
        res.status(201).json({ message: "Chat saved successfully" });
    } catch (error) {
        console.error("Error saving chat to MongoDB:", error);
        res.status(500).json({ error: "Failed to save chat to database" });
    }
});

app.delete('/api/delete-chat/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");

        // Attempt to delete the chat message based on the chatId
        const result = await collection.deleteOne({ _id: new ObjectId(chatId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat from database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
