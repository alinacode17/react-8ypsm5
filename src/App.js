import React, { useEffect, useState } from 'react';
import Calendar from './Calendar.js';
import Map from './Map';
import moment from 'moment';
import './style.css';
import uuid from 'react-uuid';

const App = () => {
  const [data, setData] = useState();
  const [showCalendar, setShowCalendar] = useState(false);
  const [locationID, setLocationID] = useState('');
  const [dataSlots, setDataSlots] = useState(null);
  const [firstAppointmentDate, setFirstAppointemntDate] = useState(null);
  const [lastAppointmentDate, setLastAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [disablePreviousWeek, setDisablePreviousWeek] = useState(false);
  const [disableNextWeek, setDisableNextWeek] = useState(false);

  // mock host served from Postman
  // const mockHost = 'https://4c81fcd6-9dea-44ee-b4fe-f37b752075ad.mock.pstmn.io';
  const mockHost = 'https://mockldb.azurewebsites.net/api';

  // getJSON
  const getJSON = async (url) => {
    var myHeaders = new Headers();
    myHeaders.append(
      'x-api-key',
      'PMAK-63d154094adda860d1dbe327-b1654fe8a40896693a9eee1476e796e33e'
    ); // mock server

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions).catch((error) =>
      console.log('error', error)
    );

    return response.json(); // get JSON from the response
  };

  // postJSON
  const postJSON = async (url, bodyObject) => {
    var myHeaders = new Headers();
    myHeaders.append(
      'x-api-key',
      'PMAK-63d154094adda860d1dbe327-b1654fe8a40896693a9eee1476e796e33e'
    );
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify(bodyObject);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions).catch((error) =>
      console.log('error', error)
    );

    return response.json(); // get JSON from the response
  };

  const getData = () => {
    getJSON(
      `${mockHost}/GetConsultantDetails?professionalRegistrationNumber=GM987654321`
    ).then((consultantDetails) => {
      // got the consultant data
      console.log(consultantDetails);
      setLoading(false);
      setData(consultantDetails);
    });
  };

  const getSlots = (locationID, availableDate, lastAvailableDate) => {
    setLocationID(locationID);
    setFirstAppointemntDate(availableDate);
    const date = moment(availableDate);
    const lastDate = moment(lastAvailableDate);
    const firstDayOfWeek = date.clone().startOf('isoWeek').format('YYYY-MM-DD');
    const lastDayOfWeek = date.clone().endOf('isoWeek').format('YYYY-MM-DD');

    const currentWeek = moment(date).startOf('week').day('Monday');
    // get next week start day to check if lastAvailableDate is before first day of next week
    const nextWeek = moment(currentWeek).add(1, 'week');
    const firstDayOfNextWeek = nextWeek
      .clone()
      .startOf('week')
      .day('Monday')
      .format('YYYY-MM-DD');

    // check if first available date is after the first day of the current week
    const disablePrev = moment(availableDate).isAfter(currentWeek);
    console.log('disablePrev', disablePrev);
    if (disablePrev === true) {
      setDisablePreviousWeek(true);
    }
    // check if last available date is before the first day of the next week
    // longer next test '2023-08-21T12:00:00.000'
    const disableNext = moment('2023-08-21T12:00:00.000').isBefore(
      firstDayOfNextWeek
    );

    console.log('disableNext', disableNext);

    console.log(firstDayOfWeek, lastDayOfWeek);

    // get slots
    getJSON(
      `${mockHost}/GetConsultantSlots?HCAConsultantId=C987654321&LocationId=${locationID}&DateFrom=${firstDayOfWeek}&DateTo=${lastDayOfWeek}`
    ).then((response) => {
      setLoadingSlots(false);
      // get days data to build calendar
      setDataSlots(response);
      // show calendar
      setShowCalendar(true);
      console.log(response);
    });
  };

  return (
    <div>
      <button onClick={getData}>Get data</button>
      {!loading && (
        <div>
          <div>
            Consultant name: {data?.firstName} {data?.lastName}
          </div>
          <div>Consulant registration number: GM123456789</div>
          <h2>Availability</h2>
          {/* <Map locations={data?.availability} /> */}
          {data?.availability &&
            data?.availability.length > 0 &&
            data?.availability.map((facility) => (
              <div key={uuid()}>
                <button
                  onClick={() =>
                    getSlots(
                      facility?.facilityLocation,
                      facility?.firstAppointmentSlotDateTime,
                      facility?.lastAppointmentSlotDateTime
                    )
                  }
                >
                  {facility?.facilityFullName}
                </button>
                <div>Facility id: {facility?.facilityLocation}</div>
                <div>
                  First available date: {facility?.firstAppointmentSlotDateTime}
                </div>
                <div>
                  Last available date: {facility?.lastAppointmentSlotDateTime}
                </div>
              </div>
            ))}
        </div>
      )}
      {/* if showCalendar is true then show calendar */}
      {showCalendar && (
        <Calendar
          mockHost={mockHost}
          data={dataSlots}
          consultantDetailsData={data}
          locationID={locationID}
          getJSON={getJSON}
          loadingSlots={loadingSlots}
          setLoadingSlots={setLoadingSlots}
          firstAppointmentDate={firstAppointmentDate}
          lastAppointmentDate={lastAppointmentDate}
          disablePreviousWeek={disablePreviousWeek}
          setDisablePreviousWeek={setDisablePreviousWeek}
          disableNextWeek={disableNextWeek}
          setDisableNextWeek={setDisableNextWeek}
        />
      )}
    </div>
  );
};

export default App;
