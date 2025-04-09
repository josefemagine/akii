#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs/promises';
import path from 'path';
const FUNCTIONS_DIR = path.resolve(__dirname, '../');
const EXCLUDED_DIRS = ["_shared", "node_modules", ".vscode", "scripts"];
// Constants for imports to standardize
const SUPABASE_IMPORT = "https://esm.sh/@supabase/supabase-js@2.39.3";
const POSTGRES_IMPORT = "https://deno.land/x/postgres@v0.17.0/mod.ts";
function processFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield fs.readFile(filePath, 'utf-8');
            // Replace supabase-js imports
            let updatedContent = content.replace(/from ["'](@supabase\/supabase-js|https:\/\/esm\.sh\/@supabase\/supabase-js(@[0-9.]+)?)["']/g, `from "${SUPABASE_IMPORT}"`);
            // Replace postgres imports
            updatedContent = updatedContent.replace(/from ["'](postgres|https:\/\/deno\.land\/x\/postgres(@[0-9.]+)?\/mod\.ts)["']/g, `from "${POSTGRES_IMPORT}"`);
            // Replace relative imports to _shared with absolute imports
            updatedContent = updatedContent.replace(/from ["'](\.\.\/)*_shared\/([\w-]+)["']/g, 'from "./_shared/$2"');
            // Write the file back if changes were made
            if (content !== updatedContent) {
                yield fs.writeFile(filePath, updatedContent);
                console.log(`Updated imports in ${filePath}`);
            }
        }
        catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    });
}
function updateImportMaps() {
    return __awaiter(this, void 0, void 0, function* () {
        // Update deno.json import map
        try {
            const denoJsonPath = path.join(FUNCTIONS_DIR, "deno.json");
            let denoJson;
            try {
                const denoJsonContent = yield fs.readFile(denoJsonPath, 'utf-8');
                denoJson = JSON.parse(denoJsonContent);
            }
            catch (error) {
                // Create a new deno.json if it doesn't exist
                denoJson = {
                    "imports": {},
                    "compilerOptions": {
                        "allowJs": true,
                        "strict": true
                    },
                    "tasks": {
                        "start": "deno run --allow-net index.ts"
                    }
                };
            }
            // Ensure imports section exists
            if (!denoJson.imports) {
                denoJson.imports = {};
            }
            // Update standard imports
            denoJson.imports["@supabase/supabase-js"] = SUPABASE_IMPORT;
            denoJson.imports["postgres"] = POSTGRES_IMPORT;
            // Make sure we have the correct _shared import map
            denoJson.imports["./_shared/"] = "./_shared/";
            yield fs.writeFile(denoJsonPath, JSON.stringify(denoJson, null, 2));
            console.log("Updated deno.json import map");
        }
        catch (error) {
            console.error("Error updating deno.json:", error);
        }
    });
}
// Helper function to walk directories recursively
function walkDir(dir, fileCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const entries = yield fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRS.includes(entry.name)) {
                    yield walkDir(fullPath, fileCallback);
                }
            }
            else if (entry.isFile() && fullPath.endsWith('.ts')) {
                yield fileCallback(fullPath);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting to update imports in Supabase functions...");
        // Update import maps first
        yield updateImportMaps();
        // Process TypeScript files
        yield walkDir(FUNCTIONS_DIR, processFile);
        console.log("Import update process completed!");
    });
}
if (require.main === module) {
    main();
}
