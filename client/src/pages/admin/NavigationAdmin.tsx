import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, Navigation } from 'lucide-react';
import { api } from '../../lib/api';
import { NavigationItem } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const NavigationAdmin: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const loadNav = () => {
    setLoading(true);
    api
      .get('/content/navigation')
      .then((res) => setItems(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNav();
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // re-assign sortOrder
    const updated = newItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    setItems(updated);
  };

  const toggleVisibility = (index: number) => {
    const newItems = [...items];
    newItems[index].isVisible = !newItems[index].isVisible;
    setItems(newItems);
  };

  const updateField = (index: number, field: 'label' | 'url', val: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };
    setItems(newItems);
  };

  const addItem = () => {
    const newItem: NavigationItem = {
      id: '',
      label: 'New Link',
      url: '/custom',
      isExternal: false,
      isVisible: true,
      sortOrder: items.length,
    };
    setItems([...items, newItem]);
  };

  const removeItem = async (index: number) => {
    const item = items[index];
    if (item.id) {
      try {
        await api.delete(`/content/navigation/${item.id}`);
      } catch (err: any) {
        error(err.message);
        return;
      }
    }
    setItems(items.filter((_, i) => i !== index));
    success('Navigation link removed');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/content/navigation', { items });
      success('Navigation menu updated successfully!');
      loadNav();
    } catch (err: any) {
      error(err.message || 'Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Site Structure</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Navigation Menu Builder</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Navigation'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl glass-panel border border-white/10 p-6 space-y-3 shadow-2xl">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">Loading menu...</div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                item.isVisible ? 'glass-card border-white/10' : 'bg-gray-950/40 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-1 text-gray-500">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    className="p-1 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    className="p-1 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateField(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Projects)"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => updateField(idx, 'url', e.target.value)}
                      placeholder="URL (e.g. /projects)"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(idx)}
                  className={`p-2 rounded-xl transition-colors ${
                    item.isVisible ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-white'
                  }`}
                  title={item.isVisible ? 'Visible on site' : 'Hidden from navigation'}
                >
                  {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeItem(idx)}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
