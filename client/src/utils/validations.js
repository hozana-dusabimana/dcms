/**
 * Validation utility functions for form inputs
 * Provides comprehensive validation for phone numbers, emails, ID numbers, dates, and age requirements
 */

/**
 * Validates phone number format
 * Accepts 10 or 13 digit phone numbers
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePhoneNumber = (phone) => {
    if (!phone) {
        return { isValid: false, message: 'Phone number is required' };
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if phone number is 10 or 13 digits
    if (cleanPhone.length === 10) {
        return { isValid: true, message: '' };
    } else if (cleanPhone.length === 13) {
        return { isValid: true, message: '' };
    } else {
        return {
            isValid: false,
            message: 'Phone number must be 10 or 13 digits'
        };
    }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (emailRegex.test(email)) {
        return { isValid: true, message: '' };
    } else {
        return {
            isValid: false,
            message: 'Please enter a valid email address'
        };
    }
};

/**
 * Validates ID number format
 * Must be exactly 16 digits
 * @param {string} idNumber - ID number to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateIdNumber = (idNumber) => {
    if (!idNumber) {
        return { isValid: false, message: 'ID number is required' };
    }

    // Remove all non-digit characters
    const cleanId = idNumber.replace(/\D/g, '');

    if (cleanId.length !== 16) {
        return {
            isValid: false,
            message: 'ID number must be exactly 16 digits'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates ID number format and birth year consistency
 * Must be exactly 16 digits and first two digits should match birth year
 * @param {string} idNumber - ID number to validate
 * @param {string|Date} dateOfBirth - Date of birth to validate against
 * @returns {object} - Validation result with isValid and message
 */
export const validateIdNumberWithBirthYear = (idNumber, dateOfBirth) => {
    // First validate basic ID format
    const basicValidation = validateIdNumber(idNumber);
    if (!basicValidation.isValid) {
        return basicValidation;
    }

    if (!dateOfBirth) {
        return { isValid: true, message: '' }; // If no birth date provided, just validate format
    }

    // Extract birth year from date
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
        return { isValid: true, message: '' }; // If invalid date, just validate format
    }

    const birthYear = birthDate.getFullYear();
    const idYearDigits = idNumber.substring(0, 2);

    // Convert ID year digits to actual year (assuming 20xx format)
    const idYear = 2000 + parseInt(idYearDigits);

    // Check if the years match (allow some tolerance for different ID formats)
    if (Math.abs(idYear - birthYear) <= 1) {
        return { isValid: true, message: '' };
    } else {
        return {
            isValid: false,
            message: `ID number birth year (${idYear}) does not match the provided birth year (${birthYear}). Please verify your ID number and date of birth.`
        };
    }
};

/**
 * Validates date format and ensures it's a valid date
 * @param {string|Date} date - Date to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateDate = (date) => {
    if (!date) {
        return { isValid: false, message: 'Date is required' };
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
        return {
            isValid: false,
            message: 'Please enter a valid date'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates age requirement for marriage registration
 * Must be 18 years or older (born before 2006)
 * @param {string|Date} dateOfBirth - Date of birth to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateAgeForMarriage = (dateOfBirth) => {
    if (!dateOfBirth) {
        return { isValid: false, message: 'Date of birth is required' };
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
        return {
            isValid: false,
            message: 'Please enter a valid date of birth'
        };
    }

    // Calculate age
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    // Check if person is 18 or older
    if (actualAge >= 18) {
        return { isValid: true, message: '' };
    } else {
        const birthYear = birthDate.getFullYear();
        return {
            isValid: false,
            message: `You are not eligible for marriage registration. You must be 18 years or older. You are currently ${actualAge} years old (born in ${birthYear}).`
        };
    }
};

/**
 * Validates that a date is not in the future
 * @param {string|Date} date - Date to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateNotFutureDate = (date) => {
    if (!date) {
        return { isValid: false, message: 'Date is required' };
    }

    const dateObj = new Date(date);
    const today = new Date();

    if (isNaN(dateObj.getTime())) {
        return {
            isValid: false,
            message: 'Please enter a valid date'
        };
    }

    if (dateObj > today) {
        return {
            isValid: false,
            message: 'Date cannot be in the future'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates that a date is in the future
 * @param {string|Date} date - Date to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateFutureDate = (date) => {
    if (!date) {
        return { isValid: false, message: 'Date is required' };
    }

    const dateObj = new Date(date);
    const today = new Date();

    if (isNaN(dateObj.getTime())) {
        return {
            isValid: false,
            message: 'Please enter a valid date'
        };
    }

    if (dateObj <= today) {
        return {
            isValid: false,
            message: 'Date must be in the future'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return {
            isValid: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates that two passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - Validation result with isValid and message
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: false, message: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
        return {
            isValid: false,
            message: 'Passwords do not match'
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result with isValid and message
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return {
            isValid: false,
            message: `${fieldName} is required`
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result with isValid and message
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
    if (!value) {
        return {
            isValid: false,
            message: `${fieldName} is required`
        };
    }

    if (value.length < minLength) {
        return {
            isValid: false,
            message: `${fieldName} must be at least ${minLength} characters long`
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validates maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - Validation result with isValid and message
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
    if (!value) {
        return { isValid: true, message: '' };
    }

    if (value.length > maxLength) {
        return {
            isValid: false,
            message: `${fieldName} must not exceed ${maxLength} characters`
        };
    }

    return { isValid: true, message: '' };
};

/**
 * React Hook Form validation rules generator
 * Returns validation rules object for use with react-hook-form
 */
export const getValidationRules = {
    required: (fieldName) => ({
        required: `${fieldName} is required`,
        validate: (value) => validateRequired(value, fieldName).isValid || validateRequired(value, fieldName).message
    }),

    email: () => ({
        required: 'Email is required',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address'
        }
    }),

    phone: () => ({
        required: 'Phone number is required',
        validate: (value) => {
            const result = validatePhoneNumber(value);
            return result.isValid || result.message;
        }
    }),

    idNumber: () => ({
        required: 'ID number is required',
        validate: (value) => {
            const result = validateIdNumber(value);
            return result.isValid || result.message;
        }
    }),

    idNumberWithBirthYear: (dateOfBirth) => ({
        required: 'ID number is required',
        validate: (value) => {
            const result = validateIdNumberWithBirthYear(value, dateOfBirth);
            return result.isValid || result.message;
        }
    }),

    dateOfBirth: () => ({
        required: 'Date of birth is required',
        validate: (value) => {
            const dateResult = validateDate(value);
            if (!dateResult.isValid) return dateResult.message;

            const ageResult = validateAgeForMarriage(value);
            return ageResult.isValid || ageResult.message;
        }
    }),

    marriageDate: () => ({
        required: 'Marriage date is required',
        validate: (value) => {
            const result = validateFutureDate(value);
            return result.isValid || result.message;
        }
    }),

    password: () => ({
        required: 'Password is required',
        minLength: {
            value: 6,
            message: 'Password must be at least 6 characters long'
        }
    }),

    confirmPassword: (password) => ({
        required: 'Please confirm your password',
        validate: (value) => {
            const result = validatePasswordMatch(password, value);
            return result.isValid || result.message;
        }
    }),

    minLength: (minLength, fieldName) => ({
        required: `${fieldName} is required`,
        minLength: {
            value: minLength,
            message: `${fieldName} must be at least ${minLength} characters long`
        }
    })
};

export default {
    validatePhoneNumber,
    validateEmail,
    validateIdNumber,
    validateDate,
    validateAgeForMarriage,
    validateNotFutureDate,
    validateFutureDate,
    validatePassword,
    validatePasswordMatch,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    getValidationRules
};
