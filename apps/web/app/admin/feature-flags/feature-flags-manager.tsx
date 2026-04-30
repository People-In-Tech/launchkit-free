'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, X } from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  enabledForPlans: string[] | null;
  enabledForOrgs: string[] | null;
  rolloutPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export function FeatureFlagsManager({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '' });
  const [editForm, setEditForm] = useState({ plans: '', orgs: '', rollout: 100 });

  async function toggleFlag(key: string, enabled: boolean) {
    await fetch(`/api/feature-flags/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    router.refresh();
  }

  async function createFlag() {
    if (!newFlag.key || !newFlag.name) return;
    await fetch('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: newFlag.key,
        name: newFlag.name,
        description: newFlag.description || null,
      }),
    });
    setNewFlag({ key: '', name: '', description: '' });
    setShowCreate(false);
    router.refresh();
  }

  function startEdit(flag: FeatureFlag) {
    setEditingKey(flag.key);
    setEditForm({
      plans: flag.enabledForPlans?.join(', ') ?? '',
      orgs: flag.enabledForOrgs?.join(', ') ?? '',
      rollout: flag.rolloutPercentage,
    });
  }

  async function saveEdit(key: string) {
    const plans = editForm.plans.split(',').map((s) => s.trim()).filter(Boolean);
    const orgs = editForm.orgs.split(',').map((s) => s.trim()).filter(Boolean);
    await fetch(`/api/feature-flags/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabledForPlans: plans,
        enabledForOrgs: orgs,
        rolloutPercentage: editForm.rollout,
      }),
    });
    setEditingKey(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? 'Cancel' : 'New Flag'}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Feature Flag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Flag key (e.g. new-dashboard)"
              value={newFlag.key}
              onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
            />
            <Input
              placeholder="Display name"
              value={newFlag.name}
              onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newFlag.description}
              onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
            />
            <Button size="sm" onClick={createFlag}>Create</Button>
          </CardContent>
        </Card>
      )}

      {initialFlags.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No feature flags yet. Create one to get started.
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {initialFlags.map((flag) => (
            <div key={flag.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-secondary px-1.5 py-0.5 rounded">
                      {flag.key}
                    </code>
                    <span className="text-sm font-medium">{flag.name}</span>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    {flag.enabledForPlans && flag.enabledForPlans.length > 0 && (
                      <span>Plans: {flag.enabledForPlans.join(', ')}</span>
                    )}
                    {flag.rolloutPercentage < 100 && (
                      <span>Rollout: {flag.rolloutPercentage}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingKey === flag.key ? setEditingKey(null) : startEdit(flag)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    onClick={() => toggleFlag(flag.key, !flag.enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      flag.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                        flag.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {editingKey === flag.key && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Enabled for Plans (comma-separated)</label>
                    <Input
                      className="mt-1"
                      placeholder="pro, team"
                      value={editForm.plans}
                      onChange={(e) => setEditForm({ ...editForm, plans: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Enabled for Orgs (comma-separated IDs)</label>
                    <Input
                      className="mt-1"
                      placeholder="org_abc123, org_def456"
                      value={editForm.orgs}
                      onChange={(e) => setEditForm({ ...editForm, orgs: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Rollout Percentage (0-100)</label>
                    <Input
                      className="mt-1"
                      type="number"
                      min={0}
                      max={100}
                      value={editForm.rollout}
                      onChange={(e) => setEditForm({ ...editForm, rollout: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <Button size="sm" onClick={() => saveEdit(flag.key)}>Save Changes</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
