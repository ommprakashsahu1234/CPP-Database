import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateResultPDF = async (result, student, test) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `result_${student.rollNumber}_${test._id}.pdf`;
      const filePath = path.join(process.cwd(), 'temp', fileName);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Test Result Report', { align: 'center' });
      doc.moveDown();

      // Student Details
      doc.fontSize(12).text(`Student Name: ${student.name}`);
      doc.text(`Roll Number: ${student.rollNumber}`);
      doc.text(`Email: ${student.email}`);
      doc.moveDown();

      // Test Details
      doc.text(`Test Title: ${test.title}`);
      doc.text(`Subject: ${test.subject?.name || 'N/A'}`);
      doc.text(`Date: ${new Date(test.scheduledDate).toLocaleDateString()}`);
      doc.moveDown();

      // Results
      doc.fontSize(14).text('Performance:', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Marks: ${result.totalMarks}`);
      doc.text(`Obtained Marks: ${result.obtainedMarks}`);
      doc.text(`Percentage: ${result.percentage.toFixed(2)}%`);
      doc.text(`Status: ${result.isPassed ? 'PASSED' : 'FAILED'}`, {
        color: result.isPassed ? 'green' : 'red'
      });
      doc.moveDown();

      // Question-wise breakdown
      doc.fontSize(14).text('Question-wise Analysis:', { underline: true });
      doc.fontSize(10);
      result.answers.forEach((answer, index) => {
        doc.moveDown(0.5);
        doc.text(`Q${index + 1}: ${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'} - Marks: ${answer.marksAwarded}`);
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateReportPDF = async (data, title, headers, rows) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `report_${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), 'temp', fileName);

      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(2);

      // Create table
      const tableTop = doc.y;
      const itemHeight = 25;
      let currentY = tableTop;

      // Headers
      doc.fontSize(10).fillColor('black');
      headers.forEach((header, i) => {
        doc.text(header, 50 + (i * 100), currentY, { width: 90 });
      });

      currentY += itemHeight;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 5;

      // Rows
      rows.forEach(row => {
        row.forEach((cell, i) => {
          doc.text(cell.toString(), 50 + (i * 100), currentY, { width: 90 });
        });
        currentY += itemHeight;
      });

      doc.moveDown(2);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
