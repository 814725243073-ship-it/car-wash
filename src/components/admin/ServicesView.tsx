import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Service } from '../../types/database';
import { getServiceImage } from '../../lib/images';
import { formatRupee } from '../../lib/formatters';

export const ServicesView: React.FC = () => {
  const { services, createService, updateService, loading } = useData();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [price, setPrice] = useState<number>(50);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(45);
    setPrice(50);
    setIsActive(true);
    setStatusMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDurationMinutes(service.duration_minutes);
    setPrice(service.price);
    setIsActive(service.is_active);
    setStatusMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Service name is required.' });
      return;
    }
    if (durationMinutes <= 0 || price < 0) {
      setStatusMessage({ type: 'error', text: 'Duration must be > 0 and price cannot be negative.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    if (editingService) {
      const res = await updateService(editingService.id, {
        name: name.trim(),
        description: description.trim() || null,
        duration_minutes: Number(durationMinutes),
        price: Number(price),
        is_active: isActive,
      });

      setSaving(false);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Service updated successfully.' });
        setTimeout(() => setModalOpen(false), 800);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update service.' });
      }
    } else {
      const res = await createService({
        name: name.trim(),
        description: description.trim() || null,
        duration_minutes: Number(durationMinutes),
        price: Number(price),
        is_active: isActive,
      });

      setSaving(false);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Service created successfully.' });
        setTimeout(() => setModalOpen(false), 800);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to create service.' });
      }
    }
  };

  const handleToggleActive = async (service: Service) => {
    const newStatus = !service.is_active;
    await updateService(service.id, { is_active: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Wash & Detailing Services
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage packages, starting prices, service durations, and public booking visibility.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
        >
          + Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1522] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No services configured in database yet. Click "+ Add New Service" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 pl-6">Service</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Name & Description */}
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getServiceImage(svc.name)}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white text-sm">{svc.name}</div>
                          <div className="text-[11px] text-slate-400 max-w-sm truncate mt-0.5">
                            {svc.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 font-mono tabular-nums text-slate-300">
                      {svc.duration_minutes} mins
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-mono tabular-nums text-cyan-400 font-semibold">
                      {formatRupee(svc.price)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition-colors cursor-pointer ${
                          svc.is_active
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${svc.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span>{svc.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="rounded border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(svc)}
                          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            svc.is_active
                              ? 'text-amber-400 hover:bg-amber-950/30'
                              : 'text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                        >
                          {svc.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1522] p-6 sm:p-8 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-display text-lg font-bold text-white">
                {editingService ? `Edit Service: ${editingService.name}` : 'Create New Wash Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {statusMessage && (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
                    : 'border-rose-500/30 bg-rose-950/40 text-rose-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Service Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage 2 Paint Correction & Ceramic"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive exterior foam wash, iron decontamination, clay bar, and sealant..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Duration (Minutes) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Starting Price (₹ INR) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-white font-medium">Active (Visible on public booking site)</span>
                    <p className="text-slate-400 text-[11px]">
                      Deactivated services stay in the database but are hidden from customers.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
