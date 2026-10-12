'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Accepts options as strings/numbers or { value, label, disabled } objects.
function normalizeOptions(options) {
  return (options || []).map((option) =>
    typeof option === 'string' || typeof option === 'number'
      ? { value: String(option), label: String(option) }
      : option
  );
}

/**
 * Accessible custom dropdown used across the platform in place of native
 * <select>. Renders a pill trigger and a floating listbox in a portal so it
 * is never clipped by scroll containers.
 *
 * API:
 *   value / onChange(value, option)  controlled selection
 *   options  [{ value, label, disabled }] | string[]
 *   size     'sm' | 'md'
 *   className targets the root wrapper, triggerClassName the button
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  size = 'md',
  id,
  className,
  triggerClassName,
  menuClassName,
  menuMinWidth = 180,
  emptyLabel = 'No options',
  ariaLabel,
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();

  const items = useMemo(() => normalizeOptions(options), [options]);
  const selectedIndex = items.findIndex((option) => String(option.value) === String(value ?? ''));
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  const enabledIndexes = useMemo(
    () => items.reduce((acc, option, index) => (option.disabled ? acc : [...acc, index]), []),
    [items]
  );
  const firstEnabled = enabledIndexes[0] ?? -1;
  const lastEnabled = enabledIndexes[enabledIndexes.length - 1] ?? -1;

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 0;
    setPos((prev) => {
      const placement = prev?.placement || 'down';
      return {
        left: rect.left,
        width: rect.width,
        placement,
        top: placement === 'up' ? rect.top - menuHeight - 6 : rect.bottom + 6,
      };
    });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    position();
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled);
    setOpen(true);
  }, [disabled, position, selectedIndex, firstEnabled]);

  const closeMenu = useCallback((focusTrigger = true) => {
    setOpen(false);
    setPos(null);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  // Dismiss on outside pointer interaction.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      closeMenu(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open, closeMenu]);

  // Keep the floating listbox anchored while the page scrolls or resizes.
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => position();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, position]);

  // Flip upward when there is not enough room below the trigger.
  useLayoutEffect(() => {
    if (!open || !pos) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    if (menuHeight > spaceBelow && spaceAbove > spaceBelow) {
      setPos((prev) => (prev && prev.placement === 'up' ? prev : { ...prev, placement: 'up', top: rect.top - menuHeight - 6 }));
    } else {
      setPos((prev) => (prev && prev.placement === 'down' ? prev : { ...prev, placement: 'down', top: rect.bottom + 6 }));
    }
  }, [open, pos]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const commit = useCallback(
    (option) => {
      if (!option || option.disabled) return;
      onChange?.(option.value, option);
      closeMenu();
    },
    [onChange, closeMenu]
  );

  const step = useCallback(
    (direction) => {
      if (!items.length) return;
      setActiveIndex((current) => {
        let next = current;
        for (let i = 0; i < items.length; i += 1) {
          next = (next + direction + items.length) % items.length;
          if (!items[next].disabled) return next;
        }
        return current;
      });
    },
    [items]
  );

  const onKeyDown = (event) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        step(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(firstEnabled);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastEnabled);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(items[activeIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn('hf-select-root', className)}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        data-open={open}
        data-size={size}
        data-disabled={disabled || undefined}
        className={cn('hf-select-trigger', triggerClassName)}
      >
        <span className="hf-select-value" data-placeholder={!selected}>
          {selected ? (renderOption ? renderOption(selected) : selected.label) : placeholder}
        </span>
        <ChevronDown size={16} className="hf-select-chevron" aria-hidden="true" />
      </button>

      {open && pos && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            tabIndex={-1}
            className={cn('hf-select-menu', pos.placement === 'up' && 'hf-select-menu-up', menuClassName)}
            style={{ left: pos.left, top: pos.top, width: pos.width, minWidth: menuMinWidth }}
          >
            {items.length === 0 ? (
              <div className="hf-select-empty">{emptyLabel}</div>
            ) : (
              items.map((option, index) => {
                const isSelected = String(option.value) === String(value ?? '');
                const isActive = index === activeIndex;
                return (
                  <div
                    key={option.value ?? index}
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    data-active={isActive}
                    data-selected={isSelected}
                    data-disabled={option.disabled || undefined}
                    className="hf-select-option"
                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commit(option)}
                  >
                    <span className="hf-select-option-label">{option.label}</span>
                    {isSelected && <Check size={15} className="hf-select-option-check" aria-hidden="true" />}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
