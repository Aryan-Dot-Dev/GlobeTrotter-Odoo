export const printToPDF = (orientation = 'landscape') => {
  // Create a style element to force orientation
  
  // Hide elements you don't want in PDF
  const elementsToHide = document.querySelectorAll('.no-print, .trip-actions, nav, header, footer');
  elementsToHide.forEach(el => {
    el.style.display = 'none';
  });

  // Trigger print dialog
  window.print();

  // Restore hidden elements and remove style after print
  setTimeout(() => {
    elementsToHide.forEach(el => {
      el.style.display = '';
    });
    document.head.removeChild(style);
  }, 1000);
};

// You can also create specific functions for different orientations
export const printToPDFLandscape = () => printToPDF('landscape');
// export const printToPDFPortrait = () => printToPDF('portrait');