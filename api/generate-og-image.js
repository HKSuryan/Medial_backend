const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { IncomingForm } = require('formidable');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.post('/api/generate-og-image', (req, res) => {
  const form = new IncomingForm();
  form.uploadDir = path.join(__dirname, '../uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).send('Error parsing form data');
      return;
    }

    const { title, content } = fields;
    const imageUrl = files.image ? `http://localhost:3001/uploads/${files.image.newFilename}` : null;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    await page.setContent(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Graph Image</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 1200px;
      height: 630px;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f0f2f5;
      box-sizing: border-box;
    }
    .container {
      position: relative;
      display: flex;
      width: 1100px;
      height: 530px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .content-side {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 40px;
      width: 70%;
    }
    .image-side {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30%;
      padding: 40px;
    }
    .badge {
      color: #ff7e5f;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .title {
      font-size: 36px;
      margin-bottom: 20px;
      font-weight: bold;
      color: #333;
      line-height: 1.2;
    }
    .description {
      font-size: 24px;
      color: #555;
      margin-bottom: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .background-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    .background-shape {
      position: absolute;
      background: #ff7e5f;
      border-radius: 50%;
      opacity: 0.5;
    }
    .shape-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
    }
    .shape-2 {
      width: 500px;
      height: 500px;
      bottom: -150px;
      right: -150px;
      background: #feb47b;
    }
    .image {
      max-width: 100%;
      max-height: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content-side">
      <div class="badge">BLOGGER</div>
      <div class="title">${title}</div>
      <div class="description">${content}</div>
    </div>
    <div class="image-side">
      ${imageUrl ? `<img src="${imageUrl}" class="image" alt="Image"/>` : ''}
    </div>
    <div class="background-shapes">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
    </div>
  </div>
</body>
</html>
    `);

    const buffer = await page.screenshot({ type: 'jpeg' });

    await browser.close();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.send(buffer);
  });
});

module.exports = app;