const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");

dotenv.config();

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
async function insertMessageToMongoDB(client, userId, sessionId, message) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");

        // Check if a conversation with the given sessionId already exists
        const existingConversation = await collection.findOne({ sessionId });

        if (existingConversation) {
            // Update the existing conversation by appending the new message
            await collection.updateOne(
                { sessionId },
                { $push: { messages: message } } // Use $push to add a new message
            );
            console.log("New message added to existing conversation");
        } else {
            // Insert a new conversation with a generated ObjectId and the first message
            const newConversation = {
                _id: new ObjectId(),
                sessionId,
                userId,
                messages: [message], // Start with the first message
                timestamp: new Date().toISOString(),
            };
            await collection.insertOne(newConversation);
            console.log("New conversation created");
        }
    } catch (error) {
        console.error("Error inserting message into conversation:", error);
    }
}

function generateRandomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}
async function fetchConversationById(client, id) {
    try {
        const database = client.db("conversationHistory");
        const collection = database.collection("conversation");

        // Fetch the conversation by ObjectId
        const conversation = await collection.findOne({ _id: new ObjectId(id) });
        return conversation; // Return the fetched conversation
    } catch (error) {
        console.error("Error fetching conversation:", error);
        throw error; // Rethrow the error to be handled in the route
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
    const userInput = req.body.input;
    const userId = 'user1'; // Replace with actual userId logic if needed
    const sessionId = 'session1'; // Replace with actual sessionId logic if needed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const start = Date.now();
    let responseText = ""; // Initialize an empty string to accumulate responses

    try {
        const conversation = await fetchConversationById(client, '6723041bd1a8c20f697f528d'); 
        const allHistory = conversation ? conversation.messages.map(msg => `${msg.role}: ${msg.content}`) : [];
        const userMessage = { role: 'user', content: userInput, datetime: new Date().toISOString() };
        const prompt = [...allHistory, `user: ${userInput}`]; 

        const result = await model.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
            responseText += chunk.text(); 
        }

        const botMessage = { role: 'bot', content: responseText, datetime: new Date().toISOString() };

        res.json({ response: responseText });
        console.log("Full Response:", responseText);
        const end = Date.now();
        console.log("Response time (ms):", end - start);
        
        // Insert both user and bot messages into MongoDB
        await insertMessageToMongoDB(client, userId, sessionId, userMessage);
        await insertMessageToMongoDB(client, userId, sessionId, botMessage);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/api/conversation/:id", async (req, res) => {
    const { id } = req.params||'6723041bd1a8c20f697f528d';

    try {
        const conversation = await fetchConversationById(client, id);
        if (conversation) {
            res.json(conversation); // Return the conversation details
        } else {
            res.status(404).json({ error: "Conversation not found" });
        }
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB(); // Connect to MongoDB when server starts
});