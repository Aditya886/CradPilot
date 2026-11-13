import { query, insert, removeWhere } from '../storage/local/sqlite';
import { tuitionStorage, TuitionStudent, TuitionPendingFee, TuitionAttendanceRecord } from './tuitionStorage';

export interface ImportParseResult {
    success: boolean;
    message: string;
    rowCount: number;
    data?: any;
}

export const importService = {
    /**
     * Validate that the file format is allowed (only PDF and Excel .xlsx/.xls/.csv are allowed)
     */
    validateFormat(filenameOrType: string): { valid: boolean; format: 'excel' | 'pdf' | 'invalid' } {
        const lower = (filenameOrType || '').toLowerCase().trim();
        if (
            lower.endsWith('.xlsx') ||
            lower.endsWith('.xls') ||
            lower.endsWith('.csv') ||
            lower.includes('spreadsheet') ||
            lower.includes('excel') ||
            lower.includes('comma-separated')
        ) {
            return { valid: true, format: 'excel' };
        }
        if (lower.endsWith('.pdf') || lower.includes('pdf')) {
            return { valid: true, format: 'pdf' };
        }
        // In case of pasted raw CSV or tabular text
        if (lower.includes(',') || lower.includes('\t') || lower.includes('credpilot') || lower.startsWith('{')) {
            return { valid: true, format: 'excel' };
        }
        return { valid: false, format: 'invalid' };
    },

    /**
     * Parses standard CSV / TSV text or Excel XML data into headers and row objects
     */
    parseTabularData(raw: string): { headers: string[]; rows: Record<string, string>[] } {
        const clean = (raw || '').replace(/\uFEFF/g, '').trim();
        if (!clean) return { headers: [], rows: [] };

        // Handle JSON backup format if exported as structured backup
        if (clean.startsWith('{') && clean.endsWith('}')) {
            try {
                const parsed = JSON.parse(clean);
                if (parsed.rows && Array.isArray(parsed.rows)) {
                    const headers = parsed.columns?.map((c: any) => c.key || c.label) || Object.keys(parsed.rows[0] || {});
                    return { headers, rows: parsed.rows };
                }
            } catch (e) {
                // proceed with tabular parsing
            }
        }

        // Handle Excel XML Spreadsheet
        if (clean.includes('<Workbook') && clean.includes('<Table>')) {
            return this.parseExcelXml(clean);
        }

        // Standard CSV / TSV parsing
        const lines = clean.split(/\r?\n/).filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('==');
        });

        if (lines.length === 0) return { headers: [], rows: [] };

        // Determine delimiter: comma or tab or pipe
        const sampleLine = lines[0];
        let delimiter = ',';
        if (sampleLine.includes('\t')) delimiter = '\t';
        else if (sampleLine.includes('|') && !sampleLine.includes(',')) delimiter = '|';

        const parseLine = (line: string): string[] => {
            const values: string[] = [];
            let inQuotes = false;
            let current = '';

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === delimiter && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            return values;
        };

        const rawHeaders = parseLine(lines[0]);
        const cleanHeaders = rawHeaders.map(h => h.replace(/["']/g, '').trim());

        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
            const lineValues = parseLine(lines[i]);
            if (lineValues.length === 0 || (lineValues.length === 1 && lineValues[0] === '')) continue;

            const rowObj: Record<string, string> = {};
            cleanHeaders.forEach((header, index) => {
                rowObj[header] = lineValues[index] !== undefined ? lineValues[index] : '';
                // Also provide normalized lowercase key without spaces
                const normalizedKey = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                rowObj[normalizedKey] = rowObj[header];
            });
            rows.push(rowObj);
        }

        return { headers: cleanHeaders, rows };
    },

    /**
     * Parses Excel XML Spreadsheet format into tabular rows
     */
    parseExcelXml(xml: string): { headers: string[]; rows: Record<string, string>[] } {
        const rows: Record<string, string>[] = [];
        let headers: string[] = [];

        const rowMatches = xml.match(/<Row[^>]*>[\s\S]*?<\/Row>/gi) || [];
        const extractedRowData: string[][] = [];

        rowMatches.forEach(rowXml => {
            const cellMatches = rowXml.match(/<Data[^>]*>([\s\S]*?)<\/Data>/gi) || [];
            const cells = cellMatches.map(c => {
                return c.replace(/<Data[^>]*>/, '').replace(/<\/Data>/, '').trim();
            });
            if (cells.length > 0) {
                extractedRowData.push(cells);
            }
        });

        // Find header row (first row with multiple columns)
        let headerIndex = -1;
        for (let i = 0; i < extractedRowData.length; i++) {
            if (extractedRowData[i].length >= 2) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex >= 0) {
            headers = extractedRowData[headerIndex];
            for (let i = headerIndex + 1; i < extractedRowData.length; i++) {
                const cellValues = extractedRowData[i];
                const rowObj: Record<string, string> = {};
                headers.forEach((h, idx) => {
                    rowObj[h] = cellValues[idx] || '';
                    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                    rowObj[norm] = rowObj[h];
                });
                rows.push(rowObj);
            }
        }

        return { headers, rows };
    },

    /**
     * 1. Import Tuition Students
     */
    async importStudents(rawInput: string): Promise<ImportParseResult> {
        try {
            const { rows } = this.parseTabularData(rawInput);
            if (rows.length === 0) {
                return { success: false, message: 'No valid student rows found in input', rowCount: 0 };
            }

            const current = await tuitionStorage.getStudents();
            const newStudents: TuitionStudent[] = [];

            rows.forEach((r, idx) => {
                const name = r['name'] || r['studentname'] || r['student'] || r['Name'] || '';
                if (!name.trim()) return;

                const fee = parseFloat(r['feeamount'] || r['fee'] || r['amount'] || '1500') || 1500;
                const student: TuitionStudent = {
                    id: String(Date.now() + idx),
                    name: name.trim(),
                    classGrade: r['classgrade'] || r['class'] || r['grade'] || 'Class 10',
                    parentName: r['parentname'] || r['parent'] || 'Parent of ' + name.trim(),
                    phone: r['phone'] || r['contact'] || '+91 98765 43210',
                    subjects: (r['subjects'] || r['subject'] || 'Mathematics').split(/[,;]/).map(s => s.trim()),
                    batchName: r['batchname'] || r['batch'] || 'Morning Juniors',
                    batchTiming: r['batchtiming'] || r['timing'] || '7:00 AM – 8:30 AM',
                    feeAmount: fee,
                    feePeriod: r['feeperiod'] || 'month',
                    feeStatus: r['feestatus'] || r['status'] || 'Due Soon',
                    dueInfo: r['dueinfo'] || r['duedate'] || 'Next due 20th',
                    attendanceStatus: 'Not marked',
                    isActive: true,
                };
                newStudents.push(student);
            });

            if (newStudents.length === 0) {
                return { success: false, message: 'Could not extract student names from data', rowCount: 0 };
            }

            // Merge with existing students without duplicate names
            const merged = [...newStudents, ...current.filter(c => !newStudents.some(n => n.name.toLowerCase() === c.name.toLowerCase()))];
            await tuitionStorage.saveStudents(merged);

            return {
                success: true,
                message: `Successfully imported ${newStudents.length} students into Tuition Center!`,
                rowCount: newStudents.length,
                data: merged,
            };
        } catch (e: any) {
            console.error('[importService] importStudents error:', e);
            return { success: false, message: e?.message || 'Failed to import students', rowCount: 0 };
        }
    },

    /**
     * 2. Import Attendance Records
     */
    async importAttendance(rawInput: string, defaultDate?: string): Promise<ImportParseResult> {
        try {
            const { rows } = this.parseTabularData(rawInput);
            if (rows.length === 0) {
                return { success: false, message: 'No attendance rows found in input', rowCount: 0 };
            }

            const targetDate = defaultDate || new Date().toISOString().split('T')[0];
            const records: TuitionAttendanceRecord[] = [];

            rows.forEach((r, idx) => {
                const name = r['name'] || r['studentname'] || r['student'] || '';
                if (!name.trim()) return;

                const rawStatus = (r['status'] || r['attendance'] || 'Present').trim().toLowerCase();
                const status = rawStatus.includes('absent') || rawStatus === 'a' ? 'Absent' : 'Present';

                records.push({
                    id: String(Date.now() + idx),
                    studentId: String(idx + 1),
                    name: name.trim(),
                    date: r['date'] || targetDate,
                    status,
                    classGrade: r['classgrade'] || r['class'] || 'Class 10',
                    batchName: r['batchname'] || r['batch'] || 'All Batches',
                    selectedSubjects: (r['subjects'] || 'Mathematics').split(/[,;]/).map(s => s.trim()),
                    phone: r['phone'] || '',
                });
            });

            const current = await tuitionStorage.getAttendanceRecords();
            // Filter out old records for the same date and students
            const filtered = current.filter(c => !records.some(n => n.name.toLowerCase() === c.name.toLowerCase() && n.date === c.date));
            const merged = [...records, ...filtered];
            await tuitionStorage.saveAttendanceRecords(merged);

            return {
                success: true,
                message: `Imported attendance for ${records.length} students on ${targetDate}`,
                rowCount: records.length,
                data: records,
            };
        } catch (e: any) {
            console.error('[importService] importAttendance error:', e);
            return { success: false, message: e?.message || 'Failed to import attendance', rowCount: 0 };
        }
    },

    /**
     * 3. Import Tuition Fees / Payments
     */
    async importPendingFees(rawInput: string): Promise<ImportParseResult> {
        try {
            const { rows } = this.parseTabularData(rawInput);
            if (rows.length === 0) {
                return { success: false, message: 'No fee records found in data', rowCount: 0 };
            }

            const items: TuitionPendingFee[] = [];
            rows.forEach((r, idx) => {
                const name = r['name'] || r['studentname'] || r['student'] || '';
                if (!name.trim()) return;

                const amount = parseFloat(r['amount'] || r['feeamount'] || r['fee'] || '1000') || 1000;
                const status = (r['status'] || r['statustype'] || 'due_soon').toLowerCase();

                items.push({
                    id: String(Date.now() + idx),
                    name: name.trim(),
                    classGrade: r['classgrade'] || r['class'] || 'Class 10',
                    feeAmount: amount,
                    dueFormatted: r['dueformatted'] || r['duedate'] || 'Due Soon',
                    statusType: status.includes('overdue') ? 'overdue' : status.includes('paid') ? 'paid' : 'due_soon',
                    daysText: r['daystext'] || 'Due this month',
                    category: status.includes('overdue') ? 'overdue' : 'this_month',
                });
            });

            await tuitionStorage.savePendingFees(items);
            return {
                success: true,
                message: `Successfully imported ${items.length} fee / payment records`,
                rowCount: items.length,
                data: items,
            };
        } catch (e: any) {
            console.error('[importService] importPendingFees error:', e);
            return { success: false, message: e?.message || 'Failed to import fees', rowCount: 0 };
        }
    },

    /**
     * 4. Import Trip Budget / Plan into SQLite
     * Directly inserts into `plans`, `plan_spends`, and `plan_members`!
     */
    async importTripPlan(rawInput: string, fallbackTitle?: string): Promise<ImportParseResult> {
        try {
            const { headers, rows } = this.parseTabularData(rawInput);
            if (rows.length === 0) {
                return { success: false, message: 'No trip or budget items found in input', rowCount: 0 };
            }

            let tripTitle = fallbackTitle || 'Trip Budget Plan';
            let tripType = 'Group';
            let totalBudget = 0;
            const spendsToInsert: { title: string; amount: number; paidBy: string; date: string }[] = [];
            const membersSet = new Set<string>();

            // Check if rows represent spends or a plan summary
            rows.forEach(r => {
                // Check if title or spend name is present
                const itemTitle = r['title'] || r['item'] || r['spend'] || r['expense'] || r['description'] || '';
                const amount = parseFloat(r['amount'] || r['cost'] || r['total'] || r['budget'] || '0') || 0;
                const paidBy = r['paidby'] || r['member'] || r['person'] || r['payer'] || 'You';
                const date = r['date'] || new Date().toISOString().split('T')[0];

                if (r['plantitle'] || r['triptitle']) {
                    tripTitle = r['plantitle'] || r['triptitle'];
                }
                if (r['type'] && (r['type'].toLowerCase() === 'single' || r['type'].toLowerCase() === 'group')) {
                    tripType = r['type'];
                }

                if (itemTitle && amount > 0) {
                    spendsToInsert.push({ title: itemTitle, amount, paidBy, date });
                    membersSet.add(paidBy);
                    totalBudget += amount;
                }
            });

            if (spendsToInsert.length === 0) {
                // If only budget was provided
                const firstRow = rows[0];
                totalBudget = parseFloat(firstRow['total'] || firstRow['budget'] || firstRow['amount'] || '10000') || 10000;
                tripTitle = firstRow['title'] || firstRow['name'] || tripTitle;
            }

            // If budget is still 0, assign a reasonable default
            if (totalBudget === 0) totalBudget = 25000;

            // 1. Insert plan into SQLite table `plans`
            const now = new Date().toISOString();
            insert('plans', {
                title: tripTitle,
                type: tripType,
                total: totalBudget,
                note: `Imported on ${new Date().toLocaleDateString()}`,
                created_at: now,
            });

            // Get inserted plan ID
            const insertedPlans = query('SELECT id FROM plans WHERE title = ? ORDER BY id DESC LIMIT 1', [tripTitle]);
            const planId = insertedPlans && insertedPlans.length > 0 ? insertedPlans[0].id : null;

            if (planId) {
                // 2. Insert members into `plan_members`
                const membersList = Array.from(membersSet);
                if (membersList.length === 0) membersList.push('You');

                const equalShare = Math.round(totalBudget / membersList.length);
                membersList.forEach(m => {
                    const memberPaid = spendsToInsert
                        .filter(s => s.paidBy.toLowerCase() === m.toLowerCase())
                        .reduce((sum, s) => sum + s.amount, 0);

                    insert('plan_members', {
                        plan_id: planId,
                        name: m,
                        paid: memberPaid,
                        owes: equalShare,
                    });
                });

                // 3. Insert spends into `plan_spends`
                spendsToInsert.forEach(s => {
                    insert('plan_spends', {
                        plan_id: planId,
                        title: s.title,
                        amount: s.amount,
                        paid_by: s.paidBy,
                        date: s.date,
                    });
                });
            }

            return {
                success: true,
                message: `Successfully imported "${tripTitle}" with ${spendsToInsert.length} expense items!`,
                rowCount: spendsToInsert.length,
                data: { planId, tripTitle, totalBudget, spends: spendsToInsert },
            };
        } catch (e: any) {
            console.error('[importService] importTripPlan error:', e);
            return { success: false, message: e?.message || 'Failed to import trip budget', rowCount: 0 };
        }
    },

    /**
     * 5. Import Debts into SQLite
     * Inserts into `debt_persons` and `debt_transactions`
     */
    async importDebts(rawInput: string): Promise<ImportParseResult> {
        try {
            const { rows } = this.parseTabularData(rawInput);
            if (rows.length === 0) {
                return { success: false, message: 'No debt records found in data', rowCount: 0 };
            }

            let insertedTxns = 0;
            const now = new Date().toISOString();

            rows.forEach((r, idx) => {
                const name = r['name'] || r['person'] || r['contact'] || '';
                if (!name.trim()) return;

                const phone = r['phone'] || `98000000${idx}`;
                const amount = parseFloat(r['amount'] || r['balance'] || '0') || 0;
                const type = (r['type'] || 'outgoing').toLowerCase().includes('in') ? 'incoming' : 'outgoing';
                const date = r['date'] || now.split('T')[0];
                const mode = r['mode'] || 'Cash';
                const notes = r['notes'] || 'Imported debt';

                // Find or insert person
                const existingPerson = query('SELECT id FROM debt_persons WHERE LOWER(name) = ? LIMIT 1', [name.trim().toLowerCase()]);
                let personId: number;

                if (existingPerson && existingPerson.length > 0) {
                    personId = existingPerson[0].id;
                } else {
                    insert('debt_persons', {
                        name: name.trim(),
                        phone,
                        created_at: now,
                    });
                    const p = query('SELECT id FROM debt_persons WHERE LOWER(name) = ? ORDER BY id DESC LIMIT 1', [name.trim().toLowerCase()]);
                    personId = p[0].id;
                }

                if (amount > 0 && personId) {
                    insert('debt_transactions', {
                        person_id: personId,
                        amount,
                        type,
                        date,
                        mode,
                        notes,
                    });
                    insertedTxns++;
                }
            });

            return {
                success: true,
                message: `Successfully imported ${insertedTxns} debt transactions into CredPilot!`,
                rowCount: insertedTxns,
            };
        } catch (e: any) {
            console.error('[importService] importDebts error:', e);
            return { success: false, message: e?.message || 'Failed to import debts', rowCount: 0 };
        }
    },

    /**
     * 6. Complete App Backup Restore (Transfer to new device / Account switch)
     */
    async importCompleteAppBackup(rawInput: string): Promise<ImportParseResult> {
        try {
            const clean = (rawInput || '').trim();
            let backupData: any = null;

            if (clean.startsWith('{') && clean.endsWith('}')) {
                backupData = JSON.parse(clean);
            } else {
                // If CSV or XML, parse tabular records
                const { rows } = this.parseTabularData(clean);
                backupData = { genericRows: rows };
            }

            if (!backupData) {
                return { success: false, message: 'Invalid backup file structure', rowCount: 0 };
            }

            let restoredCount = 0;

            // Restore borrowers & loans
            if (backupData.borrowers && Array.isArray(backupData.borrowers)) {
                backupData.borrowers.forEach((b: any) => {
                    try {
                        insert('borrowers', { name: b.name, phone: b.phone, address: b.address || '' });
                        restoredCount++;
                    } catch (e) {}
                });
            }

            if (backupData.loans && Array.isArray(backupData.loans)) {
                backupData.loans.forEach((l: any) => {
                    try {
                        insert('loans', l);
                        restoredCount++;
                    } catch (e) {}
                });
            }

            // Restore debts
            if (backupData.debt_persons && Array.isArray(backupData.debt_persons)) {
                backupData.debt_persons.forEach((dp: any) => {
                    try {
                        insert('debt_persons', { name: dp.name, phone: dp.phone, created_at: dp.created_at || new Date().toISOString() });
                        restoredCount++;
                    } catch (e) {}
                });
            }

            if (backupData.debt_transactions && Array.isArray(backupData.debt_transactions)) {
                backupData.debt_transactions.forEach((dt: any) => {
                    try {
                        insert('debt_transactions', dt);
                        restoredCount++;
                    } catch (e) {}
                });
            }

            // Restore plans & trips
            if (backupData.plans && Array.isArray(backupData.plans)) {
                backupData.plans.forEach((p: any) => {
                    try {
                        insert('plans', { title: p.title, type: p.type, total: p.total, note: p.note || '', created_at: p.created_at || new Date().toISOString() });
                        restoredCount++;
                    } catch (e) {}
                });
            }

            // Restore Tuition
            if (backupData.tuition_students && Array.isArray(backupData.tuition_students)) {
                await tuitionStorage.saveStudents(backupData.tuition_students);
                restoredCount += backupData.tuition_students.length;
            }

            if (backupData.tuition_attendance && Array.isArray(backupData.tuition_attendance)) {
                await tuitionStorage.saveAttendanceRecords(backupData.tuition_attendance);
                restoredCount += backupData.tuition_attendance.length;
            }

            return {
                success: true,
                message: `Complete backup successfully restored! Synchronized ${restoredCount} records across all sections.`,
                rowCount: restoredCount,
                data: backupData,
            };
        } catch (e: any) {
            console.error('[importService] importCompleteAppBackup error:', e);
            return { success: false, message: e?.message || 'Failed to restore complete backup', rowCount: 0 };
        }
    },
};
