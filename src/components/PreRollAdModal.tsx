import React from 'react';
import { PreRollAdConfig } from '../types';

interface PreRollAdModalProps {
  config?: PreRollAdConfig;
  isOpen: boolean;
  onClose: () => void;
  contextText?: string;
}

/**
 * 100% Ad-Free Experience
 * Pre-roll ads disabled per user request ("sob ad bondo kore daw").
 */
export const PreRollAdModal: React.FC<PreRollAdModalProps> = () => {
  return null;
};
