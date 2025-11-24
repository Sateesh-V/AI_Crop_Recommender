import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaDownload } from 'react-icons/fa';

const ExportButton = ({ contentRef, inputs }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!contentRef.current) {
      console.error("Export error: No content ref found.");
      return;
    }

    setIsExporting(true);
    const elementToCapture = contentRef.current;

    // Get original styles to restore them later
    const originalBg = elementToCapture.style.backgroundColor;
    const originalBoxShadow = elementToCapture.style.boxShadow;
    
    // Temporarily set a solid white background for capture
    elementToCapture.style.backgroundColor = '#ffffff';
    elementToCapture.style.boxShadow = 'none';

    html2canvas(elementToCapture, {
      scale: 2, // Double resolution
      backgroundColor: '#ffffff', // Ensure background is white
      logging: false, // Hide console logs
      useCORS: true, // For images
      onclone: (document) => {
        // This function runs on the *cloned* document before capture
        // This is where we force all styles for the PDF
        
        const clonedElement = document.getElementById(elementToCapture.id);
        if (!clonedElement) return;

        // 1. Hide unwanted elements
        const proTip = clonedElement.querySelector('.pro-tip');
        if (proTip) proTip.style.display = 'none';
        
        const exportButton = clonedElement.querySelector('.export-button');
        if (exportButton) exportButton.style.display = 'none';

        // 2. Force all text to be black for readability
        const textSelectors = [
          'h2', 'h3', 'h4', 'p', 'span', 'li', 'div',
          '.user-input-title', '.input-label', '.input-value',
          '.top-pick h3', '.top-pick .confidence', '.top-label',
          '.other-options-title', '.crop-name', '.crop-confidence',
          '.chart-title'
        ];
        
        clonedElement.querySelectorAll(textSelectors.join(', ')).forEach(el => {
          el.style.color = '#000000 !important'; // Force black
          el.style.background = 'none'; // Ensure no transparent backgrounds
        });
        
        // 3. Force chart text (SVG) to be black
        clonedElement.querySelectorAll('text, .recharts-text').forEach(el => {
          el.style.fill = '#000000'; // Force black fill for SVG text
        });

        // 4. Force Recharts legend
        clonedElement.querySelectorAll('.recharts-legend-item-text').forEach(el => {
          el.style.color = '#000000 !important'; // Legend text
        });

        // 5. Force Recharts axis (if any were on this page)
        clonedElement.querySelectorAll('.recharts-cartesian-axis-tick text').forEach(el => {
          el.style.fill = '#000000';
        });

        // 6. Force Pie Chart labels
        clonedElement.querySelectorAll('.recharts-pie-label-text').forEach(el => {
          el.style.fill = '#000000';
        });
      }
    }).then(canvas => {
      // --- Restore original styles to the live page ---
      elementToCapture.style.backgroundColor = originalBg;
      elementToCapture.style.boxShadow = originalBoxShadow;
      // ---

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size portrait
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - 20; // Add 10mm margin on each side
      const imgHeight = imgWidth / ratio;

      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin
      const leftMargin = 10; // 10mm left margin

      // Add the first page
      pdf.addImage(imgData, 'PNG', leftMargin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Subtract page height minus margins

      // Add new pages if needed
      while (heightLeft > 0) {
        position = -heightLeft - 10; // Move position up
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', leftMargin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }
      
      const fileName = `agripredict_report_${inputs?.city || 'custom'}.pdf`;
      pdf.save(fileName);
      setIsExporting(false);

    }).catch(err => {
      console.error("Error exporting PDF:", err);
      // Restore styles even if there's an error
      elementToCapture.style.backgroundColor = originalBg;
      elementToCapture.style.boxShadow = originalBoxShadow;
      setIsExporting(false);
    });
  };

  return (
    <button 
      className="export-button" 
      onClick={handleExport} 
      disabled={isExporting}
    >
      <FaDownload style={{ marginRight: '0.5rem' }} />
      {isExporting ? 'Exporting...' : 'Export Results to PDF'}
    </button>
  );
};

export default ExportButton;