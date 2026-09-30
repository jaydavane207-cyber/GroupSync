import React from 'react';
import Modal from './Modal';
import Checkbox from '@/components/forms/Checkbox';
import Button from '@/components/buttons/Button';
import { useAppContext } from '@/context/AppContext';

export const PreferencesModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useAppContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workspace Preferences">
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gs-text-main mb-2">Appearance</h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-xs font-medium text-gs-text-main block">Light Theme</span>
              <span className="text-[10px] text-gs-text-muted">Switch between dark and light themes</span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-[#6D6AF6] text-white text-xs font-medium hover:bg-[#5C59EC] transition-colors"
            >
              Toggle ({theme})
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gs-text-main mb-2">Notifications</h4>
          <div className="space-y-2">
            <Checkbox label="Receive sound notifications on new chat messages" checked={true} onChange={() => {}} />
            <Checkbox label="Email digest for team invitations and project updates" checked={false} onChange={() => {}} />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gs-border">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PreferencesModal;

