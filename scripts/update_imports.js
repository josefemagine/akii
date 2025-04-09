/**
 * This script updates imports across all Deno functions to use standardized imports
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
// Standard library imports
// @ts-ignore - Deno imports will be resolved by Deno's import system
import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
// Path to the functions directory 
const FUNCTIONS_DIR = "./";
// Import mappings to standardize
const replacements = [
    // Supabase client imports
    {
        pattern: /import\s+createClient\s+from\s+["']https:\/\/esm\.sh\/@supabase\/supabase-js@2["'];/g,
        replacement: 'import { createClient } from "supabase-js";'
    },
    {
        pattern: /import\s+{\s*createClient\s*}\s+from\s+["']https:\/\/esm\.sh\/@supabase\/supabase-js@2["'];/g,
        replacement: 'import { createClient } from "supabase-js";'
    },
    {
        pattern: /import\s+createClient\s+from\s+["']@supabase\/supabase-js["'];/g,
        replacement: 'import { createClient } from "supabase-js";'
    },
    // Postgres imports
    {
        pattern: /import\s+{\s*Pool,\s*PoolClient\s*}\s+from\s+["']https:\/\/deno\.land\/x\/postgres@v0\.17\.0\/mod\.ts["'];/g,
        replacement: 'import { Pool, PoolClient } from "postgres";'
    },
    {
        pattern: /import\s+{\s*Pool,\s*PoolClient\s*}\s+from\s+["']postgres\/mod\.ts["'];/g,
        replacement: 'import { Pool, PoolClient } from "postgres";'
    }
];
// Process a single file
function processFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield Deno.readTextFile(filePath);
            // Skip if no replacements needed
            let hasChanges = false;
            let newContent = content;
            // Apply all replacements
            for (const { pattern, replacement } of replacements) {
                if (pattern.test(newContent)) {
                    newContent = newContent.replace(pattern, replacement);
                    hasChanges = true;
                }
            }
            // Write changes back if needed
            if (hasChanges) {
                yield Deno.writeTextFile(filePath, newContent);
                console.log(`Updated imports in ${filePath}`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`Error processing ${filePath}:`, error);
            return false;
        }
    });
}
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        console.log("Standardizing imports across Deno functions...");
        let totalFiles = 0;
        let updatedFiles = 0;
        try {
            // Process all TypeScript files
            for (var _d = true, _e = __asyncValues(walk(FUNCTIONS_DIR, {
                exts: [".ts"],
                skip: [/\.git/]
            })), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const entry = _c;
                if (entry.isFile) {
                    totalFiles++;
                    const updated = yield processFile(entry.path);
                    if (updated)
                        updatedFiles++;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log(`\nSummary:`);
        console.log(`- Total TypeScript files checked: ${totalFiles}`);
        console.log(`- Files with standardized imports: ${updatedFiles}`);
        console.log("Done!");
    });
}
// Run the script
if (import.meta.main) {
    main().catch(console.error);
}
