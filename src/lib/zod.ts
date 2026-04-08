export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateRequired<T>(value: T, fieldName: string): ValidationResult<T> {
  if (value === null || value === undefined || value === "") {
    return {
      success: false,
      error: `${fieldName} is required`,
    };
  }

  return {
    success: true,
    data: value,
  };
}
