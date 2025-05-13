// backend/routes/convert.js or convert.ts
import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('video'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const outputPath = `outputs/${file.filename}.mp3`;

    ffmpeg(file.path)
        .audioCodec('libmp3lame')
        .save(outputPath)
        .on('end', () => {
            fs.unlinkSync(file.path); // Clean up
            return res.json({ file: `/outputs/${file.filename}.mp3` });
        })
        .on('error', (err) => {
            console.error(err);
            return res.status(500).json({ error: 'Conversion failed' });
        });
});

export default router;
