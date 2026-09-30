import React, { useState } from 'react';
import Modal from './Modal';
import FormGroup from '@/components/forms/FormGroup';
import TextInput from '@/components/forms/TextInput';
import Button from '@/components/buttons/Button';
import { Mail } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose, onInvite, teamName = 'Team' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await onInvite?.(email);
      setEmail('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite Member to ${teamName}`}>
      <form onSubmit={handleInvite} className="space-y-4">
        <FormGroup label="Member Email Address" required>
          <TextInput
            icon={Mail}
            type="email"
            placeholder="colleague@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteModal;

