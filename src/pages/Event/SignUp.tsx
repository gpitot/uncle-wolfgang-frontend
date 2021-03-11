import List from "components/List";
import Register from "components/Register";
import React, { useContext, useState } from "react";
import { IEvent } from "rest/events";
import { IUserEvent } from "rest/user_events";
import { timeIsAfter } from "utils/compareTime";
import style from "./style.module.scss";
import { UserContext } from "contexts/UserContext";
import API from "rest/api";
import UserRow from "components/UserRow";
import { toast } from "react-toastify";
import Edit from "components/Edit";
import EditSocial from "components/EditConfigs/edit-social";
import Paid from "components/Paid";

import { ReactComponent as Close } from "icons/times-circle-solid.svg";
interface IProps {
  event: IEvent;
  userEvents?: Array<IUserEvent>;
  setUserEvents: (userEvents: Array<IUserEvent>) => void;
}

const SignupSheet = ({ event, userEvents, setUserEvents }: IProps) => {
  const { user } = useContext(UserContext);

  const [loadingRemove, setLoadingRemove] = useState(false);

  const { enabled, open, start, spots } = event;
  if (userEvents === undefined || enabled === false) return null;

  let registeredUsers = 0;
  let alreadyRegistered = false;
  for (let i = 0; i < userEvents.length; i += 1) {
    const { enabled, id } = userEvents[i];
    if (enabled) {
      registeredUsers += 1;
    }

    if (enabled && user.id === id) {
      alreadyRegistered = true;
    }
  }
  const isFull = spots <= registeredUsers;

  const isOpen = !timeIsAfter(open);
  const hasStarted = timeIsAfter(start);

  const removeEntry = ({ id }: IUserEvent) => {
    setLoadingRemove(true);
    API.userEvents
      .deleteUserEvent({ id })
      .then((res) => {
        if (res.success) {
          toast.success("Successfuly removed yourself from this event");
          const newEvents = [...userEvents].filter((event) => event.id !== id);
          setUserEvents(newEvents);
        } else {
          throw Error();
        }
      })
      .catch(() => {
        toast.error("Could not remove yourself from this event");
      })
      .finally(() => {
        setLoadingRemove(false);
      });
  };

  let nameList = userEvents.map((event) => [
    <div className={style.row}>
      <UserRow
        id={event.user_id}
        name={`${event.firstname} ${event.lastname}`}
        photo={event.photo}
      />
      {user.id === event.user_id && !loadingRemove && (
        <Close onClick={() => removeEntry(event)} />
      )}
      <Edit>
        {(setOpen) => (
          <EditSocial
            setOpen={setOpen}
            event={event}
            userEvents={userEvents}
            setUserEvents={setUserEvents}
          />
        )}
      </Edit>
      <Paid paid={event.paid} />
    </div>,
  ]);

  if (nameList.length === 0) {
    nameList.push([<div className={style.row}>No registrations yet.</div>]);
  }

  return (
    <div className={style.signup}>
      {isOpen && hasStarted && !alreadyRegistered && (
        <Register
          registerCTA={"Sign up for this event"}
          eventId={event.id}
          isFull={isFull}
          userEvents={userEvents}
          setUserEvents={setUserEvents}
        />
      )}
      <List headers={[event.name]} body={nameList} />
    </div>
  );
};

export default React.memo(SignupSheet);
