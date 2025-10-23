import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export const generateResultsExcel = async (results, testTitle) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Results');

    // Add title
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `Test Results - ${testTitle}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    // Add headers
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Roll Number',
      'Student Name',
      'Total Marks',
      'Obtained Marks',
      'Percentage',
      'Status'
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    // Add data
    results.forEach(result => {
      worksheet.addRow([
        result.student?.rollNumber || 'N/A',
        result.student?.name || 'N/A',
        result.totalMarks,
        result.obtainedMarks,
        `${result.percentage.toFixed(2)}%`,
        result.isPassed ? 'PASSED' : 'FAILED'
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Save file
    const fileName = `results_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'temp', fileName);

    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    throw error;
  }
};

export const generatePerformanceExcel = async (data, title) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance Report');

    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = title;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]);
    const headerRow = worksheet.addRow(['Student', 'Tests Taken', 'Average Score', 'Pass Rate', 'Rank']);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    data.forEach(item => {
      worksheet.addRow([
        item.studentName,
        item.testsTaken,
        `${item.averageScore.toFixed(2)}%`,
        `${item.passRate.toFixed(2)}%`,
        item.rank
      ]);
    });

    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    const fileName = `performance_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'temp', fileName);

    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    throw error;
  }
};
