import { CustomMessageTriggerHandler } from "aws-lambda";

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === "CustomMessage_SignUp") {
    const message = `Dear ${event.request.userAttributes.given_name} ${event.request.userAttributes.family_name}
    Thank you for registering.
    Please use this code to verify your email address ${event.request.codeParameter}`;
    event.response.emailMessage = message;
    event.response.emailSubject = "User Registration";
  }
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    const message = `Dear ${event.request.userAttributes.given_name} ${event.request.userAttributes.family_name}
    Please use this code to reset your password ${event.request.codeParameter}`;
    event.response.emailMessage = message;
    event.response.emailSubject = "Password Reset";
  }
  return event;
};
