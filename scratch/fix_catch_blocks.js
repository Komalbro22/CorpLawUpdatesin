const fs = require('fs');
const path = require('path');

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
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - does not exist`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the catch block
  const searchString = `} catch (error) {
    console.error('[API Error]', error);`;
  
  const replaceString = `} catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) {
      throw error;
    }
    console.error('[API Error]', error);`;
    
  if (content.includes(searchString)) {
    content = content.replaceAll(searchString, replaceString);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  } else {
    // maybe it has `catch (error: any)` or something else
    const searchString2 = `} catch (error: any) {
    console.error('[API Error]', error);`;
    if (content.includes(searchString2)) {
      content = content.replaceAll(searchString2, replaceString);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${file} (variant 2)`);
    } else {
        console.log(`Could not find search string in ${file}`);
    }
  }
}
