const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class CertificateGenerator {
    constructor() {
        this.certificatesDir = path.join(__dirname, '..', 'certificates');
        this.ensureCertificatesDir();
    }

    ensureCertificatesDir() {
        if (!fs.existsSync(this.certificatesDir)) {
            fs.mkdirSync(this.certificatesDir, { recursive: true });
        }
    }

    async generateCertificate(application, certificateRequest) {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Generate HTML content for the certificate
            const htmlContent = this.generateCertificateHTML(application, certificateRequest);

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate filename
            const filename = `certificate-${certificateRequest.requestNumber}-${Date.now()}.pdf`;
            const filepath = path.join(this.certificatesDir, filename);

            // Generate PDF
            await page.pdf({
                path: filepath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                }
            });

            await browser.close();

            return {
                filename,
                filepath,
                success: true
            };
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }

    generateCertificateHTML(application, certificateRequest) {
        const marriageDate = new Date(application.marriageDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const issueDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Determine certificate type and content
        const isSectorCertificate = certificateRequest.certificateType === 'sector';
        const certificateTitle = isSectorCertificate ? 'SECTOR MARRIAGE CERTIFICATE' : 'CHURCH MARRIAGE CERTIFICATE';
        const issuingAuthority = isSectorCertificate ? 'SECTOR ADMINISTRATION' : 'CHURCH AUTHORITY';
        const certificateSubtitle = isSectorCertificate ? 'Certificate of Civil Marriage Registration' : 'Certificate of Religious Marriage Registration';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Marriage Certificate</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
                
                body {
                    font-family: 'Georgia', 'Times New Roman', serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    min-height: 100vh;
                }
                
                .certificate-container {
                    background: white;
                    border: 4px solid #1a365d;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                    position: relative;
                    height: calc(100vh - 40px);
                    max-height: calc(100vh - 40px);
                    overflow: hidden;
                    box-sizing: border-box;
                }
                
                .certificate-container::before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                    border: 2px solid #c53030;
                    border-radius: 10px;
                    pointer-events: none;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .republic {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1a365d;
                    margin-bottom: 6px;
                    letter-spacing: 1px;
                }
                
                .ministry {
                    font-size: 14px;
                    color: #2d3748;
                    margin-bottom: 10px;
                    font-weight: 500;
                }
                
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #c53030;
                    text-decoration: underline;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }
                
                .subtitle {
                    font-size: 14px;
                    color: #4a5568;
                    font-style: italic;
                    font-weight: 400;
                }
                
                .content {
                    margin: 15px 0;
                    line-height: 1.5;
                    font-size: 14px;
                }
                
                .couple-names {
                    text-align: center;
                    margin: 15px 0;
                    font-size: 20px;
                    font-weight: bold;
                    color: #1a365d;
                }
                
                .groom-name, .bride-name {
                    display: inline-block;
                    margin: 0 10px;
                    padding: 6px 15px;
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border-radius: 6px;
                    border: 2px solid #cbd5e0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .details {
                    margin: 15px 0;
                    font-size: 13px;
                }
                
                .detail-row {
                    margin: 5px 0;
                    display: flex;
                    justify-content: space-between;
                }
                
                .detail-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .detail-value {
                    color: #34495e;
                }
                
                .signatures {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .signature {
                    text-align: center;
                    width: 200px;
                }
                
                .signature-line {
                    border-bottom: 2px solid #1a365d;
                    margin-bottom: 6px;
                    height: 30px;
                }
                
                .signature-label {
                    font-size: 12px;
                    color: #1a365d;
                    font-weight: bold;
                }
                
                .certificate-number {
                    position: absolute;
                    top: 20px;
                    right: 25px;
                    font-size: 12px;
                    color: #4a5568;
                    font-weight: 500;
                }
                
                .seal {
                    position: absolute;
                    bottom: 15px;
                    right: 15px;
                    width: 70px;
                    height: 70px;
                    border: 2px solid #c53030;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: bold;
                    color: #c53030;
                    text-align: center;
                    line-height: 1.1;
                    background: radial-gradient(circle, #fff 0%, #f8f9fa 100%);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .seal::before {
                    content: '';
                    position: absolute;
                    width: 45px;
                    height: 45px;
                    border: 1px solid #c53030;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                
                .corner-decoration {
                    position: absolute;
                    width: 25px;
                    height: 25px;
                    border: 2px solid #c53030;
                }
                
                .corner-decoration.top-left {
                    top: 15px;
                    left: 15px;
                    border-right: none;
                    border-bottom: none;
                }
                
                .corner-decoration.top-right {
                    top: 15px;
                    right: 15px;
                    border-left: none;
                    border-bottom: none;
                }
                
                .corner-decoration.bottom-left {
                    bottom: 15px;
                    left: 15px;
                    border-right: none;
                    border-top: none;
                }
                
                .corner-decoration.bottom-right {
                    bottom: 15px;
                    right: 15px;
                    border-left: none;
                    border-top: none;
                }
                
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 60px;
                    color: rgba(197, 48, 48, 0.02);
                    font-weight: bold;
                    z-index: 1;
                    pointer-events: none;
                    user-select: none;
                }
                
                .security-code {
                    position: absolute;
                    bottom: 10px;
                    left: 20px;
                    font-size: 8px;
                    color: #718096;
                    font-family: 'Courier New', monospace;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="watermark">OFFICIAL</div>
                <div class="security-code">SEC-${Date.now().toString(36).toUpperCase()}</div>
                
                <div class="corner-decoration top-left"></div>
                <div class="corner-decoration top-right"></div>
                <div class="corner-decoration bottom-left"></div>
                <div class="corner-decoration bottom-right"></div>
                
                <div class="certificate-number">
                    Certificate No: ${certificateRequest.requestNumber}
                </div>
                
                <div class="header">
                    <div class="republic">REPUBLIC OF RWANDA</div>
                    <div class="ministry">${isSectorCertificate ? 'MINISTRY OF LOCAL GOVERNMENT' : 'RELIGIOUS AFFAIRS'}</div>
                    <div class="title">${certificateTitle}</div>
                    <div class="subtitle">${certificateSubtitle}</div>
                </div>
                
                <div class="content">
                    <p style="text-align: center; font-size: 14px; margin-bottom: 15px;">
                        This is to certify that the marriage between:
                    </p>
                    
                    <div class="couple-names">
                        <div class="groom-name">${application.groomFirstName} ${application.groomLastName}</div>
                        <span style="color: #c53030; font-size: 16px;">&</span>
                        <div class="bride-name">${application.brideFirstName} ${application.brideLastName}</div>
                    </div>
                    
                    <p style="text-align: center; font-size: 14px; margin: 15px 0;">
                        was solemnized on the <strong>${marriageDate}</strong>
                    </p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Groom's Full Name:</span>
                            <span class="detail-value">${application.groomFirstName} ${application.groomLastName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Groom's Date of Birth:</span>
                            <span class="detail-value">${new Date(application.groomDateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Groom's National ID:</span>
                            <span class="detail-value">${application.groomIdNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bride's Full Name:</span>
                            <span class="detail-value">${application.brideFirstName} ${application.brideLastName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bride's Date of Birth:</span>
                            <span class="detail-value">${new Date(application.brideDateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bride's National ID:</span>
                            <span class="detail-value">${application.brideIdNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date of Marriage:</span>
                            <span class="detail-value">${marriageDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Type of Ceremony:</span>
                            <span class="detail-value">${application.ceremonyType}</span>
                        </div>
                    </div>
                    
                    <p style="text-align: center; font-size: 12px; margin: 20px 0;">
                        This certificate is issued in accordance with the laws of the Republic of Rwanda 
                        and is valid for all legal purposes.
                    </p>
                </div>
                
                <div class="signatures">
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-label">${isSectorCertificate ? 'Sector Administrator' : 'Church Leader'}</div>
                    </div>
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-label">Date: ${issueDate}</div>
                    </div>
                </div>
                
                <div class="seal">
                    ${isSectorCertificate ? 'SECTOR<br>SEAL' : 'CHURCH<br>SEAL'}
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = CertificateGenerator;
