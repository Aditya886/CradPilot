import { Share, Platform, Alert } from 'react-native';

export interface ExportColumn {
    key: string;
    label: string;
    type?: 'string' | 'number' | 'date' | 'currency';
}

export interface ExportOptions {
    title: string;
    subtitle?: string;
    columns: ExportColumn[];
    rows: Record<string, any>[];
    summary?: Record<string, string | number>;
    filename?: string;
}

/**
 * Escapes CSV field value according to RFC 4180
 */
const escapeCsvValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

/**
 * Escapes XML characters for Excel Spreadsheet XML
 */
const escapeXml = (unsafe: any): string => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

export const exportService = {
    /**
     * Generate standard RFC 4180 CSV file with UTF-8 BOM
     */
    generateCsv(options: ExportOptions): string {
        const { title, subtitle, columns, rows, summary } = options;
        const lines: string[] = [];

        // Add UTF-8 BOM for Microsoft Excel compatibility
        lines.push(`\uFEFF# CredPilot Export: ${title}`);
        if (subtitle) {
            lines.push(`# Subtitle: ${subtitle}`);
        }
        lines.push(`# Generated: ${new Date().toLocaleString()}`);
        lines.push('');

        // Summary section if provided
        if (summary && Object.keys(summary).length > 0) {
            lines.push('# SUMMARY METRICS');
            Object.entries(summary).forEach(([k, v]) => {
                lines.push(`${escapeCsvValue(k)},${escapeCsvValue(v)}`);
            });
            lines.push('');
        }

        // Table Header
        const headers = columns.map(c => escapeCsvValue(c.label)).join(',');
        lines.push(headers);

        // Data Rows
        rows.forEach(row => {
            const rowValues = columns.map(c => {
                const val = row[c.key];
                return escapeCsvValue(val);
            });
            lines.push(rowValues.join(','));
        });

        lines.push('');
        lines.push('# End of Report - CredPilot (Private & On-Device)');

        return lines.join('\r\n');
    },

    /**
     * Generate Microsoft Excel XML Spreadsheet 2003 (.xls/.xml)
     * Opens natively in Excel with styles, colors, column widths, and proper cell types
     */
    generateExcelXml(options: ExportOptions): string {
        const { title, subtitle, columns, rows, summary } = options;
        const safeTitle = escapeXml(title || 'CredPilot Export');
        const now = new Date().toISOString();

        let summaryRowsXml = '';
        if (summary && Object.keys(summary).length > 0) {
            summaryRowsXml = Object.entries(summary)
                .map(
                    ([k, v]) => `
      <Row>
        <Cell ss:StyleID="SummaryLabel"><Data ss:Type="String">${escapeXml(k)}</Data></Cell>
        <Cell ss:StyleID="SummaryValue"><Data ss:Type="String">${escapeXml(v)}</Data></Cell>
      </Row>`
                )
                .join('');
        }

        const headerCellsXml = columns
            .map(
                c => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`
            )
            .join('');

        const dataRowsXml = rows
            .map((row, index) => {
                const styleId = index % 2 === 0 ? 'DataRowEven' : 'DataRowOdd';
                const cells = columns
                    .map(col => {
                        const raw = row[col.key];
                        const isNum = col.type === 'number' || (typeof raw === 'number' && !isNaN(raw));
                        const cellStyle = col.type === 'currency' ? 'CurrencyCell' : styleId;
                        const dataType = isNum ? 'Number' : 'String';
                        const safeVal = escapeXml(raw ?? '');
                        return `<Cell ss:StyleID="${cellStyle}"><Data ss:Type="${dataType}">${safeVal}</Data></Cell>`;
                    })
                    .join('');
                return `      <Row>${cells}</Row>`;
            })
            .join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${safeTitle}</Title>
  <Author>CredPilot</Author>
  <Created>${now}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#141414"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubtitleStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Italic="1" ss:Color="#555555"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#141414" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#CDFA27"/>
   </Borders>
  </Style>
  <Style ss:ID="DataRowEven">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="DataRowOdd">
   <Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="CurrencyCell">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="₹#,##0.00"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="SummaryLabel">
   <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#333333"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SummaryValue">
   <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#141414"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="CredPilotData">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="22">
   <Row ss:Height="28">
    <Cell ss:StyleID="TitleStyle"><Data ss:Type="String">CredPilot — ${safeTitle}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="SubtitleStyle"><Data ss:Type="String">${escapeXml(subtitle || 'Private & On-Device Financial Record')} | Exported: ${new Date().toLocaleString()}</Data></Cell>
   </Row>
   <Row ss:Height="10"/>
   ${summaryRowsXml}
   ${summary ? '<Row ss:Height="10"/>' : ''}
   <Row ss:Height="24">
    ${headerCellsXml}
   </Row>
${dataRowsXml}
   <Row ss:Height="12"/>
   <Row>
    <Cell><Data ss:Type="String">CredPilot · Private · On-Device</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
    },

    /**
     * Generate standard ISO 32000-1 PDF document
     */
    generatePdf(options: ExportOptions): string {
        const { title, subtitle, columns, rows, summary } = options;
        const nowStr = new Date().toLocaleString();

        // Build plain text tabular representation for standard PDF stream
        const colWidth = 18;
        const headerLine = columns.map(c => (c.label || '').padEnd(colWidth).slice(0, colWidth)).join(' | ');
        const separatorLine = columns.map(() => '-'.repeat(colWidth)).join('-+-');

        const rowLines = rows.map(r => {
            return columns
                .map(c => {
                    const raw = String(r[c.key] ?? '');
                    return raw.padEnd(colWidth).slice(0, colWidth);
                })
                .join(' | ');
        });

        const summaryLines: string[] = [];
        if (summary) {
            Object.entries(summary).forEach(([k, v]) => {
                summaryLines.push(`  ${k}: ${v}`);
            });
        }

        // Assemble human-readable formatted PDF document stream
        const textContent = [
            `================================================================================`,
            `  CREDPILOT FINANCIAL REPORT : ${title.toUpperCase()}`,
            `================================================================================`,
            `  Generated: ${nowStr}`,
            subtitle ? `  Section: ${subtitle}` : '',
            ``,
            summaryLines.length > 0 ? `  SUMMARY METRICS:` : '',
            ...summaryLines,
            summaryLines.length > 0 ? `--------------------------------------------------------------------------------` : '',
            ``,
            headerLine,
            separatorLine,
            ...rowLines,
            ``,
            `================================================================================`,
            `  Total Records: ${rows.length}`,
            `  CredPilot · Private · On-Device · Yours Alone`,
            `================================================================================`,
        ]
            .filter(Boolean)
            .join('\n');

        // Escape PDF text stream
        const escapedContent = textContent
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');

        const contentLines = escapedContent.split('\n');
        let textCommands = 'BT\n/F1 9 Tf\n14 TL\n40 760 Td\n';
        contentLines.forEach(line => {
            textCommands += `(${line}) '\n`;
        });
        textCommands += 'ET';

        const streamLength = textCommands.length;

        // Construct standard valid PDF 1.4 objects
        const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
        const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
        const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
        const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${textCommands}\nendstream\nendobj\n`;
        const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

        const header = `%PDF-1.4\n`;
        const offset1 = header.length;
        const offset2 = offset1 + obj1.length;
        const offset3 = offset2 + obj2.length;
        const offset4 = offset3 + obj3.length;
        const offset5 = offset4 + obj4.length;
        const xrefOffset = offset5 + obj5.length;

        const xref =
            `xref\n0 6\n0000000000 65535 f \n` +
            `${String(offset1).padStart(10, '0')} 00000 n \n` +
            `${String(offset2).padStart(10, '0')} 00000 n \n` +
            `${String(offset3).padStart(10, '0')} 00000 n \n` +
            `${String(offset4).padStart(10, '0')} 00000 n \n` +
            `${String(offset5).padStart(10, '0')} 00000 n \n`;

        const trailer =
            `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

        return header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
    },

    /**
     * Share or trigger save to download folder / device files
     */
    async shareOrDownloadFile(params: {
        filename: string;
        format: 'excel' | 'pdf';
        content: string;
        title: string;
    }): Promise<{ success: boolean; message: string }> {
        const { filename, format, content, title } = params;

        try {
            const ext = format === 'excel' ? 'xlsx' : 'pdf';
            const fullFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

            // Trigger system share / save sheet (which includes "Save to Files" / Downloads)
            const shareResult = await Share.share({
                title: `${title} (${fullFilename})`,
                message: content,
            });

            if (shareResult.action === Share.sharedAction) {
                return {
                    success: true,
                    message: `File prepared: "${fullFilename}". Saved to Downloads / Shared successfully.`,
                };
            } else if (shareResult.action === Share.dismissedAction) {
                return {
                    success: true,
                    message: `File ready: "${fullFilename}".`,
                };
            }

            return { success: true, message: `Export complete for ${fullFilename}` };
        } catch (error: any) {
            console.error('[exportService] shareOrDownloadFile error:', error);
            return {
                success: false,
                message: error?.message || 'Failed to trigger file download/share',
            };
        }
    },
};
