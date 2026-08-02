import { RecordType } from './types';

// Standard 18 fixed record lengths
export const RECORD_LENGTHS: Record<RecordType, number> = {
  [RecordType.VOL1]: 80,
  [RecordType.HDR1]: 80,
  [RecordType.HDR2]: 80,
  [RecordType.UHL1]: 80,
  [RecordType.DATA]: 106,
  [RecordType.EOF1]: 80,
  [RecordType.EOF2]: 80,
  [RecordType.UTL1]: 80,
};

// Required order of records (the header/volume records)
export const REQUIRED_HEADER_ORDER: RecordType[] = [
  RecordType.VOL1,
  RecordType.HDR1,
  RecordType.HDR2,
  RecordType.UHL1,
];

export const REQUIRED_TRAILER_ORDER: RecordType[] = [
  RecordType.EOF1,
  RecordType.EOF2,
  RecordType.UTL1,
];

// Line identifier offset (0-3)
export const RECORD_TYPE_OFFSET = 0;
export const RECORD_TYPE_LENGTH = 4;