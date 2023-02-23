import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';

const Calendar = (props) => {
  const [availabilityData, setAvailabilityData] = useState(props?.data);
  const [currentWeek, setCurrentWeek] = useState(
    moment(props.firstAppointmentDate).startOf('week').day('Monday')
  );
  const [selectedDate, setSelectedDate] = useState(null);

  //test 2

  useEffect(() => {
    setCurrentWeek(
      moment(props.firstAppointmentDate).startOf('week').day('Monday')
    );
    setAvailabilityData(props?.data);
  }, [props.firstAppointmentDate, props?.data]);

  // utils: reformat time 00:00
  const removeSeconds = (time) => {
    return time.split(':').slice(0, 2).join(':');
  };

  ////// get previous week //////
  function handlePreviousClick() {
    let date = moment(props.firstAppointmentDate);
    const previousWeek = moment(currentWeek).subtract(1, 'week');
    const startOfWeek = previousWeek
      .clone()
      .startOf('week')
      .day('Monday')
      .format('YYYY-MM-DD');
    const endOfWeek = previousWeek
      .clone()
      .add(1, 'week')
      .endOf('week')
      .day('Sunday')
      .format('YYYY-MM-DD');

    // check if first available date is after the first day of the previous week
    const disablePrev = moment(props.firstAppointmentDate).isAfter(
      previousWeek
    );
    console.log('disablePrev prev', disablePrev);
    if (disablePrev === true) {
      props.setDisablePreviousWeek(true);
    } else {
      props.setDisablePreviousWeek(false);
    }

    console.log(`From: ${startOfWeek} to: ${endOfWeek}`);
    props.setLoadingSlots(true);
    callSlots(startOfWeek, endOfWeek, props.locationID);

    setCurrentWeek(previousWeek);
  }

  ///// get next week /////
  function handleNextClick() {
    let date = moment(props.firstAppointmentDate);
    const nextWeek = moment(currentWeek).add(1, 'week');
    const firstDayOfNextWeek = nextWeek
      .clone()
      .startOf('week')
      .day('Monday')
      .format('YYYY-MM-DD');
    const endOfNextWeek = nextWeek
      .clone()
      .add(1, 'week')
      .endOf('week')
      .day('Sunday')
      .format('YYYY-MM-DD');

    console.log(`From: ${firstDayOfNextWeek} to: ${endOfNextWeek}`);
    props.setLoadingSlots(true);

    callSlots(firstDayOfNextWeek, endOfNextWeek, props.locationID);

    setCurrentWeek(nextWeek);

    // check if first available date is after the first day of the next week
    const disablePrev = moment(props.firstAppointmentDate).isAfter(nextWeek);
    console.log('disablePrev next', disablePrev);
    if (disablePrev === true) {
      props.setDisablePreviousWeek(true);
    } else {
      props.setDisablePreviousWeek(false);
    }
  }

  // get slots
  const callSlots = (dateFrom, dateTo, locationID) => {
    props
      .getJSON(
        `${props.mockHost}/GetConsultantSlots?HCAConsultantId=C987654321&LocationId=${locationID}&DateFrom=${dateFrom}&DateTo=${dateTo}`
      )
      .then((response) => {
        console.log(response);
        setAvailabilityData(response);
        props.setLoadingSlots(false);
      });

    // checking url is correct
    console.log(
      `${props.mockHost}/GetConsultantSlots?HCAConsultantId=C987654321&LocationId=${locationID}&DateFrom=${dateFrom}&DateTo=${dateTo}`
    );
  };

  const showAppointment = (e, date, slotStartTime, slotEndTime) => {
    // remove the previous selected style
    const elements = document.querySelectorAll('.slot-time');

    if (elements.length > 0) {
      elements.forEach((element) => {
        if (element.classList.contains('slot-time--selected')) {
          element.classList.remove('slot-time--selected');
        }
      });
    }

    // add selected style to clicked element
    e.target.classList.add('slot-time--selected');

    const bookingInformation = {
      consultant: `${props?.consultantDetailsData?.title} ${props?.consultantDetailsData?.firstName} ${props?.consultantDetailsData?.lastName}`,
      hcaConsultantId: `${props?.consultantDetailsData?.HCAConsultantId}`,
      professionalRegistrationNumber: `${props?.consultantDetailsData?.professionalRegistrationNumber}`,
      locationID: props.locationID,
      providerMainSpecialty: `${props?.consultantDetailsData?.providerMainSpecialty}`,
      date,
      slotStartTime,
      slotEndTime,
    };

    let selectedDate = {
      facilityLocation: props.locationID,
      date: date,
      startTime: slotStartTime,
    };

    setSelectedDate(selectedDate);

    console.log(bookingInformation);
    alert(JSON.stringify(bookingInformation, null, ' '));
  };

  return (
    <div className="calendar">
      {/* prev week btn */}
      <button
        onClick={handlePreviousClick}
        className="previous"
        disabled={props.disablePreviousWeek ? true : false}
      >
        Previous Week
      </button>
      <div className="week-container">
        {/* week header */}
        <div className="week-header">
          {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
            const day = moment(currentWeek).add(offset, 'days');
            return (
              <div className="day" key={offset}>
                <div className="date">{day.format('ddd')}</div>
                <div className="date">{day.format('DD MMM')}</div>
              </div>
            );
          })}
        </div>
        {/* week slots */}
        {props.loadingSlots && (
          <div className="loading-slots">Loading slots...</div>
        )}
        {!props.loadingSlots && (
          <div className="week-slots">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const day = moment(currentWeek).add(offset, 'days');
              const date = day.format('YYYY-MM-DD');
              return (
                <div className="day" key={offset}>
                  <div className="slots">
                    {availabilityData?.days
                      .filter((d) => d.date === date)
                      .map((slot) => {
                        return slot.slots.map((slot) => (
                          <div
                            className={`slot-time 
                            ${
                              slot?.isBlocked === true
                                ? 'slot-time--booked'
                                : ''
                            }
                            ${
                              selectedDate !== null &&
                              selectedDate?.facilityLocation ===
                                props.locationID &&
                              selectedDate?.date === date &&
                              selectedDate?.startTime === slot?.startTime
                                ? 'slot-time--selected'
                                : ''
                            }
                            `}
                            onClick={(e) =>
                              showAppointment(
                                e,
                                date,
                                slot.startTime,
                                slot.endTime
                              )
                            }
                          >
                            {removeSeconds(slot.startTime)}
                          </div>
                        ));
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* next week btn */}
      <button
        onClick={handleNextClick}
        className="next"
        disabled={props.disableNextWeek ? true : false}
      >
        Next Week
      </button>
    </div>
  );
};

export default Calendar;
