import React, { FC } from "react";

import { PlusOutlined } from "@ant-design/icons";

interface FilterOptionsProps {
  addFilterRow: (child?: boolean) => void;
  unNest?: () => void;
  convertNested?: () => void;
  removeFilter: () => void;
  deleteDisable: boolean;
  child: boolean;
  last: boolean;
  hasChildren: boolean;
}

const FilterOptions: FC<FilterOptionsProps> = ({
  addFilterRow,
  unNest,
  convertNested,
  removeFilter,
  deleteDisable,
  child,
  last,
  hasChildren,
}) => {
  return (
    <div className="filter-modal">
      <button type="button" onClick={() => addFilterRow(child)}>
        <span>
          <PlusOutlined /> Add filter
        </span>
      </button>
      {!child && (
        <button type="button" onClick={() => addFilterRow(true)}>
          <span>
            <img src="/images/add-nested.svg" alt="Add nested filter" /> Add
            nested filter
          </span>
        </button>
      )}
      {!child && !hasChildren && !last && (
        <button type="button" onClick={convertNested}>
          <span>
            <img
              src="/images/convert-nested.svg"
              alt="Convert to nested filter"
            />
            Convert to nested filter
          </span>
        </button>
      )}
      {(hasChildren || child) && (
        <button type="button" onClick={unNest}>
          <span>
            <img src="/images/unnest.svg" alt="Unnest filter" /> Unnest filter
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={removeFilter}
        disabled={!child && deleteDisable}
      >
        <span>
          <img src="/images/remove-filter.svg" alt="Remove filter" /> Remove
          filter
        </span>
      </button>
    </div>
  );
};

export default FilterOptions;
