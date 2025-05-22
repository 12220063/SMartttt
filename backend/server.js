// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');
// const { spawn } = require('child_process');
// const cors = require('cors');
// require('dotenv').config();
// const adminRoutes = require('./admin/routes/adminRoutes');
// const userRoutes = require('./user/routes/userRoutes');


// const app = express();
// const statisticsRoutes = require('./routes/statistics');
// const Image = require('./models/Image'); // Import the Image model

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/smartsort', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));
// app.use('/', statisticsRoutes);

// // Routes
// app.use('/admin', adminRoutes);
// app.use('/user', userRoutes);

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
//     cb(null, filename);
//   }
// });

// const upload = multer({ storage: storage });

// // Upload endpoint
// app.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     console.log('Received upload request');

//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     const fullImagePath = path.join(__dirname, 'uploads', req.file.filename);
//     const imageUrlPath = path.join('uploads', req.file.filename);
//     console.log('Uploaded path:', fullImagePath);

//     // Spawn Python process
//     const python = spawn('python', ['predict.py', fullImagePath]);

//     let output = '';
//     let errorOutput = '';

//     python.stdout.on('data', (data) => {
//       output += data.toString();
//     });

//     python.stderr.on('data', (data) => {
//       errorOutput += data.toString();
//     });

//     python.on('close', async (code) => {
//       if (code !== 0) {
//         console.error('Prediction script error:', errorOutput);
//         return res.status(500).send('Prediction script failed.');
//       }

//       try {
//         // Try parsing the output safely
//         const jsonStart = output.indexOf('[');
//         const jsonEnd = output.lastIndexOf(']') + 1;

//         if (jsonStart === -1 || jsonEnd === -1) {
//           console.error('No valid JSON array found in prediction output');
//           return res.status(500).send('Invalid prediction output.');
//         }

//         const predictionsJson = output.slice(jsonStart, jsonEnd);
//         const predictions = JSON.parse(predictionsJson);

//         // Save to MongoDB
//         const newImage = new Image({
//           imageUrl: `http://localhost:5000/${imageUrlPath.replace(/\\/g, '/')}`,
//           predictions
//         });

//         await newImage.save();

//         res.status(200).json({ imageUrl: newImage.imageUrl, predictions });

//       } catch (err) {
//         console.error('Error parsing predictions:', err);
//         res.status(500).send('Prediction parsing failed.');
//       }
//     });

//   } catch (err) {
//     console.error('Server error:', err);
//     res.status(500).send('Server error.');
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
require('dotenv').config();


// Models and Routes
const Image = require('./models/Image');
const adminRoutes = require('./admin/routes/adminRoutes');
const userRoutes = require('./user/routes/userRoutes');
const statisticsRoutes = require('./routes/statistics');
const profileRoutes = require('./routes/Profile');
const realtimeRoutes = require('./routes/realtimeRoutes');  // <-- Already Added!

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartsort', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/', statisticsRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/realtime', realtimeRoutes);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });

// Upload & Prediction Endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Received upload request');

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fullImagePath = path.join(__dirname, 'uploads', req.file.filename);
    const imageUrlPath = path.join('uploads', req.file.filename);
    console.log('Uploaded path:', fullImagePath);

    // Run Python prediction script
    const python = spawn('python', ['predict.py', fullImagePath]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => { output += data.toString(); });
    python.stderr.on('data', (data) => { errorOutput += data.toString(); });

    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('Prediction script error:', errorOutput);
        return res.status(500).send('Prediction script failed.');
      }

      try {
        // Try parsing prediction output
        const jsonStart = output.indexOf('[');
        const jsonEnd = output.lastIndexOf(']') + 1;

        if (jsonStart === -1 || jsonEnd === -1) {
          console.error('No valid JSON array found in prediction output');
          return res.status(500).send('Invalid prediction output.');
        }

        const predictionsJson = output.slice(jsonStart, jsonEnd);
        const predictions = JSON.parse(predictionsJson);

        // Save image & predictions to MongoDB
        const newImage = new Image({
          filename: req.file.filename,
          path: imageUrlPath.replace(/\\/g, '/'), // Save as forward slashes for web
          detections: predictions.map(pred => ({
            class: pred.class_id,
            confidence: pred.confidence,
            box: pred.box,
          })),
        });

        await newImage.save();

        console.log('Saved image and detections to MongoDB');

        res.status(200).json({
          imageUrl: `http://localhost:5000/${imageUrlPath.replace(/\\/g, '/')}`,
          predictions
        });

      } catch (err) {
        console.error('Error parsing predictions:', err);
        res.status(500).send('Prediction parsing failed.');
      }
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error.');
  }
});

// ✅✅✅ [NEW] Save Detection Data Endpoint (for Realtime Detection)
app.post('/save', async (req, res) => {
  try {
    const { filename, detections } = req.body;

    if (!filename || !detections) {
      return res.status(400).json({ message: 'Filename and detections are required' });
    }

    const newImage = new Image({
      filename: filename,
      path: `/uploads/${filename}`,
      detections: detections
    });

    await newImage.save();

    res.status(201).json({ message: 'Image and detections saved successfully' });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅✅✅ End of Save Endpoint

// Get images
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ timestamp: -1 });
    res.json(images);
  } catch (error) {
    console.error("Failed to fetch images:", error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete image
app.delete('/api/images/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send("Failed to delete image.");
  }
});

// // Update image (single put route)
// app.put('/api/images/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const codeToCategory = [
//       "1-PET", "2-HDPE", "3-PVC", "4-LDPE",
//       "5-PP", "6-PS", "7-O", "Non-Waste"
//     ];

//     const updateData = {
//       detections: req.body.detections.map(d => ({
//         class: d.class,
//         category: codeToCategory[d.class],
//       })),
//     };

//     console.log(response.data);

//     console.log("Updating image:", id);
//     console.log("With data:", updateData);

//     const updatedImage = await Image.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedImage) {
//       return res.status(404).json({ message: "Image not found" });
//     }

//     res.json(updatedImage);
//   } catch (error) {
//     console.error("Update failed:", error);
//     res.status(500).json({ message: "Update failed", error: error.message });
//   }
// });

app.put('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const codeToCategory = [
      "1-PET", "2-HDPE", "3-PVC", "4-LDPE",
      "5-PP", "6-PS", "7-O", "Non-Waste"
    ];

    // Fix: log the incoming request body instead of undefined 'response'
    console.log(req.body);

    const updateData = {
      detections: req.body.detections.map(d => ({
        class: d.class,
        category: codeToCategory[d.class],
      })),
    };

    console.log("Updating image:", id);
    console.log("With data:", updateData);

    const updatedImage = await Image.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.json(updatedImage);
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));