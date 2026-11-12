import { useState, useCallback } from 'react';

type CollapsibleSection = 'speciesLevel' | 'traits' | 'spellcasting' | 'inventory' | 'combat' | 'classResources';

export const useCollapsibleSections = () => {
  const [collapsedSections, setCollapsedSections] = useState<Record<CollapsibleSection, boolean>>({
    speciesLevel: false,
    traits: false,
    spellcasting: false,
    inventory: false,
    combat: false,
    classResources: false,
  });

  const toggleSection = useCallback((section: CollapsibleSection) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return { collapsedSections, toggleSection };
};
