import React, { useState, useEffect } from 'react';
import { Icons } from './AspirantIcons';
import SmoothCaretInput from './animations/SmoothCaretInput';
import SmoothCaretTextarea from './animations/SmoothCaretTextarea';
import { stripEmojis } from '../utils/textUtils';

const SUBJECTS = ['Quant', 'LRDI', 'VARC', 'General'];

export default function MistakeLogModal({ isOpen, onClose, onSave, editingMistake = null }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Quant',
    content: '',
    source: ''
  });

  useEffect(() => {
    if (editingMistake) {
      setFormData({
        title: editingMistake.title || '',
        subject: editingMistake.subject || 'Quant',
        content: editingMistake.takeawayRule || editingMistake.content || editingMistake.whatHappened || '',
        source: editingMistake.source || ''
      });
    } else {
      setFormData({
        title: '',
        subject: 'Quant',
        content: '',
        source: ''
      });
    }
  }, [editingMistake, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.content.trim()) {
      alert('Please enter a title or note content.');
      return;
    }

    const entry = {
      id: editingMistake ? editingMistake.id : `card_${Date.now()}`,
      title: formData.title.trim() || 'Untitled Note',
      subject: formData.subject,
      content: formData.content.trim(),
      takeawayRule: formData.content.trim(),
      source: formData.source.trim(),
      createdAt: editingMistake ? editingMistake.createdAt : new Date().toISOString()
    };

    onSave(entry);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="clean-confirm-modal"
        style={{
          background: 'var(--surface-color, #111522)',
          border: '1px solid var(--accent-color, #38bdf8)',
          borderRadius: '16px',
          padding: '22px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 25px var(--accent-glow, rgba(56, 189, 248, 0.2))'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(var(--accent-rgb, 56, 189, 248), 0.15)',
              color: 'var(--accent-color, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icons.Edit size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                {editingMistake ? 'Edit Study Card' : 'New Study Card'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-secondary, #94a3b8)' }}>
                Add a key takeaway, formula, or question reflection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            title="Close"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Subject Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)', marginBottom: '5px' }}>
              SECTION
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SUBJECTS.map(subj => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, subject: subj }))}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: formData.subject === subj ? '1px solid var(--accent-color, #38bdf8)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: formData.subject === subj ? 'rgba(var(--accent-rgb, 56, 189, 248), 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    color: formData.subject === subj ? 'var(--accent-color, #38bdf8)' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Title with Smooth Caret Input & Clear */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)' }}>
                TITLE / QUESTION
              </label>
              {formData.title && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, title: '' }))}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
            <SmoothCaretInput
              type="text"
              className="smooth-text-input"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: stripEmojis(e.target.value) }))}
              placeholder="e.g. Relative Speed unit trap or RC Extreme options..."
            />
          </div>

          {/* Content / Takeaway Textarea */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)' }}>
                NOTE / KEY TAKEAWAY
              </label>
              {formData.content && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, content: '' }))}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
            <SmoothCaretTextarea
              className="vault-textarea"
              style={{ minHeight: '90px' }}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: stripEmojis(e.target.value) }))}
              placeholder="Write your note, formula, or mistake reflection here..."
            />
          </div>

          {/* Optional Source */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--accent-color, #38bdf8)' }}>
                SOURCE (OPTIONAL)
              </label>
              {formData.source && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, source: '' }))}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
            <SmoothCaretInput
              type="text"
              className="smooth-text-input"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: stripEmojis(e.target.value) }))}
              placeholder="e.g. SimCAT Mock 3, Arun Sharma..."
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: '1px solid var(--border-color, #27272a)',
                background: 'transparent',
                color: 'var(--text-primary, #f4f4f5)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 16px',
                borderRadius: '7px',
                border: 'none',
                background: 'var(--accent-color, #38bdf8)',
                color: 'var(--accent-contrast, #09090b)',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 14px var(--accent-glow, rgba(56, 189, 248, 0.35))'
              }}
            >
              <Icons.Check size={13} />
              <span>{editingMistake ? 'Save Changes' : 'Add Card'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
