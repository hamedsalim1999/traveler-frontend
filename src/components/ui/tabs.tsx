'use client';

import { AnimatePresence, motion } from 'motion/react';
import React, {
  createContext,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

interface TabContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  wobbly: boolean;
  hover: boolean;
  defaultValue: string;
  prevIndex: number;
  setPrevIndex: (value: number) => void;
  tabsOrder: string[];
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};

interface TabsProviderProps {
  children: ReactNode;
  defaultValue: string;
  wobbly?: boolean;
  hover?: boolean;
}

interface TabsBtnProps {
  children: ReactNode;
  className?: string;
  value: string;
}

interface TabsContentProps {
  children: ReactNode;
  className?: string;
  value: string;
  yValue?: boolean;
}

export const TabsProvider: React.FC<TabsProviderProps> = React.memo(
  ({ children, defaultValue, wobbly = true, hover = false }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    const [prevIndex, setPrevIndex] = useState(0);

    const tabsOrder = useMemo(() => {
      return React.Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === TabsContent)
        .map((child) => (child as React.ReactElement<{ value: string }>).props.value);
    }, [children]);

    const contextValue = useMemo(
      () => ({
        activeTab,
        setActiveTab,
        wobbly,
        hover,
        defaultValue,
        setPrevIndex,
        prevIndex,
        tabsOrder,
      }),
      [activeTab, setActiveTab, wobbly, hover, defaultValue, prevIndex, tabsOrder],
    );

    return <TabContext.Provider value={contextValue}>{children}</TabContext.Provider>;
  },
);

export const TabsBtn: React.FC<TabsBtnProps> = React.memo(({ children, className, value }) => {
  const { activeTab, setPrevIndex, setActiveTab, defaultValue, hover, wobbly, tabsOrder } =
    useTabs();

  const handleClick = useCallback(() => {
    setPrevIndex(tabsOrder.indexOf(activeTab));
    setActiveTab(value);
  }, [setPrevIndex, tabsOrder, activeTab, setActiveTab, value]);

  return (
    <motion.div
      className={cn('relative cursor-pointer rounded-md p-2 px-2 2xl:px-4', className)}
      onFocus={() => hover && handleClick()}
      onMouseEnter={() => hover && handleClick()}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence mode="wait">
        {activeTab === value && (
          <>
            <motion.div
              transition={{ layout: { duration: 0.2, ease: 'easeInOut', delay: 0.2 } }}
              layoutId={defaultValue}
              className="absolute left-0 top-0 z-1 h-full w-full rounded-md bg-card"
            />

            {wobbly && (
              <>
                <motion.div
                  transition={{ layout: { duration: 0.4, ease: 'easeInOut', delay: 0.04 } }}
                  layoutId={defaultValue}
                  className="tab-shadow absolute left-0 top-0 z-1 h-full w-full rounded-md bg-card"
                />
                <motion.div
                  transition={{ layout: { duration: 0.4, ease: 'easeOut', delay: 0.2 } }}
                  layoutId={`${defaultValue}b`}
                  className="tab-shadow absolute left-0 top-0 z-1 h-full w-full rounded-md bg-card"
                />
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export const TabsContent: React.FC<TabsContentProps> = React.memo(
  ({ children, className, value, yValue }) => {
    const { activeTab, tabsOrder, prevIndex } = useTabs();

    const isForward = useMemo(
      () => tabsOrder.indexOf(activeTab) > prevIndex,
      [tabsOrder, activeTab, prevIndex],
    );

    return (
      <AnimatePresence mode="popLayout">
        {activeTab === value && (
          <motion.div
            initial={{ opacity: 0, y: yValue ? (isForward ? 10 : -10) : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: yValue ? (isForward ? -50 : 50) : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut', delay: 0.5 }}
            className={cn('relative rounded-md p-2 px-4', className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

TabsProvider.displayName = 'TabsProvider';
TabsBtn.displayName = 'TabsBtn';
TabsContent.displayName = 'TabsContent';
