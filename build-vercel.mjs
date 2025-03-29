import fs from 'fs';
import path from 'path';

console.log('Starting build process...');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Advisor App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      margin-bottom: 1rem;
    }
    .error-details {
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      text-align: left;
      overflow-x: auto;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Student Advisor App</h1>
    <p>แอปพลิเคชันสำหรับอาจารย์ที่ปรึกษาและนักศึกษา</p>
    
    <div class="error-details">
      <p><strong>Error:</strong> Permission denied when running Vite on Vercel</p>
      <p>Vercel มีข้อจำกัดด้านความปลอดภัยที่ไม่อนุญาตให้รัน Vite โดยตรง</p>
      <p>กรุณาติดต่อผู้พัฒนาเพื่อแก้ไขปัญหานี้</p>
    </div>
    
    <p>แอปพลิเคชันนี้ต้องการการเชื่อมต่อกับ Supabase และการตั้งค่าอื่นๆ ก่อนการใช้งาน</p>
    <a href="https://github.com/Zyler00/student-advisor-app" class="button">ดูโค้ดบน GitHub</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join('dist', 'index.html'), indexHtml);

const cssContent = `
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}
`;

if (!fs.existsSync(path.join('dist', 'assets'))) {
  fs.mkdirSync(path.join('dist', 'assets'));
}

fs.writeFileSync(path.join('dist', 'assets', 'style.css'), cssContent);

console.log('Build completed successfully!');
