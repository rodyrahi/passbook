const { execSync } = require('child_process');
const path = require('path');

function extractImagesFromPDF(pdfFilePath, outputDir) {
  const command = `pdfimages -png "${pdfFilePath}" "${path.join(outputDir, 'image')}"`;

  try {
    execSync(command);
    console.log('Images extracted successfully!');
  } catch (error) {
    console.error('Error extracting images:', error.message);
  }
}

// Replace 'input.pdf' with the path to your PDF file



module.exports = extractImagesFromPDF;
