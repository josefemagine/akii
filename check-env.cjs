// Simple script to check environment variables
const fs = require('fs');

console.log("Checking environment variables...");

// Read from .env.local
console.log("Reading from .env.local:");
try {
  const dotenvLocal = fs.readFileSync('.env.local', 'utf8');
  console.log("Contents of .env.local:", dotenvLocal);
  
  // Check for line breaks in keys
  const urlMatch = dotenvLocal.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = dotenvLocal.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch && urlMatch[1]) {
    console.log("URL from .env.local:", urlMatch[1]);
    console.log("URL length:", urlMatch[1].length);
  }
  
  if (keyMatch && keyMatch[1]) {
    console.log("ANON_KEY from .env.local:", keyMatch[1]);
    console.log("ANON_KEY length:", keyMatch[1].length);
    console.log("Contains line breaks:", keyMatch[1].includes('\n'));
  }
} catch (error) {
  console.error("Error reading .env.local:", error);
}

// Read from .env
console.log("\nReading from .env:");
try {
  const dotenv = fs.readFileSync('.env', 'utf8');
  console.log("Contents of .env:", dotenv);
  
  // Check for line breaks in keys
  const urlMatch = dotenv.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = dotenv.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch && urlMatch[1]) {
    console.log("URL from .env:", urlMatch[1]);
    console.log("URL length:", urlMatch[1].length);
  }
  
  if (keyMatch && keyMatch[1]) {
    console.log("ANON_KEY from .env:", keyMatch[1]);
    console.log("ANON_KEY length:", keyMatch[1].length);
    console.log("Contains line breaks:", keyMatch[1].includes('\n'));
  }
} catch (error) {
  console.error("Error reading .env:", error);
}

// Write a clean .env.local file
try {
  console.log("\nWriting a clean .env.local file...");
  const cleanEnv = 
`VITE_SUPABASE_URL=https://injxxchotrvgvvzelhvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluanh4Y2hvdHJ2Z3Z2emVsaHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODcxODMsImV4cCI6MjA1ODc2MzE4M30.i4oE_xcL6jo7MihdMiYXmxu2ytzopHR3Vrv19Wwob4w
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluanh4Y2hvdHJ2Z3Z2emVsaHZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzE4NzE4MywiZXhwIjoyMDU4NzYzMTgzfQ.xJZpOe1MxGg55BwRWy7rBMsPnCeij7fMmvNk_uzq1lk`;

  fs.writeFileSync('.env.local', cleanEnv, 'utf8');
  console.log("Clean .env.local file created successfully.");
  
  // Verify the clean file
  const cleanEnvContents = fs.readFileSync('.env.local', 'utf8');
  console.log("Clean .env.local contents:", cleanEnvContents);
  
  const cleanUrlMatch = cleanEnvContents.match(/VITE_SUPABASE_URL=(.+)/);
  const cleanKeyMatch = cleanEnvContents.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (cleanUrlMatch && cleanUrlMatch[1]) {
    console.log("Clean URL from .env.local:", cleanUrlMatch[1]);
    console.log("Clean URL length:", cleanUrlMatch[1].length);
  }
  
  if (cleanKeyMatch && cleanKeyMatch[1]) {
    console.log("Clean ANON_KEY from .env.local:", cleanKeyMatch[1]);
    console.log("Clean ANON_KEY length:", cleanKeyMatch[1].length);
    console.log("Contains line breaks:", cleanKeyMatch[1].includes('\n'));
  }
} catch (error) {
  console.error("Error writing clean .env.local file:", error);
} 