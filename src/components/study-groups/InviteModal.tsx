/**
 * InviteModal Component - Modal for inviting users to study groups
 * Handles email invitations and link sharing
 */

import { useState } from 'react';
import { X, Mail, Copy, Check, UserPlus, Send, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface InviteModalProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
}

export function InviteModal({ groupId, groupName, isOpen, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/app/groups/join/${groupId}`;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async () => {
    if (!email.trim()) return;

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    setError(null);

    try {
      await onInvite(email.trim());
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-blue-600" />
              Invite to {groupName}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Invite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="size-4 inline mr-2" />
              Invite by Email
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="colleague@example.com"
                className={error ? 'border-red-500' : ''}
                disabled={isInviting}
              />
              <Button 
                onClick={handleInvite}
                disabled={!email.trim() || isInviting}
              >
                {isInviting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="size-4" />
                {error}
              </p>
            )}
            
            {success && (
              <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                <Check className="size-4" />
                Invitation sent successfully!
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Invite Link
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 text-sm"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can request to join your group
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InviteModal;
