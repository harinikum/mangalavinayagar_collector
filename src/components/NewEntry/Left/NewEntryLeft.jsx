import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../common/Form/Buttton/Button'
import LabelAndInput from '../../../common/Form/LabeAndSelect.jsx/LabelAndInput'
import LabelAndInputSugg from '../../../common/Form/LabeAndSelect.jsx/LabelAndInputSugg'
import { newEntryArr } from './newEntryArr'
import { apiFunction } from '../../../Api/ApiFunction'
import { endPointURLs } from '../../../Api/endPoints'

const NewEntryLeft = ({values, setValues, setDate, datas, setDatas}) => {

  const debounceRef = useRef(null);
  const [formArr, setFormArr] = useState(newEntryArr);

  useEffect(()=>{
    const openFun = async()=>{
      const res = await apiFunction(endPointURLs.getMembersNameId,"POST")
      console.log(res)
      if(res && res.data && res.data.message == "success"){
        // setMembers(res.data.data)
        setFormArr(prev=>prev.map((val)=>val.name == "name" ? {...val,dataList : res.data.data.map((val)=>`${val.name}/${val.place}/${val.emi_amount}`),  } : val ))
      }
    }
    openFun()
  },[])

  useEffect(() => {
  const today = new Date().toISOString().split('T')[0];

  setValues((prev) => ({
    ...prev,
    date: prev.date || today
  }));

  if (!values?.date) {
    setDate(today);
  }
}, []);
  const onSubmitHandler = (e)=>{

  }
  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "date") {
      setValues((prev) => ({ ...prev, [name]: value }));
      localStorage.setItem("new_entry_date", value);
      setDate(value);
    } else if (name === "name") {
      let splitted = value.split('/')
      if(splitted && splitted[0]){
        splitted = splitted[0];
      }
      setValues((prev) => ({ ...prev, [name]: splitted }));

      // Clear any existing timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer
      debounceRef.current = setTimeout(async () => {
        let spl = value.split('/');
        const res = await apiFunction(endPointURLs.getOneMember, "POST", { name: spl[0], emi_amount : (spl && spl[2]) && spl[2]});
        if(res && res.data && res.data.message == "success"){
          let tempDatas = [...datas];

          let ind = values?.activeIndex;
          if (
            ind === undefined ||
            ind === null ||
            ind < 0 ||
            ind >= tempDatas.length ||
            tempDatas[ind]?.['hideMemberId'] ||
            (tempDatas[ind]?.['உ.எண்'] !== '' && tempDatas[ind]?.['ரசீது தொகை'] !== '')
          ) {
            ind = tempDatas.findIndex((val) => !val['hideMemberId'] && val['உ.எண்'] === '' && val['ரசீது தொகை'] === '');
            if (ind === -1) {
              ind = tempDatas.length > 0 ? tempDatas.length - 1 : 0;
            }
          }

          setValues(prev => ({
            ...prev,
            activeIndex: ind,
            name: res.data.data['Customer Name'],
            loan: res.data.data['Balance Amount'],
            place: res.data.data.place
          }));

          if (tempDatas[ind]) {
            tempDatas[ind] = {
              ...tempDatas[ind],
              'உ.எண்': res.data.data['உ.எண்'],
              hideMemberId: res.data.data['id'],
              hideLoanAmount: res.data.data['Loan Amount'],
              hideBalanceAmount: res.data.data['Balance Amount'],
              'ரசீது தொகை': res.data.data.emi_amount,
              hideEmiID: res.data.data['emi_id'],
              hideMemberName: res.data.data['Customer Name'],
              hideMemberPlace: res.data.data.place,
              hideIsNotACust: false
            };
            setDatas(tempDatas);
          }
        }
        else{
          setValues(prev=>({...prev, loan : '', place : ''}))
        }
      }, 500);
    }
  };


  const handlePaymentMethodChange = (e) => {
    const val = e.target.value;
    setValues(prev => ({ ...prev, payment_method: val }));
    const activeIdx = values.activeIndex !== undefined ? values.activeIndex : 0;
    if (datas && datas[activeIdx]) {
      setDatas(prev => {
        const updated = [...prev];
        updated[activeIdx] = { ...updated[activeIdx], payment_method: val };
        return updated;
      });
    }
  };

  console.log("values =", values);
  console.log("date =", values?.date);

  return (
    <div className='form-left-container'>
      <form className="left-form new-entr-form" onSubmit={onSubmitHandler}>
        <div className='customer-details-form-flex'>
          {/* <LabelAndInput type='date' name={'date'} label={'Date'} id={'date'} value={values['date']}/>  */}
        </div>
        {formArr.map((val, ind) => (
      <div className="form-row" key={ind}>
        <LabelAndInput
          label={val.label}
          id={val.name}
          required={val.required}
          name={val.name}
          listName={val.listName}
          type={val.type}
          onChangeHandler={onChangeHandler}
          value={values[val.name]}
          dataList={val.dataList}
        />
      </div>
    ))}

    <div className="payment-method">
      <label className="inp-label">Payment Method</label>
      <div className="payment-method-options">
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input 
            type="radio" 
            name="left_payment_method" 
            value="cash" 
            checked={(values.payment_method || 'cash') === 'cash'} 
            onChange={handlePaymentMethodChange} 
          />
          Cash
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input 
            type="radio" 
            name="left_payment_method" 
            value="gpay" 
            checked={(values.payment_method || 'cash') === 'gpay'} 
            onChange={handlePaymentMethodChange} 
          />
          GPay
        </label>
      </div>
    </div>
        <br />
        {/* <Button className={"primary-btn"} type='button' onClick={onDownloadClick} disabled={downloadLoad}>Download as PDF</Button> */}
      </form>
    </div>
  )
}

export default NewEntryLeft