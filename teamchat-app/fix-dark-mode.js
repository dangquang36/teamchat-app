const fs = require('fs');
const path = require('path');

// Hàm tìm và thay thế text-gray-500 thành text-gray-400 trong dark mode
function fixDarkModeIssues(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    files.forEach(file => {
        const fullPath = path.join(directory, file.name);

        if (file.isDirectory()) {
            fixDarkModeIssues(fullPath);
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            try {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                // Tìm và thay thế các pattern có vấn đề
                const patterns = [
                    // text-gray-500 không có dark:text-gray-400
                    {
                        regex: /className="([^"]*?)text-gray-500([^"]*?)"/g,
                        replacement: (match, before, after) => {
                            if (!match.includes('dark:text-gray-400')) {
                                return `className="${before}text-gray-500 dark:text-gray-400${after}"`;
                            }
                            return match;
                        }
                    },
                    // text-gray-500 trong template literals
                    {
                        regex: /className=\{`([^`]*?)text-gray-500([^`]*?)`\}/g,
                        replacement: (match, before, after) => {
                            if (!match.includes('dark:text-gray-400')) {
                                return `className={\`${before}text-gray-500 dark:text-gray-400${after}\`}`;
                            }
                            return match;
                        }
                    }
                ];

                patterns.forEach(pattern => {
                    const newContent = content.replace(pattern.regex, pattern.replacement);
                    if (newContent !== content) {
                        content = newContent;
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Fixed: ${fullPath}`);
                }
            } catch (error) {
                console.error(`Error processing ${fullPath}:`, error.message);
            }
        }
    });
}

// Chạy script
const projectRoot = path.join(__dirname);
console.log('Fixing dark mode issues...');
fixDarkModeIssues(projectRoot);
console.log('Done!'); 