const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();

const filesToFix = [
  'app/api/feed.xml/route.ts',
  'app/api/indexnow-key/route.ts',
  'app/api/og/route.tsx',
  'app/api/settings/announcement/route.ts',
  'app/api/settings/whatsapp/route.ts',
  'app/api/unsubscribe/route.ts',
  'app/api/compliance/route.ts',
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
  try {
    const sourceFile = project.addSourceFileAtPath(absolutePath);
    let hasChanges = false;

    // Check if NextResponse is imported
    let nextResponseImport = sourceFile.getImportDeclaration(dec => dec.getModuleSpecifierValue() === 'next/server');
    let hasNextResponse = false;
    
    if (nextResponseImport) {
        const namedImports = nextResponseImport.getNamedImports().map(i => i.getName());
        if (namedImports.includes('NextResponse')) {
            hasNextResponse = true;
        }
    }

    const functions = sourceFile.getFunctions().filter(f => f.isExported() && ['GET', 'POST', 'PATCH', 'DELETE'].includes(f.getName()));

    for (const func of functions) {
        // Check if already has try-catch at top level
        const body = func.getBody();
        if (body && body.getKind() === SyntaxKind.Block) {
            const statements = body.getStatements();
            // If the only statement is a TryStatement, it might be already wrapped, but let's check properly
            const isAlreadyWrapped = statements.length === 1 && statements[0].getKind() === SyntaxKind.TryStatement;
            
            if (!isAlreadyWrapped) {
                const bodyText = body.getText().replace(/^{/, '').replace(/}$/, '').trim();
                
                // Wrap body
                const newBodyText = `{\n  try {\n    ${bodyText}\n  } catch (error) {\n    console.error('[API Error]', error);\n    return NextResponse.json(\n      { error: 'Internal server error' },\n      { status: 500 }\n    );\n  }\n}`;
                
                func.setBodyText(newBodyText.replace(/^{/, '').replace(/}$/, ''));
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        if (!hasNextResponse) {
            if (nextResponseImport) {
                nextResponseImport.addNamedImport('NextResponse');
            } else {
                sourceFile.addImportDeclaration({
                    namedImports: ['NextResponse'],
                    moduleSpecifier: 'next/server'
                });
            }
        }
        sourceFile.saveSync();
        console.log(`Fixed: ${file}`);
    } else {
        console.log(`No changes needed or already wrapped: ${file}`);
    }
  } catch (err) {
      console.log(`Could not process ${file}: ${err.message}`);
  }
}
