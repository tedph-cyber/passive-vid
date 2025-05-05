const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/convert', async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  const id = uuidv4();
  const downloadDir = '/tmp';
  const outputAudio = path.join(downloadDir, `${id}.mp3`);

  const command = `yt-dlp -x --audio-format mp3 -o "${downloadDir}/${id}.%(ext)s" "${videoUrl}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Failed to download or convert video.' });
    }

    // Find actual file path
    const match = stderr.match(/Destination: (.+\.mp3)/);
    const filePath = match ? match[1] : outputAudio;

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'Audio file not found after conversion.' });
    }

    res.json({
      success: true,
      file: `/download/${path.basename(filePath)}`
    });
  });
});

// Serve converted files
app.get('/download/:filename', (req, res) => {
  const file = path.join('/tmp', req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).send('File not found.');

  res.download(file, err => {
    if (!err) fs.unlink(file, () => {});
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
