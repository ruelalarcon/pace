import {
  SUPPORTED_IMAGE_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  MAX_FILE_SIZE,
} from "./constants";

export const validateProjectName = (name: string): string | null => {
  if (!name.trim()) {
    return "Project name cannot be empty";
  }

  if (name.length > 100) {
    return "Project name cannot exceed 100 characters";
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return "Project name can only contain letters, numbers, spaces, hyphens, and underscores";
  }

  return null;
};

export const validateSceneName = (name: string): string | null => {
  if (!name.trim()) {
    return "Scene name cannot be empty";
  }

  if (name.length > 50) {
    return "Scene name cannot exceed 50 characters";
  }

  return null;
};

export const validateElementName = (name: string): string | null => {
  if (!name.trim()) {
    return "Element name cannot be empty";
  }

  if (name.length > 50) {
    return "Element name cannot exceed 50 characters";
  }

  return null;
};

export const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return `Unsupported image format. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(", ")}`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  return null;
};

export const validateAudioFile = (file: File): string | null => {
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    return `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(", ")}`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  return null;
};
