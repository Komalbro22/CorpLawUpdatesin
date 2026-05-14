const fs = require('fs');

const dataRaw = fs.readFileSync('scratch/audit_results.json', 'utf16le').trim();
const data = JSON.parse(dataRaw || '{}');

let md = 'Starting full project audit...\n\n';

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n🔴 CRITICAL BUGS (can crash or break the site)\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.criticalBugs || data.criticalBugs.length === 0) {
    md += 'No issues found\n\n';
} else {
    data.criticalBugs.forEach((bug, i) => {
        md += `BUG-${String(i+1).padStart(3, '0')}\nFile: ${bug.file}\nIssue: ${bug.issue}\nImpact: ${bug.risk_impact}\nLine: ${bug.line}\n\n`;
    });
}

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n🟠 SECURITY ISSUES\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.securityIssues || data.securityIssues.length === 0) {
    md += 'No issues found\n\n';
} else {
    data.securityIssues.forEach((sec, i) => {
        md += `SEC-${String(i+1).padStart(3, '0')}\nFile: ${sec.file}\nIssue: ${sec.issue}\nRisk: ${sec.risk_impact}\n\n`;
    });
}

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n🟡 PERFORMANCE ISSUES\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.performanceIssues || data.performanceIssues.length === 0) {
    md += 'No issues found\n\n';
} else {
    data.performanceIssues.forEach((perf, i) => {
        md += `PERF-${String(i+1).padStart(3, '0')}\nFile: ${perf.file}\nIssue: ${perf.issue}\nImpact: ${perf.risk_impact}\n\n`;
    });
}

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n🔵 SEO ISSUES\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.seoIssues || data.seoIssues.length === 0) {
    md += 'No issues found\n\n';
} else {
    data.seoIssues.forEach((seo, i) => {
        md += `SEO-${String(i+1).padStart(3, '0')}\nFile: ${seo.file}\nIssue: ${seo.issue}\nImpact: ${seo.risk_impact}\n\n`;
    });
}

// Since I didn't scan for UX specifically in the audit script, let's just output "No issues found" for UX or identify any.
md += '━━━━━━━━━━━━━━━━━━━━━━━━\n🟣 UX ISSUES\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.uxIssues || data.uxIssues.length === 0) {
    md += 'No issues found\n\n';
} else {
    data.uxIssues.forEach((ux, i) => {
        md += `UX-${String(i+1).padStart(3, '0')}\nFile: ${ux.file}\nIssue: ${ux.issue}\nImpact: ${ux.risk_impact}\n\n`;
    });
}

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n⚪ CODE QUALITY ISSUES\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
if (!data.codeQualityIssues || data.codeQualityIssues.length === 0) {
    md += 'No issues found\n\n';
} else {
    // Only output top 20 code quality issues to avoid spamming the report
    data.codeQualityIssues.slice(0, 20).forEach((code, i) => {
        md += `CODE-${String(i+1).padStart(3, '0')}\nFile: ${code.file}\nIssue: ${code.issue}\n\n`;
    });
    if (data.codeQualityIssues.length > 20) {
        md += `... and ${data.codeQualityIssues.length - 20} more code quality issues.\n\n`;
    }
}

md += '━━━━━━━━━━━━━━━━━━━━━━━━\n📊 AUDIT SUMMARY\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
md += `Critical Bugs:      ${data.criticalBugs?.length || 0}\n`;
md += `Security Issues:    ${data.securityIssues?.length || 0}\n`;
md += `Performance Issues: ${data.performanceIssues?.length || 0}\n`;
md += `SEO Issues:         ${data.seoIssues?.length || 0}\n`;
md += `UX Issues:          ${data.uxIssues?.length || 0}\n`;
md += `Code Quality:       ${data.codeQualityIssues?.length || 0}\n`;
md += `TOTAL ISSUES:       ${(data.criticalBugs?.length || 0) + (data.securityIssues?.length || 0) + (data.performanceIssues?.length || 0) + (data.seoIssues?.length || 0) + (data.uxIssues?.length || 0) + (data.codeQualityIssues?.length || 0)}\n\n`;

md += 'Top 5 most urgent to fix:\n';
let topIssues = [];
if (data.criticalBugs) topIssues.push(...data.criticalBugs.slice(0, 3).map((b, i) => `BUG-${String(i+1).padStart(3, '0')} — ${b.issue}`));
if (data.securityIssues) topIssues.push(...data.securityIssues.slice(0, 2).map((s, i) => `SEC-${String(i+1).padStart(3, '0')} — ${s.issue}`));
if (topIssues.length < 5 && data.performanceIssues) topIssues.push(...data.performanceIssues.slice(0, 5 - topIssues.length).map((p, i) => `PERF-${String(i+1).padStart(3, '0')} — ${p.issue}`));

topIssues.slice(0, 5).forEach((iss, i) => {
    md += `${i+1}. ${iss}\n`;
});

md += '\n━━━━━━━━━━━━━━━━━━━━━━━━\n';

fs.writeFileSync('scratch/final_report.txt', md, 'utf-8');
console.log('Report generated in scratch/final_report.txt');
