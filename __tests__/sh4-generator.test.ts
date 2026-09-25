import { buildSh4Docx, buildBoardResolutionDocx, DEFAULT_SAMPLE_SH4_DATA } from '@/lib/doc-generator/sh4-generator';
import JSZip from 'jszip';

describe('Form SH-4 Document Generator', () => {
  it('generates a valid DOCX buffer for Form SH-4', async () => {
    const buffer = await buildSh4Docx(DEFAULT_SAMPLE_SH4_DATA);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it('generates OpenXML document.xml without invalid fixed layout schema conflicts', async () => {
    const buffer = await buildSh4Docx(DEFAULT_SAMPLE_SH4_DATA);
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml')?.async('text');

    expect(xml).toBeDefined();
    // Verify no conflicting table layout fixed attribute
    expect(xml).not.toContain('<w:tblLayout w:type="fixed"/>');
    // Verify all table widths are properly specified in DXA
    expect(xml).toContain('w:type="dxa"');
    // Verify grid columns have proper DXA widths (not 100)
    expect(xml).not.toContain('<w:gridCol w:w="100"/>');
  });

  it('generates a valid Board Resolution DOCX buffer', async () => {
    const buffer = await buildBoardResolutionDocx(DEFAULT_SAMPLE_SH4_DATA);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
