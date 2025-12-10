// ClassList.tsx
import React from 'react';

interface ClassEntry {
  name: string;
  level: number;
}

interface ClassListProps {
  classes: ClassEntry[] | null | undefined;
}

const ClassList: React.FC<ClassListProps> = ({ classes }) => {
  if (!classes || classes.length === 0) {
    return <span>No class assigned</span>;
  }
//   const classText = classes.map((cls) => `${cls.name} ${cls.level}`).join(' / ');
//   return <span>{classText}</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {classes.map((cls) => (
        <li key={cls.name}>
          {cls.name} {cls.level}
        </li>
      ))}
    </ul>
  );
};

export default ClassList;