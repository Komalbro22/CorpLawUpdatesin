const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'components', 'lib'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let criticalBugs = [];
let securityIssues = [];
let performanceIssues = [];
let seoIssues = [];
let uxIssues = [];
let codeQualityIssues = [];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else {
            if (extensions.includes(path.extname(fullPath))) {
                analyzeFile(fullPath);
            }
        }
    }
}

function addIssue(category, file, issue, risk_impact, line) {
    const obj = { file, issue, risk_impact, line };
    if (category === 'BUG') criticalBugs.push(obj);
    if (category === 'SEC') securityIssues.push(obj);
    if (category === 'PERF') performanceIssues.push(obj);
    if (category === 'SEO') seoIssues.push(obj);
    if (category === 'UX') uxIssues.push(obj);
    if (category === 'CODE') codeQualityIssues.push(obj);
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // File level checks
    const isApiRoute = filePath.includes('app\\api\\') || filePath.includes('app/api/');
    const isPage = filePath.endsWith('page.tsx') || filePath.endsWith('page.js');
    
    // Check missing try/catch in API routes
    if (isApiRoute) {
        if (!content.includes('try {') && !content.includes('try{')) {
            addIssue('BUG', filePath, 'API route without try/catch block', 'Can crash the app on unhandled errors', 'entire file');
        }
        if (!content.includes('export const runtime') && !content.includes('export const dynamic')) {
            // maybe perfs?
        }
    }

    if (isPage) {
        if (!content.includes('export const metadata') && !content.includes('export function generateMetadata')) {
            addIssue('SEO', filePath, 'Missing metadata export on page', 'Poor SEO visibility', 'entire file');
        } else {
            if (!content.includes('canonical')) {
                addIssue('SEO', filePath, 'Missing canonical tag in metadata', 'Duplicate content issues', 'metadata');
            }
            if (!content.includes('openGraph') || !content.includes('images')) {
                addIssue('SEO', filePath, 'Missing og:image in metadata', 'Poor social sharing visibility', 'metadata');
            }
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // CODE QUALITY
        if (line.includes('eslint-disable')) {
            addIssue('CODE', filePath, 'eslint-disable comment hiding real issues', 'Hides code quality issues', lineNum);
        }
        if (line.includes('console.log')) {
            addIssue('CODE', filePath, 'console.log in production code', 'Clutters console, possible data leak', lineNum);
        }
        if (line.includes('TODO')) {
            addIssue('CODE', filePath, 'TODO comment left in code', 'Unfinished work', lineNum);
        }
        if (line.includes('any')) {
            // Very naive check for 'any', usually need regex
            if (line.match(/:\s*any\b/)) {
                addIssue('CODE', filePath, 'Missing TypeScript types (any usage)', 'Loss of type safety', lineNum);
            }
        }

        // PERFORMANCE
        if (line.match(/<img\s/)) {
            addIssue('PERF', filePath, 'Unoptimized images (raw img vs next/image)', 'Slower image loading and layout shifts', lineNum);
        }
        if (filePath.endsWith('.tsx') && line.includes('<a ') && line.match(/href=["']\/[^"']*["']/)) {
            addIssue('PERF', filePath, 'Using <a> instead of <Link> for internal routing', 'Causes full page reload instead of client-side routing', lineNum);
        }

        // SECURITY
        if (line.match(/process\.env\.[A-Z_]+/) && !line.includes('||') && !line.includes('??')) {
            // Not checking for missing env... just a heuristic
        }
        if (line.match(/dangerouslySetInnerHTML/)) {
            addIssue('SEC', filePath, 'Usage of dangerouslySetInnerHTML', 'XSS vulnerability if input is not sanitized', lineNum);
        }
    }
}

for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
        scanDir(dir);
    }
}

console.log(JSON.stringify({
    criticalBugs,
    securityIssues,
    performanceIssues,
    seoIssues,
    uxIssues,
    codeQualityIssues
}));
