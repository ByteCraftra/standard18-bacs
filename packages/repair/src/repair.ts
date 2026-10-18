import {
    RecordType,
    VOL1_FIELD_SPECS,
    HDR1_FIELD_SPECS,
    HDR2_FIELD_SPECS,
    UHL1_FIELD_SPECS,
    DATA_FIELD_SPECS_100,
    DATA_FIELD_SPECS_106,
    EOF1_FIELD_SPECS,
    EOF2_FIELD_SPECS,
    UTL1_FIELD_SPECS,
    FieldSpec,
} from '@standard18/shared';

export interface RepairCorrection {
    line: number;
    field: string;
    originalValue: string;
    correctedValue: string;
    reason: string;
}

export interface RepairResult {
    content: string;
    corrections: RepairCorrection[];
}

function getFieldSpecsForRecordType(typeCode: string): FieldSpec[] | null {
    switch (typeCode) {
        case RecordType.VOL1: return VOL1_FIELD_SPECS;
        case RecordType.HDR1: return HDR1_FIELD_SPECS;
        case RecordType.HDR2: return HDR2_FIELD_SPECS;
        case RecordType.UHL1: return UHL1_FIELD_SPECS;
        case RecordType.EOF1: return EOF1_FIELD_SPECS;
        case RecordType.EOF2: return EOF2_FIELD_SPECS;
        case RecordType.UTL1: return UTL1_FIELD_SPECS;
        default: return null;
    }
}

function padField(value: string, spec: FieldSpec): string {
    let result = value;
    if (result.length > spec.length) {
        result = result.slice(0, spec.length);
    } else if (result.length < spec.length) {
        if (spec.padSide === 'left') {
            result = result.padStart(spec.length, spec.padChar || ' ');
        } else {
            result = result.padEnd(spec.length, spec.padChar || ' ');
        }
    }
    return result;
}

/**
 * Smart rebuild: handles missing spaces in reserved fields.
 * For each field, if it's a reserved field and the segment at the current
 * position contains non-space characters, we treat it as short and
 * insert the missing spaces, then adjust the position accordingly.
 */
function smartRebuildLine(
    line: string,
    specs: FieldSpec[],
    lineNumber: number,
    corrections: RepairCorrection[],
): string {
    let output = '';
    let pos = 0; // current position in the original line

    for (const spec of specs) {
        const isReserved = spec.name.startsWith('reserved') &&
            spec.padChar === ' ' &&
            spec.padSide === 'right';

        if (isReserved) {
            // Extract segment (may be shorter than spec.length if line is short)
            const segment = line.substr(pos, spec.length);
            const firstNonSpace = segment.search(/\S/);

            // Output the correct number of spaces
            output += ' '.repeat(spec.length);

            if (firstNonSpace === -1) {
                // All spaces, normal case
                pos += spec.length;
            } else {
                // There is non-space, so the reserved field is short.
                // Move pos by the number of spaces before the non-space.
                pos += firstNonSpace;
            }
        } else {
            // Normal field: extract from current pos
            const raw = line.substr(pos, spec.length);
            const corrected = padField(raw, spec);
            if (raw !== corrected) {
                corrections.push({
                    line: lineNumber,
                    field: spec.name,
                    originalValue: raw,
                    correctedValue: corrected,
                    reason: 'padding or whitespace mismatch',
                });
            }
            output += corrected;
            pos += spec.length;
        }
    }

    return output;
}

export function repair(content: string): RepairResult {
    const hasTrailingNewline = content.endsWith('\n');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        return { content, corrections: [] };
    }

    // Determine data record length from first non-control line
    let dataRecordLength: 100 | 106 = 100;
    for (const line of lines) {
        const typeCode = line.substring(0, 4);
        if (!Object.values(RecordType).includes(typeCode as RecordType)) {
            dataRecordLength = line.length === 106 ? 106 : 100;
            break;
        }
    }

    const repairedLines: string[] = [];
    const corrections: RepairCorrection[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const typeCode = line.substring(0, 4);
        const specs = getFieldSpecsForRecordType(typeCode);

        let rebuiltLine: string;
        if (specs) {
            rebuiltLine = smartRebuildLine(line, specs, i + 1, corrections);
        } else {
            const dataSpecs = dataRecordLength === 100 ? DATA_FIELD_SPECS_100 : DATA_FIELD_SPECS_106;
            rebuiltLine = smartRebuildLine(line, dataSpecs, i + 1, corrections);
        }

        // Check line length discrepancy
        const expectedLength = specs
            ? 80
            : dataRecordLength;

        if (line.length !== expectedLength) {
            corrections.push({
                line: i + 1,
                field: 'lineLength',
                originalValue: `${line.length}`,
                correctedValue: `${expectedLength}`,
                reason: `Line length was ${line.length}, expected ${expectedLength}`,
            });
        }

        repairedLines.push(rebuiltLine);
    }

    let result = repairedLines.join('\n');
    if (hasTrailingNewline) result += '\n';

    return { content: result, corrections };
}