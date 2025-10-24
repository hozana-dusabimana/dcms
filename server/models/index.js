const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Church = require('./Church');
const Sector = require('./Sector');
const MarriageApplication = require('./MarriageApplication');
const Notification = require('./Notification');
const Document = require('./Document');
const CertificateRequest = require('./CertificateRequest');
const ChurchService = require('./ChurchService');
const ChurchMember = require('./ChurchMember');
const ServiceComment = require('./ServiceComment');

// Define associations
const defineAssociations = () => {
    // User associations
    User.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
    User.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

    // Church associations
    Church.hasMany(User, { foreignKey: 'churchId', as: 'users' });

    // Sector associations
    Sector.hasMany(User, { foreignKey: 'sectorId', as: 'users' });

    // MarriageApplication associations
    MarriageApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    MarriageApplication.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
    MarriageApplication.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

    // Notification associations
    Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

    // Document associations
    Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });

    // CertificateRequest associations
    CertificateRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    CertificateRequest.belongsTo(MarriageApplication, { foreignKey: 'applicationId', as: 'application' });
    CertificateRequest.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
    CertificateRequest.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuer' });

    User.hasMany(CertificateRequest, { foreignKey: 'userId', as: 'certificateRequests' });
    MarriageApplication.hasMany(CertificateRequest, { foreignKey: 'applicationId', as: 'certificateRequests' });

    // ChurchService associations
    ChurchService.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
    ChurchService.belongsTo(User, { foreignKey: 'officiantId', as: 'officiant' });
    ChurchService.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

    Church.hasMany(ChurchService, { foreignKey: 'churchId', as: 'services' });
    User.hasMany(ChurchService, { foreignKey: 'officiantId', as: 'officiatedServices' });
    User.hasMany(ChurchService, { foreignKey: 'createdBy', as: 'createdServices' });

    // ChurchMember associations
    ChurchMember.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
    ChurchMember.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

    Church.hasMany(ChurchMember, { foreignKey: 'churchId', as: 'members' });
    User.hasMany(ChurchMember, { foreignKey: 'createdBy', as: 'createdMembers' });

    // ServiceComment associations
    ServiceComment.belongsTo(ChurchService, { foreignKey: 'serviceId', as: 'service' });
    ServiceComment.belongsTo(ChurchMember, { foreignKey: 'memberId', as: 'member' });

    ChurchService.hasMany(ServiceComment, { foreignKey: 'serviceId', as: 'comments' });
    ChurchMember.hasMany(ServiceComment, { foreignKey: 'memberId', as: 'comments' });
};

// Initialize associations
defineAssociations();

module.exports = {
    sequelize,
    User,
    Church,
    Sector,
    MarriageApplication,
    Notification,
    Document,
    CertificateRequest,
    ChurchService,
    ChurchMember,
    ServiceComment
};
