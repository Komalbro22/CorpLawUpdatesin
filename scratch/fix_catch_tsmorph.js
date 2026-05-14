const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const project = new Project();

const filesToFix = [
  'app/api/feed.xml/route.ts',
  'app/api/indexnow-key/route.ts',
  'app/api/og/route.tsx',
  'app/api/settings/announcement/route.ts',
  'app/api/settings/whatsapp/route.ts',
  'app/api/unsubscribe/route.ts',
  'app/api/compliance/suggest/route.ts',
  'app/api/views/[slug]/route.ts',
  'app/api/admin/calendar/route.ts',
  'app/api/admin/compliance/route.ts',
  'app/api/admin/compliance/suggestions/route.ts',
  'app/api/admin/compliance/suggestions/[id]/route.ts',
  'app/api/admin/compliance/[id]/route.ts',
  'app/api/admin/indexnow/route.ts',
  'app/api/admin/logout/route.ts',
  'app/api/admin/repo-rate/route.ts',
  'app/api/admin/settings/route.ts',
  'app/api/admin/subscribers/[id]/route.ts'
];

for (const file of filesToFix) {
  const absolutePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(absolutePath)) continue;
  try {
    const sourceFile = project.addSourceFileAtPath(absolutePath);
    let hasChanges = false;

    const catchClauses = sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause);
    for (const catchClause of catchClauses) {
        const block = catchClause.getBlock();
        const text = block.getText();
        if (text.includes("console.error('[API Error]', error);") || text.includes("return NextResponse.json(")) {
            if (!text.includes('DYNAMIC_SERVER_USAGE')) {
                const varDecl = catchClause.getVariableDeclaration();
                if (varDecl) {
                    varDecl.setType('any');
                }
                const bodyText = text.replace(/^{/, '').replace(/}$/, '');
                const errorName = varDecl ? varDecl.getName() : 'error';
                block.replaceWithText(`{\n  if (${errorName}?.digest === 'DYNAMIC_SERVER_USAGE' || ${errorName}?.message?.includes('Dynamic server usage')) throw ${errorName};\n${bodyText}}`);
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        sourceFile.saveSync();
        console.log(`Fixed: ${file}`);
    }
  } catch (err) {
      console.log(`Could not process ${file}: ${err.message}`);
  }
}
