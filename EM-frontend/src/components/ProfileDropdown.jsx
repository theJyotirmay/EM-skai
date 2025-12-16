import React, { useEffect, useMemo, useState, useRef } from 'react';
import classNames from 'classnames';
import { useProfiles } from '../store/useProfiles';

export default function ProfileDropdown({ label, multi = false, selected, onChange, inlineAdd = true }) {
  const dropdownRef = useRef(null);
  const { profiles, fetchProfiles, addProfile } = useProfiles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const selectedIds = useMemo(() => (multi ? (selected || []).map(p => p._id) : selected ? [selected._id] : []), [multi, selected]);

  useEffect(() => {
    if (!profiles.length) {
      fetchProfiles();
    }
  }, [profiles.length, fetchProfiles]);


  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filtered = profiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (profile) => {
    if (multi) {
      const exists = selectedIds.includes(profile._id);
      const next = exists ? selectedIds.filter((id) => id !== profile._id) : [...selectedIds, profile._id];
      onChange(next.map((id) => profiles.find((p) => p._id === id)).filter(Boolean));
    } else {
      onChange(profile);
      setOpen(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const created = await addProfile({ name: newName.trim(), timezone: 'UTC' });
    setNewName('');
    setAdding(false);
    setOpen(false);
    if (multi) {
      onChange([...(selected || []), created]);
    } else {
      onChange(created);
    }
  };

  const displayLabel = () => {
    if (multi) {
      if (!selectedIds.length) return 'Select profiles...';
      return `${selectedIds.length} profile${selectedIds.length > 1 ? 's' : ''} selected`;
    }
    return selected ? selected.name : 'Select current profile...';
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      {label ? <div className="label">{label}</div> : null}
      <button className="dropdown-btn" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{displayLabel()}</span>
        <span style={{ fontSize: 16 }}>{open ? '⇅' : '⇵'}</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          <input
            className="search-input"
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="option-list">
            {filtered.length === 0 && <div className="muted">No profile found</div>}
            {filtered.map((p) => {
              const active = selectedIds.includes(p._id);
              return (
                <div key={p._id} className={classNames('option-item', { active })} onClick={() => toggleSelect(p)}>
                  <span>{active ? '✓ ' : ''}{p.name}</span>
                </div>
              );
            })}
          </div>
          {inlineAdd && !adding && (
            <button className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setAdding(true)}>
              + Add Profile
            </button>
          )}
          {inlineAdd && adding && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Public name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn primary" onClick={handleAdd} style={{ whiteSpace: 'nowrap' }}>Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
