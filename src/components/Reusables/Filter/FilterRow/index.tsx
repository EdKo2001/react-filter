import { ChangeEvent, FC, LegacyRef } from "react";

import { Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import FilterInputs from "../FilterInputs";

const { Option } = Select;

interface FilterRowProps {
  filterRowId: number;
  aggregators: { key: string; name: string }[];
  operators: { op: string; name: string; type: string[] | boolean }[];
  values: {
    rules?: {
      key?: string;
      agg?: string;
      op?: string;
      value?: string;
      errors: {
        key: boolean;
        op: boolean;
        value: boolean;
      };
    }[];
    combinator?: string;
  } & {
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
  errors?: any;
  removeFilterRow: (filterId?: number) => void;
  handleChange: (
    event: ChangeEvent<HTMLInputElement> | string,
    name: string,
    filterId?: number
  ) => void;
  handleGroup: (type: string, filterRowId?: number) => void;
  group: string;
  addFilterRow: (child?: boolean, childId?: number) => void;
  unNest?: (childId?: number) => void;
  last: boolean;
  deleteDisable: boolean;
  showAgg: boolean;
  hasChildren?: boolean;
  innerRef?: LegacyRef<HTMLDivElement>;
  provided?: any;
}

const FilterRow: FC<FilterRowProps> = ({
  filterRowId,
  aggregators,
  operators,
  values,
  removeFilterRow,
  handleChange,
  handleGroup,
  group,
  addFilterRow,
  unNest,
  last,
  deleteDisable,
  showAgg,
  hasChildren,
  provided,
  innerRef,
}) => {
  return (
    <Row
      className={`filter-row ${last ? " active" : ""}`}
      ref={innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      {filterRowId === 0 ? (
        <p className="filter-where parent">Where</p>
      ) : (
        <Select
          onChange={(e) => handleGroup(e)}
          defaultValue="and"
          className={`filter-group parent  ${group === "or" ? " or" : ""}`}
          value={group}
        >
          <Option value="and">And</Option>
          <Option value="or">Or</Option>
        </Select>
      )}
      {(last || hasChildren) && (
        <img
          src="/images/filter-drag.svg"
          alt="filter drag"
          className="filter-drag"
        />
      )}
      <div className="filter-content">
        {Array.isArray(values.rules) ? (
          values.rules.map((filter: any, filterId: number) => (
            <FilterInputs
              key={`filter${filterId}`}
              filterId={filterId}
              aggregators={aggregators}
              operators={operators}
              values={filter}
              handleChange={(event, name) =>
                handleChange(event, name!, filterId)
              }
              handleGroup={(e) => handleGroup(e, filterRowId)}
              group={values.combinator!}
              removeFilterRow={() =>
                filterId === 0 ? removeFilterRow() : removeFilterRow(filterId)
              }
              deleteDisable={deleteDisable}
              showAgg={showAgg}
              addFilterRow={(child?: boolean, childId?: number | null) =>
                addFilterRow(child, childId!)
              }
              unNest={() => (filterId === 0 ? unNest?.() : unNest?.(filterId))}
              parent={filterId === 0}
              child={filterId !== 0}
              hasChildren={hasChildren}
            />
          ))
        ) : (
          <FilterInputs
            key={`filter${filterRowId}`}
            filterId={filterRowId}
            aggregators={aggregators}
            operators={operators}
            values={values}
            handleChange={(event, name) => handleChange(event, name!)}
            handleGroup={(e) => handleGroup(e)}
            group={group}
            removeFilterRow={() => removeFilterRow()}
            deleteDisable={deleteDisable}
            last={last}
            showAgg={showAgg}
            addFilterRow={(child?: boolean) => addFilterRow(child)}
          />
        )}
        <div className="filter-break" />
        {last && (
          <button
            type="button"
            onClick={() => addFilterRow(true)}
            className="filter-add"
          >
            <PlusOutlined />
            Add Filter
          </button>
        )}
      </div>
    </Row>
  );
};

export default FilterRow;
