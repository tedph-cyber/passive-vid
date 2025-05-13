const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static folders
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));
app.use('/download', express.static('/tmp'));

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Ensure directories exist
['uploads', 'outputs'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// YouTube URL conversion
app.post('/convert', async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  const id = uuidv4();
  const downloadDir = '/tmp';
  const command = `yt-dlp -x --audio-format mp3 -o "${downloadDir}/${id}.%(ext)s" "${videoUrl}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to download or convert video.' });
    }

    const match = stderr.match(/Destination: (.+\.mp3)/);
    const filePath = match ? match[1] : path.join(downloadDir, `${id}.mp3`);

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'Audio file not found after conversion.' });
    }

    res.json({
      success: true,
      file: `download/${path.basename(filePath)}`
    });
  });
});

// Upload & convert file
app.post('/upload', upload.single('video'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const outputPath = path.join('outputs', `${file.filename}.mp3`);

  ffmpeg(file.path)
    .audioCodec('libmp3lame')
    .save(outputPath)
    .on('end', () => {
      fs.unlink(file.path, () => { }); // Cleanup
      res.json({
        success: true,
        file: `outputs/${file.filename}.mp3`
      });
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err);
      fs.unlink(file.path, () => { });
      res.status(500).json({ error: 'Conversion failed' });
    });
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Video to Audio Converter API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
