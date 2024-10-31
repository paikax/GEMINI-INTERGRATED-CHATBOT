const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' directory
const genAI = new GoogleGenerativeAI('AIzaSyD9ff9i9UzVshdB9xR1xnNx3fQDy0uqACA');

// Helper function to format history for Gemini
function formatHistory(history) {
    if (!history || !Array.isArray(history)) return [];
    
    return history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content
    }));
}


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


app.post("/api/chat", async (req, res) => {
    const userInput = req.body.input;
    const history = req.body.history || [];
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

app.post("/api/saveUser", async (req, res) => {
    const userInfo = req.body;

    try {
        const database = client.db("DEV-G5"); // replace with your database name
        const usersCollection = database.collection("users"); // replace with your collection name

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ googleId: userInfo.id });

        if (existingUser) {
            // User already exists, return existing user data
            return res.status(200).json(existingUser);
        } else {
            // Insert new user
            const newUser = {
                googleId: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                imageUrl: userInfo.imageUrl,
            };

            const result = await usersCollection.insertOne(newUser);
            res.status(201).json(result.ops[0]); // Return the newly created user
        }
    } catch (error) {
        console.error("Error saving user info:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
