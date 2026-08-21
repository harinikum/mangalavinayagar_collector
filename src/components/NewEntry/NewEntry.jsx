import React, { useEffect, useState } from 'react'
import SnackbarAlert from '../../common/Alert/SnackbarAlert/SnackBarAlert'
import PopUpAlert from '../../common/Alert/Popups/PopupAlert';
import BouncingDots from '../../common/Loader/BouncingDots';
import { Delete } from '@mui/icons-material';
import NewEntryLeft from './Left/NewEntryLeft';
import NewEntryRight from './Right/NewEntryRight';
import { getCurrentDate } from '../../utils/dateFunctions/dateFunctions';
import './styles.css';
const NewEntry = () => {
  // Set localStorage immediately (before child effects run) so children can read it
  const todayDate = getCurrentDate();
  localStorage.setItem('new_entry_date', todayDate);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setisError] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ date: todayDate });

  const [date, setDate] = useState(todayDate);
  const [datas, setDatas] = useState([
    {
      "உ.எண்": "",
      "ரசீது தொகை": "",
      "payment_method": "cash",
    },
  ]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId || !userId.includes("@")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);
  return (
    <>
      {isSuccess && (
        <SnackbarAlert open={isSuccess} setOpen={setIsSuccess} message={msg} />
      )}
      {isError && (
        <SnackbarAlert
          open={isError}
          setOpen={setisError}
          severity="error"
          message={msg}
        />
      )}
      {!loading ? (
        <div className="new-entry-page">
          {/* placeholder for existing global header */}
          <nav className="top-nav-placeholder" />
          <div className="content-wrapper">
            <section className="left-column">
              <NewEntryLeft
                datas={datas}
                setDatas={setDatas}
                setDate={setDate}
                values={values}
                setValues={setValues}
              />
            </section>
            <section className="right-column">
              <NewEntryRight
                date={date}
                setDate={setDate}
                values={values}
                setValues={setValues}
                datas={datas}
                setDatas={setDatas}
              />
            </section>
          </div>
        </div>


      ) : (
        <BouncingDots />
      )}
    </>
  )
}

export default NewEntry