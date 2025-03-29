
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const indexHtml = `
<!DOCTYPE html>
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
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Student Advisor App</h1>
    <p>แอปพลิเคชันสำหรับอาจารย์ที่ปรึกษาและนักศึกษา</p>
    <p>แอปพลิเคชันนี้ต้องการการเชื่อมต่อกับ Supabase และการตั้งค่าอื่นๆ ก่อนการใช้งาน</p>
    <a href="https://github.com/Zyler00/student-advisor-app" class="button">ดูโค้ดบน GitHub</a>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join('dist', 'index.html'), indexHtml);

console.log('Build completed successfully');
