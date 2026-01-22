import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
  isOpen = false,
  onClose,
  position = 'right',
  colors = ['#1e1e22', '#2a2a2f'],
  children,
  className = '',
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel || !preContainer) return;

      let preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('[data-stagger-item]'));
    const itemLabels = Array.from(panel.querySelectorAll('[data-stagger-label]'));

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemLabels.length) {
      gsap.set(itemLabels, { yPercent: 140, rotate: 10, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });
    
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemLabels.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemLabels,
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemLabels = Array.from(panel.querySelectorAll('[data-stagger-label]'));
        if (itemLabels.length) {
          gsap.set(itemLabels, { yPercent: 140, rotate: 10, opacity: 0 });
        }
        busyRef.current = false;
      }
    });
  }, [position]);

  useEffect(() => {
    if (isOpen && !openRef.current) {
      openRef.current = true;
      onMenuOpen?.();
      playOpen();
    } else if (!isOpen && openRef.current) {
      openRef.current = false;
      onMenuClose?.();
      playClose();
    }
  }, [isOpen, playOpen, playClose, onMenuOpen, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !isOpen) return;

    const handleClickOutside = event => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, isOpen, onClose]);

  return (
    <div
      className={`staggered-menu-wrapper ${className}`}
      data-position={position}
      data-open={isOpen || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#2a2a2f'];
          let arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
        })()}
      </div>
      <aside ref={panelRef} className="staggered-menu-panel" aria-hidden={!isOpen}>
        {children}
      </aside>
    </div>
  );
};

export default StaggeredMenu;
