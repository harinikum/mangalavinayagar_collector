import React, { useEffect, useState } from "react";
import BouncingDots from "../../../common/Loader/BouncingDots";
import NewEntryTable from "../../../common/Table/NewEntryTable";
import Button from "../../../common/Form/Buttton/Button";
import { getCurrentDate } from "../../../utils/dateFunctions/dateFunctions";
import { apiFunction } from "../../../Api/ApiFunction";
import { endPointURLs } from "../../../Api/endPoints";
import SnackbarAlert from "../../../common/Alert/SnackbarAlert/SnackBarAlert";

const NewEntryRight = ({ values, setValues, date, setDate, datas, setDatas }) => {
  const [isPopUp, setIsPopUp] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const openFun = async () => {
    const res = await apiFunction(endPointURLs.getNewEntryPayments, "POST", {
      date: localStorage.getItem('new_entry_date'),
      collector_id: localStorage.getItem("user_id_num"),
    });
    console.log(res.data.data[0]);
    // console.log(res);
    if (res && res.data && res.data.message == "success") {
      // Append an empty placeholder row for next entry with next S.No
      // const dataArray = res.data.data || [];
      // const lastRow = dataArray[dataArray.length - 1];
      // const nextSNo = lastRow && lastRow["உ.எண்"] ? Number(lastRow["உ.எண்"]) + 1 : 1;
      // const emptyRow = { "உ.எண்": String(nextSNo), "ரசீது தொகை": "", "payment_method": "cash" };
      // setDatas([...dataArray, emptyRow]);
      setDatas(res.data.data || []);
      setDate(localStorage.getItem('new_entry_date'));
      // console.log({...values, name : "", loan : ""});
      setValues(prev => ({ ...prev, name: "", loan: "", date: localStorage.getItem('new_entry_date') }));
    }
  };

  // Load data once when component mounts
  useEffect(() => {
    openFun();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // console.log(datas);
    // let filtered = datas.filter((val)=>(!val.hideIsNotEdit && (val['உ.எண்'] != "" && val['ரசீது தொகை']!='')));
    // console.log(filtered);
    let filtered = [];
    let duppCheck = [];
    let isDupp = false;
    datas.forEach((val) => {
      if (val["உ.எண்"] != "") {
        filtered.push(val);
      }
      if (duppCheck.includes(Number(val["உ.எண்"]))) {
        isDupp = true;
      } else {
        duppCheck.push(Number(val["உ.எண்"]));
      }
    });
    if (isDupp) {
      alert("Duplicate values not allowed");
      return;
    }
    // console.log(duppCheck);
    // console.log(isDupp);
    if (filtered.length > 0) {
      let errs = filtered.find(
        (val) => {
          console.log(val)
          return (val.hideIsNotACust ||
            !val["உ.எண்"] ||
            val["உ.எண்"] == 0 ||
            val["ரசீது தொகை"] == "")
        });
      if (!errs) {
        setLoading(true)
        // Debug logs for payment method and payload
        console.log('Selected Payment Method:', values.payment_method);
        const payload = {
          agent_id: localStorage.getItem("user_id_num"),
          date: date,
          payments: filtered
        };
        console.log('Payload:', payload);
        const res = await apiFunction(
          endPointURLs.insertAndUpdatePayments,
          "POST",
          payload
        );
        // console.log(res);
        // Show success feedback and refresh data from server
        if (res.data.message === "success") {
          setIsPopUp(true);
          setMsg("Successfully Registered");
          await openFun();
          // Append a new empty row for next entry without refetching
          // setDatas(prev => {
          //   const last = prev[prev.length - 1];
          //   const nextSNo = last && last["உ.எண்"] ? Number(last["உ.எண்"]) + 1 : 1;
          //   const emptyRow = {};
          //   if (last) {
          //     Object.keys(last).forEach(key => {
          //       emptyRow[key] = "";
          //     });
          //   }
          //   emptyRow["உ.எண்"] = String(nextSNo);
          //   emptyRow["payment_method"] = "cash";
          //   emptyRow["ரசீது தொகை"] = "";
          //   return [...prev, emptyRow];
          // });
        } else {
          if (res.data.message == "Some Inserted Not All") {
            openFun();
          }
          setIsErr(true);
          setMsg(res.data.message);
        }
        setLoading(false)
        // console.log(filtered)
      } else {
        alert("Properly Give Datas");
      }
    }
  };
  const onOverallOk = async () => {
    const res = await apiFunction(endPointURLs.insert_not_gived, "POST", {
      date: date,
    });
    console.log(res);
  };

  return (
    <>
      {isPopUp && (
      <SnackbarAlert
        open={isPopUp}
        setOpen={setIsPopUp}
        message={msg}
        severity="success"
      />
    )}
      {isErr && (
        <SnackbarAlert
          open={isErr}
          setOpen={setIsErr}
          message={msg}
          severity="error"
        />
      )}
      <div className="new-entry-container">
        <NewEntryTable
          date={date}
          tableDatas={datas}
          setTableDatas={setDatas}
          values={values}
          setValues={setValues}
        />
      </div>
      <div
        style={{ display: "flex", justifyContent: "end", paddingTop: "10px", alignItems: "center", gap: "20px" }}
      >
        <Button
          onClick={onSubmitHandler}
          type="submit"
          className={"pop-cancel-btn"}
          disabled={loading}
        >
          Submit
        </Button>
      </div>
      {/* Uncomment below for loading indicator */}
      {/* <BouncingDots/> */}
    </>
  );
};

export default NewEntryRight;