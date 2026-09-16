'use client';

import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { type ReactNode, useCallback } from 'react';

import { cn } from '@/lib/utils';

interface AccordionContextType {
  isActive?: boolean;
  value?: string;
  onChangeIndex?: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType>({});
const useAccordion = () => React.useContext(AccordionContext);

interface AccordionProps {
  children: ReactNode;
  multiple?: boolean;
  defaultValue?: string | string[];
}

export function Accordion({ children, multiple, defaultValue }: AccordionProps) {
  const [activeIndex, setActiveIndex] = React.useState<string | string[] | null>(
    multiple ? (Array.isArray(defaultValue) ? defaultValue : []) : defaultValue || null,
  );

  const onChangeIndex = useCallback(
    (value: string) => {
      setActiveIndex((currentActiveIndex) => {
        if (!multiple) {
          return value === currentActiveIndex ? null : value;
        }
        if (Array.isArray(currentActiveIndex)) {
          if (currentActiveIndex.includes(value)) {
            return currentActiveIndex.filter((i) => i !== value);
          }
          return [...currentActiveIndex, value];
        }
        return [value];
      });
    },
    [multiple],
  );

  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        const childProps = child.props as { value: string };
        const value = childProps.value;
        const isActive = multiple
          ? Array.isArray(activeIndex) && activeIndex.includes(value)
          : activeIndex === value;

        return (
          <AccordionContext.Provider value={{ isActive, value, onChangeIndex }}>
            {child}
          </AccordionContext.Provider>
        );
      })}
    </>
  );
}

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, className }: AccordionItemProps) {
  const { isActive } = useAccordion();

  return (
    <div
      data-active={isActive || undefined}
      className={cn('group mb-2 overflow-hidden rounded-lg border border-border', className)}
    >
      {children}
    </div>
  );
}

interface AccordionHeaderProps {
  children: ReactNode;
  customIcon?: boolean;
  className?: string;
}

export function AccordionHeader({ children, customIcon, className }: AccordionHeaderProps) {
  const { isActive, value, onChangeIndex } = useAccordion();

  const handleClick = useCallback(() => {
    if (value && onChangeIndex) {
      onChangeIndex(value);
    }
  }, [onChangeIndex, value]);

  return (
    <motion.button
      type="button"
      data-active={isActive || undefined}
      aria-expanded={isActive}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-2 p-4 text-left font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground data-active:bg-muted data-active:text-foreground',
        className,
      )}
      onClick={handleClick}
    >
      {children}
      {!customIcon && (
        <ChevronDown
          className={cn(
            'shrink-0 text-muted-foreground transition-transform',
            isActive ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}

interface AccordionPanelProps {
  children: ReactNode;
  className?: string;
  articleClassName?: string;
}

export function AccordionPanel({ children, className, articleClassName }: AccordionPanelProps) {
  const { isActive, value } = useAccordion();

  return (
    <AnimatePresence initial={true}>
      {isActive && (
        <motion.div
          data-active={isActive || undefined}
          role="region"
          id={`accordion-panel-${value}`}
          aria-labelledby={`accordion-header-${value}`}
          initial={{ height: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', overflow: 'hidden' }}
          exit={{ height: 0 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={cn('bg-secondary px-2 text-foreground data-active:bg-muted', className)}
        >
          <motion.div
            initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
            exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className={cn('space-y-2 bg-transparent px-3 pb-4', articleClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
