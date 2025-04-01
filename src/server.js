// const express = require("express")
// const bodyParser = require("body-parser")
// const Tesseract = require("tesseract.js");
// const cors = require("cors");
// const app=express()

// app.use(bodyParser.json({limit:"20mb"}));
// app.use(cors({ origin: "*" }));
// app.get("/", (req, res) => {
//     res.send("API is running...");
//   });
// app.post("/api/extract-json-challenge_naimur" , async (req,res)=>{
// try {

//   const { imageBase64 } = req.body;
//   if (!imageBase64) {
//       return res.status(400).json({ success: false, message: "image is required" });
//   }

//   const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
//   const imageBuffer = Buffer.from(base64Data, "base64");

//   const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");

      
//   let jsonData;
//   try {
//       jsonData = JSON.parse(cleanedText);
//   } catch (parseError) {
//       return res.status(400).json({ success: false, message: "Extracted text is not valid JSON", error: parseError.message });
//   }

  
//   res.json({
//       success: true,
//       data: jsonData,
//       message: "Successfully extracted JSON from image",
//   });

// } catch (error) {
//           res.status(500).json({ success: false, message: "Error processing image" });

// }
// })

// app.listen(5000, () => console.log("Server running on port 5000"));
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// Test endpoint
app.get('/', (req, res) => {
  res.send('OCR API is running');
});

// OCR Processing Endpoint
app.post('/api/extract-json-naimur', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    // Process with Tesseract
    const result = await Tesseract.recognize(
      imageBase64,
      'eng',
      { logger: m => console.log(m.status) }
    );

    // Try to extract JSON
    try {
      const jsonMatch = result.data.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(400).json({
          success: false,
          message: 'No JSON found in image',
          extractedText: result.data.text
        });
      }

      const jsonData = JSON.parse(jsonMatch[0]);

      return res.json({
        success: true,
        data: jsonData,
        message: 'Data extracted successfully'
      });
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Could not parse JSON from text',
        error: parseError.message,
        extractedText: result.data.text
      });
    }

  } catch (error) {
    console.error('OCR Error:', error);
    return res.status(500).json({
      success: false,
      message: 'OCR processing failed',
      error: error.message
    });
  }
});

// Start server
const PORT =5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API ready at http://localhost:${PORT}/api/extract-json-naimur`);
});