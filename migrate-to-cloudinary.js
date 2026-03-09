const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dy2iyxblf',
  api_key: '942312164346414',
  api_secret: 'DjqGuJUv-SCReiIHWRB7eVPhPZY',
});

const uploadsDir = path.join(__dirname, 'src', 'uploads');

async function migrateFiles() {
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads papkasi topilmadi');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'imtixon/migrated',
      });
      console.log(`✅ Yuklandi: ${file} -> ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Xato: ${file}`, error.message);
    }
  }

  // Uploads papkasini o'chirib tashla
  fs.rmSync(uploadsDir, { recursive: true, force: true });
  console.log('\n✅ Uploads papkasi o\'chirildi');
}

migrateFiles();