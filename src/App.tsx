import React, { useState } from "react";

import Filter from "./components/Reusables/Filter";

function App() {
  const [filter, setFilter] = useState({
    and: [
      {
        key: "Age",
        agg: "sum",
        op: "lte",
        value: "23",
      },
      {
        and: [
          {
            key: "First Name",
            op: "stw",
            value: "Ed",
          },
          {
            key: "Last Name",
            op: "cont",
            value: "a",
          },
        ],
      },
    ],
  });
  console.log("filter", filter);
  return (
    <Filter
      callback={(filter) => setFilter(filter)}
      data={Object.keys(filter).length > 0 ? filter : null}
    />
  );
}

export default App;
