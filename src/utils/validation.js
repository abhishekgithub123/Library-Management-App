import { z } from 'zod';

// Basic validation functions
export const nonEmptyString = (fieldName) =>
  z.string().min(1, `${fieldName} is required`).trim();

export const nameValidator = (fieldName) =>
  z.string()
    .min(1, `${fieldName} is required`)
    .regex(/^[A-Za-z\s]+$/, `${fieldName} can only contain letters and spaces`)
    .trim()
    .refine(
      (value) => value.length >= 2,
      `${fieldName} must be at least 2 characters long`
    )
    .refine(
      (value) => /^[A-Za-z]/.test(value),
      `${fieldName} must start with a letter`
    );

export const optionalTrimmedString = z.string().trim().optional();

export const positiveNumber = (fieldName) =>
  z.coerce.number().positive(`${fieldName} must be a positive number`);

export const optionalPositiveNumber = z.coerce.number().positive().optional();

export const validDateString = (fieldName) =>
  z.string().min(1, `${fieldName} is required`).refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    `${fieldName} must be a valid date`
  );

export const optionalValidDateString = (fieldName) =>
  z.string().optional().refine(
    (date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    `${fieldName} must be a valid date`
  );

export const rangedStringNumber = (fieldName, min, max) =>
  z.string().refine(
    (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    `${fieldName} must be between ${min} and ${max}`
  );

export const optionalBoolean = z.boolean().optional();

export const optionalNumber = z.coerce.number().optional();

// Email validation
export const optionalEmailValidator = z
  .string()
  .email('Invalid email format')
  .optional();

// Mobile validation for Indian numbers
export const mobileValidator = z
  .string()
  .min(10, 'Mobile number must be 10 digits')
  .max(10, 'Mobile number must be 10 digits')
  .regex(/^[6-9]\d{9}$/, 'Mobile number must start with 6, 7, 8, or 9 and be 10 digits');

// Blood pressure validation
export const bloodPressureValidator = z
  .string()
  .refine(
    (value) => {
      if (!value) return true;
      const pattern = /^\d{2,3}\/\d{2,3}$/;
      if (!pattern.test(value)) return false;
      
      const [systolic, diastolic] = value.split('/').map(Number);
      return systolic >= 70 && systolic <= 190 && diastolic >= 40 && diastolic <= 130;
    },
    'Blood pressure must be in format systolic/diastolic (e.g., 120/80)'
  )
  .optional();

// Identity validation functions
export const aadhaarValidator = z
  .string()
  .regex(/^[2-9]\d{11}$/, 'Aadhaar number must be 12 digits and cannot start with 0 or 1')
  .refine(
    (value) => {
      // Verhoeff algorithm check for Aadhaar
      const digits = value.split('').map(Number);
      return digits.length === 12;
    },
    'Invalid Aadhaar number format'
  );

export const panValidator = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)')
  .transform((val) => val.toUpperCase());

export const passportValidator = z
  .string()
  .regex(/^[A-Z]{1}[0-9]{7}$/, 'Passport number must be 1 letter followed by 7 digits')
  .transform((val) => val.toUpperCase());

export const drivingLicenseValidator = z
  .string()
  .regex(/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/, 'Driving License must be in format: DL0120140147596 (2 letters, 2 digits, 4 digits, 7 digits)')
  .transform((val) => val.toUpperCase());

// Identity number validation based on type
export const identityNumberValidator = z
  .string()
  .min(1, 'Identity Number is required');

// Password validation
export const passwordValidator = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Username validation
export const usernameValidator = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Amount validation for expenses
export const amountValidator = z
  .coerce.number()
  .positive('Amount must be a positive number')
  .min(0.01, 'Amount must be at least 0.01');

// Category validation
export const categoryValidator = z
  .string()
  .min(1, 'Category is required')
  .max(50, 'Category name must be less than 50 characters');

// User registration form schema
export const userRegistrationSchema = z
  .object({
    libraryId: positiveNumber('Library'),
    roleId: positiveNumber('Role'),
    name: nameValidator('Name'),
    mobile: mobileValidator,
    email: optionalEmailValidator,
    addLine1: nonEmptyString('Address Line 1'),
    addLine2: optionalTrimmedString,
    city: nonEmptyString('City'),
    identityType: nonEmptyString('Identity Type'),
    identityNumber: identityNumberValidator,
    seatId: positiveNumber('Seat'),
    shiftId: positiveNumber('Shift'),
    bookingDate: validDateString('Booking Date'),
    isFeeCollected: z.coerce.number().min(0).max(1),
    paidAmount: z.coerce.number().min(0, 'Paid amount must be non-negative').optional(),
    paidOn: optionalValidDateString('Paid On'),
    validFrom: optionalValidDateString('Valid From'),
    paymentMode: z.string().optional(),
    transactionId: optionalTrimmedString,
    remarks: optionalTrimmedString,
    feePlanId: positiveNumber('Fee Plan'),
  })
  .superRefine((data, ctx) => {
    // Validate payment fields only when fee is collected
    if (data.isFeeCollected === 1) {
      // Validate that paid amount is required when fee is collected
      if (!data.paidAmount || data.paidAmount <= 0) {
        ctx.addIssue({
          path: ['paidAmount'],
          message: 'Paid amount is required when fee is collected',
          code: z.ZodIssueCode.custom,
        });
      }

      // Validate that paid on date is required when fee is collected
      if (!data.paidOn) {
        ctx.addIssue({
          path: ['paidOn'],
          message: 'Paid on date is required when fee is collected',
          code: z.ZodIssueCode.custom,
        });
      }

      // Validate that valid from date is required when fee is collected
      if (!data.validFrom) {
        ctx.addIssue({
          path: ['validFrom'],
          message: 'Valid from date is required when fee is collected',
          code: z.ZodIssueCode.custom,
        });
      }

      // Validate that payment mode is required when fee is collected
      if (!data.paymentMode) {
        ctx.addIssue({
          path: ['paymentMode'],
          message: 'Payment mode is required when fee is collected',
          code: z.ZodIssueCode.custom,
        });
      }
    } else {
      // When fee is not collected, ensure paidOn is null or empty
      if (data.paidOn && data.paidOn.trim() !== '') {
        ctx.addIssue({
          path: ['paidOn'],
          message: 'Paid on date should be empty when fee is not collected',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Validate that valid from date is not in the past (only if provided)
    if (data.validFrom) {
      const validFromDate = new Date(data.validFrom);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (validFromDate < today) {
        ctx.addIssue({
          path: ['validFrom'],
          message: 'Valid from date cannot be in the past',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Validate that booking date is not in the past
    if (data.bookingDate) {
      const bookingDate = new Date(data.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        ctx.addIssue({
          path: ['bookingDate'],
          message: 'Booking date cannot be in the past',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Validate identity number based on identity type
    if (data.identityType && data.identityNumber) {
      switch (data.identityType) {
        case 'Aadhaar':
          if (!/^[2-9]\d{11}$/.test(data.identityNumber)) {
            ctx.addIssue({
              path: ['identityNumber'],
              message: 'Aadhaar number must be 12 digits and cannot start with 0 or 1',
              code: z.ZodIssueCode.custom,
            });
          }
          break;
        
        case 'Driving License':
          if (!/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(data.identityNumber.toUpperCase())) {
            ctx.addIssue({
              path: ['identityNumber'],
              message: 'Driving License must be in format: DL0120140147596 (2 letters, 2 digits, 4 digits, 7 digits)',
              code: z.ZodIssueCode.custom,
            });
          }
          break;
        
        case 'Voter Card':
          if (!/^\d{10,15}$/.test(data.identityNumber)) {
            ctx.addIssue({
              path: ['identityNumber'],
              message: 'Voter Card number must be 10-15 digits',
              code: z.ZodIssueCode.custom,
            });
          }
          break;
      }
    }
  });

// Sign In form schema
export const signInSchema = z.object({
  username: usernameValidator,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Sign Up form schema
export const signUpSchema = z.object({
  roleId: z.string().min(1, 'Please select a role'),
  libraryId: z.string().min(1, 'Please select a library'),
  username: usernameValidator,
  email: z.string().email('Invalid email format'),
  password: passwordValidator,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: nameValidator('First Name'),
  lastName: nameValidator('Last Name'),
  mobile: mobileValidator,
  identityType: z.string().min(1, 'Please select an identity type'),
  identityNumber: z.string().min(1, 'Identity number is required'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ['confirmPassword'],
      message: 'Passwords do not match',
      code: z.ZodIssueCode.custom,
    });
  }

  // Validate identity number based on identity type
  if (data.identityType && data.identityNumber) {
    switch (data.identityType) {
      case 'Aadhaar':
        if (!/^[2-9]\d{11}$/.test(data.identityNumber)) {
          ctx.addIssue({
            path: ['identityNumber'],
            message: 'Aadhaar number must be 12 digits and cannot start with 0 or 1',
            code: z.ZodIssueCode.custom,
          });
        }
        break;
      
      case 'PAN':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.identityNumber.toUpperCase())) {
          ctx.addIssue({
            path: ['identityNumber'],
            message: 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)',
            code: z.ZodIssueCode.custom,
          });
        }
        break;
      
      case 'Passport':
        if (!/^[A-Z]{1}[0-9]{7}$/.test(data.identityNumber.toUpperCase())) {
          ctx.addIssue({
            path: ['identityNumber'],
            message: 'Passport number must be 1 letter followed by 7 digits',
            code: z.ZodIssueCode.custom,
          });
        }
        break;
      
      case 'Driving License':
        if (!/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(data.identityNumber.toUpperCase())) {
          ctx.addIssue({
            path: ['identityNumber'],
            message: 'Driving License must be in format: DL0120140147596 (2 letters, 2 digits, 4 digits, 7 digits)',
            code: z.ZodIssueCode.custom,
          });
        }
        break;
    }
  }
});

// Add Expense form schema
export const addExpenseSchema = z.object({
  category: categoryValidator,
  name: nameValidator('Expense Name'),
  amount: amountValidator,
  date: validDateString('Date'),
  remark: optionalTrimmedString,
}).superRefine((data, ctx) => {
  // Validate that date is not in the future
  if (data.date) {
    const expenseDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (expenseDate > today) {
      ctx.addIssue({
        path: ['date'],
        message: 'Expense date cannot be in the future',
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

// Edit User form schema
export const editUserSchema = z.object({
  name: nameValidator('Name'),
  mobile: mobileValidator,
  email: optionalEmailValidator,
  addLine1: nonEmptyString('Address Line 1'),
  addLine2: optionalTrimmedString,
  city: nonEmptyString('City'),
});

// Add Category form schema
export const addCategorySchema = z.object({
  categoryName: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Category name can only contain letters, numbers, and spaces')
    .trim(),
});

// Profile update form schema
export const profileUpdateSchema = z.object({
  name: nameValidator('Name'),
  mobile: mobileValidator,
  addLine1: nonEmptyString('Address Line 1'),
  addLine2: optionalTrimmedString,
  subscriptionPlan: z.string().min(1, 'Subscription plan is required'),
});

// Payment form schema
export const paymentSchema = z.object({
  amount: amountValidator,
  paymentMode: z.enum(['CASH', 'ONLINE', 'CARD'], { errorMap: () => ({ message: 'Please select a valid payment mode' }) }),
  transactionId: optionalTrimmedString,
  paidOn: validDateString('Payment Date'),
  validFrom: validDateString('Valid From Date'),
  remarks: optionalTrimmedString,
}).superRefine((data, ctx) => {
  // Validate that payment date is not in the future
  if (data.paidOn) {
    const paymentDate = new Date(data.paidOn);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (paymentDate > today) {
      ctx.addIssue({
        path: ['paidOn'],
        message: 'Payment date cannot be in the future',
        code: z.ZodIssueCode.custom,
      });
    }
  }

  // Validate that valid from date is not in the past
  if (data.validFrom) {
    const validFromDate = new Date(data.validFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (validFromDate < today) {
      ctx.addIssue({
        path: ['validFrom'],
        message: 'Valid from date cannot be in the past',
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

// Fee Payment Dialog schema
export const feePaymentSchema = z.object({
  paymentMode: z.enum(['CASH', 'CARD', 'ONLINE'], {
    required_error: 'Please select a payment mode',
  }),
  transactionId: z.string().min(1, 'ID is required'),
  remarks: optionalTrimmedString,
  unpaidMonths: z.array(z.string()).min(1, 'Please select a month to pay'),
  paymentScreenshot: z.object({
    file: z.instanceof(File, { message: 'Payment screenshot is required' }),
    preview: z.string().optional(),
  }, { required_error: 'Payment screenshot is required' }),
}).superRefine((data, ctx) => {
  // Validate transaction ID based on payment mode
  if (data.paymentMode === 'CASH' && !data.transactionId.trim()) {
    ctx.addIssue({
      path: ['transactionId'],
      message: 'Receipt ID is required for cash payment',
      code: z.ZodIssueCode.custom,
    });
  }
}); 