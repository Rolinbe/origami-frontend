import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CreateBadgeModalProps {
  onClose: () => void;
  onSubmit: (userId: string) => void;
}

export const CreateBadgeModal: React.FC<CreateBadgeModalProps> = ({ onClose, onSubmit }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  // Exemple de liste d'utilisateurs (normalement récupérée depuis l'API)
  const users = [
    { id: '1', name: 'Jean Dupont', service: 'IT', hasActiveBadge: false },
    { id: '2', name: 'Marie Martin', service: 'CM', hasActiveBadge: false },
    { id: '3', name: 'Pierre Durand', service: 'CV', hasActiveBadge: false },
  ];

  const handleSubmit = () => {
    if (selectedUser) {
      onSubmit(selectedUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Créer un nouveau badge</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sélectionner un employé
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choisir un employé...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.service}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Seuls les employés sans badge actif sont affichés
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedUser}
                className="flex-1 bg-[rgb(101,193,255)] hover:bg-[rgb(81,173,235)] text-white disabled:opacity-50"
              >
                Créer le badge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};