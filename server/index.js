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
    const history = req.body.history || [];
    const sessionId = req.body.sessionId;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const start = Date.now();
    let responseText = ""; // Initialize an empty string to accumulate responses

    try {
        const allHistory = history.map((item) => item.content);
        // Using generateContentStream to collect all parts into one string
        const result = await model.generateContentStream([...allHistory, userInput]);

        // Collect all chunks into responseText
        for await (const chunk of result.stream) {
            responseText += chunk.text(); // Concatenate text from each chunk
        }

        // Send the complete response once all chunks are processed
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
        res.status(500).json({ error: "Internal Server Error" }); // hi
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB(); // Connect to MongoDB when server starts
});

app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

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
        res.status(200).json({ message: "Login successful", userId: user._id });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/update-profile", async (req, res) => {
    const { email, profileData } = req.body;

    try {
        const database = client.db("DEV-G5");
        const usersCollection = database.collection("users");

        const result = await usersCollection.updateOne(
            { email: email },
            { $set: { profile: profileData } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: "Profile updated successfully" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
