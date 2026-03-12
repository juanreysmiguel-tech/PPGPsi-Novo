import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as xlsx from 'xlsx';

// Helper to keep qualis data in memory, simulating a small DB
let qualisCache: any[] | null = null;
let lastModified: number = 0;

function loadQualisData() {
    const filePath = path.join(process.cwd(), 'qualis.xlsx');

    if (!fs.existsSync(filePath)) {
        console.error('Qualis file not found at:', filePath);
        return [];
    }

    const stats = fs.statSync(filePath);

    // Reload only if file has changed or cache is empty
    if (!qualisCache || stats.mtimeMs > lastModified) {
        try {
            console.log('Loading Qualis data from Excel file...');
            const file = xlsx.readFile(filePath);
            const sheetName = file.SheetNames[0];
            const sheet = file.Sheets[sheetName];

            // The Excel might have headers like: ISSN, Título, Área de Avaliação, Estrato
            // So we map them to our standard keys
            const rawData = xlsx.utils.sheet_to_json(sheet) as any[];

            qualisCache = rawData.map(row => ({
                issn: row['ISSN'] || row['issn'] || '',
                titulo: String(row['Título'] || row['Titulo'] || row['titulo'] || '').toUpperCase(),
                areaAvaliacao: row['Área de Avaliação'] || row['Area de Avaliacao'] || '',
                estrato: row['Estrato'] || row['estrato'] || '',
                evento: row['Evento'] || row['evento'] || ''
            }));

            lastModified = stats.mtimeMs;
            console.log(`Loaded ${qualisCache.length} qualis entries.`);
        } catch (e) {
            console.error('Error reading Qualis file:', e);
            return [];
        }
    }

    return qualisCache;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const issn = searchParams.get('issn')?.trim();
    const titulo = searchParams.get('titulo')?.trim()?.toUpperCase();

    if (!issn && !titulo) {
        return NextResponse.json({
            success: false,
            message: 'Provide issn or titulo to search.'
        }, { status: 400 });
    }

    try {
        const data = loadQualisData();

        if (!data || data.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Could not load Qualis data. Check if qualis.xlsx is available.'
            }, { status: 500 });
        }

        let results = data;

        if (issn) {
            results = results.filter(item => item.issn === issn);
        } else if (titulo) {
            results = results.filter(item => item.titulo.includes(titulo));
        }

        // Limit to prevent huge payloads
        const limitedResults = results.slice(0, 20);

        return NextResponse.json({
            success: true,
            totalFound: results.length,
            limitReached: results.length > 20,
            results: limitedResults
        });

    } catch (error: any) {
        console.error('Qualis API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
