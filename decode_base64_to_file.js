// decode_base64_to_file.js
const fs = require('fs');
const path = require('path');

// --- Configuration: Update these values as needed ---
const sounds = [
  {
    filename: 'bounce.wav',
    base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  },
  {
    filename: 'game_over.wav',
    base64: 'UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAACYw==',
  },
  // --- ADD THE NEW SOUND HERE ---
  {
    filename: 'ui_click.wav', // You can name this file as you like
    base64: 'UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAUcA==',
  },
  // You can add more sound objects here if needed
  // {
  //   filename: 'another_sound.wav',
  //   base64: 'YOUR_OTHER_BASE64_STRING_HERE',
  // }
];

const outputDir = path.join(__dirname, 'assets', 'sounds');
// --- End Configuration ---

function decodeBase64ToFile(base64String, outputFilePath) {
  try {
    // Create the output directory if it doesn't exist
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }

    // Decode the Base64 string to a buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Write the buffer to the file
    fs.writeFileSync(outputFilePath, buffer);
    console.log(`Successfully decoded and saved to: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error processing ${outputFilePath}:`, error);
  }
}

function main() {
  if (!sounds || sounds.length === 0) {
    console.log("No sounds configured in the script. Exiting.");
    return;
  }

  console.log(`Output directory set to: ${outputDir}`);

  sounds.forEach(sound => {
    if (!sound.filename || !sound.base64) {
      console.warn("Skipping sound with missing filename or base64 string.");
      return;
    }
    const filePath = path.join(outputDir, sound.filename);
    decodeBase64ToFile(sound.base64, filePath);
  });

  console.log("\nScript finished.");
}

// Run the main function
main();