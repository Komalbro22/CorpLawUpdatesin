import { GET as getAICatalogRoute, getAICatalog } from '../app/.well-known/ai-catalog.json/route';
import { GET as getArdRoute } from '../app/.well-known/ard.json/route';

describe('Agentic Resource Discovery (ARD) Specification Conformance', () => {
  const urnRegex = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/;
  const allowedRootProperties = ['specVersion', 'host', 'entries'];
  const allowedHostProperties = ['displayName', 'identifier', 'documentationUrl', 'logoUrl', 'trustManifest'];
  const allowedEntryProperties = [
    'identifier',
    'displayName',
    'type',
    'url',
    'data',
    'description',
    'tags',
    'capabilities',
    'representativeQueries',
    'version',
    'updatedAt',
    'metadata',
    'trustManifest',
  ];

  it('generates a strictly conformant ARD AI Catalog manifest', () => {
    const catalog = getAICatalog();

    // 1. Root Schema Validation
    expect(catalog.specVersion).toBe('1.0');
    expect(Array.isArray(catalog.entries)).toBe(true);
    expect(catalog.entries.length).toBeGreaterThanOrEqual(5);

    // No illegal additionalProperties at root (which previously caused PageSpeed audit failure)
    const rootKeys = Object.keys(catalog);
    for (const key of rootKeys) {
      expect(allowedRootProperties).toContain(key);
    }

    // 2. Host Validation
    expect(catalog.host).toBeDefined();
    expect(catalog.host.displayName).toBe('CorpLawUpdates.in');
    expect(catalog.host.identifier).toBe('did:web:corplawupdates.in');
    expect(catalog.host.documentationUrl).toMatch(/^https:\/\//);
    expect(catalog.host.logoUrl).toMatch(/^https:\/\//);

    const hostKeys = Object.keys(catalog.host);
    for (const key of hostKeys) {
      expect(allowedHostProperties).toContain(key);
    }

    // 3. Entries Validation
    for (const entry of catalog.entries) {
      // Required properties
      expect(entry.identifier).toBeDefined();
      expect(entry.displayName).toBeDefined();
      expect(entry.type).toBeDefined();

      // RFC 8141 URN compliance
      expect(entry.identifier).toMatch(urnRegex);

      // Either url or data, never both
      expect(entry.url).toBeDefined();
      expect((entry as any).data).toBeUndefined();

      // Representative queries: 2 to 5 items required by spec
      expect(Array.isArray(entry.representativeQueries)).toBe(true);
      expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2);
      expect(entry.representativeQueries.length).toBeLessThanOrEqual(5);

      // Allowed properties only
      const entryKeys = Object.keys(entry);
      for (const key of entryKeys) {
        expect(allowedEntryProperties).toContain(key);
      }
    }
  });

  it('serves /.well-known/ai-catalog.json with CORS and JSON headers', async () => {
    const res = await getAICatalogRoute();
    expect(res.status).toBe(200);

    const headers = res.headers;
    expect(headers.get('content-type')).toContain('application/json');
    expect(headers.get('access-control-allow-origin')).toBe('*');

    const data = await res.json();
    expect(data.specVersion).toBe('1.0');
    expect(data.entries.length).toBeGreaterThanOrEqual(8);
  });

  it('serves /.well-known/ard.json with CORS and identical specification', async () => {
    const res = await getArdRoute();
    expect(res.status).toBe(200);

    const headers = res.headers;
    expect(headers.get('content-type')).toContain('application/json');
    expect(headers.get('access-control-allow-origin')).toBe('*');

    const data = await res.json();
    expect(data.specVersion).toBe('1.0');
    expect(data.host.displayName).toBe('CorpLawUpdates.in');
    expect(data.entries.length).toBeGreaterThanOrEqual(8);
  });
});
