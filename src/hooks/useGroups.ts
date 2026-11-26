import { useMemo } from 'react';
import { useSplitter } from '../context/SplitterContext';
import type { Group } from '../types/splitter';

export function useGroups() {
  const { groups, expenses, dispatch } = useSplitter();

  const addGroup = (group: Group) => dispatch({ type: 'ADD_GROUP', payload: group });
  const deleteGroup = (id: string) => dispatch({ type: 'DELETE_GROUP', payload: id });

  const groupsWithCount = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        expenseCount: expenses.filter((e) => e.groupId === g.id).length,
      })),
    [groups, expenses],
  );

  return { groups: groupsWithCount, addGroup, deleteGroup };
}
