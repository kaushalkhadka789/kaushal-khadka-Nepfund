import { jsPDF } from 'jspdf';
import { ORGANIZATION_LOGO, DIGITAL_SIGNATURE } from './receiptAssets.js';

export const generateReceiptBuffer = (amount, userName, trxId) => {
  // 1. Initialize the document (This was likely missing!)
  const doc = new jsPDF();
  
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Format the ID safely
  const displayTrxId = `#TRX-${trxId?.toString().slice(-4).toUpperCase() || 'N/A'}`;
  // This line converts the input to a readable string
  const numAmount = Number(amount);
  const displayAmount = (!isNaN(numAmount) && numAmount > 0) ? numAmount.toLocaleString() : '0';

  // 2. WATERMARK
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(60);
  doc.text("OFFICIAL RECEIPT", 105, 150, { align: "center", angle: 45 });

  // 3. HEADER & LOGO
  try {
    doc.addImage(ORGANIZATION_LOGO, 'PNG', 20, 15, 25, 25);
  } catch (e) { console.error("Logo Error"); }

  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text("IMPACT PLATFORM", 50, 25);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Katari, Bagmati Province, Nepal", 50, 31);

  // 4. DETAILS
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Receipt Details", 20, 55);
  doc.setFontSize(10);
  doc.text(`Donor Name: ${userName}`, 20, 65);
  doc.text(`Receipt ID: ${displayTrxId}`, 20, 72);
  doc.text(`Date: ${date}`, 20, 79);

  // 5. TABLE
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 90, 170, 10, 'F');
  doc.text("Description", 25, 97);
  doc.text("Amount (NPR)", 150, 97);
  doc.text("Charitable Donation", 25, 110);
  doc.text(`Rs. ${displayAmount}`, 150, 110);

  // 6. SIGNATURE
  try {
    doc.addImage(DIGITAL_SIGNATURE, 'PNG', 145, 172, 35, 15);
  } catch (e) { console.error("Signature Error"); }
  doc.line(140, 190, 185, 190);
  doc.text("Authorized Signatory", 162.5, 195, { align: "center" });

  // Return as Buffer
  return Buffer.from(doc.output('arraybuffer'));
};