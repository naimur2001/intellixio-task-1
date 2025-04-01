const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Tesseract = require("tesseract.js");
const app = express();
app.use(cors({
    origin: ["https://json-extraction-challenge.intellixio.com","https://intellixio-task-1.vercel.app/extract-json-by-naimur"],  // No trailing slash
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json({ limit: "50mb" }));




const cleanExtractedText = (text) => {
    const cleaned = text
        .replace(/“|”/g, '"')   // Convert fancy quotes to normal
        .replace(/’/g, "'")     // Convert fancy apostrophes
        .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
        .replace(/\s*:\s*/g, ': ') // Normalize spacing around colons
        .replace(/\s*,\s*/g, ', ') // Normalize spacing around commas
        .replace(/(\w)\n(\w)/g, '$1 $2') // Replace newlines inside words
        .replace(/lq/g, '')  // Remove unnecessary "lq"
        .replace(/(\w+):\s*\((\d{3})\)\s*(\d{3}-\d{4}.*)/g, '$1: "$2-$3"') // **Fix mobile numbers**
        .trim();

    return `{${cleaned}}`; // JSON format
};

// testing route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// api endpoint
app.post("/extract-json-by-naimur", async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        // extract text using Tesseract
        const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");

        const cleanedText = cleanExtractedText(text);

        console.log({cleanedText});

        // extract JSON from text
        let jsonData;
        try {
            jsonData = JSON.parse(cleanedText);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: "Extracted text is not valid JSON",
                error: parseError.message,
                extractedText: cleanedText
            });
        }

     
     

        res.json({
            success: true,
            data: {
                name: jsonData.name,
                organization: jsonData.organization,
                address: jsonData.address,
                mobile: jsonData.mobile 
            },
            message: "Successfully extracted JSON from image"
        });

    } catch (error) {
        console.error("server Error:", error);
        res.status(500).json({ success: false, message: "error processing image", error: error.message });
    }
});

// start server
const PORT =  5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


