import React, { useEffect, useState } from "react";
import "./Table.css";
import { dummyEmiDatas } from "./dummyDatas";
import { changeDateYYMMDD } from "../../utils/dateFunctions/dateFunctions";

function NormalTable({ tableDatas = dummyEmiDatas, loading, selectedRow = {}, onClick = () => {}, hideColumns = []}) {
  const [headings, setHeadings] = useState([]);

  useEffect(()=>{
    setHeadings(tableDatas && tableDatas.length > 0 ? Object.keys(tableDatas[0]) : [])
  },[tableDatas])

  return (
    // <div className="table-container">
    <table className="table">
      <thead>
        <tr>
          {headings.map((heading, index) => (
            (!heading.includes('hide') && !hideColumns.includes(heading)) && (
              <th className={`table-th`} key={index}>
                {heading === "id" ? "Sno" : heading}
              </th>
            )
          ))}
        </tr>
      </thead>
      <tbody>
        {loading && <div className="table-body-load"></div>}
        {tableDatas.map((row, i) => (
          <tr
            className={selectedRow && selectedRow.id && selectedRow.id === row.id ? "selected-tr" : "body-tr"}
            key={i}
            onClick={() => onClick(row)}
          >
            {headings.map((heading, ind) => (
              (!heading.includes('hide') && !hideColumns.includes(heading)) && (
                <td key={ind} className={`table-td`}>
                  {heading === "id" && row[heading] !== "" ? i + 1 : (heading.toLowerCase() && heading.toLowerCase().includes('date')) ? changeDateYYMMDD(row[heading]) : row[heading]}
                </td>
              )
            ))}
          </tr>
        ))}
      </tbody>
    </table>

  );
}

export default NormalTable;