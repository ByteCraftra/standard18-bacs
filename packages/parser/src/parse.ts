import {
  RecordType, BacsFile,
  Vol1, Hdr1, Hdr2, Uhl1, DataRecord, Eof1, Eof2, Utl1,
  VOL1_FIELD_SPECS, HDR1_FIELD_SPECS, HDR2_FIELD_SPECS, UHL1_FIELD_SPECS,
  DATA_FIELD_SPECS, EOF1_FIELD_SPECS, EOF2_FIELD_SPECS, UTL1_FIELD_SPECS,
} from '@standard18/shared';

function extractFields(line: string, specs: { name: string; start: number; length: number }[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const spec of specs) {
    fields[spec.name] = line.substring(spec.start, spec.start + spec.length);
  }
  return fields;
}

export function parse(content: string): BacsFile {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  let vol1: Vol1 | undefined, hdr1: Hdr1 | undefined, hdr2: Hdr2 | undefined, uhl1: Uhl1 | undefined;
  let eof1: Eof1 | undefined, eof2: Eof2 | undefined, utl1: Utl1 | undefined;
  const transactions: DataRecord[] = [];

  for (const line of lines) {
    const typeCode = line.substring(0, 4);
    switch (typeCode) {
      case RecordType.VOL1:
        vol1 = { type: RecordType.VOL1, ...extractFields(line, VOL1_FIELD_SPECS) } as Vol1;
        break;
      case RecordType.HDR1:
        hdr1 = { type: RecordType.HDR1, ...extractFields(line, HDR1_FIELD_SPECS) } as Hdr1;
        break;
      case RecordType.HDR2:
        hdr2 = { type: RecordType.HDR2, ...extractFields(line, HDR2_FIELD_SPECS) } as Hdr2;
        break;
      case RecordType.UHL1:
        uhl1 = { type: RecordType.UHL1, ...extractFields(line, UHL1_FIELD_SPECS) } as Uhl1;
        break;
      case RecordType.EOF1:
        eof1 = { type: RecordType.EOF1, ...extractFields(line, EOF1_FIELD_SPECS) } as Eof1;
        break;
      case RecordType.EOF2:
        eof2 = { type: RecordType.EOF2, ...extractFields(line, EOF2_FIELD_SPECS) } as Eof2;
        break;
      case RecordType.UTL1:
        utl1 = { type: RecordType.UTL1, ...extractFields(line, UTL1_FIELD_SPECS) } as Utl1;
        break;
      default:
        transactions.push({ type: RecordType.DATA, ...extractFields(line, DATA_FIELD_SPECS) } as DataRecord);
    }
  }

  if (!vol1 || !hdr1 || !hdr2 || !uhl1 || !eof1 || !eof2 || !utl1) {
    throw new Error('Missing required record type(s)');
  }

  return { vol1, hdr1, hdr2, uhl1, transactions, eof1, eof2, utl1 };
}