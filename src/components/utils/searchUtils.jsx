// Advanced Search & Filter Utilities

export const createFilter = (query, fields) => {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();
  return (item) => {
    return fields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return String(value).toLowerCase().includes(lowerQuery);
    });
  };
};

export const filterByDateRange = (items, startDate, endDate, dateField) => {
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

export const filterByStatus = (items, statuses, statusField) => {
  return items.filter(item => statuses.includes(item[statusField]));
};

export const filterByCategory = (items, categories, categoryField) => {
  return items.filter(item => categories.includes(item[categoryField]));
};

export const combinedFilter = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined) return true;
      if (Array.isArray(value)) return value.includes(item[key]);
      return item[key] === value;
    });
  });
};

export const sortItems = (items, sortBy, direction = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return sorted;
};

export const paginateItems = (items, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

export const getPageCount = (totalItems, pageSize) => {
  return Math.ceil(totalItems / pageSize);
};