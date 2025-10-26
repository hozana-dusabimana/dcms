const transporter = require('../config/email');
const { Notification } = require('../models');

class NotificationService {
    // Send email notification
    static async sendEmail(to, subject, htmlContent, textContent = null) {
        try {
            const mailOptions = {
                from: {
                    name: 'DMCS MIS',
                    address: 'lanari.rw@gmail.com'
                },
                to: to,
                subject: subject,
                html: htmlContent,
                text: textContent || this.stripHtml(htmlContent)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Create in-app notification
    static async createNotification(userId, title, message, type = 'info', data = null) {
        try {
            const notification = await Notification.create({
                userId: userId,
                title: title,
                message: message,
                type: type, // info, success, warning, error
                data: data ? JSON.stringify(data) : null,
                isRead: false
            });

            return { success: true, notification };
        } catch (error) {
            console.error('Notification creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Send both email and in-app notification
    static async sendNotification(userId, userEmail, title, message, emailSubject, emailContent, type = 'info', data = null) {
        const results = {
            email: { success: false },
            notification: { success: false }
        };

        // Send email if email is provided
        if (userEmail) {
            results.email = await this.sendEmail(userEmail, emailSubject, emailContent);
        }

        // Create in-app notification
        results.notification = await this.createNotification(userId, title, message, type, data);

        return results;
    }

    // Email templates
    static getEmailTemplates() {
        return {
            // Marriage Application Templates
            marriageApplicationSubmitted: (data) => ({
                subject: 'Marriage Application Submitted - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Marriage Application Submitted</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Your marriage application has been successfully submitted to the DMCS MIS system.</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Application Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Submitted Date:</strong> ${data.submittedDate}</p>
                            <p><strong>Status:</strong> ${data.status}</p>
                        </div>
                        <p>You will be notified once your application is reviewed by the appropriate authorities.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            marriageApplicationApproved: (data) => ({
                subject: 'Marriage Application Approved - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Marriage Application Approved</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Congratulations! Your marriage application has been approved.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Application Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Approved Date:</strong> ${data.approvedDate}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">APPROVED</span></p>
                        </div>
                        <p>Please contact the relevant authorities for the next steps in your marriage process.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            marriageApplicationRejected: (data) => ({
                subject: 'Marriage Application Update - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e74c3c;">Marriage Application Update</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Your marriage application requires attention.</p>
                        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Application Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Status:</strong> <span style="color: #e74c3c; font-weight: bold;">${data.status.toUpperCase()}</span></p>
                            <p><strong>Reason:</strong> ${data.reason}</p>
                        </div>
                        <p>Please review the feedback and take the necessary actions to complete your application.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            marriageApplicationSectorApproved: (data) => ({
                subject: 'Marriage Application Approved (Sector) - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Marriage Application Approved (Sector Level)</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Great news! Your marriage application has been approved at the sector level.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Application Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Approved Date:</strong> ${data.approvedDate}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">SECTOR APPROVED</span></p>
                        </div>
                        <p>Your application will now be reviewed by the church leadership for final approval.</p>
                        <p>You will be notified once the church review is complete.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            marriageCompleted: (data) => ({
                subject: 'Marriage Completed - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Marriage Completed</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Congratulations! Your marriage has been successfully completed.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Marriage Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Marriage Date:</strong> ${data.marriageDate}</p>
                            <p><strong>Marriage Location:</strong> ${data.marriageLocation}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">COMPLETED</span></p>
                        </div>
                        <p>Your marriage is now officially recorded in the DMCS system. You may proceed with any additional legal or administrative requirements.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            civilMarriageCompleted: (data) => ({
                subject: 'Civil Marriage Completed - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Civil Marriage Completed</h2>
                        <p>Dear ${data.groomName} & ${data.brideName},</p>
                        <p>Congratulations! Your civil marriage has been successfully completed.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Civil Marriage Details:</h3>
                            <p><strong>Application ID:</strong> ${data.applicationId}</p>
                            <p><strong>Groom:</strong> ${data.groomName}</p>
                            <p><strong>Bride:</strong> ${data.brideName}</p>
                            <p><strong>Civil Marriage Date:</strong> ${data.civilMarriageDate}</p>
                            <p><strong>Civil Marriage Location:</strong> ${data.civilMarriageLocation}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">CIVIL COMPLETED</span></p>
                        </div>
                        <p>Your civil marriage is now officially registered. You may proceed with any additional religious ceremonies or administrative requirements.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            // Service Request Templates
            serviceRequestSubmitted: (data) => ({
                subject: 'Service Request Submitted - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Service Request Submitted</h2>
                        <p>Dear ${data.memberName},</p>
                        <p>Your service request has been successfully submitted to ${data.churchName}.</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Request Details:</h3>
                            <p><strong>Request Number:</strong> ${data.requestNumber}</p>
                            <p><strong>Service Type:</strong> ${data.serviceType}</p>
                            <p><strong>Title:</strong> ${data.title}</p>
                            <p><strong>Requested Date:</strong> ${data.requestedDate || 'Not specified'}</p>
                            <p><strong>Status:</strong> ${data.status}</p>
                        </div>
                        <p>You will be notified once your request is reviewed by the church leadership.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            serviceRequestApproved: (data) => ({
                subject: 'Service Request Approved - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Service Request Approved</h2>
                        <p>Dear ${data.memberName},</p>
                        <p>Great news! Your service request has been approved by ${data.churchName}.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Request Details:</h3>
                            <p><strong>Request Number:</strong> ${data.requestNumber}</p>
                            <p><strong>Service Type:</strong> ${data.serviceType}</p>
                            <p><strong>Title:</strong> ${data.title}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">APPROVED</span></p>
                            ${data.scheduledDate ? `<p><strong>Scheduled Date:</strong> ${data.scheduledDate}</p>` : ''}
                            ${data.reviewComments ? `<p><strong>Comments:</strong> ${data.reviewComments}</p>` : ''}
                        </div>
                        <p>Please contact the church office for further details about your service.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            serviceRequestRejected: (data) => ({
                subject: 'Service Request Update - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e74c3c;">Service Request Update</h2>
                        <p>Dear ${data.memberName},</p>
                        <p>Your service request requires attention.</p>
                        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Request Details:</h3>
                            <p><strong>Request Number:</strong> ${data.requestNumber}</p>
                            <p><strong>Service Type:</strong> ${data.serviceType}</p>
                            <p><strong>Title:</strong> ${data.title}</p>
                            <p><strong>Status:</strong> <span style="color: #e74c3c; font-weight: bold;">${data.status.toUpperCase()}</span></p>
                            <p><strong>Reason:</strong> ${data.rejectionReason}</p>
                        </div>
                        <p>Please review the feedback and contact the church office if you have any questions.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            // Certificate Request Templates
            certificateRequestSubmitted: (data) => ({
                subject: 'Certificate Request Submitted - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Certificate Request Submitted</h2>
                        <p>Dear ${data.userName},</p>
                        <p>Your certificate request has been successfully submitted to the DMCS MIS system.</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Request Details:</h3>
                            <p><strong>Request ID:</strong> ${data.requestId}</p>
                            <p><strong>Certificate Type:</strong> ${data.certificateType}</p>
                            <p><strong>Submitted Date:</strong> ${data.submittedDate}</p>
                            <p><strong>Status:</strong> ${data.status}</p>
                        </div>
                        <p>You will be notified once your certificate is ready for collection.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            }),

            certificateReady: (data) => ({
                subject: 'Certificate Ready for Collection - DMCS MIS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #27ae60;">Certificate Ready for Collection</h2>
                        <p>Dear ${data.userName},</p>
                        <p>Your certificate is now ready for collection.</p>
                        <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Certificate Details:</h3>
                            <p><strong>Request ID:</strong> ${data.requestId}</p>
                            <p><strong>Certificate Type:</strong> ${data.certificateType}</p>
                            <p><strong>Ready Date:</strong> ${data.readyDate}</p>
                            <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">READY FOR COLLECTION</span></p>
                        </div>
                        <p>Please visit the relevant office to collect your certificate. Don't forget to bring a valid ID.</p>
                        <p>Thank you for using DMCS MIS.</p>
                        <hr>
                        <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from DMCS MIS System.</p>
                    </div>
                `
            })
        };
    }

    // Helper method to strip HTML tags
    static stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
}

module.exports = NotificationService;

