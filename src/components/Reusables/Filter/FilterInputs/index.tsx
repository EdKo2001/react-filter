import { ChangeEvent, FC, LegacyRef, useState } from "react";

import { Input, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import FilterOptions from "../FilterOptions";

const { Option } = Select;

interface FilterChildProps {
  filterId: number;
  aggregators: { key: string; name: string }[];
  operators: { op: string; name: string; type: string[] | boolean }[];
  values?: {
    key?: string;
    agg?: string;
    op?: string;
    value?: string;
    errors: {
      key: boolean;
      op: boolean;
      value: boolean;
    };
  };
  removeFilterRow?: () => void;
  removeFilterChild?: () => void;
  handleChange?: (
    event: ChangeEvent<HTMLInputElement> | string,
    name?: string
  ) => void;
  handleChildChange?: (
    event: ChangeEvent<HTMLInputElement>,
    name?: string
  ) => void;
  handleGroup?: (type: string) => void;
  group: string;
  handleChildGroups?: (type: string) => void;
  parent?: boolean;
  child?: boolean;
  deleteDisable?: boolean;
  last?: boolean;
  showAgg: boolean;
  addFilterRow: (child?: boolean, childId?: number | null) => void;
  unNest?: () => void;
  convertNested?: () => void;
  hasChildren?: boolean;
  innerRef?: LegacyRef<HTMLDivElement>;
  provided?: any;
}

const FilterInputs: FC<FilterChildProps> = ({
  filterId,
  aggregators,
  operators,
  values,
  removeFilterRow,
  handleChange,
  handleGroup,
  group,
  parent,
  child,
  deleteDisable,
  last,
  showAgg,
  addFilterRow,
  unNest,
  convertNested,
  hasChildren,
  innerRef,
  provided,
}) => {
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  return (
    <div
      className="filter-inputs"
      ref={innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      {((filterId === 0 || parent) && !child) || last ? (
        <p className="filter-where">Where</p>
      ) : (
        <Select
          onChange={(e) => handleChange?.(e)}
          defaultValue="and"
          className={`filter-group  ${group === "or" ? " or" : ""}`}
          value={group}
        >
          <Option value="and">And</Option>
          <Option value="or">Or</Option>
        </Select>
      )}
      {!last && !hasChildren && (
        <img
          src="/images/filter-drag.svg"
          alt="filter drag"
          className="filter-drag"
        />
      )}
      <Input
        name="key"
        placeholder="Field name"
        onChange={(e) => handleChange?.(e)}
        className={`filter-input ${values?.errors?.key ? " error" : ""}`}
        value={values?.key}
      />
      {showAgg && (
        <Select
          placeholder="Aggregator"
          onChange={(e) => handleChange?.(e, "agg")}
          className="filter-input"
          value={values?.agg === "" ? null : values?.agg}
          allowClear
        >
          {aggregators?.map((aggregator, idx: number) => (
            <Option value={aggregator?.key} key={`aggregator${idx}`}>
              {aggregator?.name}
            </Option>
          ))}
        </Select>
      )}
      <Select
        placeholder="Operator"
        onChange={(e) => handleChange?.(e, "op")}
        className={`filter-input ${values?.errors?.op ? " error" : ""}`}
        value={values?.op === "" ? null : values?.op}
      >
        {operators?.map((operator, idx: number) => (
          <Option value={operator?.op} key={`operator${idx}`}>
            {operator?.name}
          </Option>
        ))}
      </Select>
      <Input
        name="value"
        placeholder="Value"
        onChange={(e) => handleChange?.(e)}
        className={`filter-input ${values?.errors?.value ? " error" : ""}`}
        value={values?.value}
      />
      <button
        type="button"
        className="filter-modal-button"
        onClick={() => setShowFilterOptions((prevState) => !prevState)}
        onBlur={() =>
          setTimeout(() => {
            setShowFilterOptions(false);
          }, 300)
        }
      >
        <img src="/images/filter-modal.svg" alt="filter's modal" />
        {showFilterOptions && (
          <FilterOptions
            addFilterRow={(child?: boolean) =>
              addFilterRow(child, hasChildren ? filterId : null)
            }
            convertNested={convertNested}
            unNest={unNest}
            removeFilter={removeFilterRow!}
            deleteDisable={deleteDisable!}
            hasChildren={hasChildren!}
            child={child!}
            last={last!}
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => removeFilterRow?.()}
        className="filter-delete"
        disabled={child ? false : deleteDisable}
      >
        <DeleteOutlined />
      </button>
    </div>
  );
};

export default FilterInputs;
