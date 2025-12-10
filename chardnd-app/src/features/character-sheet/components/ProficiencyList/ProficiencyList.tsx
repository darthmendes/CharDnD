import React from "react";

interface ProficiencyListEntry {
  name: string;
  level: number;
}

interface ProficiencyListProps {
  profs: ProficiencyListEntry[] | null | undefined;
}

const ProficiencyList: React.FC<ProficiencyListProps> = ({ profs }) => {
    if (!profs || profs.length === 0) {
        return <span>No proficiencies assigned</span>;
    }
    return(
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {profs.map((cls) => (
        <li key={cls.name}>
          {cls.name}
        </li>
      ))}
    </ul>
  );
};

export default ProficiencyList;