import React, { useEffect, useRef, useState } from "react";
import "./Table.css";
import { dummyEmiDatas } from "./dummyDatas";
import { changeDateYYMMDD, getCurrentDate } from "../../utils/dateFunctions/dateFunctions";
import { apiFunction } from "../../Api/ApiFunction";
import { endPointURLs } from "../../Api/endPoints";
import debounce from 'lodash/debounce';
import Button from "../Form/Buttton/Button";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

function NewEntryTable({ tableDatas = dummyEmiDatas, setTableDatas, loading, onClick = () => {}, values, setValues, date}) {
  const [headings, setHeadings] = useState([]);

  const inputRefs = useRef([]);

  useEffect(()=>{
    setHeadings(tableDatas && tableDatas.length > 0 ? Object.keys(tableDatas[0]) : [])
  },[tableDatas]);

  useEffect(() => {
    inputRefs.current = tableDatas.map((_, rowIndex) =>
      headings.map((_, colIndex) => inputRefs.current?.[rowIndex]?.[colIndex] || React.createRef())
    );
  }, [tableDatas, headings]);
  
  const onChangeHandler = (rowIndex, column, value) => {
    let updated = [...tableDatas];

    // Already saved entries - Customer Number should not be editable
    if (updated[rowIndex]["hidePayId"] && column === "உ.எண்") {
      return;
    }

    if (
      column !== "ரசீது தொகை" ||
      value === "" ||
      !updated[rowIndex]["hideMemberId"] ||
      Number(values.loan || 0) >= Number(value) ||
      (
        updated[rowIndex]["hideBalanceAmount"] &&
        Number(updated[rowIndex]["hideBalanceAmount"]) >= Number(value)
      )
    ) {
      updated[rowIndex][column] = value;
      setTableDatas(updated);

      if (column === "உ.எண்") {
        debouncedFetchMember(rowIndex, value);
      }
    }
  };

  // const onChangeHandler = (rowIndex, column, value) => {
  //   let updated = [...tableDatas];
  //   if(!updated[rowIndex]['hidePayId'] || (updated[rowIndex]['hidePayId'] && column != "உ.எண்" && column !== "ரசீது தொகை" )){
  //     if(column != "ரசீது தொகை" || !updated[rowIndex]['hideMemberId'] || (Number(values.loan || 0) >= Number(value) || (updated[rowIndex]['hideBalanceAmount'] && Number(updated[rowIndex]['hideBalanceAmount']) >= Number(value)))){
  //       updated[rowIndex][column] = value;
  //       setTableDatas(updated);
  //       if (column === "உ.எண்") {
  //         debouncedFetchMember(rowIndex, value);
  //       }
  //     }
  //   }
  // };
  
  // Create the debounced function using useRef to persist across renders
  const debouncedFetchMember = useRef(
    debounce(async (rowIndex, value) => {
      const res = await apiFunction(endPointURLs.getOneMember, "POST", { id: value });
      if (res && res.data && res.data.message === "success") {
        let currentPm = 'cash';
        setTableDatas((prev) => {
            const updated = [...prev];
            updated[rowIndex]['hideIsNotACust'] = false;
            updated[rowIndex]['ரசீது தொகை'] = res.data.data.emi_amount;
            updated[rowIndex]['hideMemberId'] = res.data.data.id;
            updated[rowIndex]['hideMemberName'] = res.data.data['Customer Name'];
            updated[rowIndex]['hideMemberPlace'] = res.data.data.place;
            updated[rowIndex]['hideLoanAmount'] = res.data.data['Loan Amount'];
            updated[rowIndex]['hideBalanceAmount'] = res.data.data['Balance Amount'];
            updated[rowIndex]['hideEmiID'] = res.data.data['emi_id'];
            currentPm = updated[rowIndex]['payment_method'] || 'cash';
            console.log(updated);
            return updated;
        });
        setValues(prev => ({
          ...prev, 
          activeIndex: rowIndex, 
          loan : res.data.data['Balance Amount'], 
          name : res.data.data['Customer Name'], 
          date : localStorage.getItem('new_entry_date'), 
          place : res.data.data.place,
          payment_method: currentPm
        }));
      }
      else{
        setTableDatas((prev) => {
            const updated = [...prev];
            updated[rowIndex]['hideIsNotACust'] = true;
            updated[rowIndex]['hideMemberId'] = '';
            updated[rowIndex]['ரசீது தொகை'] = '';
            updated[rowIndex]['hideMemberName'] = '';
            updated[rowIndex]['hideMemberPlace'] = '';
            console.log(updated);
            return updated;
        });
        setValues(prev => ({
          ...prev, 
          activeIndex: rowIndex, 
          loan : "", 
          name : "", 
          date : localStorage.getItem('new_entry_date'), 
          place : '',
          payment_method: 'cash'
        }));
      }
    }, 500)
  ).current;

  const handleKeyPress = (e, rowIndex, column, value, colIndex) => {
    const visibleHeadings = headings.filter(h => !h.includes('hide') && h !== 'payment_method' && h !== 'id');
    if (e.key === "Enter" && value === "SA") {
      setEmiId(tableDatas[rowIndex]["hideEmiId"]);
      setSADate(column);
      setIsSAPopUp(true);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const direction = e.key === "ArrowUp" ? -1 : 1;
      const nextRow = rowIndex + direction;
      if (nextRow >= 0 && nextRow < tableDatas.length) {
        const ref = inputRefs.current[nextRow]?.[headings.indexOf(column)];
        if (ref?.current) ref.current.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const nextRow = rowIndex + 1;
  
      if (nextRow < tableDatas.length) {
        // Move to first visible column of next row
        const firstVisibleCol = visibleHeadings[0];
        const ref = inputRefs.current[nextRow]?.[headings.indexOf(firstVisibleCol)];
        if (ref?.current) ref.current.focus();
      } 
      else {
        // Add new empty row and focus its first input after a short delay
        const newRow = {};
        headings.forEach(h => {
            if (h === "payment_method") newRow[h] = "cash";
            else newRow[h] = "";
        });
        setTableDatas(prev => {
          const updated = [...prev, newRow];
          return updated;
        });
        // Wait until DOM updates
        setTimeout(() => {
          const firstVisibleCol = visibleHeadings[0];
          const ref = inputRefs.current[nextRow]?.[headings.indexOf(firstVisibleCol)];
          if (ref?.current) ref.current.focus();
        }, 50);
      }
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const direction = e.key === "ArrowRight" ? 1 : -1;
      const nextCol = colIndex + direction;
  
      if (nextCol >= 0 && nextCol < visibleHeadings.length) {
        const nextHeading = visibleHeadings[nextCol];
        const ref = inputRefs.current[rowIndex]?.[headings.indexOf(nextHeading)];
        if (ref?.current) ref.current.focus();
      }
    }
  };

  const onAddRow = () => {
    const newRow = {};
    headings.forEach(h => {
        if (h === "payment_method") newRow[h] = "cash";
        else newRow[h] = "";
    });
    
    setTableDatas(prev => {
      const updated = [...prev, newRow];
      return updated;
    });
  
    const nextRow = tableDatas.length; // New row will be added at this index
  
    // Focus input after DOM updates
    setTimeout(() => {
      const visibleHeadings = headings.filter(h => !h.includes('hide') && h !== 'payment_method' && h !== 'id');
      const firstVisibleCol = visibleHeadings[0];
      const ref = inputRefs.current[nextRow]?.[headings.indexOf(firstVisibleCol)];
      if (ref?.current) ref.current.focus();
    }, 50);
  };
  

  const visibleHeadings = headings.filter(h => !h.includes('hide') && h !== 'payment_method' && h !== 'id');


  const cashTotal = tableDatas.reduce(
  (acc, row) =>
    (row.payment_method || "cash") === "cash"
      ? acc + Number(row["ரசீது தொகை"] || 0)
      : acc,
  0
);

const gpayTotal = tableDatas.reduce(
  (acc, row) =>
    row.payment_method === "gpay"
      ? acc + Number(row["ரசீது தொகை"] || 0)
      : acc,
  0
);

const total = cashTotal + gpayTotal;
  return (
    <>
    <div className="new-entry-par">
      <table className="table new-entry-table">
        <thead>
          <tr>
            <th className={`table-th`} style={{ width: '50px', minWidth: '50px' }}>S.No</th>
            {visibleHeadings.map((heading, idx) => (
              <th className={`table-th`} key={idx}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && <div className="table-body-load"></div>}
          {tableDatas.map((row, i) => (
            <tr className={"body-tr"} key={i} onClick={() => {
              onClick(row);
              if (row["உ.எண்"]) {
                debouncedFetchMember(i, row["உ.எண்"]);
              } else {
                setValues(prev => ({
                  ...prev,
                  activeIndex: i,
                  name: row['hideMemberName'] || row['Customer Name'] || '',
                  loan: row['hideBalanceAmount'] || row['Balance Amount'] || '',
                  place: row['hideMemberPlace'] || row['place'] || '',
                  payment_method: row['payment_method'] || 'cash'
                }));
              }
            }}>
              <td className={`table-td new-entry-td`} style={{ width: '50px', minWidth: '50px', textAlign: 'center' }}>{i + 1}</td>
              {visibleHeadings.map((heading, ind) => (
                <td
                  key={ind}
                  style={{ width: heading === "உ.எண்" ? "100px" : undefined }}
                  className={`table-td new-entry-td`}
                >
                  {heading.toLowerCase().includes("date") ? (
  changeDateYYMMDD(row[heading])
) : heading === "ரசீது தொகை" ? (
  <div className="amount-icon-wrapper">
    <input
      ref={inputRefs.current?.[i]?.[headings.indexOf(heading)] ?? null}
      onKeyDown={(e) =>
        handleKeyPress(
          e,
          i,
          heading,
          row[heading] ? row[heading]["date"] : "",
          ind
        )
      }
      onFocus={() => {
        if (row["உ.எண்"]) {
          debouncedFetchMember(i, row["உ.எண்"]);
        } else {
          setValues((prev) => ({
            ...prev,
            activeIndex: i,
            name: row["hideMemberName"] || row["Customer Name"] || "",
            loan: row["hideBalanceAmount"] || row["Balance Amount"] || "",
            place: row["hideMemberPlace"] || row["place"] || "",
            payment_method: row["payment_method"] || "cash",
          }));
        }
      }}
      disabled={row["hideIsFinished"]}
      required
      className="new-entry-input"
      type="text"
      value={row[heading]}
      onChange={(e) => onChangeHandler(i, heading, e.target.value)}
    />

   <span className="amount-icon">
  {(row.payment_method || "cash") === "cash" ? (
    <AttachMoneyIcon fontSize="small" />
  ) : (
    <PhoneAndroidIcon fontSize="small" />
  )}
</span>
  </div>
) : (
  <input
    ref={inputRefs.current?.[i]?.[headings.indexOf(heading)] ?? null}
    onKeyDown={(e) =>
      handleKeyPress(
        e,
        i,
        heading,
        row[heading] ? row[heading]["date"] : "",
        ind
      )
    }
    onFocus={() => {
      if (row["உ.எண்"]) {
        debouncedFetchMember(i, row["உ.எண்"]);
      } else {
        setValues((prev) => ({
          ...prev,
          activeIndex: i,
          name: row["hideMemberName"] || row["Customer Name"] || "",
          loan: row["hideBalanceAmount"] || row["Balance Amount"] || "",
          place: row["hideMemberPlace"] || row["place"] || "",
          payment_method: row["payment_method"] || "cash",
        }));
      }
    }}
    disabled={row["hideIsFinished"]}
    required
    className="new-entry-input"
    type="text"
    value={row[heading]}
    onChange={(e) => onChangeHandler(i, heading, e.target.value)}
  />
)}
                  {/* {heading.toLowerCase().includes('date')
                    ? changeDateYYMMDD(row[heading])
                    : <input
                        ref={inputRefs.current?.[i]?.[headings.indexOf(heading)] ?? null}
                        onKeyDown={(e) =>
                            handleKeyPress(e, i, heading, row[heading] ? row[heading]["date"] : "", ind)
                        }
                        onFocus={() => {
                          if (row["உ.எண்"]) {
                            debouncedFetchMember(i, row["உ.எண்"]);
                          } else {
                            setValues(prev => ({
                              ...prev,
                              activeIndex: i,
                              name: row['hideMemberName'] || row['Customer Name'] || '',
                              loan: row['hideBalanceAmount'] || row['Balance Amount'] || '',
                              place: row['hideMemberPlace'] || row['place'] || '',
                              payment_method: row['payment_method'] || 'cash'
                            }));
                          }
                        }}
                        disabled={row['hideIsFinished']}
                        required={true}
                        className="new-entry-input" type="text" value={row[heading]} onChange={(e)=>onChangeHandler(i, heading, e.target.value)} />
                  } */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <div>
        {/* Total : {tableDatas.reduce((acc,val)=>acc+Number(val["ரசீது தொகை"]), 0)} */}
        <div className="payment-summary">
  <div className="cash-summary">
    💵 Cash : {cashTotal}
  </div>

  <div className="gpay-summary">
    📱 GPay : {gpayTotal}
  </div>

  <div className="total-summary">
    🧾 Total : {total}
  </div>
</div>
      </div>
      <Button className={'pop-done-btn'} onClick={onAddRow}>Add Row</Button>
    </>
  );
}

export default NewEntryTable;