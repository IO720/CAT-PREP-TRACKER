import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AspirantProfileCard from './AspirantProfileCard';

/**
 * PeerInspectorModal - Tactical Operative Dossier Portal
 * Mounts the Valorant/Apex Tactical Operative Card cleanly in document.body
 */
export default function PeerInspectorModal({
  isOpen = true,
  onClose,
  friend,
  activePeer: propActivePeer,
  trackerData: propTrackerData,
  loading: propLoading = false,
  onMessagePeer,
  onEditProfile,
  currentUser
}) {
  const activePeer = propActivePeer || friend;
  const [trackerData, setTrackerData] = useState(propTrackerData || null);
  const [loading, setLoading] = useState(propLoading);

  // Prevent background website page from scrolling & stop Lenis wheel hijacking when modal is open
  useEffect(() => {
    if (activePeer && isOpen !== false) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      import('../utils/smoothScroll').then(({ getLenis }) => {
        getLenis()?.stop();
      });
      return () => {
        document.body.style.overflow = originalOverflow;
        import('../utils/smoothScroll').then(({ getLenis }) => {
          getLenis()?.start();
        });
      };
    }
  }, [activePeer, isOpen]);

  useEffect(() => {
    if (!activePeer) {
      setTrackerData(null);
      return;
    }

    if (propTrackerData) {
      setTrackerData(propTrackerData);
    } else {
      setTrackerData(activePeer);
    }
    setLoading(true);

    import('../utils/firebase')
      .then(({ getUserTrackerData }) => {
        const peerId = activePeer.uid || activePeer.id;
        if (!peerId || peerId === 'self') {
          setLoading(false);
          return;
        }
        return getUserTrackerData(peerId);
      })
      .then((data) => {
        if (data) {
          setTrackerData((prev) => ({
            ...(prev || {}),
            ...data
          }));
        }
      })
      .catch((err) => {
        console.error("Error fetching peer detailed progress:", err);
        setTrackerData(activePeer);
      })
      .finally(() => setLoading(false));
  }, [activePeer, propTrackerData]);

  if (!activePeer || isOpen === false) return null;

  const isSelf = activePeer.isSelf || (currentUser && (activePeer.id === currentUser.uid || activePeer.uid === currentUser.uid));

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 9999999 }}>
      <div 
        className="tactical-modal-wrapper" 
        onClick={(e) => e.stopPropagation()}
      >
        <AspirantProfileCard
          user={currentUser}
          profile={trackerData || activePeer}
          tracker={trackerData}
          isSelf={isSelf}
          onEditProfile={onEditProfile}
          onMessagePeer={onMessagePeer}
          onClose={onClose}
          compact={false}
        />
      </div>
    </div>,
    document.body
  );
}
