import { FC, useState, useEffect, ChangeEvent } from "react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import FilterRow from "./FilterRow";
import InstantAlert from "../InstantAlert";
import FilterInputs from "./FilterInputs";

interface FilterRowValues {
  rules: {
    key?: string;
    agg?: string;
    op?: string;
    value?: string;
    errors: {
      key: boolean;
      op: boolean;
      value: boolean;
    };
    rules?: {
      key: string;
      agg?: string;
      op: string;
      value: string;
      errors: {
        key: boolean;
        op: boolean;
        value: boolean;
      };
    }[];
    combinator?: string;
  }[];
  combinator: string;
}

interface FilterProps {
  callback: (filters: any) => void;
  data: any;
}

const Filter: FC<FilterProps> = ({ callback, data }) => {
  // eslint-disable-next-line
  const [aggregators, setAggregators] = useState([
    {
      key: "avg",
      name: "AVG.",
    },
    {
      key: "max",
      name: "MAX.",
    },
    {
      key: "min",
      name: "MIN",
    },
    {
      key: "sum",
      name: "SUM",
    },
    {
      key: "sum_distinct",
      name: "SUM DISTINCT",
    },
    {
      key: "count",
      name: "COUNT",
    },
    {
      key: "count_distinct",
      name: "COUNT DISTINCT",
    },
  ]); // eslint-disable-next-line
  const [operators, setOperators] = useState([
    {
      op: "lt",
      type: ["number", "integer", "float", "timestamp"],
      name: "<",
    },
    {
      op: "gt",
      type: ["number", "integer", "float", "timestamp"],
      name: ">",
    },
    {
      op: "lte",
      type: ["number", "integer", "float", "timestamp"],
      name: "<=",
    },
    {
      op: "gte",
      type: ["number", "integer", "float", "timestamp"],
      name: ">=",
    },
    {
      op: "eq",
      type: ["number", "integer", "float", "timestamp", "boolean"],
      name: "=",
    },
    {
      op: "neq",
      type: ["number", "integer", "float", "timestamp", "boolean"],
      name: "≠",
    },
    {
      op: "is",
      type: ["string"],
      name: "Is",
    },
    {
      op: "nis",
      type: ["string"],
      name: "Is not",
    },
    {
      op: "stw",
      type: ["string"],
      name: "Starts With",
    },
    {
      op: "edw",
      type: ["string"],
      name: "Ends With",
    },
    {
      op: "cont",
      type: ["string"],
      name: "Contains",
    },
    {
      op: "ncont",
      type: ["string"],
      name: "Does not contain",
    },
    {
      op: "reg",
      type: ["string"],
      name: "Matches (reg.)",
    },
    {
      op: "nreg",
      type: ["string"],
      name: "Does not match (reg.)",
    },
    {
      op: "exists",
      type: true,
      name: "Exists",
    },
    {
      op: "nexists",
      type: true,
      name: "Does not exist",
    },
  ]); // eslint-disable-next-line
  const [parameters, setParameters] = useState({
    key: "event_property",
    name: "Project ID",
    collection: "event",
    generated: false,
    type: "string",
    dm: "d",
    aggregate: true,
  });
  const [filterRows, setFilterRows] = useState<FilterRowValues>({
    rules: [
      {
        key: "",
        agg: "",
        op: "",
        value: "",
        errors: {
          key: false,
          op: false,
          value: false,
        },
      },
    ],
    combinator: "and",
  });
  const [isLoading, setLoading] = useState(true);

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    message: "",
    type: "success",
  });

  useEffect(
    () =>
      data
        ? (setFilterRows({
            rules:
              // @ts-ignore
              Object.entries(data)[0][1].map((dataFilter) =>
                Object.keys(dataFilter)[0] === "key"
                  ? {
                      ...dataFilter,
                      errors: { key: false, op: false, value: false },
                    }
                  : {
                      // @ts-ignore
                      rules: Object.entries(dataFilter)[0][1].map(
                        (dataFilterChild: any) => ({
                          ...dataFilterChild,
                          errors: { key: false, op: false, value: false },
                        })
                      ),
                      combinator: Object.keys(dataFilter)[0],
                    }
              ),
            combinator: Object.keys(data)[0],
          }),
          setLoading(false))
        : setLoading(false),
    [data]
  );

  const addFilterRow = (
    id?: number,
    child?: boolean,
    childId?: number | null
  ) => {
    const tempFilters = JSON.parse(JSON.stringify(filterRows));
    let selectedTempFilter: FilterRowValues;
    if (typeof id === "number") {
      selectedTempFilter = tempFilters.rules[id];
      if (child) {
        if (typeof childId === "number") {
          tempFilters.rules[id].rules.splice(childId + 1, 0, {
            key: "",
            agg: "",
            op: "",
            value: "",
            errors: {
              key: false,
              op: false,
              value: false,
            },
          });
        } else {
          !Array.isArray(tempFilters.rules[id]?.rules) &&
            tempFilters.rules.splice(id, 1, {
              rules: [{ ...selectedTempFilter }],
              combinator: "and",
            });

          tempFilters.rules[id].rules.push({
            key: "",
            agg: "",
            op: "",
            value: "",
            errors: {
              key: false,
              op: false,
              value: false,
            },
          });
        }
      } else {
        tempFilters.rules.splice(id + 1, 0, {
          key: "",
          agg: "",
          op: "",
          value: "",
          errors: {
            key: false,
            op: false,
            value: false,
          },
        });
      }
    } else {
      tempFilters.rules.push({
        key: "",
        agg: "",
        op: "",
        value: "",
        errors: {
          key: false,
          op: false,
          value: false,
        },
      });
    }

    setFilterRows(tempFilters);
  };

  const validate = (
    name: string,
    value: string,
    filterRowId: number,
    filterId?: number
  ) => {
    const tempFilters = JSON.parse(JSON.stringify(filterRows));
    if (typeof filterId === "number") {
      switch (name) {
        case "key":
          tempFilters.rules[filterRowId].rules[filterId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = false;
          }
          break;
        case "value":
          tempFilters.rules[filterRowId].rules[filterId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = false;
          }
          break;
        case "op":
          tempFilters.rules[filterRowId].rules[filterId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].rules[filterId].errors[name] = false;
          }
          break;
        case "agg":
          tempFilters.rules[filterRowId].rules[filterId][name] = value;
          break;
        default:
          break;
      }
    } else {
      switch (name) {
        case "key":
          tempFilters.rules[filterRowId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].errors[name] = false;
          }
          break;
        case "value":
          tempFilters.rules[filterRowId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].errors[name] = false;
          }
          break;
        case "op":
          tempFilters.rules[filterRowId][name] = value;
          if (value === "") {
            tempFilters.rules[filterRowId].errors[name] = true;
          } else {
            tempFilters.rules[filterRowId].errors[name] = false;
          }
          break;
        case "agg":
          tempFilters.rules[filterRowId][name] = value;
          break;
        default:
          break;
      }
    }
    setFilterRows(tempFilters);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | string,
    name: string,
    filterRowId: number,
    filterId?: number
  ) => {
    if (typeof filterId === "number") {
      if (event === undefined) {
        //after select field clear
        return;
      } else if (typeof event === "string") {
        // select field value
        validate(name, event, filterRowId, filterId);
      } else {
        // input field value
        validate(event.target.name, event.target.value, filterRowId, filterId);
      }
    } else {
      if (event === undefined) {
        //after select field clear
        return;
      } else if (typeof event === "string") {
        // select field value
        validate(name, event, filterRowId);
      } else {
        // input field value
        validate(event.target.name, event.target.value, filterRowId);
      }
    }
  };

  const handleGroup = (e: string, filterId?: number) => {
    const tempFilters = JSON.parse(JSON.stringify(filterRows));
    if (typeof filterId === "number") {
      tempFilters.rules[filterId].combinator = e;
    } else {
      tempFilters.combinator = e;
    }
    setFilterRows(tempFilters);
  };

  const convertToNested = (filterRowId: number) => {
    // Deep copy
    const tempFilters: FilterRowValues = JSON.parse(JSON.stringify(filterRows));
    const selectedTempFilter = tempFilters.rules[filterRowId];

    tempFilters.rules.splice(filterRowId, 1, {
      //@ts-ignore
      rules: [{ ...selectedTempFilter }],
      combinator: "and",
    });

    setFilterRows(tempFilters);
  };

  const unNest = (filterRowId: number, childId?: number) => {
    // Deep copy
    const tempFilter: FilterRowValues = JSON.parse(
      JSON.stringify(filterRows.rules[filterRowId])
    );

    const tempFiltersNew = { ...filterRows };

    let tempChild;

    if (typeof childId === "number") {
      tempChild = JSON.parse(JSON.stringify(tempFilter.rules[childId]));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    typeof childId === "number"
      ? tempFiltersNew?.rules[filterRowId]?.rules?.length === 2
        ? (tempFiltersNew.rules.splice(
            filterRowId,
            1,
            //@ts-ignore
            tempFiltersNew.rules[filterRowId].rules[0]
          ),
          tempFiltersNew.rules.splice(filterRowId + 1, 0, tempChild),
          delete tempFiltersNew.rules[filterRowId].rules)
        : (tempFiltersNew.rules.splice(filterRowId + 1, 0, tempChild),
          tempFiltersNew?.rules[filterRowId]?.rules?.splice(childId, 1))
      : (tempFiltersNew.rules.splice(filterRowId + 1, 0, {
          key: tempFilter.rules[0].key,
          agg: tempFilter.rules[0].agg,
          op: tempFilter.rules[0].op,
          value: tempFilter.rules[0].value,
          errors: {
            op: tempFilter.rules[0].errors.op,
            key: tempFilter.rules[0].errors.key,
            value: tempFilter.rules[0].errors.value,
          },
        }),
        (tempFiltersNew.rules[filterRowId].agg = tempFilter.rules[0].agg),
        (tempFiltersNew.rules[filterRowId].op = tempFilter.rules[0].op),
        (tempFiltersNew.rules[filterRowId].key = tempFilter.rules[0].key),
        (tempFiltersNew.rules[filterRowId].value = tempFilter.rules[0].value),
        tempFiltersNew?.rules[filterRowId]?.rules?.splice(0, 1),
        tempFiltersNew?.rules[filterRowId]?.rules?.length === 1 &&
          tempFiltersNew.rules.splice(
            filterRowId,
            1,
            //@ts-ignore
            tempFiltersNew?.rules[filterRowId]?.rules[0]
          ));

    setFilterRows(tempFiltersNew);
  };

  const removeFilterRow = (filterRowId: number, filterId?: number) => {
    const tempFilters = JSON.parse(JSON.stringify(filterRows));
    if (typeof filterId === "number") {
      tempFilters.rules[filterRowId].rules.length === 2
        ? tempFilters.rules.splice(
            filterRowId,
            1,
            tempFilters.rules[filterRowId].rules[0]
          ) && delete tempFilters.rules[filterRowId].rules
        : tempFilters.rules[filterRowId].rules.splice(filterId, 1);
    } else {
      tempFilters.rules.splice(filterRowId, 1);
    }
    setFilterRows(tempFilters);
  };

  const handleValidation = () => {
    let formIsValid = true;
    filterRows.rules.forEach((fieldRow) => {
      if (fieldRow?.rules) {
        fieldRow.rules.forEach((filter) => {
          //key
          if (filter["key"] === "") {
            // @ts-ignore
            filter.errors["key"] = true;
          } else {
            filter.errors["key"] = false;
          }
          //operators
          if (filter["op"] === "") {
            // @ts-ignore
            filter.errors["op"] = true;
          } else {
            filter.errors["op"] = false;
          }
          //value
          if (filter["value"] === "") {
            // @ts-ignore
            filter.errors["value"] = true;
          } else {
            filter.errors["value"] = false;
          }
        });
      } else {
        //key
        if (fieldRow["key"] === "") {
          // @ts-ignore
          fieldRow.errors["key"] = true;
        } else {
          fieldRow.errors["key"] = false;
        }
        //operators
        if (fieldRow["op"] === "") {
          // @ts-ignore
          fieldRow.errors["op"] = true;
        } else {
          fieldRow.errors["op"] = false;
        }
        //value
        if (fieldRow["value"] === "") {
          // @ts-ignore
          fieldRow.errors["value"] = true;
        } else {
          fieldRow.errors["value"] = false;
        }
      }
    });

    filterRows.rules.forEach((errors) => {
      errors?.rules
        ? errors.rules.filter((error) =>
            Object.keys(error.errors).forEach((key) => {
              // @ts-ignore
              error.errors[key] === true && (formIsValid = false);
            })
          )
        : Object.keys(errors.errors).forEach((key) => {
            // @ts-ignore
            errors.errors[key] === true && (formIsValid = false);
          });
    });

    return formIsValid;
  };

  const handleValueValidation = () => {
    let inputValuesValid = true;
    let childrenValuesValide = true;
    filterRows.rules.forEach((fieldRow) => {
      if (fieldRow?.rules) {
        fieldRow?.rules.forEach((childRow) => {
          const types = operators.filter((op) => op.op === childRow["op"])[0]
            ?.type;
          const typesResult = Array.isArray(types)
            ? types.filter(
                (type) =>
                  type === typeof childRow["value"] || // @ts-ignore
                  type ===
                    typeof (isNaN(parseInt(childRow["value"]))
                      ? false
                      : parseInt(childRow["value"]))
              )
            : types === true
            ? childRow["value"] === "true" || "false"
            : false;
          childrenValuesValide = Array.isArray(typesResult)
            ? typesResult?.length > 0
              ? (inputValuesValid = true)
              : (inputValuesValid = false)
            : typesResult === false
            ? (inputValuesValid = false)
            : (inputValuesValid = true);
        });
      } else {
        const types = operators.filter((op) => op.op === fieldRow["op"])[0]
          ?.type;
        const typesResult = Array.isArray(types)
          ? types.filter(
              (type) =>
                type === typeof fieldRow["value"] || // @ts-ignore
                type ===
                  typeof (isNaN(parseInt(fieldRow["value"] as string))
                    ? false
                    : parseInt(fieldRow["value"] as string))
            )
          : types === true
          ? fieldRow["value"] === "true" || "false"
          : false;
        Array.isArray(typesResult)
          ? typesResult?.length > 0
            ? (inputValuesValid = true)
            : (inputValuesValid = false)
          : typesResult === false
          ? (inputValuesValid = false)
          : (inputValuesValid = true);
      }
    });
    return inputValuesValid && childrenValuesValide;
  };

  const formatFilters = (filterRows: FilterRowValues) => {
    // Deep copy
    const tempFilters: FilterRowValues = JSON.parse(JSON.stringify(filterRows));
    // whether aggregate is true or false
    const showAggregate = parameters?.aggregate;
    // getting the group from the main row
    const mainGroup = tempFilters.combinator;
    // deleting agg if parameters?.aggregate is false
    !showAggregate &&
      tempFilters.rules.forEach(
        (filterRow) =>
          delete filterRow.agg &&
          filterRow?.rules?.forEach((child) => delete child.agg)
      );
    // deleting agg if it is empty
    showAggregate &&
      tempFilters.rules.forEach(
        (filterRow) =>
          (filterRow.agg === "" && delete filterRow.agg) ||
          filterRow?.rules?.forEach(
            (child) => child.agg === "" && delete child.agg
          )
      );
    // deleting errors
    tempFilters.rules.forEach(
      (filterRow) =>
        //@ts-ignore
        delete filterRow.errors && //@ts-ignore
        filterRow?.rules?.forEach((child) => delete child.errors)
    );
    // uniting into one object
    const formattedObject = {
      [mainGroup]: tempFilters.rules.map((filterRow, idx) => {
        const childrenArray =
          //@ts-ignore
          filterRow?.rules?.length > 0 &&
          filterRow?.rules?.map((childRow) => childRow); //@ts-ignore
        return filterRow?.rules?.length > 0
          ? {
              //@ts-ignore
              [tempFilters.rules[idx].combinator]: [...childrenArray],
            }
          : filterRow;
      }),
    };
    callback(formattedObject);
    console.log("formattedObject", JSON.stringify(formattedObject, null, 2));
  };

  const clearHandler = () => {
    setFilterRows({
      rules: [
        {
          key: "",
          agg: "",
          op: "",
          value: "",
          errors: {
            key: false,
            op: false,
            value: false,
          },
        },
      ],
      combinator: "and",
    });
  };

  const submitHadler = () => {
    if (handleValidation()) {
      if (handleValueValidation()) {
        formatFilters(filterRows);
        setAlert({
          message: "Success saved the filter settings.",
          type: "success",
        });
      } else {
        setAlert({
          message: "Values have incorrect values.",
          type: "warning",
        });
      }
    } else {
      setAlert({
        message: "Please fill out all required fields.",
        type: "warning",
      });
    }
  };

  // Function to update list on drop
  const handleDrop = (droppedItem: any) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;
    var updatedList = { ...filterRows };
    // Remove dragged item
    const [reorderedItem] = updatedList.rules.splice(
      droppedItem.source.index,
      1
    );
    // Add dropped item
    updatedList.rules.splice(droppedItem.destination.index, 0, reorderedItem);
    // Update State
    setFilterRows(updatedList);
  };

  return (
    <>
      <InstantAlert message={alert.message} type={alert.type} />
      <Form onFinish={submitHadler} className="filter">
        <DragDropContext onDragEnd={handleDrop}>
          <Droppable droppableId="list-container">
            {(provided) => (
              <div
                className="filter-rows"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {!isLoading &&
                  filterRows.rules.map((filterRow, filterRowId) => {
                    if (Array.isArray(filterRows?.rules[filterRowId]?.rules)) {
                      return (
                        <Draggable
                          key={filterRowId}
                          draggableId={filterRowId.toString()}
                          index={filterRowId}
                        >
                          {(provided) => (
                            <FilterRow
                              innerRef={provided.innerRef}
                              provided={provided}
                              key={`filter${filterRowId}`}
                              filterRowId={filterRowId}
                              aggregators={aggregators}
                              operators={operators}
                              values={filterRow}
                              group={filterRows.combinator}
                              handleChange={(
                                event: any,
                                name: any,
                                filterId: any
                              ) =>
                                handleChange(event, name, filterRowId, filterId)
                              }
                              handleGroup={(e, filterRowId?: number) =>
                                handleGroup(e, filterRowId)
                              }
                              removeFilterRow={(filterId?: number) =>
                                removeFilterRow(filterRowId, filterId)
                              }
                              addFilterRow={(
                                child?: boolean,
                                childId?: number
                              ) => addFilterRow(filterRowId, child, childId)}
                              unNest={(childId?: number) =>
                                unNest(filterRowId, childId)
                              }
                              deleteDisable={filterRows.rules.length === 1}
                              showAgg={parameters?.aggregate}
                              last
                              hasChildren
                            />
                          )}
                        </Draggable>
                      );
                    }
                    if (filterRows?.rules?.length - 1 === filterRowId) {
                      return (
                        <Draggable
                          key={filterRowId}
                          draggableId={filterRowId.toString()}
                          index={filterRowId}
                        >
                          {(provided) => (
                            <FilterRow
                              innerRef={provided.innerRef}
                              provided={provided}
                              key={`filter${filterRowId}`}
                              filterRowId={filterRowId}
                              aggregators={aggregators}
                              operators={operators}
                              values={filterRow}
                              handleChange={(event, name: string) =>
                                handleChange(event, name, filterRowId)
                              }
                              handleGroup={(e) => handleGroup(e)}
                              group={filterRows.combinator}
                              removeFilterRow={() =>
                                removeFilterRow(filterRowId)
                              }
                              addFilterRow={(
                                child?: boolean,
                                childId?: number
                              ) => addFilterRow(filterRowId, child, childId)}
                              deleteDisable={filterRows.rules.length === 1}
                              showAgg={parameters?.aggregate}
                              last
                            />
                          )}
                        </Draggable>
                      );
                    }
                    return (
                      <Draggable
                        key={filterRowId}
                        draggableId={filterRowId.toString()}
                        index={filterRowId}
                      >
                        {(provided) => (
                          <FilterInputs
                            innerRef={provided.innerRef}
                            provided={provided}
                            key={`filter${filterRowId}`}
                            filterId={filterRowId}
                            aggregators={aggregators}
                            operators={operators}
                            values={filterRow}
                            handleChange={(event, name) =>
                              handleChange(event, name!, filterRowId)
                            }
                            handleGroup={(e) => handleGroup(e)}
                            group={filterRows.combinator}
                            removeFilterRow={() => removeFilterRow(filterRowId)}
                            deleteDisable={filterRows.rules.length === 1}
                            showAgg={parameters?.aggregate}
                            addFilterRow={(
                              child?: boolean,
                              childId?: number | null
                            ) => addFilterRow(filterRowId, child, childId)}
                            convertNested={() => convertToNested(filterRowId)}
                          />
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          type="button"
          onClick={() => addFilterRow()}
          className="filter-add"
        >
          <PlusOutlined />
          Add Filter
        </button>
        <button className="filter-save">Save</button>
        <button type="button" className="filter-clear" onClick={clearHandler}>
          Clear Filters
        </button>
      </Form>
    </>
  );
};
export default Filter;
