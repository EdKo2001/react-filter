import React, { FC, useEffect } from "react";

import { Alert } from "antd";

interface InstantAlertProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const InstantAlert: FC<InstantAlertProps> = ({ message, type }) => {
  useEffect(() => {
    document?.querySelector(".instant-alert")?.classList?.remove("active");
  }, []);

  useEffect(() => {
    document?.querySelector(".instant-alert")?.classList?.add("active");
    setTimeout(() => {
      document?.querySelector(".instant-alert")?.classList?.remove("active");
    }, 3000);
  }, [Math.random() + Math.random()]);

  return (
    //@ts-ignore
    <Alert message={message} type={type} className="instant-alert" showIcon />
  );
};

export default InstantAlert;
