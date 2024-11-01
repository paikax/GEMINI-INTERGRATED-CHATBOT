require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

const genAI = new GoogleGenerativeAI('AIzaSyD9ff9i9UzVshdB9xR1xnNx3fQDy0uqACA');




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

// ------------------------------------------------------------------

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

app.post("/api/saveUser", async (req, res) => {
    const userInfo = req.body;

    try {
        const database = client.db("DEV-G5"); // replace with your database name
        const usersCollection = database.collection("users"); // replace with your collection name

        const existingUser = await usersCollection.findOne({ googleId: userInfo.id });

        if (existingUser) {
            return res.status(200).json(existingUser);
        } else {
            const newUser = {
                googleId: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                imageUrl: userInfo.imageUrl,
            };

            const result = await usersCollection.insertOne(newUser);
            res.status(201).json(result.ops[0]);
        }
    } catch (error) {
        console.error("Error saving user info:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

